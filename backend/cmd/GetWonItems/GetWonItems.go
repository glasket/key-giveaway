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

func GetWonItems(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	request, writer, session, err := fw.Start(ctx, req)
	if err != nil {
		return fw.Error(err)
	}
	if request == nil {
		return fw.InvalidCookie(writer)
	}
	database.SetContext(ctx)

	uid, ok := session.Values["id"].(string)
	if !ok {
		return fw.Unauthorized(writer)
	}
	user := database.User{
		ID: uid,
	}
	err = user.GetItems()
	if err != nil {
		return fw.Error(err)
	}

	writer.Header().Set("Cache-Control", "max-age=900")
	return fw.JsonOk(writer, user.WonItems)
}

func main() {
	lambda.Start(GetWonItems)
}
