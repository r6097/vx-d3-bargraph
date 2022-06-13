import React from "react";
import { Group } from "@vx/group";
import { BarGroup } from "@vx/shape";
import { AxisBottom, AxisLeft, AxisTop } from "@vx/axis";
import cityTemperature from "@vx/mock-data/lib/mocks/cityTemperature";
import { scaleBand, scaleLinear, scaleOrdinal } from "@vx/scale";
import { timeParse, timeFormat } from "d3-time-format";
import { Tooltip, useTooltip, defaultStyles } from "@vx/tooltip";
import { localPoint } from '@vx/event';

import "../styles/chart.css";

const blue = "#aeeef8";
export const green = "#e5fd3d";
const purple = "#9caff6";
export const background = "#612efb";

const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
};

// Prepare the the data
const data = cityTemperature.slice(0, 8);
// get the city names of each entry (each entry has 3)
const keys = Object.keys(data[0]).filter((d) => d !== "date");

const defaultMargin = { top: 40, right: 0, bottom: 70, left: 0 };

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
const cityScale = scaleBand({
  domain: keys,
  padding: 0.1,
});
const tempScale = scaleLinear({
  domain: [
    0,
    Math.max(
      ...data.map((d) => Math.max(...keys.map((key) => Number(d[key]))))
    ),
  ],
});
const colorScale = scaleOrdinal({
  domain: keys,
  range: [blue, green, purple],
});

export default function Bar({
  width,
  height,
  events = false,
  margin = defaultMargin,
}) {
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // update scale output dimensions
  dateScale.rangeRound([0, xMax]);
  cityScale.rangeRound([0, dateScale.bandwidth()]);
  tempScale.range([yMax, 0]);

  var tooltipTimeout;

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  var title = "Texas is Very Hot (not misleading)"
  const paddingForLeftAxis = 80;

  console.log(data);
  return width < 10 ? null : (
    <>
      <h3 style={{textAlign: "center"}}>{title}</h3>
      <svg width={width + paddingForLeftAxis} height={height}>
        <rect
          x={0}
          y={0}
          width={width + paddingForLeftAxis}
          height={height}
          fill={background}
          rx={14}
        />
        <Group top={margin.top} left={paddingForLeftAxis}>
          <BarGroup
            data={data}
            keys={keys}
            height={yMax}
            x0={getDate}
            x0Scale={dateScale}
            x1Scale={cityScale}
            yScale={tempScale}
            color={colorScale}
          >
            {(barGroups) =>
              barGroups.map((barGroup) => (
                <Group
                  key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                  left={barGroup.x0}
                >
                  {barGroup.bars.map((bar) => (
                    <rect
                      key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      fill={bar.color}
                      rx={4}
                      onClick={() => {
                        if (!events) return;
                        const { key, value } = bar;
                        alert(JSON.stringify({ key, value }));
                      }}
                      onMouseLeave={() => {
                        tooltipTimeout = window.setTimeout(() => {
                          hideTooltip();
                        }, 300);
                      }}
                      onMouseMove={(event) => {
                        if (tooltipTimeout) clearTimeout(tooltipTimeout);
                        const coords = localPoint(event.target.ownerSVGElement, event);
                        showTooltip({
                          tooltipData: bar,
                          tooltipLeft: coords.x + paddingForLeftAxis,
                          tooltipTop: coords.y,
                        });
                      }}
                    />
                  ))}
                </Group>
              ))
            }
          </BarGroup>
        </Group>
        <AxisBottom
          label="City Temperatures by State"
          labelClassName="vx-label white"
          top={yMax + margin.top}
          left={paddingForLeftAxis}
          tickFormat={formatDate}
          scale={dateScale}
          stroke={"white"}
          hideTicks
          tickLabelProps={() => ({    
            fill: "white",
            fontSize: 11,
            textAnchor: "middle",
          })}
        />
        <AxisLeft
          label="Temp (Degrees)"
          labelClassName="vx-label white"
          top={margin.top}
          left={paddingForLeftAxis}
          scale={tempScale}
          stroke={"white"}
          hideTicks
          tickLabelProps={() => ({    
            fill: "white",
            fontSize: 11,
            textAnchor: "end",
            margin: 10
          })}
        />
      </svg>

      {tooltipOpen && tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div style={{ color: colorScale(tooltipData.key) }}>
            <strong>{tooltipData.key}</strong>
          </div>
          <div>Temp: {tooltipData.value} {"\u00B0"}</div>
          <div>
            <small></small>
          </div>
        </Tooltip>
      )}
    </>
  );
}
