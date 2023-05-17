LDFLAGS = -s -w
COMP = GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="$(LDFLAGS)" -o $@ $<
PKG = $(shell find ./pkg -name '*.go')
DEPLOYCMD = chmod +x $?; zip -j $@ $?

names = $(shell ls cmd)
build_targets = $(addprefix bin/cmd/, $(names))
deploy_targets = $(addsuffix .zip, $(addprefix deploy/, $(names)))

.PHONY: all build cli deploy clean

all: deploy build-cli

deploy: $(deploy_targets)

build: $(build_targets) bin/cli/cli

cli: bin/cli/cli

clean:
	rm bin/cli/* bin/lambda/* deploy/*

bin/cli/cli: cli/cli.go $(PKG)
	go build -o bin/cli ./cli/...

$(deploy_targets): deploy/%.zip: bin/cmd/%
	$(DEPLOYCMD)

$(build_targets): bin/cmd/%: $(wildcard cmd/%/*) $(PKG)
	$(COMP)
