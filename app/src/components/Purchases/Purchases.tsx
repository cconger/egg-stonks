import * as React from 'react';

import { Player, Stonk, GetPrice } from 'stonks/game/state';

import './style.css';

export interface PurchasesProps {
  player: Player;
  stonks: Stonk[];
  client: PurchaseClient;
}

interface PurchaseClient {
  BuyStonk: (stonk: string, quantity: number) => void;
  SellStonk: (stonk: string, quantity: number) => void;
  FinishBuy: () => void;
}

export const Purchases = (props: PurchasesProps) => {

  let [hodling, setHodling] = React.useState(false);

  let purchaseControl = props.stonks.map((stonk) => {
    const [holding] = props.player.portfolio.filter((h) => (h.stonk == stonk.id));
    let quantity = 0;
    if (holding != undefined) {
      quantity = holding.lots.reduce((acc, x) => (x[0] + acc), 0);
    }

    const buy = () => {
      props.client.BuyStonk(stonk.id, 500)
    }

    const sell = () => {
      props.client.SellStonk(stonk.id, 500)
    }

    return (
      <div className="stonk-transaction {hodling ? 'hodl' : ''}" key={stonk.id}>
        <div className="name">{stonk.name}</div>
        <div className="quantity">{quantity}</div>
        <div className="transaction-controls">
          <div onClick={buy} className="control buy">Buy 500</div>
          <div onClick={sell} className="control sell">Sell 500</div>
        </div>
      </div>
    )
  })

  const done = () => {
    props.client.FinishBuy();
    setHodling(true);
  }

  var doneButton
  if (!hodling) {
    doneButton = <div onClick={done} className="purchase-done">HODL</div>
  }

  return (
    <>
      <div className="purchase-control">
        {purchaseControl}
      </div>
      {doneButton}
    </>
  );
}
