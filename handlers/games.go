package handlers

import (
	"fmt"

	"net/http"
)

type gameConfig struct {
	StockNames []string
	Players    int
	TurnCount  int
}

type createGamePayload struct {
	Password  string
	OwnerID   string
	OwnerName string
}

type createGameResponse struct {
	GameID string
}

// CreateGame is a post to generate a new game for people to join
func CreateGame(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	fmt.Fprintf(w, "create game not implemented")
}
