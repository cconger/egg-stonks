import * as React from 'react';
import Chart from 'react-apexcharts';

import {Stonk} from 'stonks/game/state';
import './style.css';

interface customFormatter {
  seriesIndex: number;
  dataPointIndex: number;
  w: any;
}

export interface StonkProps {
  stonk: Stonk;
  turns: number;
}

const moneyFormat = (v: number) => ("$" + v.toFixed(2))

export const StonkBoard = (props: StonkProps) => {
  let timeHistory = props.stonk.history.map((s, i) => [i, ...s.map((x) => x/100)])
  let series = [{data: timeHistory}];

  let options = {
    chart: {
      fontFamily: "Inconsolata, monospace",
      offsetY: -20,
      toolbar: {
        show: false,
      },
    },
    theme: {
      mode: 'dark',
    },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex, w }: customFormatter) => {
        const o = w.globals.seriesCandleO[seriesIndex][dataPointIndex]
        const h = w.globals.seriesCandleH[seriesIndex][dataPointIndex]
        const l = w.globals.seriesCandleL[seriesIndex][dataPointIndex]
        const c = w.globals.seriesCandleC[seriesIndex][dataPointIndex]

        return (
          '<div class="apexcharts-tooltip-candlestick">' +
          '<div>Open: <span class="value">' +
          moneyFormat(o) +
          '</span></div>' +
          '<div>High: <span class="value">' +
          moneyFormat(h) +
          '</span></div>' +
          '<div>Low: <span class="value">' + moneyFormat(l) +
          '</span></div>' +
          '<div>Close: <span class="value">' +
          moneyFormat(c) +
          '</span></div>' +
          '</div>'
        )
      },
      x: {
        formatter: (val: number) => ("Turn " + (val+1).toFixed(0)),
      },
      y: {
        formatter: moneyFormat,
      },
    },
    xaxis: {
      type: 'numeric',
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      min: -1,
      max: props.turns,
    },
    yaxis: {
      min: 0,
      max: 2,
      labels: {
        formatter: moneyFormat,
      }
    },
  };

  let lastPrice = props.stonk.history[props.stonk.history.length - 1][3] / 100;

  return (
    <div className="stonk">
      <div className="quote">
        <div className="symbol">{props.stonk.name}</div>
        <div className="price">${lastPrice.toFixed(2)}</div>
      </div>
      <Chart
        options={options}
        type="candlestick"
        series={series}
        height="100%"
      />
    </div>
  )
}
