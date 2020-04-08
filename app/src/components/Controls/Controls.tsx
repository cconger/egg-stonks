import * as React from 'react';

import {Wheel} from 'stonks/components/Wheel';

import './style.css';

export interface ControlProps {
  stonks: string[];
}

export interface ControlState {
  rolls: number[];
  generations: number[];
}

export const Controls = (props: ControlProps) => {
  const [{rolls, generations}, setState] = React.useState({
    rolls: [0,0,0],
    generations: [0,0,0],
  });

  let choices = [
    props.stonks,
    ["Up", "Down", "Dividend"],
    ["5", "10", "15", "20"],
  ];


  let rollAll = () => {
    setState({
      rolls: rolls.map((x, i) => (randomInt(0, choices[i].length))),
      generations: generations.map(x => x +1),
    });
  }

  let roll = (idx: number) => {
    const newRolls = rolls.map((x, i) => {
      if (i == idx) {
        return randomInt(0, choices[i].length);
      } else {
        return x;
      }
    });
    setState({
      rolls: newRolls,
      generations: generations.map((x,i) => (i === idx ? x + 1 : x)),
    });
  }


  return (
    <div className="wheels">
      <Wheel choices={choices[0]} roll={rolls[0]} generation={generations[0]} rollHandler={() => roll(0)} />
      <Wheel choices={choices[1]} roll={rolls[1]} generation={generations[1]} rollHandler={() => roll(1)} />
      <Wheel choices={choices[2]} roll={rolls[2]} generation={generations[2]} rollHandler={() => roll(2)} />
      <div className="button" onClick={rollAll}>Roll All</div>
    </div>
  )
}

function randomInt(min: number, max: number) {
  const range = max - min;
  return Math.floor(Math.random() * range) + min;
}
