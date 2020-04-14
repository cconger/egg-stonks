package stonks

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	"github.com/rs/xid"
)

/*
NOTES:
All values are integers in number of cents.

Player Status 0 means ok
Player Status 1 means disconnected
*/

// GameState is the top level node in the tree dsecribing game state
type GameState struct {
	Turn    *Turn       `json:"turn"`
	Turns   int         `json:"turns"`
	Players []*Player   `json:"players"`
	Stonks  []*Stonk    `json:"stonks"`
	Log     []*LogEntry `json:"log"`
}

func (gs *GameState) stonkByID(id xid.ID) *Stonk {
	for _, s := range gs.Stonks {
		if s != nil && s.ID == id {
			return s
		}
	}
	return nil
}

func (gs *GameState) playerByID(id xid.ID) *Player {
	for _, p := range gs.Players {
		if p != nil && p.ID == id {
			return p
		}
	}
	return nil
}

func (gs *GameState) addLog(log Log) {
	entry := &LogEntry{
		Time:  time.Now(),
		Type:  log.Type(),
		Entry: log,
	}
	gs.Log = append(gs.Log, entry)
}

func (gs *GameState) payDividend(stonk *Stonk, value int) {
	for _, p := range gs.Players {
		p.Cash += p.totalHolding(stonk.ID) * value
	}
}

// Turn stores the current state of where we are in the game
type Turn struct {
	Number int     `json:"number"`
	Phase  int     `json:"phase"`
	Player *xid.ID `json:"player"`
	Action int     `json:"action"`
}

// Stonk is a description of a stonk thorugh the course of a game
type Stonk struct {
	ID       xid.ID       `json:"id"`
	Name     string       `json:"name"`
	History  []*TurnQuote `json:"history"`
	unlisted bool
}

func (s *Stonk) getHistory(turn int) (*TurnQuote, error) {
	if turn < 0 || turn >= cap(s.History) {
		return nil, fmt.Errorf("invalid turn number %d", turn)
	}

	if turn >= len(s.History) {
		var prev *TurnQuote
		if turn == 0 {
			// Init
			prev = &TurnQuote{
				High:  100,
				Low:   100,
				Open:  100,
				Close: 100,
			}
		} else {
			var err error
			prev, err = s.getHistory(turn - 1)
			if err != nil {
				return nil, err
			}
		}
		q := &TurnQuote{
			Open:  prev.Close,
			High:  prev.Close,
			Low:   prev.Close,
			Close: prev.Close,
		}
		s.History = append(s.History, q)
		return q, nil
	}

	return s.History[turn], nil
}

func (s *Stonk) movePrice(turn int, movement int) (int, error) {
	hist, err := s.getHistory(turn)
	if err != nil {
		return 0, err
	}

	if s.unlisted {
		return 0, nil
	}

	hist.Close += movement
	if hist.Close < hist.Low {
		hist.Low = hist.Close
	}
	if hist.Close > hist.High {
		hist.High = hist.Close
	}

	if hist.Close >= 200 {
		hist.Close = 200
	}
	if hist.Close <= 0 {
		s.unlisted = true
		hist.Close = 0
	}

	return hist.Close, nil
}

func (s *Stonk) price() int {
	hist, err := s.getHistory(len(s.History) - 1)
	if err != nil {
		return 0
	}
	return hist.Close
}

func (s *Stonk) split() {
	hist, err := s.getHistory(len(s.History) - 1)
	if err != nil {
		return
	}
	hist.High = hist.High / 2
	hist.Low = hist.Low / 2
	hist.Open = hist.Open / 2
	hist.Close = 100
}

// TurnQuote is a description of the price movements of one stonk for a turn
type TurnQuote struct {
	High  int
	Low   int
	Open  int
	Close int
}

// MarshalJSON impelements a custom tighter packing for a turn quote to be a 4-tuple of ints
func (t *TurnQuote) MarshalJSON() ([]byte, error) {
	return json.Marshal([]int{t.Open, t.High, t.Low, t.Close})
}

// Player is the type for respresenting a player's state in the game
type Player struct {
	ID        xid.ID     `json:"id"`
	Name      string     `json:"name"`
	Portfolio []*Holding `json:"portfolio"`
	Cash      int        `json:"cash"`
	Value     []int      `json:"value"`
	Status    int        `json:"status"`
}

