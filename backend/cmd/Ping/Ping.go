package main

import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func ping() (events.APIGatewayV2HTTPResponse, error) {
	return events.APIGatewayV2HTTPResponse{
		Body:       "{\"message\": \"Pong\"}",
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(ping)
}
