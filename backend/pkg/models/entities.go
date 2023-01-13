package models

import (
	"strings"
	"time"
)

func buildKey(primary entity, secondary entity) (string, string) {
	var pk, sk strings.Builder
	pk.WriteRune(primary.tag())
	pk.WriteRune('#')
	pk.WriteString(primary.id())
	sk.WriteRune(secondary.tag())
	sk.WriteRune('#')
	sk.WriteString(secondary.id())

	return pk.String(), sk.String()
}

type UserTokenEntity struct {
	PK     string
	SK     string
	Expiry time.Time
}

func BuildUserTokenEntity(u User, t Token) UserTokenEntity {
	pk, sk := buildKey(u, t)
	return UserTokenEntity{
		PK:     pk,
		SK:     sk,
		Expiry: t.Expiry,
	}
}

type UserItemEntity struct {
	PK    string
	SK    string
	Name  string
	Items []GameItem
}

func BuildUserItemEntity(u User, i Item) UserItemEntity {
	pk, sk := buildKey(u, i)
	return UserItemEntity{
		PK:    pk,
		SK:    sk,
		Name:  i.Name,
		Items: i.Items,
	}
}

type DropEntity struct {
	PK   string
	SK   string
	Name string
	End  time.Time
}

func BuildDropEntity(d Drop) DropEntity {
	pk, sk := buildKey(d, d)
	return DropEntity{
		PK:   pk,
		SK:   sk,
		Name: d.Name,
		End:  d.End,
	}
}

type DropItemEntity struct {
	PK      string
	SK      string
	Name    string
	Items   []GameItem
	Entries []string
}

func BuildDropItemEntity(d Drop, i Item) DropItemEntity {
	pk, sk := buildKey(d, i)
	return DropItemEntity{
		PK:      pk,
		SK:      sk,
		Name:    i.Name,
		Items:   i.Items,
		Entries: i.Entries.Values(),
	}
}
