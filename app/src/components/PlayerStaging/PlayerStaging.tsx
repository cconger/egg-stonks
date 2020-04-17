import * as React from 'react';

import {GameState} from 'stonks/game/state';

import './style.css';

export interface PlayerStagingProps {
  state: GameState;
  currentPlayer: string;
  onStartGame: () => void;
}

export const PlayerStaging = (props: PlayerStagingProps) => {
  let playerList = props.state.players.map((player) => {
    let itsme = player.id === props.currentPlayer;
    return (
      <div className={itsme ? "player-list me" : "player-list"} key={player.id}>{player.name}</div>
    )
  })

  return (
    <div className="dialog-container">
      <div className="dialog">
        <div className="player-title">PLAYERS:</div>
        {playerList}
        <div className="start button" onClick={props.onStartGame}>Start Game</div>
      </div>
    </div>
  );
}
