import * as React from 'react';

import {Wheel} from 'stonks/components/Wheel';
import {Stonk, Player, Roll} from 'stonks/game/state';

import './style.css';

export interface ControlProps {
  player: Player;
  myPlayer: Player;
  stonks: Stonk[];
  roll: Roll | null;
  client: Client;
}

interface Client {
  RevealRoll: (mask: boolean[]) => void;
  ApplyRoll: () => void;
}

export interface ControlState {
  rolls: number[];
}

export const Controls = (props: ControlProps) => {
  let choices = [
    props.stonks.map((s) => (s.name)),
    ["Up", "Down", "Dividend"],
    ["5", "10", "15", "20"],
  ];

  let stockRoll = props.stonks.findIndex((stonk) => (stonk.id === props.roll.stonk));
  let actionRoll = props.roll.action;
  let valueRoll = choices[2].findIndex((choice) => (props.roll.value.toString() == choice));

  let rolls = [
    stockRoll,
    actionRoll,
    valueRoll,
  ];

  let myTurn = props.player.id == props.myPlayer.id;

  let allShown = props.roll.reveal.reduce((v, a) => (v && a), true)
  React.useEffect(() => {
    if (allShown && myTurn) {
      setTimeout(() => {
        props.client.ApplyRoll();
      }, 5000);
    }
  }, [allShown])


  let allRollButton
  if (myTurn) {
    let rollAll = () => {
      props.client.RevealRoll([true, true, true]);
    }
    allRollButton = <div className="button" onClick={rollAll}>Roll All</div>
  }

  let roll = (idx: number) => {
    if (!myTurn) { return; }

    let mask = [false, false, false]
    mask[idx] = true;

    props.client.RevealRoll(mask);
  }

  let id = props.roll && props.roll.id || '-';

  return (
    <div>
      <div>{props.player.name} rolling...</div>
      <div className="wheels">
        <Wheel enabled={myTurn} reveal={props.roll.reveal[0]} rollID={id} choices={choices[0]} roll={rolls[0]} rollHandler={() => roll(0)} />
        <Wheel enabled={myTurn} reveal={props.roll.reveal[1]} rollID={id} choices={choices[1]} roll={rolls[1]} rollHandler={() => roll(1)} />
        <Wheel enabled={myTurn} reveal={props.roll.reveal[2]} rollID={id} choices={choices[2]} roll={rolls[2]} rollHandler={() => roll(2)} />
        {allRollButton}
      </div>
    </div>
  )
}

function randomInt(min: number, max: number) {
  const range = max - min;
  return Math.floor(Math.random() * range) + min;
}
