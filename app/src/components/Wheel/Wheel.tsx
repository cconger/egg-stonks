import * as React from 'react';

export interface WheelProps {
  choices: string[];
  roll: number;
  generation: number;
  rollHandler: () => void;
};

interface WheelState {
  animating: boolean;
  generation: number;
  scrolledIndex: number;
};

import './style.css';

const target_size = 120;

export const Wheel = (props: WheelProps) => {
  let copies = Math.ceil(target_size / props.choices.length);
  let totalItems = copies * props.choices.length;
  let endOffset = (copies - 2) * props.choices.length;

  const [{animating, generation, scrolledIndex}, setState] = React.useState({
    animating: false,
    generation: props.generation,
    scrolledIndex: props.roll,
  });

  if (generation != props.generation) {
    setState({
      animating: true,
      generation: props.generation,
      scrolledIndex: props.roll + endOffset,
    });
  }

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
      generation: generation,
      scrolledIndex: props.roll,
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


  return (
    <div className="wheel-viewport" onClick={props.rollHandler}>
      <div className="wheel-container" style={animationStyle} onAnimationEnd={endAnimation}>
        {items}
      </div>
    </div>
  );
}
