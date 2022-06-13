import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

PROP TYPES and DEFAULT PROPS ARE AT THE BOTTOM OF THIS FILE 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */



/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Refer to the "How to use a tooltip in your @vx charts" KYS github wiki page 
for instructions on how to use this component in charts.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


export default function ToolTip({
  show, 
  data, 
  elemID, 
  styles, 
  nudgeX, 
  nudgeY, 
  followMouse=true
}) {
  let [x, setX] = useState(null);
  let [y, setY] = useState(null);
  let elem = document.getElementById(elemID);
  
  useEffect(() => {
    if (elem && followMouse) {
      elem.addEventListener("mousemove", e => {
        let rect = elem.getBoundingClientRect();
        setX(e.clientX - rect.x + nudgeX);
        setY(e.clientY - rect.y + nudgeY);
      });
    }
  });

  // add "left" and "top" - must be derived from within this component
  // add "zIndex" and "position" - required for visibility and correct positioning, cannot be overriden
  let finalStyles = {...styles, left: x, top: y, zIndex: "100", position: "absolute"};

  return (
    <div style={show ? finalStyles : {...finalStyles, visibility: "hidden"}}>
      <h5 className='text-center'>{data}</h5>
    </div>
  );
}


// Type-checking for props
ToolTip.propTypes = {
  show: PropTypes.bool,
  data: PropTypes.element,
  elemID: PropTypes.string,
  styles: PropTypes.object 
};

// Default values for props
ToolTip.defaultProps = {
  show: "false",
  data: "data",
  elemID: <p>put your data here!</p>,
  styles: {
    borderRadius: "15px",
    backgroundColor: "#333333",
    color: "white",
    padding: "10px",
    position: "absolute", 
    opacity: "0.85"
  },
  nudgeX: 0,
  nudgeY: 0
};