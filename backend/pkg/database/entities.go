package database

import (
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/glasket/datastructures/set"
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
	Name       string
	Items      []GameItem
	InsertTime time.Time
}

func BuildUserItemEntity(u User, i Item) UserItemEntity {
	pk, sk := buildKey(u, i)
	return UserItemEntity{
		Key:        Key{PK: pk, SK: sk},
		Name:       i.Name,
		Items:      i.Items,
		InsertTime: i.InsertTime,
	}
}

func (e *UserItemEntity) ToItem() Item {
	return Item{
		ID:         keyToId(e.SK),
		Name:       e.Name,
		Items:      e.Items,
		InsertTime: e.InsertTime,
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

func (d DropEntity) ToDrop() Drop {
	return Drop{
		ID:   keyToId(d.PK),
		Name: d.Name,
		End:  d.End,
	}
}

func (d DropEntity) getKey() Key { return d.Key }

type DropItemEntity struct {
	Key
	Name    string
	Items   []GameItem
	Entries []string `dynamodbav:",omitempty,stringset"`
}

func BuildDropItemEntity(d Drop, i Item) DropItemEntity {
	pk, sk := buildKey(d, i)
	var entries []string
	if i.Entries.Count() != 0 {
		entries = i.Entries.Values()
	}
	return DropItemEntity{
		Key:     Key{PK: pk, SK: sk},
		Name:    i.Name,
		Items:   i.Items,
		Entries: entries,
	}
}

func (d DropItemEntity) AddRaffleEntry(userId string) (newEntity DropItemEntity, err error) {
	addSet := types.AttributeValueMemberSS{Value: []string{userId}}
	update := expression.Add(expression.Name("Entries"), expression.Value(addSet))
	expr, err := expression.NewBuilder().WithUpdate(update).Build()
	if err != nil {
		return newEntity, err
	}
	resp, err := db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		Key:                       getEntityKey(d),
		TableName:                 TableName,
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		UpdateExpression:          expr.Update(),
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

func (d DropItemEntity) RemoveRaffleEntry(userId string) (newEntity DropItemEntity, err error) {
	removeSet := types.AttributeValueMemberSS{Value: []string{userId}}
	update := expression.Delete(expression.Name("Entries"), expression.Value(removeSet))
	expr, err := expression.NewBuilder().WithUpdate(update).Build()
	if err != nil {
		return newEntity, err
	}
	resp, err := db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		Key:                       getEntityKey(d),
		TableName:                 TableName,
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		UpdateExpression:          expr.Update(),
		ReturnValues:              types.ReturnValueAllNew,
	})
	if err != nil {
		return newEntity, err
	}
	err = attributevalue.UnmarshalMap(resp.Attributes, &newEntity)
	if err != nil {
		return newEntity, err
	}
	return newEntity, nil
}

func (d DropItemEntity) ToItem() Item {
	for i := range d.Items {
		// Drops never need to have access to the key
		d.Items[i].Key = ""
	}
	return Item{
		ID:      keyToId(d.SK),
		DropId:  keyToId(d.PK),
		Name:    d.Name,
		Items:   d.Items,
		Entries: set.NewSetFromSlice(d.Entries),
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

func keyToId(key string) string {
	return strings.Split(key, "#")[1]
}
