import React from 'react';
import PropTypes from 'prop-types';
import { AxisBottom } from '@vx/axis';



/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

PROP TYPES and DEFAULT PROPS ARE AT THE BOTTOM OF THIS FILE

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */



export default function AxisHorizontal({
  label,
  labelProps,
  labelOffset,
  scale,
  top,
  left,
  tickSize,
  tickCount,
  tickStyle,
  tickWidth,
  tickHOffset,
  tickVOffset,
  tickValues,
  textAnchor
}) {

  // maybe pass a custom function as a prop?
  // there might be cases where we want some other styling... who knows

  let style = (styleword) => {
    switch(styleword) {
      case 'horizontal':
        return () => {
          return {
            fontSize: tickSize,
            transform: `translate(${tickHOffset} ${tickVOffset})`,
            textAnchor: textAnchor ? textAnchor : 'middle',
            width: tickWidth,
            dy: tickWidth >= 80 ? '0em' : '2em'
          };
        };
      case 'vertical':
        return val => {
          return {
            fontSize: tickSize,
            transform: `translate(${tickHOffset} ${tickVOffset}), rotate(-90 ` + scale(val) + `,0) `,
            textAnchor: textAnchor ? textAnchor : 'end',
            width: tickWidth,
          };
        };
      case 'diagonal':
        return val => {
          return {
            fontSize: tickSize,
            transform: `translate(${tickHOffset} ${tickVOffset}), rotate(-45 ` + scale(val) + `,0) `,
            textAnchor: textAnchor ? textAnchor : 'start',
            width: tickWidth
          };
        };
    }
  }

  return (
    <AxisBottom
      label={label}
      labelProps={labelProps}
      labelOffset={labelOffset}
      tickLabelProps={style(tickStyle)}
      scale={scale}
      top={top}
      left={left}
      numTicks={tickCount}
      tickValues={tickValues}
    />
  )
}

// Type-checking for props
AxisHorizontal.propTypes = {
  label: PropTypes.string,
  labelProps: PropTypes.object,
  labelOffset: PropTypes.number,
  scale: PropTypes.func,
  top: PropTypes.number,
  tickSize: PropTypes.number,
  tickCount: PropTypes.number,
  tickStyle: PropTypes.string,
  tickWidth: PropTypes.number,
  tickHOffset: PropTypes.number,
  tickVOffset: PropTypes.number,
  textAnchor: PropTypes.string
}

// Default values for props
AxisHorizontal.defaultProps = {
  label: null,
  labelProps: {
    dy: '0.25em',
    fill: '#222',
    fontFamily: 'Arial',
    fontSize: 10,
    textAnchor: 'middle'
  },
  labelOffset: 8,
  scale: null,
  top: null,
  tickSize: 10,
  tickCount: 10,
  tickStyle: 'horizontal',
  tickWidth: 500,
  tickHOffset: 0,
  tickVOffset: 0
}
