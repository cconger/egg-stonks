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

	s := &http.Server{
		Addr:         "0.0.0.0:8080",
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
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./app/dist/")))

	/*
		r.HandleFunc("/game/{gameID}/state", handlers.State).Methods("GET")
		r.HandleFunc("/game/{gameID}/roll", handlers.AcquireRoll).Methods("POST")
		r.HandleFunc("/game/{gameID/applyroll", handlers.ApplyRoll).Methods("POST")

		r.HandleFunc("/game/simulate", handlers.SimulateGame)
	*/
	port := os.Getenv("PORT")

	if port == "" {
		// debug port
		port = "8080"
	}

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
