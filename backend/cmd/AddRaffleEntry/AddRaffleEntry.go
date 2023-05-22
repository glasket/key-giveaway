package main

import (
	"context"
	"encoding/json"
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

type requestJson struct {
	DropID string `json:"drop_id"`
	ItemID string `json:"item_id"`
}

func addRaffleEntry(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
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
	u := database.User{ID: userId}
	friend, err := u.IsFriend()
	if err != nil {
		return fw.Error(err)
	}
	if !friend {
		return fw.NotFriends(writer)
	}

	var reqJson requestJson
	err = json.Unmarshal([]byte(req.Body), &reqJson)
	if err != nil {
		return fw.Error(err)
	}
	item := database.Item{
		DropId: reqJson.DropID,
		ID:     reqJson.ItemID,
	}
	err = item.AddRaffleEntry(userId)
	if err != nil {
		return fw.Error(err)
	}

	return fw.JsonOk(writer, item)
}

func main() {
	lambda.Start(addRaffleEntry)
}
