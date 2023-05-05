LDFLAGS = -s -w
COMP = GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="$(LDFLAGS)" -o
BLD = bin/lambda/AddRaffleEntry bin/lambda/RemoveRaffleEntry bin/lambda/GetDropItems bin/lambda/GetDrops bin/lambda/GetWonItems bin/lambda/HandleRaffle bin/lambda/Login bin/lambda/Logout bin/lambda/Ping
DEPLOY = deploy/AddRaffleEntry.zip deploy/RemoveRaffleEntry.zip deploy/GetDropItems.zip deploy/GetDrops.zip deploy/GetWonItems.zip deploy/HandleRaffle.zip deploy/Login.zip deploy/Logout.zip deploy/Ping.zip
PKG = $(shell find ./pkg -name '*.go')
DEPLOYCMD = chmod +x $?; zip -j $@ $?

.PHONY: all build build-cli deploy clean

all: deploy build-cli

deploy: $(DEPLOY)

build: $(BLD)

build-cli:
	go build -o bin/cli ./cli/...

clean:
	rm bin/cli/* bin/lambda/* deploy/*

deploy/AddRaffleEntry.zip: bin/lambda/AddRaffleEntry
	$(DEPLOYCMD)

deploy/RemoveRaffleEntry.zip: bin/lambda/RemoveRaffleEntry
	$(DEPLOYCMD)

deploy/GetDropItems.zip: bin/lambda/GetDropItems
	$(DEPLOYCMD)

deploy/GetDrops.zip: bin/lambda/GetDrops
	$(DEPLOYCMD)

deploy/GetWonItems.zip: bin/lambda/GetWonItems
	$(DEPLOYCMD)

deploy/HandleRaffle.zip: bin/lambda/HandleRaffle
	$(DEPLOYCMD)

deploy/Login.zip: bin/lambda/Login
	$(DEPLOYCMD)

deploy/Logout.zip: bin/lambda/Logout
	$(DEPLOYCMD)

deploy/Ping.zip: bin/lambda/Ping
	$(DEPLOYCMD)

bin/lambda/AddRaffleEntry: cmd/AddRaffleEntry/AddRaffleEntry.go $(PKG)
	$(COMP) $@ $<

bin/lambda/RemoveRaffleEntry: cmd/RemoveRaffleEntry/RemoveRaffleEntry.go $(PKG)
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

bin/lambda/Logout: cmd/Logout/Logout.go $(PKG)
	$(COMP) $@ $<

bin/lambda/Ping: cmd/Ping/Ping.go $(PKG)
	$(COMP) $@ $<