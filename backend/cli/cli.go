package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"key-giveaway/pkg/database"
	"key-giveaway/pkg/fw"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/scheduler"
	"github.com/aws/aws-sdk-go-v2/service/scheduler/types"
	"github.com/google/uuid"
	"github.com/mitchellh/mapstructure"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

const (
	defaultProfile string = "Default"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	var awsProfile, infile, raffleArn, raffleRoleArn string
	var verbose int
	var noSched bool
	flag.StringVar(&awsProfile, "profile", "", "AWS Profile to be used")
	flag.StringVar(&infile, "file", "", "The path to the input file")
	flag.IntVar(&verbose, "v", 0, "Verbosity, 0=Warn (Default), 1=Info, 2=Debug")
	flag.StringVar(&raffleArn, "arn", "", "The ARN for the HandleRaffle lambda")
	flag.StringVar(&raffleRoleArn, "role", "", "The Role ARN for the HandleRaffle lambda")
	flag.BoolVar(&noSched, "no_sched", false, "Disables the schedule creation (for local testing)")
	flag.Parse()

	switch verbose {
	case 0:
		zerolog.SetGlobalLevel(zerolog.WarnLevel)
	case 1:
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	case 2:
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	default:
		log.Error().Int("verbosity", verbose).Ints("valid_verbosity", []int{0, 1, 2}).Msg("Invalid verbosity, using default")
	}

	awsProfile = strings.TrimSpace(awsProfile)
	if awsProfile == "" {
		log.Warn().Msg("Using default profile since none provided")
		awsProfile = defaultProfile
	}
	log.Info().Str("profile", awsProfile)

	infile = strings.TrimSpace(infile)
	if infile == "" {
		log.Error()
	}

	infile = filepath.Clean(infile)
	input, err := os.ReadFile(infile)
	if err != nil {
		log.Fatal().Err(err).Str("filepath", infile).Msg("")
	}
	log.Debug().Str("file_contents", string(input)).Msg("")

	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx, config.WithSharedConfigProfile(awsProfile))
	if err != nil {
		log.Panic().Err(err).Msg("")
	}
	database.Init(cfg)
	database.SetContext(ctx)

	jobs, err := parseFile(input)
	if err != nil {
		log.Fatal().Err(err)
	}
	log.Debug().Int("job_count", len(jobs)).Msg("")

	if err != nil {
		log.Fatal().Err(err).Msg("")
	}

	for i, job := range jobs {
		log.Debug().Int("job_no", i).Str("job_action", job.Action).Msg("")
		switch job.Action {
		case createDrop:
			var drop database.Drop
			decoder, err := mapstructure.NewDecoder(&mapstructure.DecoderConfig{
				Metadata:   nil,
				Result:     &drop,
				TagName:    "json",
				DecodeHook: mapstructure.ComposeDecodeHookFunc(toTimeHook()),
			})
			if err != nil {
				log.Error().Err(err).Msg("")
				break
			}
			err = decoder.Decode(job.Item)
			if err != nil {
				log.Error().Err(err).Any("item", job.Item).Msg("Item could not be converted to Drop")
				break
			}
			log.Debug().Any("drop", drop).Msg("")
			// Generate random ID
			drop.ID = uuid.New().String()
			log.Debug().Str("drop_id", drop.ID).Msg("")
			for idx := range drop.Items {
				drop.Items[idx].ID = uuid.New().String()
				drop.Items[idx].DropId = drop.ID
			}
			if err := drop.Save(); err != nil {
				log.Error().Err(err).Msg("")
				break
			}
			if noSched {
				continue
			}
			// Event Bridge
			input, err := json.Marshal(fw.HandleRaffleRequest{DropID: drop.ID})
			if err != nil {
				log.Error().Err(err).Msg("")
				break
			}
			sched := scheduler.NewFromConfig(cfg)
			schedOut, err := sched.CreateSchedule(ctx, &scheduler.CreateScheduleInput{
				ScheduleExpression: aws.String(fmt.Sprintf("at(%v)", drop.End.Format("2006-01-02T03:04:05"))),
				Target: &types.Target{
					Arn:     &raffleArn,
					RoleArn: &raffleRoleArn,
					Input:   aws.String(string(input)),
				},
				Name: aws.String(drop.ID + "-Raffle"),
				FlexibleTimeWindow: &types.FlexibleTimeWindow{
					Mode: types.FlexibleTimeWindowModeOff,
				},
			})
			if err != nil {
				log.Error().Err(err).Msg("")
			}
			if schedOut != nil {
				log.Debug().Interface("schedule_output", schedOut).Msg("")
			}
		case removeDrop:
			log.Error().Str("job_action", job.Action).Msg("Not implemented")
		default:
			log.Error().Str("job_action", job.Action).Msg("Invalid job action")
		}
	}
}

func parseFile(input []byte) ([]job, error) {
	var jobs []job
	err := json.Unmarshal(input, &jobs)
	if err != nil {
		return nil, err
	}
	return jobs, err
}

func toTimeHook() mapstructure.DecodeHookFunc {
	return func(f reflect.Type, t reflect.Type, data interface{}) (interface{}, error) {
		if t != reflect.TypeOf(time.Time{}) {
			return data, nil
		}

		switch f.Kind() {
		case reflect.String:
			return time.Parse(time.RFC3339, data.(string))
		default:
			return data, nil
		}
	}
}
