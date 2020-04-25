package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/cconger/egg-stonks/stonks"
	"github.com/rs/zerolog/log"
)

// SimulateGame is a debug function to test wiring up a game in progress to the client
func SimulateGame(w http.ResponseWriter, r *http.Request) {
	gs := stonks.NewGame(30, 4, []string{
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

	gs.StartGame()

	for i := 0; i < 4; i++ {
		if i == 0 {
			for j := 0; j < 6; j++ {
				err := gs.Transact(gs.Players[i].ID, gs.Stonks[j].ID, 500)
				if err != nil {
					log.Error().Err(err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}
			}
		} else {
			err := gs.Transact(gs.Players[i].ID, gs.Stonks[i].ID, 5000)
			if err != nil {
				log.Error().Err(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
		}

		err := gs.Ready(gs.Players[i].ID)
		if err != nil {
			log.Error().Err(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	// Do 28 turns...
	for i := 0; i < 28; i++ {
		// Each Turn
		for p := 0; p < 4; p++ {
			// Each player
			pid := gs.Players[p].ID
			gs.ApplyRoll(pid)
			gs.ApplyRoll(pid)
		}

		if i == 27 {
			continue
		}
		for p := 0; p < 4; p++ {
			// Each player
			pid := gs.Players[p].ID
			gs.Ready(pid)
		}
	}

	err := json.NewEncoder(w).Encode(gs)
	if err != nil {
		log.Error().Err(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}
