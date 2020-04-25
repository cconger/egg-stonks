import * as React from 'react';

import {StonkBoard} from 'stonks/components/StonkBoard';
import {PlayerBoard} from 'stonks/components/PlayerBoard';
import {Controls} from 'stonks/components/Controls';
import {Purchases} from 'stonks/components/Purchases';
import {ErrorPane} from 'stonks/components/ErrorPane';
import {Log} from 'stonks/components/Log';
import {GameState} from 'stonks/game/state';
import {ErrorMsg} from 'stonks/game/client';

import './style.css';

export interface GameBoardProps {
  state: GameState;
  currentPlayer?: string;
  error?: ErrorMsg;
  client?: GameClient;
  quit?: (msg: string|null) => void;
}

interface GameClient {
  BuyStonk: (stonk: string, quantity: number) => void;
  SellStonk: (stonk: string, quantity: number) => void;
  FinishBuy: () => void;
  RevealRoll: (mask: boolean[]) => void;
  ApplyRoll: () => void;
}

export const GameBoard = (props: GameBoardProps) => {
  let graphs = props.state.stonks.map((stonk) => (
    <StonkBoard key={stonk.id} stonk={stonk} turns={props.state.turns} />
  ))

  let players = props.state.players.map((player) => (
    <PlayerBoard key={player.id} player={player} stonks={props.state.stonks} />
  ));

  let [myPlayer] = props.state.players.filter((player) => (player.id == props.currentPlayer));

  let controls
  if (props.state.turn.phase == 1) {
    controls = <Purchases player={myPlayer} stonks={props.state.stonks} client={props.client} />
  }
  if (props.state.turn.phase == 2) {
    let [actingPlayer] = props.state.players.filter((player) => (player.id == props.state.turn.player))
    controls = <Controls player={actingPlayer} myPlayer={myPlayer} stonks={props.state.stonks} roll={props.state.roll} client={props.client} />
  }
  if (props.state.turn.number >= props.state.turns) {
    controls = (
      <>
        <div>Game over!</div>
        <div className="button" onClick={() => {props.quit(null)}}>New Game</div>
      </>
    )
  }

  return (
    <div className="screen">
      <div className="players">
        {players}
      </div>
      <div className="stonks">
        {graphs}
      </div>
      <div className="input">
        <Log log={props.state.log} players={props.state.players} stonks={props.state.stonks} />
        <div className="controls">
          {controls}
        </div>
      </div>
      <ErrorPane error={props.error} />
    </div>
  )
}

