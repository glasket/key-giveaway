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
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(err)
	}
	database.Init(cfg)
}

func GetDrops(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	_, writer, err := fw.StartNoSession(ctx, req)
	if err != nil {
		return fw.Error(err)
	}
	database.SetContext(ctx)

	var lastKey struct {
		LastKey map[string]types.AttributeValue `json:"last_key"`
	}
	if json.Valid([]byte(req.Body)) {
		err = json.Unmarshal([]byte(req.Body), &lastKey)
		if err != nil {
			return fw.Error(err)
		}
	}

	var drops []database.Drop
	drops, lastKey.LastKey, err = database.GetAllDrops(lastKey.LastKey)
	if err != nil {
		return fw.Error(err)
	}

	resp, err := json.Marshal(struct {
		Drops   []database.Drop                 `json:"drops"`
		LastKey map[string]types.AttributeValue `json:"last_key"`
	}{
		Drops:   drops,
		LastKey: lastKey.LastKey,
	})
	if err != nil {
		return fw.Error(err)
	}

	writer.WriteHeader(http.StatusOK)
	writer.Write(resp)
	return writer.GetProxyResponse()
}

func main() {
	lambda.Start(GetDrops)
}
