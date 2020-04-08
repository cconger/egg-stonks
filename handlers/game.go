package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/cconger/egg-stonks/stonks"
	"github.com/rs/xid"
	"github.com/rs/zerolog/log"
)

var gamestate = stonks.NewGame(10, 4, []string{
	"Eggs",
	"Resin",
	"Chat",
	"Canola",
	"RURURU",
	"Gold Chains",
})

type PendingRoll struct {
	PlayerID xid.ID
	RollID   xid.ID
	Roll     *stonks.Roll
}

var RollStore = make(map[xid.ID]PendingRoll)

func State(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:9000")
	err := json.NewEncoder(w).Encode(gamestate)
	if err != nil {
		log.Error().Err(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}

type joinGamePayload struct {
	Name string `json:"name"`
}

type joinGameResponse struct {
	PlayerID string `json:"player_id"`
}

func JoinGame(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:9000")

	req := joinGamePayload{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Invalid payload")
		log.Error().Err(err).Msg("Unable to parse payload")
		return
	}

	id, err := gamestate.AddPlayer(req.Name)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Error adding player")
		log.Error().Err(err).Msg("Unable to add player")
		return
	}

	err = json.NewEncoder(w).Encode(&joinGameResponse{
		PlayerID: id,
	})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Error adding player")
		log.Error().Err(err).Msg("Unable to write response")
		return
	}
}

type rollPayload struct {
	PlayerID xid.ID `json:"player"`
}

type rollResponse struct {
	RollID xid.ID       `json:"roll_id"`
	Roll   *stonks.Roll `json:"roll"`
}

func AcquireRoll(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:9000")

	req := rollPayload{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Invalid payload")
		log.Error().Err(err).Msg("Unable to parse payload")
		return
	}

	roll, err := gamestate.Roll(req.PlayerID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Error making roll")
		log.Error().Err(err).Msg("Failed to get roll")
		return
	}

	rid := xid.New()

	RollStore[rid] = PendingRoll{
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

func ApplyRoll(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:9000")

	req := applyRollPayload{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Invalid payload")
		log.Error().Err(err).Msg("Unable to parse payload")
		return
	}

	rollEntry, ok := RollStore[req.RollID]
	if !ok {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Invalid roll ID")
		log.Error().Err(err).Msgf("Invalid roll ID: %s", req.RollID)
		return
	}

	delete(RollStore, req.RollID)

	err = gamestate.ApplyRoll(rollEntry.Roll)
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
