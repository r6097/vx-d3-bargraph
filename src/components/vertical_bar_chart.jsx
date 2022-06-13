import React, { useState, useEffect, useLayoutEffect } from "react";
import PropTypes from "prop-types";

import { Group } from "@vx/group";
import { BarStack } from "@vx/shape";
import { BarGroup } from "@vx/shape";
import { AxisLeft } from "@vx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@vx/scale";
import { Brush } from "@vx/brush";
import { PatternLines } from "@vx/pattern";

import AxisHorizontal from "./axis_horizontal";
import ToolTip from "./tooltip";
import SVGEffectWrapper from "./svg_effect_wrapper";


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

PROP TYPES and DEFAULT PROPS ARE AT THE BOTTOM OF THIS FILE

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


function VerticalBarChartBrush({
  data,
  xKey,
  yKey,
  getX,
  xMax,
  height,
  margin,
  changeFilteredData,
  onBrushClick,
  brushBounds,
  totals,
  chartType,
  xScale
}) {

  // important variables/props
  let yMax = height - margin.top - margin.bottom;
  let PATTERN_ID = "brush_pattern";
  let accentColor = "#f6acc8";
  let selectedBrushStyle = {
    fill: `url(#${PATTERN_ID})`,
    stroke: "#f57b42",
  };

  let x1Scale =
    scaleBand({
      domain: yKey,
      range: [0, xScale.bandwidth()]
    });
  let yScale =
    scaleLinear({
      domain: [0, Math.max(...totals)],
      range: [yMax, 0],
      nice: true,
    });

  let onBrushChange = (domain) => {
    if (!domain) return;
    let newData = data.filter(d => domain.xValues.includes(getX(d)));
    changeFilteredData(newData, domain.xValues);
  };

  let [startIndex, endIndex] = brushBounds;

  let initialBrushPosition = {
    start: { x: xScale(getX(data[startIndex]))},
    end: { x: xScale(getX(data[endIndex]))+xScale.bandwidth()},
  }

  return (
    <div>
      <VerticalBarChart
        hideBottomAxis
        hideLeftAxis
        hideTitle
        useToolTip={false}
        data={data}
        xKey={xKey}
        yKey={yKey}
        height={height}
        yMax={yMax}
        margin={margin}
        xScale={xScale}
        x1Scale={x1Scale}
        yScale={yScale}
        padding={{top: 5, left: 95}}
        xLabelOffset={0}
        chartType={chartType}
        initBrushBounds={[data[0][xKey], data[data.length-1][xKey]]}
        isBrush
      >
        <PatternLines
          id={PATTERN_ID}
          height={8}
          width={8}
          stroke={accentColor}
          strokeWidth={1}
          orientation={["diagonal"]}
        />
        <Brush
          key={xMax}
          xScale={xScale}
          yScale={yScale}
          width={xMax}
          height={yMax}
          margin={margin}
          handleSize={8}
          resizeTriggerAreas={["left", "right"]}
          brushDirection={"horizontal"}
          initialBrushPosition={initialBrushPosition}
          onChange={onBrushChange}
          onClick={onBrushClick}
          selectedBoxStyle={selectedBrushStyle}
        />
      </VerticalBarChart>
    </div>
  );
}

