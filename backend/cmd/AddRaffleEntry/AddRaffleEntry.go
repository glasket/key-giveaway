package main

import (
	"github.com/aws/aws-lambda-go/lambda"
)

func AddRaffleEntry() {}

func main() {
	lambda.Start(AddRaffleEntry)
}
