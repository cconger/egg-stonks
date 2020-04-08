import * as React from 'react';

import './style.css';

import {Player,Stonk} from 'stonks/game/state';
import {LogEntry, Dividend, Transaction, PriceChange, GameStarted} from 'stonks/game/logs'

export interface LogProps {
  players: Player[];
  stonks: Stonk[];
  log: LogEntry[];
}

export const Log = (props: LogProps) => {
  const lookupPlayer = (id: string) => {
    return props.players[0];
  }

  const lookupStonk = (id: string) => {
    return props.stonks[0];
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

const timeFormatter = new Intl.DateTimeFormat('default', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
});

const LogLine = (props: LogLineProps) => {
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
      body = (
        <>
          A dividend was paid
        </>
      )
      break;
    case 'stock-split':
      body = (
        <>
          Stock split
        </>
      )
      break;
    case 'price-change':
      body = (
        <>
          Price Change
        </>
      )
      break;
    case 'transaction':
      body = (
        <>
          Somebody bought something
        </>
      )
      break;
    default:
      console.log("Unknown log type:", props.entry)
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
