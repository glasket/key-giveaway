package main

import (
	"context"
	"encoding/json"
	"key-giveaway/pkg/database"
	"key-giveaway/pkg/fw"
	"net/http"

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
	database.SetContext(ctx)

	dropId, ok := req.PathParameters["drop_id"]
	if !ok {
		return fw.BadRequest(writer)
	}

	drop := database.Drop{
		ID: dropId,
	}
	drop, err = drop.GetItems()
	if err != nil {
		return fw.Error(err)
	}

	resp, err := json.Marshal(drop.Items)
	if err != nil {
		return fw.Error(err)
	}
	writer.WriteHeader(http.StatusOK)
	writer.Write(resp)
	return writer.GetProxyResponse()
}

func main() {
	lambda.Start(GetDropItems)
}
