package database

import (
	"encoding/json"
	"errors"
	"math"
	"net/http"
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
	ID       string `json:"id"`
	Friends  bool   `json:"is_friends"`
	WonItems []Item `json:"won_items"`
}

func (u User) Id() string {
	return u.ID
}

func (u User) Tag() rune {
	return userEntityTag
}

func (u *User) IsFriend() (bool, error) {
	e := BuildUserEntity(*u)
	err := e.Get()
	if err != nil {
		return false, err
	}
	return e.Friends, nil
}

func (u *User) GetItems() error {
	e := BuildUserEntity(*u)
	expr, err := expression.NewBuilder().
		WithKeyCondition(
			expression.KeyAnd(
				expression.KeyEqual(expression.Key("PK"), expression.Value(e.PK)),
				expression.KeyBeginsWith(expression.Key("SK"), string(itemEntityTag)),
			)).
		Build()
	if err != nil {
		return err
	}
	var resp *dynamodb.QueryOutput
	resp, err = db.Query(ctx, &dynamodb.QueryInput{
		TableName:                 TableName,
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		KeyConditionExpression:    expr.KeyCondition(),
	})
	if err != nil {
		return err
	}
	var userItemEntities []UserItemEntity
	err = attributevalue.UnmarshalListOfMaps(resp.Items, &userItemEntities)
	if err != nil {
		return err
	}
	for _, i := range userItemEntities {
		u.WonItems = append(u.WonItems, i.ToItem())
	}
	return nil
}

func (u *User) Delete() error {
	e := BuildUserEntity(*u)
	err := e.Delete()
	if err != nil {
		return err
	}
	return e.DeleteItems()
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

func (d Drop) GetItems(withKeys bool) (Drop, error) {
	e := BuildDropEntity(d)
	expr, err := expression.NewBuilder().
		WithKeyCondition(
			expression.KeyAnd(
				expression.KeyEqual(expression.Key("PK"), expression.Value(e.PK)),
				expression.KeyBeginsWith(expression.Key("SK"), string(itemEntityTag)),
			)).
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
	})
	if err != nil {
		return d, err
	}
	// Estimate ~8000 items or so per MB, so leave this out unless proved otherwise
	// items := resp.Items
	// for resp.LastEvaluatedKey != nil {
	// 	resp, err = db.Query(ctx, &dynamodb.QueryInput{
	// 		TableName:                 TableName,
	// 		ExpressionAttributeNames:  expr.Names(),
	// 		ExpressionAttributeValues: expr.Values(),
	// 		KeyConditionExpression:    expr.KeyCondition(),
	// 		ExclusiveStartKey:         resp.LastEvaluatedKey,
	// 	})
	// 	if err != nil {
	// 		return d, err
	// 	}
	// 	items = append(items, resp.Items...)
	// 	if resp.LastEvaluatedKey == nil {
	// 		break
	// 	}
	// }
	var dropItemEntityList []DropItemEntity
	attributevalue.UnmarshalListOfMaps(resp.Items, &dropItemEntityList)
	for _, item := range dropItemEntityList {
		d.Items = append(d.Items, item.ToItem(withKeys))
	}
	return d, nil
}

func GetAllDrops(includeOld bool) ([]Drop, error) {
	filter := expression.And(
		expression.BeginsWith(expression.Name("PK"), string(dropEntityTag)),
		expression.BeginsWith(expression.Name("SK"), string(dropEntityTag)),
	)
	if !includeOld {
		filter = expression.And(
			filter,
			expression.GreaterThan(expression.Name("End"), expression.Value(time.Now().UTC().String())),
		)
	}
	expr, err := expression.
		NewBuilder().
		WithFilter(filter).
		Build()
	if err != nil {
		return nil, err
	}
	out, err := db.Scan(ctx, &dynamodb.ScanInput{
		TableName:                 TableName,
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		FilterExpression:          expr.Filter(),
	})
	if err != nil {
		return nil, err
	}
	var dropEntities []DropEntity
	err = attributevalue.UnmarshalListOfMaps(out.Items, &dropEntities)
	if err != nil {
		return nil, err
	}
	var drops []Drop
	for _, i := range dropEntities {
		drops = append(drops, i.ToDrop())
	}
	return drops, nil
}

