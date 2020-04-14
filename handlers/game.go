package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/cconger/egg-stonks/stonks"
	"github.com/gorilla/websocket"
	"github.com/rs/xid"
	"github.com/rs/zerolog/log"
)

// PendingRoll is a wrapper around a roll allowing it to be addressed and applied
type PendingRoll struct {
	PlayerID xid.ID
	RollID   xid.ID
	Roll     *stonks.Roll
}

type joinGamePayload struct {
	Name string `json:"name"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// GameServer is a server for a single game instance.  It encapsulates the gamestate and manages the the
// webscoket connections to the game.
type GameServer struct {
	GameState     *stonks.GameState
	Rolls         map[xid.ID]PendingRoll
	Players       map[string]string
	PlayerStreams map[string]chan interface{}
}

// SocketUpdate is the envelope type for an update from the server
type SocketUpdate struct {
	Time    time.Time   `json:"ts"`
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type socketLogin struct {
	ClientID string `json:"client_id"`
	Name     string `json:"name"`
}

// JoinGame is the main entry for a game websocket.  It upgrades to a websocket connection.
func (gs *GameServer) JoinGame(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error().Err(err).Msg("Unable to upgrade connection")
		return
	}
	defer c.Close()

	var login socketLogin
	err = c.ReadJSON(&login)
	if err != nil {
		c.WriteJSON(SocketUpdate{
			Time:    time.Now(),
			Type:    "error",
			Payload: "Did not understand your login message",
		})
		log.Error().Err(err).Msg("Unexpected payload on login")
		return
	}

	var playerID string
	var ok bool
	playerID, ok = gs.Players[login.ClientID]
	if !ok {
		playerID, err = gs.GameState.AddPlayer(login.Name)
		if err != nil {
			c.WriteJSON(SocketUpdate{
				Time:    time.Now(),
				Type:    "error",
				Payload: fmt.Sprintf("Unable to join game: %s", err),
			})
		}
	}
	gs.Players[login.ClientID] = playerID

	// Tell the player who they are
	err = c.WriteJSON(SocketUpdate{
		Time:    time.Now(),
		Type:    "whoami",
		Payload: playerID,
	})

	if err != nil {
		log.Error().Err(err).Msg("Failed on notifying whoami")
		return
	}

	// Give them the game state
	err = c.WriteJSON(SocketUpdate{
		Time:    time.Now(),
		Type:    "state",
		Payload: gs.GameState,
	})

	if err != nil {
		log.Error().Err(err).Msg("Failed to send initial gamestate")
		return
	}

	// TODO: manage timeouts for read and write timers
	// Create a channel for gamestate updates.
	readChan := make(chan []byte)
	updateChan := make(chan interface{})
	gs.PlayerStreams[login.ClientID] = updateChan
	errChan := make(chan error)

	go func() {
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Error().Err(err).Msg("Error reading message")
				// If unexpected close message, handle
				errChan <- err
				return
			}
			log.Info().Str("message", string(message)).Msg("Message received")
			readChan <- message
		}
	}()

	for {
		select {
		case <-updateChan:
			// TODO: Handle rolls
			err = c.WriteJSON(SocketUpdate{
				Time:    time.Now(),
				Type:    "state",
				Payload: gs.GameState,
			})
			if err != nil {
				log.Error().Err(err).Msg("Error sending state update... closing conn")
				return
			}
		case <-readChan:
			// TODO: Handle any incoming messages
		case err := <-errChan:
			log.Error().Err(err).Msg("Closing websocket processor")
			return
		}
	}
}

// State is the handler for just rendering the state.
func (gs *GameServer) State(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:9000")
	err := json.NewEncoder(w).Encode(gs.GameState)
	if err != nil {
		log.Error().Err(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}

type rollPayload struct {
	PlayerID xid.ID `json:"player"`
}

type rollResponse struct {
	RollID xid.ID       `json:"roll_id"`
	Roll   *stonks.Roll `json:"roll"`
}

// AcquireRoll
func (gs *GameServer) AcquireRoll(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:9000")

	req := rollPayload{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Invalid payload")
		log.Error().Err(err).Msg("Unable to parse payload")
		return
	}

	roll, err := gs.GameState.Roll(req.PlayerID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Error making roll")
		log.Error().Err(err).Msg("Failed to get roll")
		return
	}

	rid := xid.New()

	gs.Rolls[rid] = PendingRoll{
		RollID:   rid,
		PlayerID: req.PlayerID,
		Roll:     roll,
	}

	err = json.NewEncoder(w).Encode(&rollResponse{
		RollID: rid,
		Roll:   roll,
	})

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Error making roll")
		log.Error().Err(err).Msg("Unable to write response")
		return
	}
}

type applyRollPayload struct {
	RollID xid.ID `json:"roll_id"`
}

type applyRollResponse struct {
}

func (gs *GameServer) ApplyRoll(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:9000")

	req := applyRollPayload{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Invalid payload")
		log.Error().Err(err).Msg("Unable to parse payload")
		return
	}

	rollEntry, ok := gs.Rolls[req.RollID]
	if !ok {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Invalid roll ID")
		log.Error().Err(err).Msgf("Invalid roll ID: %s", req.RollID)
		return
	}

	delete(gs.Rolls, req.RollID)

	err = gs.GameState.ApplyRoll(rollEntry.Roll)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Failed to apply roll")
		log.Error().Err(err).Msg("Failed to apply roll")
		return
	}

	err = json.NewEncoder(w).Encode(&applyRollResponse{})

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Error applying roll")
		log.Error().Err(err).Msg("Unable to write response")
		return
	}
}
