import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

PROP TYPES and DEFAULT PROPS ARE AT THE BOTTOM OF THIS FILE

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


export default function SVGEffectWrapper({
  children,
  defaultFill,
  hoverFill,
  clickFill=hoverFill,
  clicked,
  useClick=false,
  useShadow=false,
  keyWordFill,
  keyWordCheck,
  doubleMatchFill
}) {

  let [hovering, setHovering] = useState(false);
  
  let fill = () => {
    let active = clicked || hovering;
    let match = keyWordCheck && keyWordCheck.matched
    
    if (match){
      if (active) return doubleMatchFill;
      else return keyWordFill;
    } else {
      if (active) return hoverFill;
      else return defaultFill;
    }
  };

  let shadow = () => (
    <defs>
      <filter id="shadow" width="200%" height="200%">
        <feOffset result="offOut" in="SourceGraphic" dx="1" dy="-1" />
        <feColorMatrix result="matrixOut" in="offOut" type="matrix"
        values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" />
        <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="3" />
        <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
      </filter>
    </defs>
  );

  let styles = {
    filter: (clicked && useClick && useShadow) ? 'url(#shadow)' : null,
    cursor: useClick ? 'pointer' : null
  };

  return (
    <svg 
      fill={fill()}
      onMouseEnter={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
    >
      {shadow()}
      <svg style={styles}>
        {children}
      </svg>
    </svg>
  )
}

// Type-checking for props
SVGEffectWrapper.propTypes = {
  defaultFill: PropTypes.string,
  hoverFill: PropTypes.string,
  keyWordFill: PropTypes.string,
  keyWordCheck: PropTypes.object,
  doubleMatchFill: PropTypes.string
}

// Default values for props
SVGEffectWrapper.defaultProps = {
  children: <p>Put something here</p>,
  defaultFill: null,
  hoverFill: null,
  keyWordFill: null,
  keyWordCheck: null,
  doubleMatchFill: null
}
