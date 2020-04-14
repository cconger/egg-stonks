import * as React from 'react';

import {GameBoard} from './GameBoard';
import {GameState} from 'stonks/game/state';

export interface GameClientProps {
  clientID: string;
  gameID: string;
  name: string;
}

interface GameClientState {
  connected: boolean;
  error?: string;
  gamestate?: GameState;
  playerID?: string;
  dropped: number;
  delay: number;
}

type SocketEnvelope = StateUpdate | WhoamiUpdate | UnknownUpdate;

interface UnknownUpdate {
  ts: string;
  type: string;
  payload: never;
}

interface StateUpdate {
  ts: string;
  type: "state";
  payload: GameState;
}

interface WhoamiUpdate {
  ts: string;
  type: "whoami";
  payload: string;
}

export const GameClient = (props: GameClientProps) => {
  const [{connected, error, gamestate, playerID, dropped, delay}, setState] = React.useState<GameClientState>({connected: false, dropped: 0, delay: 1});

  React.useEffect(() => {
    // Create the websocket connection, send the auth payload, figure out which player id I am and feed that
    // into a game board.
    let socket = new WebSocket(`ws://localhost:8080/game/${props.gameID}/join`);

    socket.onopen = function(event) {
      console.log("Socket open!", event)

      // Start the handshakke process by declaring who we are.
      socket.send(JSON.stringify({
        client_id: props.clientID,
        name: props.name,
      }))

      setState((state) => ({
        ...state,
        connected: true,
      }));
    }

    socket.onmessage = function(event) {
      console.log("Socket onmessage", event);

      let update: SocketEnvelope = JSON.parse(event.data);

      switch (update.type) {
        case "state":
          setState((state) => ({
            ...state,
            gamestate: (update.payload as GameState),
          }));
          break;
        case "whoami":
          setState((state) => ({
            ...state,
            playerID: (update.payload as string),
          }));
          break;
        default:
        console.error("Unknown socket event type:", update.type)

      }
    }

    socket.onerror = function(event) {
      console.log("Socket error", event);
    }

    socket.onclose = function(event) {
      console.log("Socket closed", event);
      setState((state) => ({
        ...state,
        error: "Connection dropped, refresh...",
      }));
    }


    return function cleanup() {
      socket.close();
    }

  }, [props.gameID])


  if (!connected) {
    return (
      <div>
        Connecting...
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    );
  }
  
  if (gamestate === undefined) {
    return (
      <div className="error">
        Connected! Joining...
      </div>
    )
  }

  return (
    <>
      <GameBoard state={gamestate} currentPlayer={playerID} />
    </>
  )
};
