package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/cconger/egg-stonks/stonks"
	"github.com/rs/zerolog/log"
)

// SimulateGame is a debug function to test wiring up a game in progress to the client
func SimulateGame(w http.ResponseWriter, r *http.Request) {
	gs := stonks.NewGame(10, 4, []string{
		"Eggs",
		"Resin",
		"Chat",
		"Canola",
		"RURURU",
		"Gold Chains",
	})

	gs.AddPlayer("ho borvat")
	gs.AddPlayer("michaelalfox")
	gs.AddPlayer("dumb dog")
	gs.AddPlayer("dan gheesling")

	for i := 0; i < 4; i++ {
		err := gs.Transact(gs.Players[i].ID, gs.Stonks[i].ID, 500)
		if err != nil {
			log.Error().Err(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
	}

	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:9000")

	err := json.NewEncoder(w).Encode(gs)
	if err != nil {
		log.Error().Err(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}
