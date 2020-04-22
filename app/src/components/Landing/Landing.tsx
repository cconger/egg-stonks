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

const defaultTurns = 10;

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
  const [turns, setTurns] = React.useState(defaultTurns)

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
          turns: turns,
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

  let customizeCommodities = stonks.map((s, i) => {
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

  let customization
  if (expanded) {
    const updateTurns = (v: string) => {
      let t = parseInt(v);
      if (t) {
        setTurns(t);
      } else {
        setTurns(defaultTurns);
      }
    }
    customization = (
      <>
        {customizeCommodities}
        <div className="turns-selector">
          <div>Turns: {turns}</div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={turns}
            onChange={(e) => {updateTurns(e.target.value);}}
          />
        </div>
      </>
    );
  }

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
          <div className="promo">Follow <a href="https://twitter.com/EggStonks">@EggStonks</a> on Twitter for patch notes and support</div>
          <form onSubmit={newGame}>
            <div className="customize clickable" onClick={toggleExpand}>Customize Game<span className="chevron"></span></div>
            <div className="customize-container">
              {customization}
            </div>
            <input className="button new-game" type="submit" value="New Game" />
          </form>
        </div>
      </div>
    </>
  )
};
