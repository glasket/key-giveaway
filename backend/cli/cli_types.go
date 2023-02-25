package main

const (
	createDrop string = "CreateDrop"
	addItem    string = "AddItem"
	removeDrop string = "RemoveDrop"
	removeItem string = "RemoveItem"
)

type job struct {
	Action string      `json:"Action"`
	Item   interface{} `json:"Item"`
}
