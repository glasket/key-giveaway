package main

import (
	"context"
	crypto "crypto/rand"
	"encoding/binary"
	"encoding/json"
	"key-giveaway/pkg/database"
	"key-giveaway/pkg/fw"
	"math/rand"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
)

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(err)
	}
	database.Init(cfg)
}

func HandleRaffle(ctx context.Context, evt events.CloudWatchEvent) error {
	var req fw.HandleRaffleRequest
	err := json.Unmarshal(evt.Detail, &req)
	if err != nil {
		return err
	}
	database.SetContext(ctx)
	drop := database.Drop{
		ID: req.DropID,
	}
	drop, err = drop.GetItems()
	if err != nil {
		return err
	}
	seed := make([]byte, 8)
	_, err = crypto.Reader.Read(seed)
	if err != nil {
		return err
	}
	rand.Seed(int64(binary.BigEndian.Uint64(seed)))
	var userItemEntities []database.UserItemEntity
	for _, item := range drop.Items {
		winningEntry := rand.Intn(item.Entries.Count())
		winner := database.User{
			ID: item.Entries.Values()[winningEntry],
		}
		item.InsertTime = time.Now()
		userItemEntities = append(userItemEntities, database.BuildUserItemEntity(winner, item))
	}
	database.BatchWrite(userItemEntities)
	return nil
}

func main() {
	lambda.Start(HandleRaffle)
}
