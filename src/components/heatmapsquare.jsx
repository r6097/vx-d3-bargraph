import React from "react";
import { Group } from "@vx/group";
import genBins from "@vx/mock-data/lib/generators/genBins";
import { scaleLinear } from "@vx/scale";
import { AxisBottom, AxisLeft } from "@vx/axis";
import { HeatmapRect } from "@vx/heatmap";

import "../styles/chart.css";

const cool1 = "#122549";
const cool2 = "#b4fbde";
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
const rectColorScale = scaleLinear({
  range: [cool1, cool2],
  domain: [0, colorMax],
});
const opacityScale = scaleLinear({
  range: [0.1, 1],
  domain: [0, colorMax],
});

const defaultMargin = { top: 10, left: 100, right: 20, bottom: 110 };

export default function HeatMapGraphRect({
  width,
  height,
  type = "circle",
  events = false,
  margin = defaultMargin,
  separation = 20,
}) {
  // bounds
  const size =
    width > margin.left + margin.right
      ? width - margin.left - margin.right - separation
      : width;
  const xMax = size;
  const yMax = height - margin.bottom - margin.top;

  const binWidth = xMax / binData.length;

  const axisLeftOffset = 42;
  const axisBottomOffset = 60;

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);
  console.log("yMax", yMax);
  return width < 10 ? null : (
    <svg width={width+axisLeftOffset} height={height+axisBottomOffset}>
      <rect
        x={0}
        y={0}
        width={width+axisLeftOffset}
        height={height+axisBottomOffset}
        rx={14}
        fill={background}
      />
      <Group top={margin.top} left={margin.left+axisLeftOffset}>
        <HeatmapRect
          data={binData}
          xScale={xScale}
          yScale={yScale}
          colorScale={rectColorScale}
          opacityScale={opacityScale}
          binWidth={binWidth}
          binHeight={binWidth}
          gap={1}
        >
          {(heatmap) =>
            heatmap.map((heatmapBins) =>
              heatmapBins.map((bin) => (
                <rect
                  key={`heatmap-rect-${bin.row}-${bin.column}`}
                  className="vx-heatmap-rect"
                  width={bin.width}
                  height={bin.height}
                  x={bin.x}
                  y={bin.y}
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
        </HeatmapRect>
      </Group>
      <AxisLeft
        scale={yScale}
        label="Axis Y"
        labelClassName="vx-label aqua"
        hideAxisLine
        top={axisBottomOffset}
        left={margin.left}
        hideTicks
        numTicks={14}
        hideZero
        tickLabelProps={() => ({
          fill: cool2,
          fontSize: 11,
          textAnchor: "middle",
          right: 10,
        })}
      />
      <AxisBottom
        scale={xScale}
        label="Axis X"
        labelClassName="vx-label aqua"
        labelOffset={25}
        hideAxisLine
        top={yMax + margin.top + axisBottomOffset}
        left={margin.left + axisLeftOffset/2}
        numTicks={14}
        hideTicks
        hideZero
        tickLabelProps={() => ({
          fill: cool2,
          fontSize: 11,
          textAnchor: "middle",
        })}
      />
    </svg>
  );
}
