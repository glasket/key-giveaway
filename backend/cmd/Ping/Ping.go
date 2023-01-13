package main

import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func ping() (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{
		Body:       "{\"message\": \"Pong\"}",
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(ping)
}
