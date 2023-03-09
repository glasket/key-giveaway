package main

import (
	"context"
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

func Logout(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	request, writer, session, err := fw.Start(ctx, req)
	if err != nil {
		return fw.Error(err)
	}
	// Nil request means the session was already invalidated in fw.Start()
	if request != nil {
		session.Options.MaxAge = -1
	}
	writer.WriteHeader(http.StatusOK)
	return writer.GetProxyResponse()
}

func main() {
	lambda.Start(Logout)
}