export default function VerticalBarChart({
  data,
  xKey,
  yKey,
  title,
  xLabel,
  yLabel,
  xScale,
  x1Scale, // used for grouped bar chart
  yScale,
  height = 400,
  fixed_width = -1,
  barSpacing = 0.2,
  margin = {top: 0, bottom: 0, left: 100, right: 50},
  padding = {top: 0, left: 0},
  labelSize = 15,
  xTickSize = 13,
  yTickSize = 13,
  xTickWidth = 500,
  xLabelOffset = 40,
  yLabelOffset = 40,
  yNumTicks = 10,
  tickStyle = "horizontal", // horizontal, diagonal, vertical
  elemID,
  tickVOffset = 0,
  tickHOffset = 0,
  tickValues = () => {},
  children,
  yMax,
  hideBottomAxis = false,
  hideLeftAxis = false,
  hideTitle = false,
  useToolTip = true,
  useBrush = false,
  useBarClick = false,
  barClickCustomHandler = () => {},
  barHoverCustomHandler,
  isBrush = false,
  initBrushBounds,
  chartType = 'stack', // stack or group
  dataRep = 0, // 0: value, 1: % by category, 2: % by each bar group
  tooltipContent= (key,val)=>{return(<p>{key}: <strong>{val}</strong></p>)}
}) {
  // hooks and globals
  let brushBounds = initBrushBounds ? initBrushBounds : [data[0][xKey], data[data.length-1][xKey]];
  let [brushDomain, setBrushDomain] = useState(null);
  let getBrushIndices = () => {
    if (brushDomain) {
      let getA = () => {
        return data.findIndex(d => brushDomain.includes(d[xKey]));
      }
      let getB = () => {
        function findLast(array, predicate) {
          for (let i = array.length - 1; i >= 0; --i) {
            const x = array[i];
            if (predicate(x)) {
              return i;
            }
          }
          return -1
        }
        return findLast(data,d => brushDomain.includes(d[xKey]))
        // return data.slice().reverse().findIndex(d => brushDomain.includes(d[xKey]));
      }
      let a = getA();
      let b = getB();
      if (a==-1 && b==-1){
        return [0,data.length-1];
      }
      return [a, b];
    } else {
      let a = data.findIndex(d => d[xKey] == brushBounds[0]);
      let b = data.findIndex(d => d[xKey] == brushBounds[1]);
      if (a==-1 && b==-1){
        return [0,data.length-1];
      }
      return [a, b];
    };
  };
  let [startIndex, endIndex] = getBrushIndices();
  let [filteredData, setFilteredData] = useState(
    useBrush ?
     (!isBrush ? data.slice(startIndex, endIndex + 1) : data)
      :
    data
  );
  let [showToolTip, setShowToolTip] = useState(false);
  let [toolTipData, setToolTipData] = useState(null);
  margin = {...margin, left: 100, right: 50}; // these left and right vals make brush drawing align properly
  const leftPadding = 120;
  // update filteredData every time data prop changes
  useEffect(() => {
    setBrushDomain(null);
    startIndex = 0;
    endIndex = data.length-1;
    useBrush ?
      (!isBrush ? setFilteredData(data.slice(startIndex, endIndex+1)) : setFilteredData(data))
        :
      setFilteredData(data);
  }, [data]);

  function useWindowSize() {
    let [width, setWidth] = useState(900);
    useLayoutEffect(() => {
      function updateWidth() {
        setWidth(0.75 * window.innerWidth);
      }
      window.addEventListener("resize", updateWidth);
      updateWidth();
      return () => window.removeEventListener("resize", updateWidth);
    }, []);
    return width;
  }

  // important variables/props
  let width = useWindowSize(); // removed conditional reimplemented elsewhere --Robert
  let chartSeparation = 30;
  let innerHeight = height - margin.top - margin.bottom;
  let mainChartHeight = 0.8 * innerHeight - chartSeparation;
  let brushChartHeight = innerHeight - mainChartHeight - chartSeparation;
  let dynamicWidth = fixed_width ? width : -1;   // implemented conditional assignment here instead --Robert
  let xMax = dynamicWidth - margin.left - margin.right;
  if (yMax == null) yMax = mainChartHeight;
  let labelProps = {"fontSize":labelSize, "textAnchor":"middle"};
  let leftTickProps = () => ({
    "fontSize":yTickSize,
    "textAnchor":"end",
    "dy":"0.25em",
    "dx":"-0.25em"
  });

  // accessor
  let getX = d => d[xKey];

  // keys
  let keys = yKey;

  // bar totals
  let stackTotals = () => data.reduce((ret, cur) => {
    let t = keys.reduce((total, k) => {
      if (cur[k] == null) {
        total += 0;
      } else {
        total += +cur[k];
      }
      return total;
    }, 0);
    ret.push(t);
    return ret;
  }, []);

  let calcPercent = (num, total) => (total !== 0) ? Math.round((num / total) * 100) : 0;

  // percentages
  let percentByCategory = () => {
    let keyTotals = {};
    for (let key of keys) keyTotals[key] = data.map(d => d[key]).reduce((a,b) => a+b);
    return data.map(d => {
      for (let key of keys) d[key] = calcPercent(d[key], keyTotals[key]);
    });
  };
  let percentByBarGroup = () => {
    let totals = stackTotals();
    return data.map((d,i) => {
      for (let key of keys) d[key] = calcPercent(d[key], totals[i]);
    });
  };

  // switch (dataRep) {
  //   case 1:
  //     percentByCategory();
  //     break;
  //   case 2:
  //     percentByBarGroup();
  // }

  // if no scales are passed as props, use these default scales
  if (xScale == null) {
    xScale = scaleBand({
      domain: filteredData.map(getX),
    });
  }
  if (x1Scale == null) {
    x1Scale = scaleBand({
      domain: yKey,
    });
  }
  if (yScale == null) {
    switch (chartType) {
      case "stack":
        yScale = scaleLinear({
          domain: [0, Math.max(...stackTotals())],
          nice: true
        });
        break;
      case "group":
        yScale = scaleLinear({
          domain: [0, Math.max(...filteredData.map(d => Math.max(...yKey.map(key => Number(d[key])))))],
          nice: true
        });
    }
  }
  xScale.range([0, xMax]);
  xScale.padding(barSpacing);
  x1Scale.range([0, xScale.bandwidth()]);
  x1Scale.padding(barSpacing / 2);
  yScale.range([yMax, 0]);

  let brushScale = scaleBand({
    domain: data.map(getX),
    range: [0, xMax]
  });

  // colors
  let darkBlue = "#1D4776"; let lightBlue = "#9AADC2"; let paleBlue = "#6FCFEB"; let gold = "#FFBF00";
  let colorScale = scaleOrdinal({
    domain: keys,
    range: [darkBlue, lightBlue, paleBlue]
  });

  // tooltip hover functions
  function barHover(key, val,bar = null) {
    setShowToolTip(true);
    setToolTipData(tooltipContent(key,val,bar));
  };

  function barLeave() {
    setShowToolTip(false);
  }

  // decide whether to render stacked bar or grouped bar
  let chart;
  let stackedBar = () =>
    <BarStack
      data={filteredData}
      keys={keys}
      x={getX}
      xScale={xScale}
      yScale={yScale}
      color={colorScale}
    >
      {barStacks => {
        return barStacks.map(barStack => {
          return barStack.bars.map(bar => {
            return (
              <SVGEffectWrapper
                key={`wrapper-${bar.index}`}
                defaultFill={bar.color}
                hoverFill={gold}
                useClick={useBarClick}
              >
                <rect
                  key={`bar-stack-${barStack.index}-${bar.index}`}
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  onMouseOver={() => barHover(bar.key, bar.bar.data[bar.key],bar)}
                  onMouseOut={barLeave}
                  onClick={() => barClickCustomHandler(bar.bar.data)}
                />
              </SVGEffectWrapper>
            );
          });
        });
      }}
    </BarStack>;
  let groupedBar = () =>
    <BarGroup
      data={filteredData}
      keys={yKey}
      height={yMax}
      x0={getX}
      x0Scale={xScale}
      x1Scale={x1Scale}
      yScale={yScale}
      color={colorScale}
    >
      {barGroups =>
        barGroups.map((barGroup, i) => (
          <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
            {barGroup.bars.map(bar => (
              <SVGEffectWrapper
                key={`wrapper-${bar.index}`}
                defaultFill={bar.color}
                hoverFill={gold}
              >
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  onMouseOver={() => barHover(bar.key, bar.value,bar)}
                  onMouseOut={barLeave}
                />
              </SVGEffectWrapper>
            ))}
          </Group>
        ))
      }
    </BarGroup>;
  switch (chartType) {case "stack": chart = stackedBar(); break; case "group": chart = groupedBar();}

  return (
    <div style={{textAlign: "center", backgroundColor:"white", paddingLeft: leftPadding}}>
      {!hideTitle && <h3 style={{textAlign: "center", color: "black"}}>{title}</h3>}

      <div style={{position: "relative"}}>

        {useToolTip &&
          <ToolTip
            show={showToolTip}
            data={toolTipData}
            elemID={elemID}
          />
        }

        <svg height={height} width={width}>
          <Group top={padding.top} left={padding.left}>
            {chart}

            {isBrush && children}

            {!hideLeftAxis &&
              <AxisLeft
                label={yLabel}
                labelProps={labelProps}
                labelOffset={yLabelOffset}
                tickLabelProps={leftTickProps}
                scale={yScale}
                numTicks={yNumTicks}
              />
            }

            {!hideBottomAxis &&
              <AxisHorizontal
                label={xLabel}
                labelProps={labelProps}
                labelOffset={xLabelOffset}
                scale={xScale}
                top={yMax}
                tickSize={xTickSize}
                tickStyle={tickStyle}
                tickWidth={xTickWidth}
                tickVOffset={tickVOffset}
                tickHOffset={tickHOffset}
                tickValues={tickValues(xScale)}
              />
            }
          </Group>
        </svg>

        {useBrush &&
          <VerticalBarChartBrush
            data={data}
            xKey={xKey}
            yKey={yKey}
            getX={getX}
            xMax={xMax}
            height={brushChartHeight}
            margin={margin}
            changeFilteredData={(newData, domainValues) => {
              setBrushDomain(domainValues);
              console.log(newData);
              setFilteredData(newData);
            }}
            onBrushClick={() => setFilteredData(data)}
            brushBounds={[startIndex, endIndex]}
            totals={stackTotals()}
            chartType={chartType}
            xScale={brushScale}
          />
        }

      </div>
    </div>
  );
}

// Type-checking for props
VerticalBarChart.propTypes = {
  data: PropTypes.array,
  title: PropTypes.string,
  height: PropTypes.number,
  fills: PropTypes.array,
  barSpacing: PropTypes.number,
  margin: PropTypes.object,
  padding: PropTypes.object,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  labelSize: PropTypes.number,
  xTickSize: PropTypes.number,
  yTickSize: PropTypes.number,
  xTickWidth: PropTypes.number,
  xLabelOffset: PropTypes.number,
  yLabelOffset: PropTypes.number,
  yNumTicks: PropTypes.number,
  tickStyle: PropTypes.string,
  elemID: PropTypes.string,
  tickVOffset: PropTypes.number,
  tickHOffset: PropTypes.number
};
