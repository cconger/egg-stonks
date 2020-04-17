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
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	r := mux.NewRouter()

	port := os.Getenv("PORT")
	if port == "" {
		// debug port
		port = "8080"
	}

	webroot := os.Getenv("WEBROOT")
	if webroot == "" {
		webroot = "./app/dist/"
	}

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

	r.HandleFunc("/games/create", registry.CreateGame).Methods("POST")
	r.HandleFunc("/game/{gameID}/join", registry.JoinGame)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir(webroot)))

	log.Printf("Reading webroot from %s", webroot)
	log.Printf("Listening on port %s", port)
	if err := s.ListenAndServe(); err != nil {
		log.Fatal().Err(err)
	}
}

func handle(w http.ResponseWriter, r *http.Request) {
	log.Info().Msg("handle")
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	fmt.Fprintf(w, "hello world")
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")
}
