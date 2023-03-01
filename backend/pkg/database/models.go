package database

import (
	"time"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/glasket/datastructures/set"
)

const (
	userEntityTag  rune = 'U'
	tokenEntityTag rune = 'T'
	dropEntityTag  rune = 'D'
	itemEntityTag  rune = 'I'
)

type User struct {
	ID       string
	Friends  bool
	WonItems []Item
}

func (u User) Id() string {
	return u.ID
}

func (u User) Tag() rune {
	return userEntityTag
}

type Drop struct {
	ID    string    `json:"id"`
	Name  string    `json:"name"`
	End   time.Time `json:"ends_at"`
	Items []Item    `json:"items"`
}

func (d Drop) Id() string {
	return d.ID
}

func (d Drop) Tag() rune {
	return dropEntityTag
}

func (d Drop) Save() error {
	e := BuildDropEntity(d)
	if err := e.Save(); err != nil {
		return err
	}
	var itemEntities []DropItemEntity
	for _, i := range d.Items {
		itemEntities = append(itemEntities, BuildDropItemEntity(d, i))
	}
	if err := BatchWrite(itemEntities); err != nil {
		return err
	}
	return nil
}

func (d Drop) GetItems() (Drop, error) {
	e := BuildDropEntity(d)
	expr, err := expression.NewBuilder().
		WithKeyCondition(expression.Key("PK").Equal(expression.Value(e.PK))).
		WithFilter(expression.BeginsWith(expression.Name("SK"), string(itemEntityTag))).
		Build()
	if err != nil {
		return d, err
	}
	var resp *dynamodb.QueryOutput
	resp, err = db.Query(ctx, &dynamodb.QueryInput{
		TableName:                 TableName,
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		KeyConditionExpression:    expr.KeyCondition(),
		FilterExpression:          expr.Filter(),
	})
	items := resp.Items
	for resp.LastEvaluatedKey != nil {
		resp, err = db.Query(ctx, &dynamodb.QueryInput{
			TableName:                 TableName,
			ExpressionAttributeNames:  expr.Names(),
			ExpressionAttributeValues: expr.Values(),
			KeyConditionExpression:    expr.KeyCondition(),
			FilterExpression:          expr.Filter(),
			ExclusiveStartKey:         resp.LastEvaluatedKey,
		})
		if err != nil {
			return d, err
		}
		items = append(items, resp.Items...)
		if resp.LastEvaluatedKey == nil {
			break
		}
	}
	var dropItemEntityList []DropItemEntity
	attributevalue.UnmarshalListOfMaps(items, &dropItemEntityList)
	for _, item := range dropItemEntityList {
		d.Items = append(d.Items, item.ToItem())
	}
	return d, nil
}

type Item struct {
	ID      string          `json:"id"`
	DropId  string          `json:"dropId"`
	Name    string          `json:"name"`
	Items   []GameItem      `json:"items"`
	Entries set.Set[string] `json:"entries"`
}

func (i Item) Id() string {
	return i.ID
}

func (i Item) Tag() rune {
	return itemEntityTag
}

func (i Item) AddRaffleEntry(userId string) (Item, error) {
	entity := BuildDropItemEntity(Drop{ID: i.DropId}, i)
	entity, err := entity.AddRaffleEntry(userId)
	if err != nil {
		return Item{}, err
	}
	return entity.ToItem(), nil
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