func (p *Player) totalHolding(stonk xid.ID) int {
	for _, h := range p.Portfolio {
		if h.Stonk == stonk {
			return h.total()
		}
	}
	return 0
}

func (p *Player) split(stonk *Stonk) {
	for _, h := range p.Portfolio {
		if h.Stonk == stonk.ID {
			h.split()
		}
	}
}

func (p *Player) buy(stonk *Stonk, quantity int) error {
	price := stonk.price()
	cost := price * quantity
	if cost > p.Cash {
		return fmt.Errorf("Insufficient Cash")
	}

	p.Cash -= cost

	var holding *Holding
	for _, h := range p.Portfolio {
		if h.Stonk == stonk.ID {
			holding = h
		}
	}

	if holding == nil {
		// No holding for this, create
		holding = &Holding{
			Stonk: stonk.ID,
			Lots:  []*Lot{},
		}
	}
	holding.buy(quantity, price)

	p.Portfolio = append(p.Portfolio, holding)
	return nil
}

func (p *Player) sell(stonk *Stonk, quantity int) (int, error) {
	for _, h := range p.Portfolio {
		if h.Stonk == stonk.ID {
			q := h.sell(quantity)
			credit := q * stonk.price()
			p.Cash += credit
			return q, nil
		}
	}

	return 0, fmt.Errorf("no ownership")
}

// Holding is the description of a players holding history of a specific stonk
type Holding struct {
	Stonk xid.ID `json:"stonk"`
	Lots  []*Lot `json:"lots"`
}

// Total returns the total Quantity of stocks this player holds
func (h *Holding) total() int {
	total := 0
	for _, l := range h.Lots {
		total += l.Quantity
	}
	return total
}

func (h *Holding) split() {
	for _, l := range h.Lots {
		l.Quantity = l.Quantity * 2
	}
}

func (h *Holding) buy(quantity int, price int) {
	lot := &Lot{
		Quantity: quantity,
		Cost:     price,
	}

	h.Lots = append(h.Lots, lot)
}

func (h *Holding) sell(quantity int) int {
	sold := 0
	newLots := make([]*Lot, 0, len(h.Lots))
	for _, l := range h.Lots {
		delta := quantity - sold
		if l.Quantity < delta {
			sold += l.Quantity
			// Don't copy to new list
			continue
		}

		if sold < quantity {
			sold += delta
			l.Quantity -= delta
		}

		newLots = append(newLots, l)
	}

	return sold
}

// Lot is a structure describing how much someone paid for stock at one point
type Lot struct {
	Quantity int
	Cost     int
}

// MarshalJSON implements a custom tighter packing for a lot to be a 2-tuple of ints
func (l *Lot) MarshalJSON() ([]byte, error) {
	return json.Marshal([]int{l.Quantity, l.Cost})
}

// PlayerAction is a enum type for the dice roll of "Up" "Down" "Dividend"
type PlayerAction int

const (
	// ActionUp is the roll for changing a price upwards
	ActionUp PlayerAction = iota
	// ActionDown is a roll for changing a price downwards
	ActionDown PlayerAction = iota
	// ActionDividend is a roll for paying a dividend on a stonk
	ActionDividend PlayerAction = iota
)

// Roll describes a roll of the dice
type Roll struct {
	Player xid.ID
	Stonk  xid.ID
	Action PlayerAction
	Value  int
}

// NewGame returns a new game configured with the appropriate fields
func NewGame(turns int, players int, stocknames []string) *GameState {

	gs := &GameState{
		Turn: &Turn{
			Number: 0,
			Phase:  0,
			Player: nil,
			Action: 0,
		},
		Turns:   turns,
		Players: make([]*Player, 0, players),
		Stonks:  makeStonks(stocknames, turns),
		Log:     []*LogEntry{},
	}
	gs.addLog(&GameCreate{})
	return gs
}

func makeStonks(stocknames []string, turns int) []*Stonk {
	stonks := make([]*Stonk, len(stocknames))
	for i, s := range stocknames {
		history := make([]*TurnQuote, 1, turns)

		history[0] = &TurnQuote{
			High:  100,
			Low:   100,
			Open:  100,
			Close: 100,
		}

		stonks[i] = &Stonk{
			ID:      xid.New(),
			Name:    s,
			History: history,
		}
	}
	return stonks
}

var allowedMovements = []int{5, 10, 15, 20}

