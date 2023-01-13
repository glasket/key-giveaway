package main

import (
	"github.com/aws/aws-lambda-go/lambda"
)

func GetDropItems() {}

func main() {
	lambda.Start(GetDropItems)
}
