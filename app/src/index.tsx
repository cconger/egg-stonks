import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {GameBoard} from './components/GameBoard';

import "./index.css"

const container = document.createElement('div')
document.body.appendChild(container)
container.classList.add("container")

ReactDOM.render(
  <GameBoard gameId={""} />,
  container,
)
