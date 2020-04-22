import * as React from 'react';

import {ErrorPane} from 'stonks/components/ErrorPane';

import './style.css';

// Default stonks from the NLSS
const defaultStonks = [
  "Eggs",
  "Resin",
  "Chat",
  "Canola",
  "RURURU",
  "Gold Chains"
];

export interface LandingProps {
  error?: string;
  onSubmit: (gameID: string) => void;
}

interface CreateGamePayload {
  config: {
    stonks: string[];
    turns: number;
  }
}

export const Landing = (props: LandingProps) => {
  const [err, setErr] = React.useState<string>(props.error || null)
  const [expanded, setExpanded] = React.useState(false);
  const [stonks, setStonks] = React.useState(defaultStonks.slice())

  let url = new URL(document.URL)
  url.pathname = "/games/create";
  url.search = "";

  const newGame = async function() {
    event.preventDefault();

    const stonksOK = stonks.reduce((acc, v) => (v.length > 0 && v.length < 13 && acc), true);

    if (!stonksOK) {
      setErr("Commodity names must be at least 1 character and less than 13")
      return
    }

    try {
      const payload = {
        config: {
          stonks,
          turns: 10,
        }
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.status !== 200) {
        console.error("Unexpected status: ", response.status)
        const error = await response.text();
        setErr("Error creating game: " + error)
        return
      }

      const body = await response.json();
      const gameID = body["game_id"];
      props.onSubmit(gameID)
    } catch (e) {
      console.error("Error handling response", e)
      setErr("Unable to create game please try again later")
    }
  }

  const updateStonk = (idx: number, v: string) => {
    setStonks((stonks) => {
      const newList = stonks.slice();
      newList[idx] = v;
      return newList;
    });
  };

  let customization = stonks.map((s, i) => {
    const updateStonk = (e: React.FormEvent<HTMLInputElement>) => {
      let value = (e.target as HTMLInputElement).value;
      setStonks((stonks) => {
        const newList = stonks.slice();
        newList[i] = value;
        return newList;
      });
    }
    return (
      <input
        key={i}
        className="customize-stonk-input"
        type="text"
        minLength={1}
        maxLength={10}
        value={s}
        onChange={updateStonk}
      />
    );
  });

  let errMsg
  if (err) {
    const errorObj = {
      ID: "-",
      Message: err,
      Persist: true,
    }
    errMsg = <ErrorPane error={errorObj} />
  }

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <>
      {errMsg}
      <div className="dialog-container">
        <div className="dialog">
          <div className="stonks-title">Egg Stonks!</div>
          <form onSubmit={newGame}>
            <div className="customize clickable" onClick={toggleExpand}>Customize Commodities<span className="chevron"></span></div>
            <div className="customize-container">
              {expanded ? customization : null}
            </div>
            <input className="button new-game" type="submit" value="New Game" />
          </form>
        </div>
      </div>
    </>
  )
};
