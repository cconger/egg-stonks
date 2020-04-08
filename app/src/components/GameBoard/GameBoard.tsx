import * as React from 'react';

import {StonkBoard} from 'stonks/components/StonkBoard';
import {PlayerBoard} from 'stonks/components/PlayerBoard';
import {Controls} from 'stonks/components/Controls';
import {Purchases} from 'stonks/components/Purchases';
import {Log} from 'stonks/components/Log';
import {GameState} from 'stonks/game/state';

import './style.css';

export interface GameBoardProps {
  gameId: string;
}

interface GameBoardState {
  loaded: boolean;
  error?: string;
  state?: GameState;
}

export const GameBoard = (props: GameBoardProps) => {
  const [{state, error, loaded}, setState] = React.useState<GameBoardState>({loaded: false})

  React.useEffect(() => {
    fetch("http://localhost:8080/game/101/state").then((response) => {
      return response.json();
    }).then((data) => {
      setState({
        loaded: true,
        state: data,
      })
    }).catch((e) => {
      setState({
        loaded: true,
        error: "Could not load data: " + e,
      });
    });
  }, [props.gameId])

  if (!loaded) {
    return <div className="loading">LOADING...</div>
  }
  if (error !== undefined) {
    return <div className="error">Error loading... {error}</div>
  }

  let graphs = state.stonks.map((stonk) => (
    <StonkBoard key={stonk.id} stonk={stonk} turns={state.turns} />
  ))

  let players = state.players.map((player) => (
    <PlayerBoard key={player.id} player={player} stonks={state.stonks} />
  ));

  let playerStyles = {
    gridTemplateColumns: "repeat(" + state.players.length + ", 1fr)",
  };

  let stocklist = state.stonks.map((stonk) => (stonk.name));

  return (
    <div className="screen">
      <div className="players" style={playerStyles}>
        {players}
      </div>
      <div className="stonks">
        {graphs}
      </div>
      <div className="input">
        <Log log={state.log} players={state.players} stonks={state.stonks} />
        <div className="controls">
          <Controls stonks={stocklist} />
          <Purchases stonks={stocklist} />
        </div>
      </div>
    </div>
  )
}

