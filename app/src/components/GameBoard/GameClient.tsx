import * as React from 'react';

import {GameBoard} from './GameBoard';
import {ErrorPane} from 'stonks/components/ErrorPane';
import {PlayerStaging} from 'stonks/components/PlayerStaging';
import {GameState, Phase} from 'stonks/game/state';
import {SocketClient, ErrorMsg} from 'stonks/game/client';

export interface GameClientProps {
  clientID: string;
  gameID: string;
  name: string;
  reset: (msg: string) => void;
}

interface GameClientState {
  connected: boolean;
  client?: SocketClient;
  error?: ErrorMsg;
  gamestate?: GameState;
  playerID?: string;
  dropped: number;
  delay: number;
}

export const GameClient = (props: GameClientProps) => {
  const [{connected, error, gamestate, playerID, dropped, delay, client}, setState] = React.useState<GameClientState>({connected: false, dropped: 0, delay: 1});

  React.useEffect(() => {
    // Create the websocket connection, send the auth payload, figure out which player id I am and feed that
    // into a game board.
    let client = new SocketClient(props.gameID, props.clientID, {
      OnConnect: () => {
        client.JoinGame(props.name)
        setState((state) => ({
          ...state,
          connected: true,
        }))
      },
      OnClose: () => {
        setState((state) => ({
          ...state,
          connected: false,
        }));
      },
      OnError: (error: ErrorMsg) => {
        setState((state) => ({
          ...state,
          error,
        }))
      },
      StateUpdate: (gamestate) =>  {
        setState((state) => ({
          ...state,
          gamestate: gamestate,
        }))
      },
      PlayerUpdate: (playerID) => {
        setState((state) => ({
          ...state,
          playerID: playerID,
        }))
      },
      NoConnect: () => {
        props.reset("Could not join game... Please create a new game.")
      }
    })

    setState((state) => ({
      ...state,
      client,
    }));

    return function cleanup() {
      client.Close();
    }

  }, [props.gameID])

  let errorContent
  if (error) {
    errorContent = (
      <div className="error">
        {error.Message}
      </div>
    )
  }

  if (!connected) {
    if (error) {
      return errorContent;
    }
    return (
      <>
        <div>
          Connecting...
        </div>
      </>
    )
  }

  if (gamestate === undefined) {
    return (
      <>
        {errorContent}
        <div className="error">
          Connected! Joining...
        </div>
      </>
    )
  }

  if (gamestate.turn.phase === Phase.Forming) {
    let startGame = () => { client.StartGame() };
    return (
      <>
        <ErrorPane error={error} />
        <PlayerStaging gameID={props.gameID} state={gamestate} currentPlayer={playerID} onStartGame={startGame} />
      </>
    )
  }

  return <GameBoard state={gamestate} error={error} currentPlayer={playerID} client={client} quit={props.reset} />;
};
