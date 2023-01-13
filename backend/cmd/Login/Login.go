package main

import (
	"context"
	"encoding/json"
	"fmt"
	c "key-giveaway/pkg/constants"
	"key-giveaway/pkg/models"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

const facebook_url string = "https://graph.facebook.com/v15.0/"
const facebook_me string = "me?fields=id&access_token="
const facebook_long_token string = "oauth/access_token?grant_type=fb_exchange_token&client_id=%s&client_secret=%s&fb_exchange_token=%s"
const facebook_secret_name string = "prod/keygiveaway/facebook"

var db dynamodb.Client
var sec secretsmanager.Client

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(err)
	}
	db = *dynamodb.NewFromConfig(cfg)
	sec = *secretsmanager.NewFromConfig(cfg)
}

func login(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Get ID for the token
	var token string
	json.Unmarshal([]byte(req.Body), &token)
	userId, err := getTokenId(token)
	if err != nil {
		log.Fatal(err.Error())
	}

	// Exchange token
	var fbSecret facebookSecret
	res, err := sec.GetSecretValue(ctx, &secretsmanager.GetSecretValueInput{
		SecretId: aws.String(facebook_secret_name),
	})
	if err != nil {
		log.Fatal(err.Error())
	}
	if err = json.Unmarshal([]byte(*res.SecretString), &fbSecret); err != nil {
		log.Fatal(err.Error())
	}
	longToken, err := exchangeToken(token, fbSecret)
	if err != nil {
		log.Fatal(err.Error())
	}

	// Create primary key
	u := models.User{Id: userId}
	t := models.Token{Token: longToken.Token, Expiry: longToken.Expiry}
	item, err := attributevalue.MarshalMap(models.BuildUserTokenEntity(u, t))
	if err != nil {
		log.Fatal(err.Error())
	}

	// Save
	_, err = db.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(c.TableName),
		Item:      item,
	})
	if err != nil {
		log.Fatal(err.Error())
	}

	resp, err := json.Marshal(t)
	if err != nil {
		log.Fatal(err.Error())
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       string(resp),
	}, nil
}

func main() {
	lambda.Start(login)
}

func getTokenId(token string) (string, error) {
	var userInfo struct {
		Id  *string                `json:"id"`
		Err *models.FBErrorMessage `json:"error"`
	}
	resp, err := http.Get(createMeUrl(token))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	d := json.NewDecoder(resp.Body)
	if err := d.Decode(&userInfo); err != nil {
		return "", err
	}

	// Check to see if Err
	if userInfo.Err != nil {
		return "", fmt.Errorf("FBError: %v", userInfo.Err.Message)
	}
	return *userInfo.Id, nil
}

func createMeUrl(token string) string {
	var sb strings.Builder
	sb.WriteString(facebook_url)
	sb.WriteString(facebook_me)
	sb.WriteString(token)
	return sb.String()
}

func exchangeToken(token string, secret facebookSecret) (longToken bearerToken, err error) {
	var sb strings.Builder
	sb.WriteString(facebook_url)
	sb.WriteString(fmt.Sprintf(facebook_long_token, secret.Id, secret.Secret, token))
	resp, err := http.Get(sb.String())
	if err != nil {
		return longToken, err
	}
	defer resp.Body.Close()
	d := json.NewDecoder(resp.Body)
	d.DisallowUnknownFields()
	var respBody tokenResponse
	err = d.Decode(&respBody)
	if err != nil {
		return longToken, err
	}
	longToken.Expiry = time.Now().Add(time.Second * time.Duration(respBody.TTL))
	longToken.Token = respBody.Token
	return longToken, nil
}

type tokenResponse struct {
	Token string `json:"access_token"`
	Type  string `json:"token_type"`
	TTL   int    `json:"expires_in"`
}

type bearerToken struct {
	Token  string    `json:"token"`
	Expiry time.Time `json:"expiry"`
}

type facebookSecret struct {
	Id     string `json:"app_id"`
	Secret string `json:"app_secret"`
}
