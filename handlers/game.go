package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/cconger/egg-stonks/stonks"
	"github.com/gorilla/websocket"
	"github.com/rs/xid"
	"github.com/rs/zerolog/log"
)

// PendingRoll is a wrapper around a roll allowing it to be addressed and applied
type PendingRoll struct {
	PlayerID string
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
	GameID      xid.ID
	StateMutex  sync.RWMutex
	GameState   *stonks.GameState
	PendingRoll *PendingRoll
	// Map of clientID to playerID
	Players       map[string]xid.ID
	PlayerStreams map[string]chan interface{}
}

// SocketUpdate is the envelope type for an update from the server
type SocketUpdate struct {
	Time    time.Time   `json:"ts"`
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type socketCommand struct {
	Action  string          `json:"action"`
	Payload json.RawMessage `json:"payload"`
}

type socketLogin struct {
	ClientID string `json:"client_id"`
	Name     string `json:"name"`
}

// JoinGame is the main entry for a game websocket.  It upgrades to a websocket connection.
func (gs *GameServer) JoinGame(w http.ResponseWriter, r *http.Request) {
	logger := log.With().Str("game", gs.GameID.String()).Logger()
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error().Err(err).Msg("Unable to upgrade connection")
		return
	}
	defer c.Close()

	// We expect the first message to be a identity payload.
	var loginAction socketCommand
	err = c.ReadJSON(&loginAction)
	if err != nil {
		logger.Error().Err(err).Msg("Unparsable payload on login")
		return
	}

	var login socketLogin
	err = json.Unmarshal(loginAction.Payload, &login)
	if err != nil {
		c.WriteJSON(SocketUpdate{
			Time:    time.Now(),
			Type:    "error",
			Payload: "Did not understand your login message",
		})
		logger.Error().Err(err).Msg("Unexpected payload on login")
		return
	}

	logger = logger.With().Str("ClientID", login.ClientID).Str("Name", login.Name).Logger()

	playerID, ok := gs.Players[login.ClientID]
	if !ok {
		logger.Info().Msg("New Player")
		gs.StateMutex.Lock()
		playerID, err = gs.GameState.AddPlayer(login.Name)
		gs.StateMutex.Unlock()
		if err != nil {
			c.WriteJSON(SocketUpdate{
				Time:    time.Now(),
				Type:    "error",
				Payload: fmt.Sprintf("Unable to join game: %s", err),
			})
			return
		}
	} else {
		logger.Info().Msg("Rejoining")
	}
	gs.Players[login.ClientID] = playerID

	// Tell the player who they are
	err = c.WriteJSON(SocketUpdate{
		Time:    time.Now(),
		Type:    "whoami",
		Payload: playerID.String(),
	})

	if err != nil {
		logger.Error().Err(err).Msg("Failed on notifying whoami")
		return
	}

	// Give them the game state
	gs.StateMutex.RLock()
	err = c.WriteJSON(SocketUpdate{
		Time:    time.Now(),
		Type:    "state",
		Payload: gs.GameState,
	})
	gs.StateMutex.RUnlock()
	if err != nil {
		logger.Error().Err(err).Msg("Failed to send initial gamestate")
		return
	}

	// Create a channel for gamestate updates.
	updateChan := make(chan interface{})
	gs.PlayerStreams[login.ClientID] = updateChan
	errChan := make(chan error)

	defer func() {
		close(updateChan)
		close(errChan)
		delete(gs.PlayerStreams, login.ClientID)
	}()

	go func() {
		for {
			var msg socketCommand
			err = c.ReadJSON(&msg)
			if err != nil {
				if websocket.IsUnexpectedCloseError(err) {
					// Websocket closed
					logger.Error().Err(err).Msg("UnexpectedCloseError")
					errChan <- err
					return
				}

				logger.Error().Err(err).Msg("Unexpected payload from client")
				updateChan <- SocketUpdate{
					Time:    time.Now(),
					Type:    "error",
					Payload: "Could not parse command",
				}
			}
			err = gs.HandleAction(msg, playerID)
			if err != nil {
				logger.Error().Err(err).Msg("Error handling action")
				updateChan <- SocketUpdate{
					Time:    time.Now(),
					Type:    "error",
					Payload: err.Error(),
				}
			}
		}
	}()

	for {
		select {
		case update := <-updateChan:
			// TODO: Handle rolls
			err = c.WriteJSON(update)
			if err != nil {
				logger.Error().Err(err).Msg("Error sending state update closing conn")
			}
		case err := <-errChan:
			logger.Error().Err(err).Msg("Closing websocket processor")
			return
		}
	}
}

// HandleAction is the central entry point for applying all player actions.
func (gs *GameServer) HandleAction(action socketCommand, playerID xid.ID) error {
	logger := log.With().Str("action", action.Action).Str("player", playerID.String()).Logger()
	switch action.Action {
	case "start":
		logger.Info().Msg("Start")
		gs.StateMutex.Lock()
		err := gs.GameState.StartGame()
		gs.StateMutex.Unlock()
		gs.PublishState()
		if err != nil {
			return err
		}
	case "reveal-roll":
		logger.Info().Msg("Reveal roll")
		var reveal [3]bool
		if err := json.Unmarshal(action.Payload, &reveal); err != nil {
			return err
		}
		gs.StateMutex.Lock()
		err := gs.GameState.Reveal(playerID, reveal)
		gs.StateMutex.Unlock()
		gs.PublishState()
		if err != nil {
			return err
		}
	case "apply-roll":
		logger.Info().Msg("Apply roll")
		gs.StateMutex.Lock()
		err := gs.GameState.ApplyRoll(playerID)
		gs.StateMutex.Unlock()
		gs.PublishState()
		if err != nil {
			return err
		}
	case "hodl":
		logger.Info().Msg("Hodl receved")
		gs.StateMutex.Lock()
		err := gs.GameState.Ready(playerID)
		gs.StateMutex.Unlock()
		gs.PublishState()
		if err != nil {
			return err
		}
	case "transact":
		var transaction struct {
			Stonk    xid.ID `json:"stonk"`
			Quantity int    `json:"quantity"`
		}
		if err := json.Unmarshal(action.Payload, &transaction); err != nil {
			return err
		}
		gs.StateMutex.Lock()
		err := gs.GameState.Transact(playerID, transaction.Stonk, transaction.Quantity)
		gs.StateMutex.Unlock()
		gs.PublishState()
		if err != nil {
			return err
		}
	default:
		logger.Error().Str("action", action.Action).Msg("Received unknown action message")
	}
	return nil
}

// PublishState informs all players of a state change.
func (gs *GameServer) PublishState() {
	gs.StateMutex.RLock()
	update := SocketUpdate{
		Time:    time.Now(),
		Type:    "state",
		Payload: gs.GameState,
	}
	gs.StateMutex.RUnlock()
	for _, c := range gs.PlayerStreams {
		c <- update
	}
}
