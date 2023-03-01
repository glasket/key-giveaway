// Framework
//
// A package providing a collection of functions for handling responses from keygiveaway lambdas.
package fw

import (
	"context"
	_ "embed"
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/awslabs/aws-lambda-go-api-proxy/core"
	"github.com/gorilla/sessions"
)

const (
	application_key_secret string = "prod/keygiveaway/cipher"
)

var (
	//go:embed hmac.key
	hmacKey []byte
	//go:embed enc.key
	encKey []byte
)

func Response(statusCode int, header map[string]string, body interface{}) (events.APIGatewayProxyResponse, error) {
	if header == nil {
		header = make(map[string]string)
	}

	bodyJson, err := json.Marshal(body)
	if err != nil {
		return events.APIGatewayProxyResponse{}, err
	}

	header["Content-Type"] = "application/json"

	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Headers:    header,
		Body:       string(bodyJson),
	}, nil
}

func Start(ctx context.Context, req events.APIGatewayProxyRequest) (*http.Request, *core.ProxyResponseWriter, *sessions.Session, error) {
	ra := core.RequestAccessor{}
	r, err := ra.EventToRequestWithContext(ctx, req)
	if err != nil {
		return nil, nil, nil, err
	}
	w := core.ProxyResponseWriter{}
	w.Header().Set("Content-Type", "application/json")
	store := sessions.NewCookieStore(hmacKey, encKey)
	s, err := store.Get(r, "kga_sess")
	s.Options = &sessions.Options{
		Path:     "/api/",
		Secure:   true,
		HttpOnly: false,
		SameSite: http.SameSiteStrictMode,
		Domain:   "giveaway.glasket.com",
	}
	if err != nil {
		// Something went wrong with decoding, so invalidate the cookie
		s.Options.MaxAge = -1
		s.Save(r, &w)
		return nil, &w, s, nil
	}
	return r, &w, s, nil
}

func NotFriends(w *core.ProxyResponseWriter) (events.APIGatewayProxyResponse, error) {
	w.WriteHeader(http.StatusUnauthorized)
	resp, err := json.Marshal(ErrorResponse{Reason: "not friends"})
	if err != nil {
		return Error(err)
	}
	w.Write(resp)
	return w.GetProxyResponse()
}

func InvalidCookie(w *core.ProxyResponseWriter) (events.APIGatewayProxyResponse, error) {
	w.WriteHeader(http.StatusUnauthorized)
	resp, err := json.Marshal(ErrorResponse{Reason: "invalid cookie"})
	if err != nil {
		return Error(err)
	}
	w.Write(resp)
	return w.GetProxyResponse()
}

func Error(err error) (events.APIGatewayProxyResponse, error) {
	return events.APIGatewayProxyResponse{}, err
}
