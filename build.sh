#!/bin/bash

# Set environment variables
export CGO_ENABLED=1
export CC="/home/daniel/code/api/zig cc -target x86_64-linux-gnu  -isystem /usr/include"
export CXX="/home/daniel/code/api/zig c++ -target x86_64-linux-gnu  -isystem /usr/include"

# export C_INCLUDE_PATH=/usr/include
# export LIBRARY_PATH=/usr/lib

OUTPUT_NAME="main"


# Define target architecture and operating system
TARGET_OS=${1:-linux}
TARGET_ARCH=${2:-amd64}

go clean

# Build the project
echo "Building for $TARGET_OS/$TARGET_ARCH..."
GOOS=$TARGET_OS GOARCH=$TARGET_ARCH go build -ldflags '-s -w -extldflags "-ldl -lc -lunwind -static"' -o $TARGET_OS-$TARGET_ARCH main.go

# Print success message
if [ $? -eq 0 ]; then
    echo "Build completed successfully for $TARGET_OS/$TARGET_ARCH!"
else
    echo "Build failed for $TARGET_OS/$TARGET_ARCH."
fi
