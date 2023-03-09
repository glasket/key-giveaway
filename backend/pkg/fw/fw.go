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
	"github.com/rs/zerolog/log"
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

func Response(statusCode int, header map[string]string, body interface{}) (events.APIGatewayV2HTTPResponse, error) {
	if header == nil {
		header = make(map[string]string)
	}

	bodyJson, err := json.Marshal(body)
	if err != nil {
		return events.APIGatewayV2HTTPResponse{}, err
	}

	header["Content-Type"] = "application/json"

	return events.APIGatewayV2HTTPResponse{
		StatusCode: statusCode,
		Headers:    header,
		Body:       string(bodyJson),
	}, nil
}

func Start(ctx context.Context, req events.APIGatewayV2HTTPRequest) (*http.Request, *core.ProxyResponseWriterV2, *sessions.Session, error) {
	log.Info().Str("request", req.Body).Msg("")
	r, w, err := StartNoSession(ctx, req)
	if err != nil {
		return nil, nil, nil, err
	}
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
		err = s.Save(r, w)
		if err != nil {
			return nil, nil, nil, err
		}
		return nil, w, s, nil
	}
	return r, w, s, nil
}

func StartNoSession(ctx context.Context, req events.APIGatewayV2HTTPRequest) (*http.Request, *core.ProxyResponseWriterV2, error) {
	ra := core.RequestAccessorV2{}
	r, err := ra.EventToRequestWithContext(ctx, req)
	if err != nil {
		return nil, nil, err
	}
	w := core.NewProxyResponseWriterV2()
	w.Header().Set("Content-Type", "application/json")
	return r, w, nil
}

func NotFriends(w *core.ProxyResponseWriterV2) (events.APIGatewayV2HTTPResponse, error) {
	w.WriteHeader(http.StatusUnauthorized)
	resp, err := json.Marshal(ErrorResponse{Reason: "not friends"})
	if err != nil {
		return Error(err)
	}
	w.Write(resp)
	return w.GetProxyResponse()
}

func InvalidCookie(w *core.ProxyResponseWriterV2) (events.APIGatewayV2HTTPResponse, error) {
	w.WriteHeader(http.StatusUnauthorized)
	resp, err := json.Marshal(ErrorResponse{Reason: "invalid cookie"})
	if err != nil {
		return Error(err)
	}
	w.Write(resp)
	return w.GetProxyResponse()
}

func Unauthorized(w *core.ProxyResponseWriterV2) (events.APIGatewayV2HTTPResponse, error) {
	w.WriteHeader(http.StatusUnauthorized)
	resp, err := json.Marshal(ErrorResponse{Reason: "session id not set"})
	if err != nil {
		return Error(err)
	}
	w.Write(resp)
	return w.GetProxyResponse()
}

func BadRequest(w *core.ProxyResponseWriterV2) (events.APIGatewayV2HTTPResponse, error) {
	w.WriteHeader(http.StatusBadRequest)
	resp, err := json.Marshal(ErrorResponse{Reason: "invalid json body"})
	if err != nil {
		return Error(err)
	}
	w.Write(resp)
	return w.GetProxyResponse()
}

func Error(err error) (events.APIGatewayV2HTTPResponse, error) {
	return events.APIGatewayV2HTTPResponse{}, err
}