func validateDrop(id string) bool {
	e := BuildDropEntity(Drop{ID: id})
	expr, err := expression.NewBuilder().
		WithKeyCondition(
			expression.KeyAnd(
				expression.KeyEqual(expression.Key("PK"), expression.Value(e.PK)),
				expression.KeyBeginsWith(expression.Key("SK"), string(e.SK)),
			)).WithFilter(
		expression.GreaterThan(
			expression.Name("End"),
			expression.Value(time.Now().UTC().Format(time.RFC3339)))).
		Build()
	if err != nil {
		return false
	}
	out, err := db.Query(ctx, &dynamodb.QueryInput{
		TableName:                 TableName,
		KeyConditionExpression:    expr.KeyCondition(),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		FilterExpression:          expr.Filter(),
	})
	if err != nil {
		return false
	}
	if out.Count < 1 {
		return false
	}
	return true
}

type Item struct {
	ID         string          `json:"id"`
	DropId     string          `json:"drop_id"`
	Name       string          `json:"name"`
	Items      []GameItem      `json:"items"`
	Entries    set.Set[string] `json:"entries"`
	InsertTime time.Time       `json:"insert_time,omitempty"`
}

func (i Item) Id() string {
	return i.ID
}

func (i Item) Tag() rune {
	return itemEntityTag
}

func (i Item) AddRaffleEntry(userId string) (Item, error) {
	return i.HandleRaffleEntry(userId, DropItemEntity.AddRaffleEntry)
}

func (i Item) RemoveRaffleEntry(userId string) (Item, error) {
	return i.HandleRaffleEntry(userId, DropItemEntity.RemoveRaffleEntry)
}

func (i Item) HandleRaffleEntry(userId string, raffleFunc func(e DropItemEntity, userId string) (DropItemEntity, error)) (Item, error) {
	valid := validateDrop(i.DropId)
	if !valid {
		return Item{}, errors.New("drop is expired")
	}
	e := BuildDropItemEntity(Drop{ID: i.DropId}, i)
	e, err := raffleFunc(e, userId)
	if err != nil {
		return Item{}, err
	}
	return e.ToItem(false), nil
}

type GameItem struct {
	Name          string   `json:"name"`
	AppId         string   `json:"appId"` // Steam App ID
	Key           string   `json:"key"`
	ReviewScore   int16    `json:"review_score"`
	Price         int      `json:"price"`
	InitialPrice  int      `json:"initial_price"`
	Discount      int      `json:"discount"`
	LockedRegions []string `json:"locked_regions,omitempty" dynamodbav:",omitempty,stringset"`
}

type steamSpyResponse struct {
	Name         string `json:"name"`
	Pos          int    `json:"positive"`
	Neg          int    `json:"negative"`
	Price        int    `json:"price,string"`
	InitialPrice int    `json:"initialprice,string"`
	Discount     int    `json:"discount,string"`
}

func (g *GameItem) GetSteamSpyData() error {
	if g == nil {
		return errors.New("*GameItem is nil")
	}
	resp, err := http.Get("https://steamspy.com/api.php?request=appdetails&appid=" + g.AppId)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	var ssResp steamSpyResponse
	if json.NewDecoder(resp.Body).Decode(&ssResp); err != nil {
		return err
	}
	g.Name = ssResp.Name
	g.Price = ssResp.Price
	g.InitialPrice = ssResp.InitialPrice
	g.Discount = ssResp.Discount
	g.ReviewScore = int16(math.Round(float64(ssResp.Pos) / float64(ssResp.Pos+ssResp.Neg) * 100.0))
	return nil
}

type FBErrorMessage struct {
	Message      string `json:"message"`
	Type         string `json:"type"`
	Code         int    `json:"code"`
	ErrorSubCode int    `json:"error_subcode"`
	TraceId      string `json:"fbtrace_id"`
}
