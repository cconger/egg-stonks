import {LogEntry} from './logs';

// A lot is a Tuple type of quanity and cost per share
export type Lot = [number, number];

export interface Holding {
  stonk: string;
  lots: Lot[];
}

export interface Player {
  id: string;
  name: string;
  portfolio: Holding[];
  cash: number;
  value: number[];
}

// Tuple type of Open High Low Close
export type Candlestick = [number, number, number, number]

export interface Stonk {
  id: string;
  name: string;
  history: Candlestick[]
}

export interface GameState {
  turn: Turn;
  turns: number;
  players: Player[];
  stonks: Stonk[];
  log: LogEntry[];
  roll: Roll | null;
}

export enum Phase {
  Forming,
  Transact,
  Market,
}

export interface Turn {
  index: number;
  phase: Phase;
  player: string;
}

export interface Roll {
  id: string;
  player: string;
  stonk: string;
  action: number;
  value: number;
  reveal: boolean[];
}

export function GetPrice(stonk: Stonk): number {
  return stonk.history[stonk.history.length - 1][3] / 100;
}
