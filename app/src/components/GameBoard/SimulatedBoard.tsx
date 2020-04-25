import * as React from 'react';

import {GameState} from 'stonks/game/state';
import {GameBoard} from './GameBoard';

const noopClient = {
  BuyStonk: (stonk: string, quantity: number) => { console.log("Buy Stonk", stonk, quantity) },
  SellStonk: (stonk: string, quantity: number) => { console.log("Sell Stonk", stonk, quantity) },
  FinishBuy: () => { console.log("HODL") },
  RevealRoll: (mask: boolean[]) => { console.log("Reveal Roll", mask) },
  ApplyRoll: () => { console.log("Apply Roll") },
}

interface Props {
  gameID: string;
}

export const SimulatedBoard = (props: Props) => {
  const [gamestate, setGamestate] = React.useState<GameState>(null);

  React.useEffect(() => {
    fetch("/game/101/state").then((res) => {
      return res.json();
    }).then((json) => {
      setGamestate(json);
    });
  }, [props.gameID])

  if (gamestate === null) {
    return <div>Loading...</div>
  }

  let myPlayer = gamestate.players[0].id;

  return <GameBoard state={gamestate} currentPlayer={myPlayer} />
}
