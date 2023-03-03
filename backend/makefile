COMP = GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o
DEPLOY = deploy/AddRaffleEntry.zip deploy/GetDropItems.zip deploy/GetDrops.zip deploy/GetWonItems.zip deploy/HandleRaffle.zip deploy/Login.zip deploy/Ping.zip
PKG = $(shell find ./pkg -name '*.go')

.PHONY: deploy build-cli clean

deploy: $(DEPLOY)

build-cli:
	go build -o bin/cli ./cli/...

clean:
	rm bin/cli/* bin/lambda/* deploy/*

deploy/AddRaffleEntry.zip: bin/lambda/AddRaffleEntry
	chmod +x $?; zip -j $@ $?

deploy/GetDropItems.zip: bin/lambda/GetDropItems
	chmod +x $?; zip -j $@ $?

deploy/GetDrops.zip: bin/lambda/GetDrops
	chmod +x $?; zip -j $@ $?

deploy/GetWonItems.zip: bin/lambda/GetWonItems
	chmod +x $?; zip -j $@ $?

deploy/HandleRaffle.zip: bin/lambda/HandleRaffle
	chmod +x $?; zip -j $@ $?

deploy/Login.zip: bin/lambda/Login
	chmod +x $?; zip -j $@ $?

deploy/Ping.zip: bin/lambda/Ping
	chmod +x $?; zip -j $@ $?

bin/lambda/AddRaffleEntry: cmd/AddRaffleEntry/AddRaffleEntry.go $(PKG)
	$(COMP) $@ $<

bin/lambda/GetDropItems: cmd/GetDropItems/GetDropItems.go $(PKG)
	$(COMP) $@ $<

bin/lambda/GetDrops: cmd/GetDrops/GetDrops.go $(PKG)
	$(COMP) $@ $<

bin/lambda/GetWonItems: cmd/GetWonItems/GetWonItems.go $(PKG)
	$(COMP) $@ $<

bin/lambda/HandleRaffle: cmd/HandleRaffle/HandleRaffle.go $(PKG)
	$(COMP) $@ $<

bin/lambda/Login: cmd/Login/Login.go $(PKG)
	$(COMP) $@ $<

bin/lambda/Ping: cmd/Ping/Ping.go $(PKG)
	$(COMP) $@ $<