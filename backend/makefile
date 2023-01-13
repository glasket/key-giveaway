deploy: build
	for e in bin/*; do chmod +x "$${e}"; zip -j "deploy/$${e#bin/}.zip" "$${e}"; done;

build:
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bin ./...

clean:
	rm bin/* deploy/*