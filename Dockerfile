# Use the official Golang image to create a build artifact.
# This is the build stage.
FROM golang:1.23-bullseye AS builder


# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# RUN apt-get update && apt-get install -y wget unzip xz-utils \
#     && wget https://ziglang.org/download/0.13.0/zig-linux-aarch64-0.13.0.tar.xz \
#     && tar -xf zig-linux-aarch64-0.13.0.tar.xz \
#     && mv zig-linux-aarch64-0.13.0 /usr/local/zig \
#     && ln -s /usr/local/zig/zig /usr/local/bin/zig \
#     && rm zig-linux-aarch64-0.13.0.tar.xz
RUN apt-get update && apt-get install -y libc6-dev clang

# Copy the source from the current directory to the Working Directory inside the container
COPY . .

# Build the Go app
ENV CGO_ENABLED=1
# ENV CC="zig cc -target arm-linux-musleabihf"
# ENV CXX="zig cc -target arm-linux-musleabihf"
# ENV GOARCH=arm
# ENV GOOS=linux 
# ENV OK=-ldflags '-extldflags "-ldl -lc -static"' 
RUN go build -ldflags '-extldflags "-ldl -lc -static"' -o main main.go



# Start a new stage from scratch
FROM alpine:latest

# RUN apk add --no-cache libc6-compat libgcc

# Set the Current Working Directory inside the container
WORKDIR /root/

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/main ./
COPY --from=builder /app/.env ./
COPY --from=builder /app/pb_hooks ./pb_hooks
COPY --from=builder /app/pb_migrations ./pb_migrations
COPY --from=builder /app/pb_data ./pb_data/
COPY --from=builder /app/combined.json ./




# Expose port 8080 to the outside world
EXPOSE 8090

# Command to run the executable
CMD ["./main", "serve",  "--http=0.0.0.0:8090"]
