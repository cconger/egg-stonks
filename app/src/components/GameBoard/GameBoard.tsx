import * as React from 'react';

import {StonkBoard} from 'stonks/components/StonkBoard';
import {PlayerBoard} from 'stonks/components/PlayerBoard';
import {Controls} from 'stonks/components/Controls';
import {Purchases} from 'stonks/components/Purchases';
import {Log} from 'stonks/components/Log';
import {GameState} from 'stonks/game/state';

import './style.css';

export interface GameBoardProps {
  state: GameState;
  currentPlayer?: string;
}

interface GameBoardState {
  loaded: boolean;
  error?: string;
  state?: GameState;
}

export const GameBoard = (props: GameBoardProps) => {
  let graphs = props.state.stonks.map((stonk) => (
    <StonkBoard key={stonk.id} stonk={stonk} turns={props.state.turns} />
  ))

  let players = props.state.players.map((player) => (
    <PlayerBoard key={player.id} player={player} stonks={props.state.stonks} />
  ));

  let playerStyles = {
    gridTemplateColumns: "repeat(" + props.state.players.length + ", 1fr)",
  };

  let stocklist = props.state.stonks.map((stonk) => (stonk.name));

  return (
    <div className="screen">
      <div className="players" style={playerStyles}>
        {players}
      </div>
      <div className="stonks">
        {graphs}
      </div>
      <div className="input">
        <Log log={props.state.log} players={props.state.players} stonks={props.state.stonks} />
        <div className="controls">
          <Controls stonks={stocklist} />
          <Purchases stonks={props.state.stonks} />
        </div>
      </div>
    </div>
  )
}

