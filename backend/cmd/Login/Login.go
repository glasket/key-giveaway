package main

import (
	"context"
	"encoding/json"
	"key-giveaway/pkg/database"
	"key-giveaway/pkg/facebook"
	"key-giveaway/pkg/fw"
	"net/http"
	"os"

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

type requestJson struct {
	Token string `json:"token"`
}

type response struct {
	Token   facebook.Token `json:"token"`
	Friends bool           `json:"is_friends"`
}

func login(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	request, writer, session, err := fw.Start(ctx, req)
	if err != nil {
		return fw.Error(err)
	}
	if request == nil {
		return fw.InvalidCookie(writer)
	}
	database.SetContext(ctx)

	var reqJson requestJson
	err = json.Unmarshal([]byte(req.Body), &reqJson)
	if err != nil {
		return fw.Error(err)
	}
	token := reqJson.Token
	fb := facebook.Client{
		AccessToken: token,
	}

	userId, err := fb.GetUserId()
	if err != nil {
		fw.Error(err)
	}

	exists, err := checkIfUserExists(ctx, userId)
	if err != nil {
		fw.Error(err)
	}

	fb.Id = os.Getenv("facebookApiId")
	fb.Secret = os.Getenv("facebookApiSecret")
	ownerId := os.Getenv("facebookOwnerId")

	friends, err := fb.Friends(userId, ownerId)
	if err != nil {
		log.Error().Err(err).Msg("")
		return fw.Error(err)
	}

	if !exists && !friends {
		// Unauthorized
		return fw.NotFriends(writer)
	}

	u := database.User{ID: userId, Friends: friends}
	ue := database.BuildUserEntity(u)
	// Update/Create the user
	ue.Save()

	// Exchange token
	longToken, err := fb.ExchangeToken()
	if err != nil {
		log.Error().Err(err).Msg("")
		return fw.Error(err)
	}

	// Invalidate session before Facebook token
	// Simplifies session management somewhat
	session.Options.MaxAge = *longToken.ExpiresIn - 300
	session.Values["id"] = u.ID

	err = session.Save(request, writer)
	if err != nil {
		log.Error().Err(err).Msg("")
		return fw.Error(err)
	}

	writer.WriteHeader(http.StatusOK)
	resp := response{Token: longToken, Friends: u.Friends}
	respJson, err := json.Marshal(resp)
	if err != nil {
		return fw.Error(err)
	}
	writer.Write(respJson)
	return writer.GetProxyResponse()
}

func main() {
	lambda.Start(login)
}

func checkIfUserExists(ctx context.Context, id string) (bool, error) {
	ue := database.BuildUserEntity(database.User{ID: id})
	err := ue.Get()
	if err != nil {
		_, ok := err.(*database.NotExists)
		if ok {
			return false, nil
		}
		return false, err
	}
	return true, nil
}
