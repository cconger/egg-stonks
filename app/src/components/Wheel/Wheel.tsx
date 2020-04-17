import * as React from 'react';

export interface WheelProps {
  enabled: boolean;
  choices: string[];
  reveal: boolean;
  roll: number;
  rollID: string;
  rollHandler: () => void;
};

interface WheelState {
  animating: boolean;
  scrolledIndex: number;
};

import './style.css';

const target_size = 120;

export const Wheel = (props: WheelProps) => {
  let copies = Math.ceil(target_size / props.choices.length);
  let totalItems = copies * props.choices.length;
  let endOffset = (copies - 2) * props.choices.length;

  const [{animating, scrolledIndex}, setState] = React.useState({
    animating: false,
    scrolledIndex: 0,
  });

  React.useEffect(() => {
    if (props.reveal) {
      setState((state) => ({
        ...state,
        animating: true,
        scrolledIndex: endOffset + props.roll,
      }));
    }
  }, [props.reveal])

  let items = [];
  for (let i = 0; i < totalItems; i++) {
    items[i] = (
      <div key={i} className="wheel-face">
        {props.choices[i % props.choices.length]}
      </div>
    );
  }

  let endAnimation = () => {
    setState({
      animating: false,
      scrolledIndex: scrolledIndex % props.choices.length,
    });
  }

  let offset = scrolledIndex * 50;
  let animationStyle: React.CSSProperties = {
    transform: "translate3d(0, -"+offset+"px, 0)",
  }

  if (animating) {
    const minLength = 2.5;
    const range = 1.5;
    let length = (Math.random() * range)  + minLength;

    // TODO: Custom timing functions.
    animationStyle = {
      ...animationStyle,
      transitionProperty: 'transform',
      transitionDelay: '0s',
      transitionTimingFunction: 'cubic-bezier(.09,.54,.12,1.06)',
      transitionDuration: `${length}s`,
      animationName: 'motionblur',
      animationTimingFunction: 'cubic-bezier(.09,.54,.12,1.06)',
      animationDuration: `${length}s`,
    }
  }

  let classList = ["wheel-container"];
  if (props.reveal) {
    classList.push("locked")
  }
  if (props.enabled && !props.reveal) {
    classList.push("jiggle");
  }

  return (
    <div className="wheel-viewport" onClick={props.rollHandler}>
      <div className={classList.join(" ")} style={animationStyle} onAnimationEnd={endAnimation}>
        {items}
      </div>
    </div>
  );
}
