package main

import (
	"context"
	"key-giveaway/pkg/database"
	"key-giveaway/pkg/fw"

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

func GetDropItems(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	_, writer, err := fw.StartNoSession(ctx, req)
	if err != nil {
		return fw.Error(err)
	}
	writer.Header().Set("Cache-Control", "no-store")
	database.SetContext(ctx)

	dropId, ok := req.PathParameters["drop_id"]
	if !ok {
		return fw.BadRequest(writer)
	}

	drop := database.Drop{
		ID: dropId,
	}
	err = drop.GetItems(false)
	if err != nil {
		return fw.Error(err)
	}

	return fw.JsonOk(writer, drop.Items)
}

func main() {
	lambda.Start(GetDropItems)
}
