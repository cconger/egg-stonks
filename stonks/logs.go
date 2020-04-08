package stonks

import (
	"time"

	"github.com/rs/xid"
)

// LogEntry is the envelope type for all logs
type LogEntry struct {
	Time  time.Time `json:"time"`
	Type  string    `json:"type"`
	Entry Log       `json:"entry"`
}

// Log is the interface type of log entries
type Log interface {
	Type() string
}

// PriceChange is a log entry where a player rolled a price increase or decrease
type PriceChange struct {
	Player   xid.ID `json:"player"`
	Stonk    xid.ID `json:"stonk"`
	Movement int    `json:"movement"`
}

// Type implements the Log interface
func (pc *PriceChange) Type() string {
	return "price-change"
}

// Dividend is a log entry where a dividend was paid out
type Dividend struct {
	Player      xid.ID               `json:"player"`
	Stonk       xid.ID               `json:"stonk"`
	Value       int                  `json:"value"`
	Benefactors []DividendBenefactor `json:"benefactors"`
}

// Type implements the Log interface
func (d *Dividend) Type() string {
	return "dividend"
}

// DividendBenefactor is a union of a player and how much they received for a dividend
type DividendBenefactor struct {
	Player   xid.ID
	Quantity int
}

// StockPurchase is a log entry where a stock was purchased by a player
type StockPurchase struct {
	Player   xid.ID
	Stonk    xid.ID
	Quantity int
	Price    int
}

// Type implements the Log interface
func (sp *StockPurchase) Type() string {
	return "transaction"
}

// GameCreate is a log entry where a game was created (should likely be the first entry)
type GameCreate struct {
}

// Type implements the Log interface
func (gc *GameCreate) Type() string {
	return "game-create"
}

// PlayerJoined is a log entry where a player joins the game
type PlayerJoined struct {
	Player xid.ID `json:"type"`
}

// Type implements the Log interface
func (pj *PlayerJoined) Type() string {
	return "player-joined"
}

// GameStarted is a log entry where a game is started (no players can join)
type GameStarted struct {
}

// Type implements the Log interface
func (gs *GameStarted) Type() string {
	return "game-started"
}

// Split is a lot entry where a stock reached its max price and split
type Split struct {
	Stonk xid.ID
}

// Type implements the Log interface
func (gs *Split) Type() string {
	return "stock-split"
}
