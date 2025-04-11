# Basic Makefile Example
.PHONY: dev run doctor linux-arm linux-amd darwin-amd darwin-arm check_and_create_dir build linux darwin all

OUTPUT_BINARY=pb
OUTPUT_DIR=./dist/build
GOOS=$(shell uname | tr '[:upper:]' '[:lower:]')
ARCH=$(shell uname -m)
GOARCH=amd64
ifeq ($(GOARCH), x86_64)
	GOARCH=amd64
endif
ifeq ($(GOARCH), aarch64)
	GOARCH=arm64
endif

CC_TARGET=$(ARCH)-linux-gnu
ifeq ($(GOOS), darwin)
	CC_TARGET=$(ARCH)-macos-none
endif


dev:
	cd ./ui && bun run dev

run: build
	./dist/build/pb-$(GOOS)-$(GOARCH) serve


doctor:
	@if [ -z "$(shell which zig)" ]; then \
		echo "Zig not found, please check https://github.com/ziglang/zig/wiki/Install-Zig-from-a-Package-Manager"; \
		echo "i recommend https://github.com/tristanisham/zvm a zig version manager"; \
	else \
		echo "Zig is already installed"; \
	fi

	@if [ -z "$(shell which go)" ]; then \
		echo "Go not found, please check https://go.dev/dl/"; \
	else \
		echo "Go is already installed"; \
	fi

	@if [ -z "$(shell which bun)" ]; then \
		echo "bun not found, this is used for ./ui, if you are not developing the frontend, you can ignore this, please check https://bun.sh/docs/installation"; \
	else \
		echo "bun is already installed"; \
	fi

check_and_create_dir:
	@if [ ! -d "$(OUTPUT_DIR)" ]; then \
        echo "Directory '$(OUTPUT_DIR)' does not exist. Creating it now..."; \
        mkdir -p $(OUTPUT_DIR); \
        echo "Directory '$(OUTPUT_DIR)' created."; \
    else \
        echo "Directory '$(OUTPUT_DIR)' already exists."; \
    fi

build: check_and_create_dir
	@echo "Building for $(GOOS)/$(GOARCH)..."; \
    export CC="zig cc -target $(CC_TARGET)"; \
    export CXX="zig c++ -target $(CC_TARGET)"; \
    export CGO_CFLAGS="-I/${GOMODCACHE}/github.com/tursodatabase/go-libsql@v0.0.0-20241113154718-293fe7f21b08"; \
    export CGO_ENABLED=1; \
    go clean; \
    if ! go build -ldflags '-extldflags "-static -lc -lunwind -fsanitize=undefined"' -o "$(OUTPUT_DIR)/$(OUTPUT_BINARY)-$(GOOS)-$(GOARCH)" .; then \
        echo "Build failed for $(GOOS)/$(GOARCH). Check the output above for details."; \
        exit 1; \
    fi; \
    echo "Build successful for $(GOOS)/$(GOARCH). Output binary: $(OUTPUT_DIR)/$(OUTPUT_BINARY)-$(GOOS)-$(GOARCH)"

linux-arm:
	@$(MAKE) build CC_TARGET=aarch64-linux-gnu

linux-amd:
	@$(MAKE) build CC_TARGET=x86_64-linux-gnu

darwin-amd:
	@$(MAKE) build CC_TARGET=x86_64-macos

darwin-arm:
	@$(MAKE) build CC_TARGET=aarch64-macos

all:
	@if [ "$(GOOS)" = "darwin" ]; then \
        echo "Building for all platforms..."; \
        $(MAKE) linux-amd; \
        $(MAKE) linux-arm; \
        $(MAKE) darwin-amd; \
        $(MAKE) darwin-arm; \
        echo "All builds completed."; \
    else \
		$(MAKE) linux-amd; \
		echo "All builds completed."; \
    fi
