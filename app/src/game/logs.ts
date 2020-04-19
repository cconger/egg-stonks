/*
export interface LogEntry {
  time: string;
  type: string;
  entry: Log
}
*/

export type LogEntry =
  DividendLogEntry |
  TransactionLogEntry |
  PriceChangeLogEntry |
  GameStartedLogEntry |
  GameCreatedLogEntry |
  PlayerReadyLogEntry |
  UnlistedLogEntry |
  SplitLogEntry |
  UnknownLogEntry;

export interface UnknownLogEntry {
  time: string;
  type: string;
  entry: never;
}

export interface DividendLogEntry {
  time: string;
  type: "dividend";
  entry: {
    player: string;
    stonk: string;
    value: number;
  }
}

export interface TransactionLogEntry {
  time: string;
  type: "transaction";
  entry: {
    player: string;
    stonk: string;
    quantity: number;
    price: number;
  }
}

export interface PriceChangeLogEntry {
  time: string;
  type: "price-change";
  entry: {
    player: string;
    stonk: string;
    movement: number;
  }
}

export interface GameStartedLogEntry {
  time: string;
  type: "game-started";
}

export interface GameCreatedLogEntry {
  time: string;
  type: "game-created";
}

export interface PlayerReadyLogEntry {
  time: string;
  type: "ready";
  entry: {
    player: string;
  }
}

export interface UnlistedLogEntry {
  time: string;
  type: "unlisted";
  entry: {
    stonk: string;
  }
}

export interface SplitLogEntry {
  time: string;
  type: "split";
  entry: {
    stonk: string;
  }
}
