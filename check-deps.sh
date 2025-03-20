VERSION=1.23.4
OS=linux
ARCH=amd64

# Check if Zig is already installed
if ! command -v zig &> /dev/null
then
    echo "Zig not found, please check https://github.com/ziglang/zig/wiki/Install-Zig-from-a-Package-Manager"
else
    echo "Zig is already installed"
fi

# Check if Go is already installed
if ! command -v go &> /dev/null
then
    echo "Go not found, please check https://go.dev/dl/"
else
    echo "Go is already installed"
fi


