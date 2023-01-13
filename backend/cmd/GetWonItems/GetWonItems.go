package main

import (
	"github.com/aws/aws-lambda-go/lambda"
)

func GetWonItems() {}

func main() {
	lambda.Start(GetWonItems)
}
