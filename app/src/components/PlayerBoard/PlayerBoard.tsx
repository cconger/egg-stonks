import * as React from 'react';

import { Player, Stonk } from 'stonks/game/state';

import "./style.css";

export interface PlayerBoardProps {
  player: Player;
  stonks: Stonk[];
}

export const PlayerBoard = (props: PlayerBoardProps) => {
  let cashDollars = props.player.cash / 100;
  let value = cashDollars;

  let holdings = props.player.portfolio.map((holding) => {
    let stonk = props.stonks.find(s => s.id == holding.stonk);

    let quantity = 0;
    let totalCost = 0;
    for (const lot of holding.lots) {
      quantity += lot[0];
      let cost = quantity * (lot[1] / 100);
      totalCost += cost;
    }

    let avgCost = (totalCost / quantity).toFixed(2);
    let prices = stonk.history[stonk.history.length - 1]
    let lastPrice = prices[prices.length - 1] / 100;
    let mktValue = quantity * lastPrice;

    value += mktValue;

    return (
      <React.Fragment key={stonk.id}>
        <div className="ticker">{stonk.name}</div>
        <div className="quantity">{quantity}</div>
        <div className="avg-price">${avgCost}</div>
        <div className="mkt-value">${mktValue}</div>
      </React.Fragment>
    )
  });

  let table;

  if (holdings.length) {
    table = (
      <div className="holdings">
        <div className="header ticker">Ticker</div>
        <div className="header quantity">Quantity</div>
        <div className="header avg-price">Avg Price</div>
        <div className="header mkt-value">Mkt Value</div>
        {holdings}
        <div className="cash">Cash</div>
        <div className="cash-count">${cashDollars}</div>
      </div>
    )
  } else {
    table = (
      <div className="holdings">
        <div className="cash">Cash</div>
        <div className="cash-count">${cashDollars}</div>
      </div>
    )
  }

  let serverValue = props.player.value[props.player.value.length - 1].toLocaleString();
  let localValue = value.toLocaleString();

  return (
    <div className="player">
      <div className="title">
        <div className="name">{props.player.name}</div>
        <div className="worth">
          ${localValue}
        </div>
      </div>
      {table}
    </div>
  );
}
