import {GameState, Phase} from '../game/state'

export const data: GameState = {
  turn: {
    index: 4,
    phase: Phase.Transact,
    player: "d9c3df04-742d-48fb-8d47-de16b522aba7",
  },
  turns: 10,
  players: [
    {
      id: "d9c3df04-742d-48fb-8d47-de16b522aba7",
      name: "ho borvat",
      portfolio: [
        {
          stonk: "5b5740af-8766-4718-b30a-066fa4f6f14d",
          lots: [[500, 500]],
        },
        {
          stonk: "d518af33-7c16-4da3-8c5e-589d11143aed",
          lots: [[2500, 2500]],
        },
      ],
      cash: 2000,
      value: [5000],
    },
    {
      id: "8a757342-89e2-4426-8e35-937ea7ab4445",
      name: "DumbDog",
      portfolio: [
      ],
      cash: 5000,
      value: [5000],
    },
    {
      id: "fcfd8cc5-04a2-4f04-a71e-342c61145515",
      name: "michaelalfox",
      portfolio: [
        {
          stonk: "235ba346-3fc7-4c6d-a6bc-cdd55efd5c09",
          lots: [[500, 500]],
        },
        {
          stonk: "b38ac4bb-e165-4fa3-abb1-20a0d7edf129",
          lots: [[500, 500]],
        },
        {
          stonk: "5b5740af-8766-4718-b30a-066fa4f6f14d",
          lots: [[500, 500]],
        },
        {
          stonk: "f21084d1-e575-4ca5-a6b6-3893c10bff23",
          lots: [[500, 500]],
        },
        {
          stonk: "d518af33-7c16-4da3-8c5e-589d11143aed",
          lots: [[500, 500]],
        },
        {
          stonk: "9863aa35-477a-4d89-8424-c805b474efa0",
          lots: [[500, 500]],
        },
      ],
      cash: 0,
      value: [5000],
    },
    {
      id: "b2b9d87c-482e-443c-8f3c-7f4e0e077f50",
      name: "DanGheesling",
      portfolio: [],
      cash: 5000,
      value: [5000],
    },
  ],
  stonks: [
    {
      id: "235ba346-3fc7-4c6d-a6bc-cdd55efd5c09",
      name: "Eggs",
      history: [
        [100, 110, 90, 90],
        [90, 120, 90, 110],
        [110, 110, 110, 110],
        [110, 110, 110, 110],
        [110, 110, 110, 110],
      ],
    },
    {
      id: "b38ac4bb-e165-4fa3-abb1-20a0d7edf129",
      name: "Resin",
      history: [
        [100, 110, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
      ],
    },
    {
      id: "5b5740af-8766-4718-b30a-066fa4f6f14d",
      name: "Chat",
      history: [
        [100, 110, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
      ],
    },
    {
      id: "f21084d1-e575-4ca5-a6b6-3893c10bff23",
      name: "Canola",
      history: [
        [100, 110, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
      ],
    },
    {
      id: "d518af33-7c16-4da3-8c5e-589d11143aed",
      name: "RURURU",
      history: [
        [100, 110, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
      ],
    },
    {
      id: "9863aa35-477a-4d89-8424-c805b474efa0",
      name: "Gold Chains",
      history: [
        [100, 110, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
        [90, 90, 90, 90],
      ],
    },
  ],
  log: [
  ]
};
