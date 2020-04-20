package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/cconger/egg-stonks/stonks"
	"github.com/gorilla/mux"
	"github.com/rs/xid"
	"github.com/rs/zerolog/log"
)

type gameConfig struct {
	StockNames []string `json:"stonks"`
	TurnCount  int      `json:"turns"`
}

type createGamePayload struct {
	Config gameConfig `json:"config"`
}

// GameRegistry is just a map of game servers and handles routing to them from central web handlers
type GameRegistry struct {
	Games map[string]*GameServer
}

// NewGameRegistry returns a registry of all games.  It allows routing to the sub gameservers
func NewGameRegistry() *GameRegistry {
	return &GameRegistry{
		Games: make(map[string]*GameServer),
	}
}

type createGameResponse struct {
	GameID string `json:"game_id"`
}

// CreateGame is the http handler for users to create a new game in the registry
func (gr *GameRegistry) CreateGame(w http.ResponseWriter, r *http.Request) {
	id := xid.New()

	var payload createGamePayload
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Could not parse request payload: %s", err.Error())
		return
	}

	if payload.Config.StockNames == nil || len(payload.Config.StockNames) != 6 {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Invalid stock configuration")
		return
	}

	turnCount := 10
	if payload.Config.TurnCount > 0 {
		turnCount = payload.Config.TurnCount
	}

	gr.Games[id.String()] = &GameServer{
		GameID:        id,
		GameState:     stonks.NewGame(turnCount, 4, payload.Config.StockNames),
		Players:       make(map[string]xid.ID),
		PlayerStreams: make(map[string]chan interface{}),
	}
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(&createGameResponse{
		GameID: id.String(),
	})
	if err != nil {
		log.Error().Err(err).Msg("unable to return game id")
	}
}

// JoinGame is the central entrypoint.  A gameid is specified in the path and we route the request to the sub
// game server to handle.
func (gr *GameRegistry) JoinGame(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	gameID, ok := vars["gameID"]
	if !ok || gameID == "" {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Invalid game specified")
		return
	}

	server, ok := gr.Games[gameID]
	if !ok {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "Unknown game ID: %s", gameID)
		return
	}

	server.JoinGame(w, r)
}
