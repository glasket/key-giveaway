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

func deleteUser(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	request, writer, session, err := fw.Start(ctx, req)
	if err != nil {
		return fw.Error(err)
	}
	if request == nil {
		return fw.InvalidCookie(writer)
	}
	database.SetContext(ctx)

	userId, ok := session.Values["id"].(string)
	if !ok {
		return fw.Unauthorized(writer)
	}
	user := database.User{ID: userId}
	err = user.Delete()
	if err != nil {
		return fw.Error(err)
	}
	session.Options.MaxAge = -1
	err = session.Save(request, writer)
	if err != nil {
		fw.Error(err)
	}
	return fw.Ok(writer, nil)
}

func main() {
	lambda.Start(deleteUser)
}
