export interface LogEntry {
  time: string;
  type: string;
  entry: Log
}

export type Log = Dividend | Transaction | PriceChange | GameStarted;

export interface Dividend {
  player: string;
  stonk: string;
  value: number;
}

export interface Transaction {
  player: string;
  stonk: string;
  quantity: number;
  price: number;
}

export interface PriceChange {
  player: string;
  stonk: string;
  movement: number;
}

export interface GameStarted {
}
