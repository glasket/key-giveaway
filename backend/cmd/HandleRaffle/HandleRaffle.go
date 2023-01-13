package main

import (
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRaffle() {}

func main() {
	lambda.Start(HandleRaffle)
}
