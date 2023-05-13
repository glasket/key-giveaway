package main

const (
	createDrop string = "CreateDrop"
)

type job struct {
	Action string      `json:"Action"`
	Item   interface{} `json:"Item"`
}
