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

var (
	//go:embed hmac.key
	hmacKey []byte
	//go:embed enc.key
	encKey []byte

	host string = "giveaway.glasket.com"
	port string = ""
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
		Path:     "/",
		Secure:   true,
		HttpOnly: false,
		SameSite: http.SameSiteStrictMode,
		Domain:   host,
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
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Origin", "https://"+host+port)
	return r, w, nil
}

func Ok(w *core.ProxyResponseWriterV2, resp []byte) (events.APIGatewayV2HTTPResponse, error) {
	w.WriteHeader(http.StatusOK)
	w.Write(resp)
	return w.GetProxyResponse()
}

func NotFriends(w *core.ProxyResponseWriterV2) (events.APIGatewayV2HTTPResponse, error) {
	w.WriteHeader(http.StatusUnauthorized)
	resp, err := json.Marshal(ErrorResponse{Reason: "not friends"})
	if err != nil {
		log.Error().Err(err).Msg("")
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
	j, e := json.Marshal(err.Error())
	if e != nil {
		log.Error().Err(e).Send()
		j = []byte("Something went wrong")
	}
	return events.APIGatewayV2HTTPResponse{
		StatusCode: 500,
		Body:       string(j),
	}, nil
}
