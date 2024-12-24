# #!/bin/bash

# # Set environment variables
# export CGO_ENABLED=1
# export CC="/home/daniel/code/api/zig cc -target x86_64-linux-gnu  -isystem /usr/include"
# export CXX="/home/daniel/code/api/zig c++ -target x86_64-linux-gnu  -isystem /usr/include"

# # export C_INCLUDE_PATH=/usr/include
# # export LIBRARY_PATH=/usr/lib

# OUTPUT_NAME="main"


# # Define target architecture and operating system
# TARGET_OS=${1:-linux}
# TARGET_ARCH=${2:-amd64}

# go clean

# # Build the project
# echo "Building for $TARGET_OS/$TARGET_ARCH..."
# GOOS=$TARGET_OS GOARCH=$TARGET_ARCH go build -ldflags '-s -w -extldflags "-ldl -lc -lunwind -static"' -o $TARGET_OS-$TARGET_ARCH main.go

# # Print success message
# if [ $? -eq 0 ]; then
#     echo "Build completed successfully for $TARGET_OS/$TARGET_ARCH!"
# else
#     echo "Build failed for $TARGET_OS/$TARGET_ARCH."
# fi
#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Ensure Zig is installed
if ! command -v zig &>/dev/null; then
    echo "Zig could not be found. Please install Zig to proceed."
    exit 1
fi

# Set the output binary name
OUTPUT_BINARY="my-go-app"

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
    go build -ldflags '-extldflags "-static -lc -lunwind"' -o "${OUTPUT_BINARY}-${target_os}-${target_arch}" .

    echo "Build successful for $target_os/$target_arch. Output binary: ${OUTPUT_BINARY}-${target_os}-${target_arch}"
}

# Build for amd64
build "linux" "amd64" "x86_64-linux-gnu"

# Build for arm64
build "linux" "arm64" "aarch64-linux-gnu"

# build "darwin" "amd64" "x86_64-darwin"

# build "darwin" "arm64" "aarch64-macos-none -F/host/Frameworks"