import React from "react";
import { Group } from "@vx/group";
import genBins from "@vx/mock-data/lib/generators/genBins";
import { scaleLinear } from "@vx/scale";
import { AxisBottom, AxisLeft } from "@vx/axis";
import { HeatmapCircle } from "@vx/heatmap";
import {
  LegendLinear,
  LegendItem,
  LegendLabel,
} from "@vx/legend";

import "../styles/chart.css";

const hot1 = "#77312f";
const hot2 = "#f33d15";
export const background = "#28272c";

const binData = genBins(/* length = */ 16, /* height = */ 16);

function max(data, value) {
  return Math.max(...data.map(value));
}

function min(data, value) {
  return Math.min(...data.map(value));
}

// accessors
const bins = (d) => d.bins;
const count = (d) => d.count;

const colorMax = max(binData, (d) => max(bins(d), count));
const bucketSizeMax = max(binData, (d) => bins(d).length);

// scales
const xScale = scaleLinear({
  domain: [1, binData.length],
});
const yScale = scaleLinear({
  domain: [1, bucketSizeMax],
});
const circleColorScale = scaleLinear({
  range: [hot1, hot2],
  domain: [0, colorMax],
});
const opacityScale = scaleLinear({
  range: [1, 1],
  domain: [0, colorMax],
});



const defaultMargin = { top: 10, left: 100, right: 20, bottom: 110 };

export default function HeatMapGraph({
  width,
  height,
  events = false,
  margin = defaultMargin,
  separation = 10,
}) {
  // bounds
  const size =
    width > margin.left + margin.right
      ? width - margin.left - margin.right - separation
      : width;
  const xMax = size;
  const yMax = height - margin.bottom - margin.top;

  const binWidth = xMax / binData.length;
  const binHeight = yMax / bucketSizeMax;
  const radius = min([binWidth, binHeight], (d) => d / 2);

  const axisLeftOffset = 42;
  const axisBottomOffset = 60;
  
  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);
  const legendGlyphSize = 15;
  var title = "Rudolph's Red Nose Sightings";
  return width < 10 ? null : (
    <div>
      <h3 style={{ textAlign: "center" }}>{title}</h3>
      <div style={{display:"flex"}}>
        <LegendDemo title="Quantile">
          <LegendLinear scale={circleColorScale}>
            {(labels) =>
              labels.map((label, i) => (
                <LegendItem
                  key={`legend-${i}`}
                  onClick={() => {
                    if (events) alert(`clicked legend label: ${JSON.stringify(label)}`);
                  }}
                >
                  <svg
                    width={legendGlyphSize}
                    height={legendGlyphSize}
                    style={{ margin: "2px 0" }}
                  >
                    <circle
                      fill={label.value}
                      r={legendGlyphSize / 2}
                      cx={legendGlyphSize / 2}
                      cy={legendGlyphSize / 2}
                    />
                  </svg>
                  <LegendLabel align="left" margin="0 4px">
                    {label.text.slice(0,5)}
                  </LegendLabel>
                </LegendItem>
              ))
            }
          </LegendLinear>
        </LegendDemo>
        <svg width={width + axisLeftOffset} height={height + axisBottomOffset}>
          <rect
            x={0}
            y={0}
            width={width + axisLeftOffset}
            height={height + axisBottomOffset}
            rx={10}
            fill="#074a3d"
            stroke="#efefef" 
            stroke-width="1.5"
            stroke-linecap="square"
          />
          <Group top={margin.top} left={margin.left + axisLeftOffset}>
            <HeatmapCircle
              data={binData}
              xScale={xScale}
              yScale={yScale}
              colorScale={circleColorScale}
              opacityScale={opacityScale}
              radius={radius}
              gap={2}
            >
              {(heatmap) =>
                heatmap.map((heatmapBins) =>
                  heatmapBins.map((bin) => (
                    <circle
                      key={`heatmap-circle-${bin.row}-${bin.column}`}
                      className="vx-heatmap-circle"
                      cx={bin.cx}
                      cy={bin.cy}
                      r={bin.r}
                      fill={bin.color}
                      fillOpacity={bin.opacity}
                      onClick={() => {
                        if (!events) return;
                        const { row, column } = bin;
                        alert(JSON.stringify({ row, column, bin: bin.bin }));
                      }}
                    />
                  ))
                )
              }
            </HeatmapCircle>
          </Group>
          <AxisLeft
            scale={yScale}
            label="Days (before Christmas)"
            labelClassName="vx-label hot"
            hideAxisLine
            top={axisBottomOffset}
            left={margin.left}
            hideTicks
            numTicks={14}
            hideZero
            tickLabelProps={() => ({
              fill: hot2,
              fontSize: 11,
              textAnchor: "middle",
              right: 10,
            })}
          />
          <AxisBottom
            scale={xScale}
            label="District Number"
            labelClassName="vx-label hot"
            labelOffset={25}
            hideAxisLine
            top={yMax + margin.top + axisBottomOffset}
            left={margin.left + axisLeftOffset / 2}
            numTicks={14}
            hideTicks
            hideZero
            tickLabelProps={() => ({
              fill: hot2,
              fontSize: 11,
              textAnchor: "middle",
            })}
          />
        </svg>
      </div>
    </div>
  );
}

function LegendDemo({ title, children }) {
  return (
    <div className="legend">
      <div className="title">{title}</div>
      {children}
      <style jsx>{`
        .legend {
          line-height: 0.9em;
          color: #efefef;
          font-size: 10px;
          font-family: arial;
          padding: 10px 10px;
          float: left;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          margin: 5px 5px;
          height: 7rem;
        }
        .title {
          font-size: 12px;
          margin-bottom: 10px;
          font-weight: 100;
        }
      `}</style>
    </div>
  );
}
