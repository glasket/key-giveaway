package database

import (
	"context"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/rs/zerolog/log"
)

const (
	TableNameValue string = "KeyGiveaway"
	batchSize      int    = 25
)

var (
	TableName *string = aws.String(TableNameValue)
	db        *dynamodb.Client
	ctx       context.Context
)

func Init(cfg aws.Config) {
	endpoint := os.Getenv("ENDPOINT_OVERRIDE")
	var resolver dynamodb.EndpointResolver
	if endpoint == "" {
		resolver = dynamodb.NewDefaultEndpointResolver()
	} else {
		resolver = dynamodb.EndpointResolverFromURL(endpoint)
	}
	log.Info().Str("endpoint", endpoint).Msg("")
	db = dynamodb.NewFromConfig(cfg, dynamodb.WithEndpointResolver(resolver))
}

func SetContext(c context.Context) {
	ctx = c
}
