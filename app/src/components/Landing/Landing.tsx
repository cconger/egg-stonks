import * as React from 'react';

import './style.css';

export const Landing = () => {
  let url = `${document.URL}games/create`

  const newGame = async function() {
    const response = await fetch(url, {
      method: 'POST',
    })

    const body = await response.json()
    const gameID = body["game_id"];
    window.location.replace(`${document.URL}/?game=${gameID}`)
  }

  return (
    <div className="dialog-container">
      <div className="dialog">
        <div className="stonks-title">Egg Stonks!</div>
        <div className="button" onClick={newGame}>New Game</div>
    </div>
  </div>
  )
};
