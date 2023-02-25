package facebook

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

const (
	version            string = "v15.0"
	url                string = "https://graph.facebook.com/" + version + "/"
	me_url             string = url + "me?fields=id"
	token_exchange_url string = url + "oauth/access_token?grant_type=fb_exchange_token&client_id=%s&client_secret=%s&fb_exchange_token=%s"
	friend_url         string = url + "%s/friends/%s"
)

var (
	httpClient http.Client
)

type Client struct {
	Id          string
	Secret      string
	AccessToken string
}

type fbError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
	Code    int    `json:"code"`
	TraceId string `json:"fbtrace_id"`
}

type fbResponse interface {
	error() *fbError
}

type getUserIdResponse struct {
	Id    *string  `json:"id"`
	Error *fbError `json:"error"`
}

func (r getUserIdResponse) error() *fbError {
	return r.Error
}

func (c Client) GetUserId() (string, error) {
	var respBody getUserIdResponse
	err := c.invoke(me_url, &respBody)
	if err != nil {
		return "", err
	}
	return *respBody.Id, nil
}

type exchangeTokenResponse struct {
	*Token
	Error *fbError `json:"error"`
}

func (r exchangeTokenResponse) error() *fbError {
	return r.Error
}

type Token struct {
	Token     *string `json:"access_token"`
	Type      *string `json:"token_type"`
	ExpiresIn *int    `json:"expires_in"`
}

func (c Client) ExchangeToken() (Token, error) {
	url := fmt.Sprintf(token_exchange_url, c.Id, c.Secret, c.AccessToken)
	var respBody exchangeTokenResponse
	err := c.invoke(url, &respBody)
	if err != nil {
		return Token{}, err
	}
	return *respBody.Token, nil
}

type friendResponse struct {
	Data  []map[string]string
	Error *fbError
}

func (r friendResponse) error() *fbError {
	return r.Error
}

func (c Client) Friends(firstId string, secondId string) (bool, error) {
	url := fmt.Sprintf(friend_url, firstId, secondId)
	var respBody friendResponse
	err := c.invoke(url, &respBody)
	if err != nil {
		return false, err
	}
	return len(respBody.Data) == 1, nil
}

func (c Client) invoke(url string, response fbResponse) error {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.AccessToken)
	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(response); err != nil {
		return err
	}
	if response.error() != nil {
		return errors.New(response.error().Message)
	}
	return nil
}
