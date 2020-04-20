import * as React from 'react';

import './style.css';

import {Player,Stonk} from 'stonks/game/state';
import {LogEntry} from 'stonks/game/logs'

export interface LogProps {
  players: Player[];
  stonks: Stonk[];
  log: LogEntry[];
}

export const Log = (props: LogProps) => {
  const lookupPlayer = (id: string) => {
    return props.players.find((p) => (p.id === id));
  }

  const lookupStonk = (id: string) => {
    return props.stonks.find((s) => (s.id === id));
  }

  let lines = props.log.map((entry, i) => (
    <LogLine
      key={i}
      entry={entry}
      resolvePlayer={lookupPlayer}
      resolveStonk={lookupStonk}
    />
  ));

  lines.reverse();

  return (
    <div className="log">
      <div className="log-title">LOG:</div>
      <div className="log-container">
        {lines}
      </div>
    </div>
  )
};

interface PlayerTokenProps {
  player: Player;
}

const PlayerToken = (props: PlayerTokenProps) => {
  return (
    <span>props.player.name</span>
  );
}

interface LogLineProps {
  entry: LogEntry;
  resolvePlayer: (id: string) => Player;
  resolveStonk: (id: string) => Stonk;
}

interface LookUpSet {
  getPlayer: (id: string) => Player;
  getStonk: (id: string) => Stonk;
}

const timeFormatter = new Intl.DateTimeFormat('default', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
});

const LogLine = (props: LogLineProps) => {
  let player, stonk
  let body
  switch(props.entry.type) {
    case 'game-create':
      body = (
        <>
          Game created
        </>
      )
      break;
    case 'dividend':
      stonk = props.resolveStonk(props.entry.entry.stonk)
      let v = (props.entry.entry.value/100).toFixed(2);
      body = (
        <>
          Dividend paid on {stonk.name} @ ${v}
        </>
      )
      break;
    case 'ready':
      player =  props.resolvePlayer(props.entry.entry.player)
      body = (
        <>
          {player.name} is HODLing
        </>
      )

      break;
    case 'split':
      stonk = props.resolveStonk(props.entry.entry.stonk)
      body = (
        <>
          {stonk.name} is splitting.  Resetting to $1 and doubling all existing holdings.
        </>
      )
      break;
    case 'unlisted':
      stonk = props.resolveStonk(props.entry.entry.stonk)
      body = (
        <>
          {stonk.name} hit $0, resetting to $1 and removing all shraes
        </>
      )
      break;
    case 'price-change':
      player =  props.resolvePlayer(props.entry.entry.player)
      stonk = props.resolveStonk(props.entry.entry.stonk)
      let dir = "increased";
      let mov = (props.entry.entry.movement/100).toFixed(2);
      if (props.entry.entry.movement < 0) {
        dir = "decreased";
        mov = (-props.entry.entry.movement/100).toFixed(2);
      }
      
      body = (
        <>
          Price of {stonk.name} {dir} by ${mov}
        </>
      )
      break;
    case 'transaction':
      player =  props.resolvePlayer(props.entry.entry.player)
      stonk = props.resolveStonk(props.entry.entry.stonk)
      let q = props.entry.entry.quantity
      let direction = "bought"
      if (props.entry.entry.quantity < 0) {
        q = -q
        direction = "sold"
      }
      body = (
        <>
          {player.name} {direction} {q} shares of {stonk.name}
        </>
      )
      break;
    default:
      console.error("Unknown log type:", props.entry)
      body = (
        <>
          Unknown Log Type
        </>
      )
  }

  let d = new Date(props.entry.time);
  let dateString = timeFormatter.format(d);

  return (
    <div className="log-line">
      <div className="log-line-time">{dateString}:</div>
      <div className="log-line-body">{body}</div>
    </div>
  );
}