func (gs *GameState) reconcileValue() {
	for _, player := range gs.Players {
		total := player.Cash
		for _, h := range player.Portfolio {
			stonk := gs.stonkByID(h.Stonk)
			if stonk == nil {
				continue
			}
			total += h.total() * stonk.price()
		}
		player.Value[gs.Turn.Number] = total
	}
}

// ApplyRoll internally mutates the gamestate to apply the outcome of the roll provided.
// These are decoupled to allow for the roll to be returned to the player before
func (gs *GameState) ApplyRoll(roll *Roll) error {
	switch roll.Action {
	case ActionUp, ActionDown:
		return gs.applyStockMove(roll)
	case ActionDividend:
		return gs.applyDividend(roll)
	default:
		return fmt.Errorf("Unknown PlayerAction %v", roll.Action)
	}
}

func (gs *GameState) applyStockMove(roll *Roll) error {
	stonk := gs.stonkByID(roll.Stonk)
	if stonk == nil {
		return fmt.Errorf("Unknown stonk %v", roll.Stonk)
	}
	player := gs.playerByID(roll.Player)
	if player == nil {
		return fmt.Errorf("Unknown player %v", roll.Player)
	}

	log := &PriceChange{
		Player:   player.ID,
		Stonk:    stonk.ID,
		Movement: roll.Value,
	}
	gs.addLog(log)

	delta := roll.Value
	if roll.Action == ActionDown {
		delta = -roll.Value
	}

	p, err := stonk.movePrice(gs.Turn.Number, delta)
	if err != nil {
		return fmt.Errorf("Couldn't update price")
	}

	// We hit the stock split price
	if p >= 200 {
		for _, player := range gs.Players {
			player.split(stonk)
		}
		stonk.split()
	}
	gs.reconcileValue()

	return nil
}

func (gs *GameState) applyDividend(roll *Roll) error {
	stonk := gs.stonkByID(roll.Stonk)
	if stonk == nil {
		return fmt.Errorf("Unknown stonk %v", roll.Stonk)
	}
	player := gs.playerByID(roll.Player)
	if player == nil {
		return fmt.Errorf("Unknown player %v", roll.Player)
	}

	log := &Dividend{
		Player: player.ID,
		Stonk:  stonk.ID,
		Value:  roll.Value,
	}
	gs.payDividend(stonk, roll.Value)
	gs.reconcileValue()
	gs.addLog(log)

	return nil
}

// AddPlayer creates a new player of the given name and returns the ID for that player
func (gs *GameState) AddPlayer(name string) (string, error) {
	player := &Player{
		ID:        xid.New(),
		Name:      name,
		Portfolio: []*Holding{},
		Cash:      500000,
		Value:     make([]int, gs.Turns),
	}
	player.Value[0] = player.Cash
	gs.Players = append(gs.Players, player)

	return player.ID.String(), nil
}

// Roll returns a roll.  It does not modify gamestate since we want to return fast
func (gs *GameState) Roll(player xid.ID) (*Roll, error) {
	stonk := gs.Stonks[rand.Intn(len(gs.Stonks))]
	action := PlayerAction(rand.Intn(3))
	movement := allowedMovements[rand.Intn(len(allowedMovements))]

	return &Roll{
		Player: player,
		Stonk:  stonk.ID,
		Action: action,
		Value:  movement,
	}, nil
}

// Transact is for a player buying or selling stock
func (gs *GameState) Transact(playerID xid.ID, stonkID xid.ID, quantity int) error {
	stonk := gs.stonkByID(stonkID)
	if stonk == nil {
		return fmt.Errorf("Unknown stonk %v", stonkID)
	}
	player := gs.playerByID(playerID)
	if player == nil {
		return fmt.Errorf("Unknown player %v", playerID)
	}

	if quantity == 0 {
		return fmt.Errorf("very clever")
	}

	if quantity > 0 {
		err := player.buy(stonk, quantity)
		if err != nil {
			return fmt.Errorf("Could not buy: %s", err)
		}
	} else {
		q, err := player.sell(stonk, quantity)
		if err != nil {
			return fmt.Errorf("Unable to sell: %s", err)
		}
		quantity = q
	}

	gs.addLog(&StockPurchase{
		Player:   player.ID,
		Stonk:    stonk.ID,
		Quantity: quantity,
		Price:    stonk.price(),
	})
	gs.reconcileValue()

	return nil
}
