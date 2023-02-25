package database

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

const (
	TableNameValue string = "KeyGiveaway"
	batchSize      int    = 25
)

var (
	TableName *string = aws.String(TableNameValue)
	db        dynamodb.Client
	ctx       context.Context
)

func Init(cfg aws.Config) {
	db = *dynamodb.NewFromConfig(cfg)
}

func SetContext(c context.Context) {
	ctx = c
}
