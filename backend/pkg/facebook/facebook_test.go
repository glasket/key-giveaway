package facebook_test

import (
	"flag"
	"fmt"
	"key-giveaway/pkg/facebook"
	"os"
	"testing"
)

var (
	client facebook.Client

	TestUserId          string
	TestUserFriendId    string
	TestUserNotFriendId string
)

func TestMain(m *testing.M) {
	flag.StringVar(&client.Id, "id", "", "facebook api client id")
	flag.StringVar(&client.Secret, "secret", "", "facebook api client secret")

	flag.StringVar(&TestUserId, "test_id", "", "id of the test user")
	flag.StringVar(&client.AccessToken, "test_token", "", "access token of the test user")
	flag.StringVar(&TestUserFriendId, "test_friend", "", "id of test user's friend")
	flag.StringVar(&TestUserNotFriendId, "test_not_friend", "", "id of test user who isn't friends")

	flag.Parse()

	if client.Id == "" || client.Secret == "" || TestUserId == "" || client.AccessToken == "" || TestUserFriendId == "" || TestUserNotFriendId == "" {
		fmt.Println("All args must be passed")
		os.Exit(1)
	}

	m.Run()
}

func TestGetUserId(t *testing.T) {
	id, err := client.GetUserId()
	if err != nil {
		t.Fatal(err.Error())
	}
	if id != TestUserId {
		t.Error("id mismatch")
	}
}

func TestExchangeToken(t *testing.T) {
	_, err := client.ExchangeToken()
	if err != nil {
		t.Fatal(err.Error())
	}
}

func TestFriends(t *testing.T) {
	ok, err := client.Friends(TestUserId, TestUserFriendId)
	if err != nil {
		t.Fatal(err.Error())
	}
	if !ok {
		t.Error("friends returned as not friends")
	}
	ok, err = client.Friends(TestUserId, TestUserNotFriendId)
	if err != nil {
		t.Fatal(err.Error())
	}
	if ok {
		t.Error("not friends returned as friends")
	}
}
