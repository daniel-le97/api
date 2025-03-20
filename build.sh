# #!/bin/bash
set -e

# Ensure Zig is installed
if ! command -v zig &>/dev/null; then
    echo "Zig could not be found. Please install Zig to proceed."
    exit 1
fi

# Set the output binary name
OUTPUT_BINARY="pb"
OUTPUT_DIR="./dist/build"

check_and_create_dir() {
    if [ ! -d "$OUTPUT_DIR" ]; then
        echo "Directory '$OUTPUT_DIR' does not exist. Creating it now..."
        mkdir -p "$OUTPUT_DIR"
        echo "Directory '$OUTPUT_DIR' created."
    else
        echo "Directory '$OUTPUT_DIR' already exists."
    fi
}

# Function to build for a specific target
build() {
    local target_os=$1
    local target_arch=$2
    local cc_target=$3

    echo "Building for $target_os/$target_arch..."

    # Set the Go environment variables for cross-compilation
    export GOOS=$target_os
    export GOARCH=$target_arch
    export CC="zig cc -target $cc_target"
    export CXX="zig c++ -target $cc_target"
    export CGO_CFLAGS="-I/Users/daniel/go/pkg/mod/github.com/tursodatabase/go-libsql@v0.0.0-20241113154718-293fe7f21b08"
    export CGO_ENABLED=1

    # Clean the previous build
    go clean

    # Build the Go project
    go build -ldflags '-extldflags "-static -lc -lunwind"' -o "${OUTPUT_DIR}/${OUTPUT_BINARY}-${target_os}-${target_arch}" .

    echo "Build successful for $target_os/$target_arch. Output binary: ${OUTPUT_DIR}/${OUTPUT_BINARY}-${target_os}-${target_arch}"
}

check_and_create_dir
# Build for amd64
build "linux" "amd64" "x86_64-linux-gnu"

# Build for arm64
build "linux" "arm64" "aarch64-linux-gnu"

# build "darwin" "amd64" "x86_64-darwin"

# build "darwin" "arm64" "aarch64-macos-none -F/host/Frameworks"