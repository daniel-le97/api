package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"github.com/joho/godotenv"
	"github.com/tursodatabase/go-libsql"
)

func run() (err error) {
	primaryUrl := os.Getenv("TURSO_URL")
	if primaryUrl == "" {
		return fmt.Errorf("TURSO_URL environment variable not set")
	}

	toHttp := strings.Replace(primaryUrl, "libsql", "https", 1)
	fmt.Println("primaryUrl", primaryUrl)

	health, err := http.Get(toHttp + "/health")
	if err != nil {
		fmt.Println("Error getting health", err)
	}

	fmt.Println("health", health.StatusCode)

	authToken := os.Getenv("TURSO_AUTH_TOKEN")
	dir, err := os.MkdirTemp("", "libsql-*")
	if err != nil {
		return err
	}
	defer os.RemoveAll(dir)

	connector, err := libsql.NewEmbeddedReplicaConnector(dir+"/test.db", primaryUrl, libsql.WithAuthToken(authToken))
	if err != nil {
		return err
	}
	defer func() {
		if closeError := connector.Close(); closeError != nil {
			fmt.Println("Error closing connector", closeError)
			if err == nil {
				err = closeError
			}
		}
	}()

	db := sql.OpenDB(connector)
	defer func() {
		if closeError := db.Close(); closeError != nil {
			fmt.Println("Error closing database", closeError)
			if err == nil {
				err = closeError
			}
		}
	}()

	return nil
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	if err := run(); err != nil {
		panic(err)
	}
	fmt.Println("Done")
}
