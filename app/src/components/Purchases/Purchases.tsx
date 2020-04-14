import * as React from 'react';

import { Stonk } from 'stonks/game/state';

export interface PurchasesProps {
  stonks: Stonk[];
}

export const Purchases = (props: PurchasesProps) => {
  return (
    <div>
      Hello world
    </div>
  );
}
