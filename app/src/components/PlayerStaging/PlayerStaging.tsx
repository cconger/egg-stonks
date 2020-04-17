import * as React from 'react';

import {GameState} from 'stonks/game/state';

import './style.css';

export interface PlayerStagingProps {
  gameID: string;
  state: GameState;
  currentPlayer: string;
  onStartGame: () => void;
}

export const PlayerStaging = (props: PlayerStagingProps) => {
  let playerList = props.state.players.map((player) => {
    let itsme = player.id === props.currentPlayer;
    return (
      <div className={itsme ? "player-list me" : "player-list"} key={player.id}>{player.name}</div>
    )
  })

  const [copied, setCopied] = React.useState(false);

  const url = `${document.URL}?game=${props.gameID}`

  const gameURLDiv = React.useRef(null);
  const copyURL = () => {
    if('clipboard' in navigator) {
      navigator.clipboard.writeText(url);
    }

    // Manually do it...
    const node = document.createElement('pre')
    node.style.width = '1px';
    node.style.height = '1px';
    node.style.position = 'fixed';
    node.style.top = '5px';
    node.textContent = url;
    document.body.appendChild(node);
    const selection = getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(node)
    selection.addRange(range)

    document.execCommand('copy')
    selection.removeAllRanges()
    document.body.removeChild(node);
  }

  let copiedNotification;
  if (copied) {
    copiedNotification = <div className="error">Copied URL</div>;
  }

  return (
    <>
      {copiedNotification}
      <div className="dialog-container">
        <div className="dialog">
          <div className="player-title">PLAYERS:</div>
          {playerList}
          <div className="start button" onClick={props.onStartGame}>Start Game</div>
          <div className="copy button" onClick={copyURL}>Copy URL</div>
        </div>
      </div>
    </>
  );
}
