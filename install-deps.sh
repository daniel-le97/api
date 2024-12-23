VERSION=1.23.4
OS=linux
ARCH=amd64

# Check if Zig is already installed
if ! command -v ./zig &> /dev/null
then
    echo "Zig not found, installing..."
    ZIG_VERSION=0.13.0
    curl -L https://github.com/marler8997/zigup/releases/download/v2024_05_05/zigup-x86_64-linux.tar.gz | tar xz
    chmod +x zigup
    ./zigup ${ZIG_VERSION}
else
    echo "Zig is already installed"
fi

# Check if Go is already installed
if ! command -v go &> /dev/null
then
    echo "Go not found, installing..."
    cd $HOME
    wget https://storage.googleapis.com/golang/go$VERSION.$OS-$ARCH.tar.gz
    tar -xvf go$VERSION.$OS-$ARCH.tar.gz
    mv go go-$VERSION
    sudo mv go-$VERSION /usr/local
    # Add Go to PATH
    echo "export PATH=\$PATH:/usr/local/go/bin" >> ~/.profile
    source ~/.profile
else
    echo "Go is already installed"
fi


