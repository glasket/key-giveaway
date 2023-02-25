package main

import (
	"context"
	"encoding/json"
	"key-giveaway/pkg/database"
	"key-giveaway/pkg/facebook"
	"key-giveaway/pkg/fw"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

const (
	fb_secret string = "prod/keygiveaway/facebook"
)

var (
	sec secretsmanager.Client
)

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(err)
	}
	database.Init(cfg)
	sec = *secretsmanager.NewFromConfig(cfg)
}

func login(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	request, writer, session, err := fw.Start(ctx, req)
	if err != nil {
		return fw.Error(err)
	}
	if request == nil {
		return fw.InvalidCookie(writer)
	}

	var token string
	json.Unmarshal([]byte(req.Body), &token)
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

	var fbSecret facebookSecret
	res, err := sec.GetSecretValue(ctx, &secretsmanager.GetSecretValueInput{
		SecretId: aws.String(fb_secret),
	})
	if err != nil {
		fw.Error(err)
	}
	if err = json.Unmarshal([]byte(*res.SecretString), &fbSecret); err != nil {
		fw.Error(err)
	}
	fb.Id = fbSecret.Id
	fb.Secret = fbSecret.Secret

	friends, err := fb.Friends(userId, fbSecret.OwnerId)
	if err != nil {
		fw.Error(err)
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
		log.Fatal(err.Error())
	}

	// Invalidate session before Facebook token
	// Simplifies session management somewhat
	session.Options.MaxAge = *longToken.ExpiresIn - 300
	session.Values["id"] = u.Id

	session.Save(request, writer)

	writer.WriteHeader(http.StatusOK)
	tokenJson, err := json.Marshal(longToken)
	if err != nil {
		return fw.Error(err)
	}
	writer.Write(tokenJson)
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

type facebookSecret struct {
	Id      string `json:"app_id"`
	Secret  string `json:"app_secret"`
	OwnerId string `json:"owner_id"`
}
