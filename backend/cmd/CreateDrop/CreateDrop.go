package main

import (
	"key-giveaway/pkg/models"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
)

type request struct {
	Name  string     `json:"name"`
	End   time.Time  `json:"endAt"`
	Items []dropItem `json:"items"`
}

type dropItem struct {
	Name  string            `json:"name"`
	Items []models.GameItem `json:"items"`
}

func CreateDrop(request request) (bool, error) {
	return true, nil
}

func main() {
	lambda.Start(CreateDrop)
}
