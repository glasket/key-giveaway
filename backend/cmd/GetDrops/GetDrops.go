package main

import (
	"context"
	"encoding/json"
	"fmt"
	"key-giveaway/pkg/database"
	"key-giveaway/pkg/fw"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/rs/zerolog/log"
)

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(err)
	}
	database.Init(cfg)
}

type cachedResp struct {
	Resp   []byte
	Expiry time.Time
}

const cacheTTL time.Duration = time.Hour
const cacheStr string = "max-age=3600"

var cache map[bool]*cachedResp = make(map[bool]*cachedResp)

func GetDrops(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	_, writer, err := fw.StartNoSession(ctx, req)
	if err != nil {
		return fw.Error(err)
	}
	includeOld, err := strconv.ParseBool(req.QueryStringParameters["old"])
	if err != nil {
		includeOld = false
	}

	cacheVal := cache[includeOld]
	if cacheVal != nil && cacheVal.Expiry.After(time.Now()) {
		log.Info().Msg("using cache")
		writer.Header().Set("Cache-Control", fmt.Sprintf("max-age=%d, must-revalidate", int(time.Until(cacheVal.Expiry).Seconds())))
		return fw.Ok(writer, cacheVal.Resp)
	}

	database.SetContext(ctx)

	var drops []database.Drop
	drops, err = database.GetAllDrops(includeOld)
	if err != nil {
		return fw.Error(err)
	}

	resp, err := json.Marshal(drops)
	if err != nil {
		return fw.Error(err)
	}

	cache[includeOld] = &cachedResp{Resp: resp, Expiry: time.Now().Add(cacheTTL)}
	writer.Header().Set("Cache-Control", cacheStr)
	return fw.Ok(writer, resp)
}

func main() {
	lambda.Start(GetDrops)
}
