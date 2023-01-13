package models

import (
	"time"

	"github.com/glasket/datastructures/set"
)

const (
	userEntityTag  rune = 'U'
	tokenEntityTag rune = 'T'
	dropEntityTag  rune = 'D'
	itemEntityTag  rune = 'I'
)

type entity interface {
	id() string
	tag() rune
}

type User struct {
	Id       string
	WonItems []Item
}

func (u User) id() string {
	return u.Id
}

func (u User) tag() rune {
	return userEntityTag
}

type Token struct {
	Token  string
	Expiry time.Time
}

func (t Token) id() string {
	return t.Token
}

func (t Token) tag() rune {
	return tokenEntityTag
}

type Drop struct {
	Id    string
	Name  string
	End   time.Time
	Items []Item
}

func (d Drop) id() string {
	return d.Id
}

func (d Drop) tag() rune {
	return dropEntityTag
}

type Item struct {
	Id      string
	DropId  string
	Name    string
	Items   []GameItem
	Entries set.Set[string]
}

func (d Item) id() string {
	return d.Id
}

func (d Item) tag() rune {
	return itemEntityTag
}

type GameItem struct {
	Name  string `json:"name"`
	AppId string `json:"appId"` // Steam App ID
	Key   string `json:"key"`
}

type FBErrorMessage struct {
	Message      string `json:"message"`
	Type         string `json:"type"`
	Code         int    `json:"code"`
	ErrorSubCode int    `json:"error_subcode"`
	TraceId      string `json:"fbtrace_id"`
}
