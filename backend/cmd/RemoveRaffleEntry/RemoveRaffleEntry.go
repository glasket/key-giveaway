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

type requestJson struct {
	DropID string `json:"drop_id"`
	ItemID string `json:"item_id"`
}

func RemoveRaffleEntry(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
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

	var reqJson requestJson
	err = json.Unmarshal([]byte(req.Body), &reqJson)
	if err != nil {
		return fw.Error(err)
	}
	item := database.Item{
		DropId: reqJson.DropID,
		ID:     reqJson.ItemID,
	}
	err = item.RemoveRaffleEntry(userId)
	if err != nil {
		return fw.Error(err)
	}

	resp, err := json.Marshal(item)
	if err != nil {
		return fw.Error(err)
	}
	writer.WriteHeader(http.StatusOK)
	writer.Write(resp)
	return writer.GetProxyResponse()
}

func main() {
	lambda.Start(RemoveRaffleEntry)
}
