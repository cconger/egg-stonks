package handlers

import (
	"fmt"
	"net/http"

	"github.com/cconger/egg-stonks/stonks"
	"github.com/gorilla/mux"
	"github.com/rs/xid"
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
	GameID string
}

// CreateGame is the http handler for users to create a new game in the registry
func (gr *GameRegistry) CreateGame(w http.ResponseWriter, r *http.Request) {
	id := xid.New()

	gr.Games[id.String()] = &GameServer{
		GameID: id,
		GameState: stonks.NewGame(10, 4, []string{
			"Eggs",
			"Resin",
			"Chat",
			"Canola",
			"RURURU",
			"Gold Chains",
		}),
		Players:       make(map[string]xid.ID),
		PlayerStreams: make(map[string]chan interface{}),
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "New Game Created: %s", id.String())
}

// JoinGame is the central entrypoint.  A gameid is specified in the path and we route the request to the sub
// game server to handle.
func (gr *GameRegistry) JoinGame(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
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
