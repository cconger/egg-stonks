import * as React from 'react';
import { nanoid } from 'nanoid';

import {GameClient} from 'stonks/components/GameBoard';
import {NamePicker} from 'stonks/components/NamePicker';

interface ApplicationState {
  clientID: string;
  playerName?: string;
  gameID?: string;
}

export const Application = () => {
  const [{clientID, playerName, gameID}, setState] = React.useState<ApplicationState>(() => {

    // Parse query params for gameID

    let clientID = localStorage.getItem('client_id');
    if (clientID == null) {
      clientID = nanoid();
      localStorage.setItem('client_id', clientID);
    }

    let playerName = sessionStorage.getItem('player_name')

    return {
      gameID: "101",
      clientID,
      playerName,
    }
  })

  const namePicked = (name: string) => {
    sessionStorage.setItem("player_name", name);
    setState((state) => ({
      ...state,
      playerName: name,
    }))
  }

  if (gameID === undefined) {
    return <div> WTF no game ID</div>
  }

  if (playerName === undefined) {
    let prefill = sessionStorage.getItem("player_name")

    return <NamePicker prefill={prefill} onSubmit={namePicked} />
  }

  return <GameClient clientID={clientID} gameID={"101"} name={"ChandyMan"} />
}
