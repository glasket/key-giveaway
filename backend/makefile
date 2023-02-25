.PHONY: deploy build build-cli clean

deploy: build
	for e in bin/lambda/*; do chmod +x "$${e}"; zip -j "deploy/$${e#bin/lambda/}.zip" "$${e}"; done;

build:
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bin ./cmd/...

build-cli:
	go build -o bin/cli ./cli/...

clean:
	rm bin/cli/* bin/lambda/* deploy/*