package main

import (
	"github.com/aws/aws-lambda-go/lambda"
)

func AddDropItem() {}

func main() {
	lambda.Start(AddDropItem)
}
