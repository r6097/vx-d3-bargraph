import React from "react";
import { BarStack } from "@vx/shape";
import { Group } from "@vx/group";
import cityTemperature, {
  CityTemperature,
} from "@vx/mock-data/lib/mocks/cityTemperature";
import { scaleBand, scaleLinear, scaleOrdinal } from "@vx/scale";
import { timeParse, timeFormat } from "d3-time-format";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@vx/tooltip";
import { LegendOrdinal } from "@vx/legend";
import { AxisBottom, AxisLeft } from "@vx/axis";

// set the margins of the graph
const margin = { top: 70, right: 30, bottom: 20, left: 50 };
const leftAxisPadding = 50;

// colors
const purple1 = "#6c5efb";
const purple2 = "#c998ff";
const purple3 = "#a44afe";
const background = "#eaedff";
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: "rgba(0,0,0,0.9)",
  color: "white",
};
// parse data
const data = cityTemperature.slice(0, 12);
const keys = Object.keys(data[0]).filter((d) => d !== "date");

const temperatureTotals = data.reduce((allTotals, currentDate) => {
  let totals = [];
  // sum up all temps of one date
  const totalTemperature = keys.reduce((dailyTotal, k) => {
    dailyTotal += Number(currentDate[k]);
    return dailyTotal;
  }, 0);
  // push this number to a total list
  totals.push(totalTemperature);
  return totals;
});

const parseDate = timeParse("%Y-%m-%d");
const format = timeFormat("%b %d");
// YYYY-MM-DD to Month Day
const formatDate = (date) => format(parseDate(date));

// accessors
const getDate = (d) => d.date;

// scales
const dateScale = scaleBand({
  domain: data.map(getDate),
  padding: 0.2,
});
const temperatureScale = scaleLinear({
  domain: [0, Math.max(...temperatureTotals)],
  nice: true,
});
const colorScale = scaleOrdinal({
  domain: keys,
  range: [purple1, purple2, purple3],
});

export default function StackedBars({ width, height, events = false }) {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal();

  if (width < 10) return null;
  // bounds
  const xMax = width;
  const yMax = height - margin.top - 100;

  dateScale.rangeRound([0, xMax]);
  temperatureScale.range([yMax, 0]);

  let tooltipTimeout;

  return width < 10 ? null : (
    // relative position is needed for correct tooltip positioning
    <div style={{ position: "relative" }}>
      <svg
        ref={containerRef}
        width={width + leftAxisPadding + margin.left}
        height={height}
      >
        <rect
          x={0}
          y={0}
          width={width + leftAxisPadding + margin.left}
          height={height}
          fill={background}
          rx={14}
        />

        <Group top={margin.top} left={leftAxisPadding + margin.left}>
          <BarStack
            data={data}
            keys={keys}
            x={getDate}
            xScale={dateScale}
            yScale={temperatureScale}
            color={colorScale}
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => (
                  <rect
                    key={`bar-stack-${barStack.index}-${bar.index}`}
                    x={bar.x}
                    y={bar.y}
                    height={bar.height}
                    width={bar.width}
                    fill={bar.color}
                    onClick={() => {
                      if (events) alert(`clicked: ${JSON.stringify(bar)}`);
                    }}
                    onMouseLeave={() => {
                      tooltipTimeout = window.setTimeout(() => {
                        hideTooltip();
                      }, 300);
                    }}
                    onMouseMove={(event) => {
                      if (tooltipTimeout) clearTimeout(tooltipTimeout);
                      const top = event.clientY - margin.top / 2 - bar.height;
                      const left = bar.x + bar.width / 2;
                      showTooltip({
                        tooltipData: bar,
                        tooltipTop: top,
                        tooltipLeft: left,
                      });
                    }}
                  />
                ))
              )
            }
          </BarStack>
        </Group>
        <AxisLeft
          label="Temp (Degrees)"
          labelClassName="vx-label purple"
          top={margin.top}
          left={leftAxisPadding + margin.left}
          scale={temperatureScale}
          stroke={purple3}
          hideTicks
          tickLabelProps={() => ({
            fill: purple3,
            fontSize: 11,
            textAnchor: "end",
            margin: 10,
          })}
        />
        <AxisBottom
          label="Dates (cities are stacked)"
          labelClassName="vx-label purple"
          top={yMax + margin.top}
          left={leftAxisPadding + margin.left}
          scale={dateScale}
          tickFormat={formatDate}
          stroke={purple3}
          tickStroke={purple3}
          tickLabelProps={() => ({
            fill: purple3,
            fontSize: 11,
            textAnchor: "middle",
          })}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: margin.top / 2 - 10,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        <LegendOrdinal
          scale={colorScale}
          direction="row"
          labelMargin="0 15px 0 0"
          legendLabelProps={() => ({
            backgroundColor: "black",
          })}
        />
      </div>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={Math.random()} // update tooltip bounds each render
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div style={{ color: colorScale(tooltipData.key) }}>
            <strong>{tooltipData.key}</strong>
          </div>
          <div>{tooltipData.bar.data[tooltipData.key]}℉</div>
          <div>
            <small>{formatDate(getDate(tooltipData.bar.data))}</small>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
