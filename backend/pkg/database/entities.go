package database

import (
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/rs/zerolog/log"
)

type Key struct {
	PK string
	SK string
}

type model interface {
	Id() string
	Tag() rune
}

type entity interface {
	getKey() Key
}

func buildKey(primary model, secondary model) (string, string) {
	var pk, sk strings.Builder
	pk.WriteRune(primary.Tag())
	pk.WriteRune('#')
	pk.WriteString(primary.Id())
	sk.WriteRune(secondary.Tag())
	sk.WriteRune('#')
	sk.WriteString(secondary.Id())

	return pk.String(), sk.String()
}

type UserEntity struct {
	Key
	Friends bool
}

func BuildUserEntity(u User) UserEntity {
	pk, sk := buildKey(u, u)
	return UserEntity{
		Key:     Key{PK: pk, SK: sk},
		Friends: u.Friends,
	}
}

func (u *UserEntity) Get() error {
	o, err := db.GetItem(ctx, &dynamodb.GetItemInput{
		Key:       getEntityKey(u),
		TableName: TableName,
	})
	if err != nil {
		return err
	}
	if o.Item == nil {
		return &NotExists{}
	}
	err = attributevalue.UnmarshalMap(o.Item, u)
	return err
}

func (u UserEntity) Save() error {
	_, err := db.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: TableName,
		Item:      getEntityItem(u),
	})
	return err
}

func (u UserEntity) getKey() Key { return u.Key }

type UserItemEntity struct {
	Key
	Name  string
	Items []GameItem
}

func BuildUserItemEntity(u User, i Item) UserItemEntity {
	pk, sk := buildKey(u, i)
	return UserItemEntity{
		Key:   Key{PK: pk, SK: sk},
		Name:  i.Name,
		Items: i.Items,
	}
}

type DropEntity struct {
	Key
	Name string
	End  time.Time
}

func BuildDropEntity(d Drop) DropEntity {
	pk, sk := buildKey(d, d)
	return DropEntity{
		Key:  Key{PK: pk, SK: sk},
		Name: d.Name,
		End:  d.End,
	}
}

func (d DropEntity) Save() error {
	_, err := db.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: TableName,
		Item:      getEntityItem(d),
	})
	return err
}

func (d DropEntity) getKey() Key { return d.Key }

type DropItemEntity struct {
	Key
	Name    string
	Items   []GameItem
	Entries []string `dynamodbav:",stringset"`
}

func BuildDropItemEntity(d Drop, i Item) DropItemEntity {
	pk, sk := buildKey(d, i)
	return DropItemEntity{
		Key:     Key{PK: pk, SK: sk},
		Name:    i.Name,
		Items:   i.Items,
		Entries: i.Entries.Values(),
	}
}

func (d DropItemEntity) AddRaffleEntry(userId string) (newEntity DropItemEntity, err error) {
	addSet := types.AttributeValueMemberSS{Value: []string{userId}}
	update := expression.Add(expression.Name("entries"), expression.Value(addSet))
	exp, err := expression.NewBuilder().WithUpdate(update).Build()
	if err != nil {
		return newEntity, err
	}
	resp, err := db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		Key:                       getEntityKey(d),
		TableName:                 TableName,
		ExpressionAttributeNames:  exp.Names(),
		ExpressionAttributeValues: exp.Values(),
		UpdateExpression:          exp.Update(),
		ReturnValues:              types.ReturnValueAllNew,
	})
	if err != nil {
		return newEntity, err
	}
	err = attributevalue.UnmarshalMap(resp.Attributes, &newEntity)
	if err != nil {
		return newEntity, err
	}
	return newEntity, err
}

func (d DropItemEntity) ToItem() Item {
	return Item{
		ID:     strings.Split(d.SK, "#")[1],
		DropId: strings.Split(d.PK, "#")[1],
		Name:   d.Name,
		Items:  d.Items,
	}
}

func (d DropItemEntity) getKey() Key { return d.Key }

func BatchWrite[T any](items []T) error {
	start := 0
	end := start + batchSize
	for start < len(items) {
		var reqs []types.WriteRequest
		if end > len(items) {
			end = len(items)
		}
		for _, item := range items[start:end] {
			i := getEntityItem(item)
			reqs = append(reqs, types.WriteRequest{PutRequest: &types.PutRequest{Item: i}})
		}
		_, err := db.BatchWriteItem(ctx, &dynamodb.BatchWriteItemInput{
			RequestItems: map[string][]types.WriteRequest{*TableName: reqs},
		})
		if err != nil {
			return err
		}
		start = end
		end += batchSize
	}
	return nil
}

func getEntityKey(e entity) map[string]types.AttributeValue {
	k, err := attributevalue.MarshalMap(e.getKey())
	if err != nil {
		log.Fatal().Err(err).Msg("")
	}
	return k
}

func getEntityItem(e interface{}) map[string]types.AttributeValue {
	i, err := attributevalue.MarshalMap(e)
	if err != nil {
		log.Fatal().Err(err).Msg("")
	}
	return i
}
