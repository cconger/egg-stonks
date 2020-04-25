package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/cconger/egg-stonks/handlers"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		// debug port
		port = "8080"
	}

	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	debug := os.Getenv("DEBUG")
	if debug != "" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}

	webroot := os.Getenv("WEBROOT")
	if webroot == "" {
		webroot = "./app/dist/"
	}

	r := mux.NewRouter()

	s := &http.Server{
		Addr:         "0.0.0.0:" + port,
		WriteTimeout: time.Second * 10,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Second * 60,
		Handler:      r,
	}

	registry := handlers.NewGameRegistry()

	r.HandleFunc("/_ah/health", healthCheckHandler)
	r.HandleFunc("/game/create", registry.CreateGame)
	r.HandleFunc("/healthz", healthCheckHandler)

	r.HandleFunc("/games/create", registry.CreateGame).Methods("POST")
	r.HandleFunc("/game/{gameID}/join", registry.JoinGame)
	r.HandleFunc("/game/{gameID}/state", handlers.SimulateGame)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir(webroot)))

	log.Printf("Reading webroot from %s", webroot)
	log.Printf("Listening on port %s", port)
	if err := s.ListenAndServe(); err != nil {
		log.Fatal().Err(err)
	}
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")
}
