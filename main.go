package main

import (
	"database/sql"
	"fmt"

	// "fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	// "time"

	"strings"

	"github.com/pocketbase/dbx"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/ghupdate"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/hook"

	"github.com/tursodatabase/go-libsql"
	// _ "github.com/rqlite/gorqlite"
	// _ "github.com/rqlite/gorqlite/stdlib"
	// "github.com/tursodatabase/libsql-client-go/libsql"
	// _ "github.com/tursodatabase/libsql-client-go/libsql"
)

// register the libsql driver to use the same query builder
// implementation as the already existing sqlite3 builder
func init() {
	dbx.BuilderFuncMap["libsql"] = dbx.BuilderFuncMap["sqlite3"]
	// dbx.BuilderFuncMap["rqlite"] = dbx.BuilderFuncMap["sqlite3"]
}

func Open(driverName, dsn string) (*dbx.DB, error) {
	primaryUrl := os.Getenv("TURSO_URL")
	isLocal := strings.EqualFold(os.Getenv("TURSO_LOCAL"), "local")
	if isLocal {
		db, err := sql.Open("libsql", "file:"+dsn)
		if err != nil {
			return nil, err
		}
		return dbx.NewFromDB(db, driverName), nil
	}
	authToken := os.Getenv("TURSO_AUTH_TOKEN")
	pinger, err := http.Get(primaryUrl + "/health")
	if err != nil {
		return nil, err
	}
	fmt.Println(pinger.StatusCode)
	connector, err := libsql.NewEmbeddedReplicaConnector(dsn, primaryUrl, libsql.WithAuthToken(authToken))
	if err != nil {
		return nil, err
	}
	sqlDB := sql.OpenDB(connector)
	return dbx.NewFromDB(sqlDB, driverName), nil
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	app := pocketbase.NewWithConfig(pocketbase.Config{
		DBConnect: func(dbPath string) (*dbx.DB, error) {

			if strings.Contains(dbPath, "data.db") {
				// return dbx.Open("libsql", "file:"+dbPath)
				return Open("libsql", dbPath)
			}

			// optionally for the logs (aka. pb_data/auxiliary.db) use the default local filesystem driver
			return core.DefaultDBConnect(dbPath)
		},
	})

	// ---------------------------------------------------------------
	// Optional plugin flags:
	// ---------------------------------------------------------------

	var hooksDir string
	app.RootCmd.PersistentFlags().StringVar(
		&hooksDir,
		"hooksDir",
		"",
		"the directory with the JS app hooks",
	)

	var hooksWatch bool
	app.RootCmd.PersistentFlags().BoolVar(
		&hooksWatch,
		"hooksWatch",
		true,
		"auto restart the app on pb_hooks file change",
	)

	var hooksPool int
	app.RootCmd.PersistentFlags().IntVar(
		&hooksPool,
		"hooksPool",
		15,
		"the total prewarm goja.Runtime instances for the JS app hooks execution",
	)

	var migrationsDir string
	app.RootCmd.PersistentFlags().StringVar(
		&migrationsDir,
		"migrationsDir",
		"",
		"the directory with the user defined migrations",
	)

	var automigrate bool
	app.RootCmd.PersistentFlags().BoolVar(
		&automigrate,
		"automigrate",
		true,
		"enable/disable auto migrations",
	)

	var publicDir string
	app.RootCmd.PersistentFlags().StringVar(
		&publicDir,
		"publicDir",
		defaultPublicDir(),
		"the directory to serve static files",
	)

	var indexFallback bool
	app.RootCmd.PersistentFlags().BoolVar(
		&indexFallback,
		"indexFallback",
		true,
		"fallback the request to index.html on missing static path (eg. when pretty urls are used with SPA)",
	)

	app.RootCmd.ParseFlags(os.Args[1:])
	// ---------------------------------------------------------------
	// Plugins and hooks:
	// ---------------------------------------------------------------

	// load jsvm (pb_hooks and pb_migrations)
	jsvm.MustRegister(app, jsvm.Config{
		MigrationsDir: migrationsDir,
		HooksDir:      hooksDir,
		HooksWatch:    hooksWatch,
		HooksPoolSize: hooksPool,
	})

	// migrate command (with js templates)
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS,
		Automigrate:  automigrate,
		Dir:          migrationsDir,
	})

	// GitHub self update
	ghupdate.MustRegister(app, app.RootCmd, ghupdate.Config{})

	// static route to serves files from the provided public dir
	// (if publicDir exists and the route path is not already defined)
	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			if !e.Router.HasRoute(http.MethodGet, "/{path...}") {
				e.Router.GET("/{path...}", apis.Static(os.DirFS(publicDir), indexFallback))
			}

			return e.Next()
		},
		Priority: 999, // execute as latest as possible to allow users to provide their own route
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

// the default pb_public dir location is relative to the executable
func defaultPublicDir() string {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		// most likely ran with go run
		return "./pb_public"
	}

	return filepath.Join(os.Args[0], "../pb_public")
}
