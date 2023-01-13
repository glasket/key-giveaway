package main

import (
	"github.com/aws/aws-lambda-go/lambda"
)

func GetDrops() {}

func main() {
	lambda.Start(GetDrops)
}
