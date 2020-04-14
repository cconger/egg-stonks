import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {Application} from 'stonks/components/Application';

import "./index.css"

const container = document.createElement('div')
document.body.appendChild(container)
container.classList.add("container")

ReactDOM.render(
  <Application />,
  container,
)
