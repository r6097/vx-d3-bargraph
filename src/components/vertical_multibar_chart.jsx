import React from "react";
import { Group } from "@vx/group";
import { BarGroup } from "@vx/shape";
import { AxisLeft, AxisBottom } from "@vx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@vx/scale";
import { Text } from "@vx/text";
import AxisHorizontal from "./axis_horizontal";

// export type BarGroupProps = {
//   width: number;
//   height?: number;
//   margin?: { top: number; right: number; bottom: number; left: number };
//   events?: boolean;
// };

function VerticalMultibarChart({
  data,
  x1Keys,
  x0Key,
  xLabel,
  yLabel,
  width,
  height = 500,
  events = true,
  margin = { top: 40, right: 0, bottom: 100, left: 60 },
  tickStyle = "horizontal",
  labelOffset = 40,
  tickWidth = 180,
  tickHOffset = 0,
  tickVOffset = 10,
  percentage = true,
}) {
  //Percentages or raw counts
  // const data_raw = JSON.parse(JSON.stringify(data));
  // data = [];
  // let percentSymbol = percentage ? "%" : "";
  // if (percentage) {

  //   const calcPercent = (num, total) => Math.round((num / total) * 100);
  //   let totals = {}
  //   x1Keys.forEach(key => {
  //     let total = 0
  //     data_raw.forEach(d => {total += d[key]});
  //     totals[key] = total
  //   });

  //   console.log(data_raw);
  //   data_raw.slice().map(item => {
  //     const itemPercent = item;
  //     x1Keys.forEach(key => {
  //       itemPercent[key] = calcPercent(item[key], totals[key]);
  //     });
  //     data.push(itemPercent);
  //   })
  // } else {
  //   data = data_raw;
  // }

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // accessors
  const getX0 = (d) => d[x0Key];

  // scales
  const x0Scale = scaleBand({
    domain: data.map(getX0),
    range: [0, xMax],
    padding: 0.2,
  });
  const x1Scale = scaleBand({
    domain: x1Keys,
    range: [0, x0Scale.bandwidth()],
    padding: 0.1,
  });

  const yScale = scaleLinear({
    domain: [
      0,
      Math.max(
        ...data.map((d) => Math.max(...x1Keys.map((key) => Number(d[key]))))
      ),
    ],
    range: [yMax, 0],
  });

  const blue = "#1a6499";
  const yellow = "#d9b337";

  const colorScale = scaleOrdinal({
    domain: x1Keys,
    range: [blue, yellow],
  });
  console.log(x1Scale.domain);
  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect x={0} y={0} width={width} height={height} fill="white" />
      <Group top={margin.top} left={margin.left}>
        <BarGroup
          data={data}
          keys={x1Keys}
          height={yMax}
          x0={getX0}
          x0Scale={x0Scale}
          x1Scale={x1Scale}
          yScale={yScale}
          color={colorScale}
        >
          {(barGroups) =>
            barGroups.map((barGroup) => (
              <Group
                key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                left={barGroup.x0}
              >
                {barGroup.bars.map((bar) => (
                  <g>
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
                    />
                    <Text
                      x={bar.x + bar.width / 2 - 10}
                      y={yMax - bar.height - 10}
                    >
                      {`${bar.value}%`}
                    </Text>
                  </g>
                ))}
              </Group>
            ))
          }
        </BarGroup>
      </Group>

      <AxisHorizontal
        label={xLabel}
        scale={x0Scale}
        top={yMax + margin.top}
        labelOffset={labelOffset}
        tickWidth={tickWidth}
        tickHOffset={tickHOffset}
        tickVOffset={tickVOffset}
        left={margin.left}
      />
      <AxisLeft
        scale={yScale}
        top={margin.top}
        left={margin.left}
        label={percentage ? "Percent" : "Count"}
        stroke={"#1b1a1e"}
        tickTextFill={"#1b1a1e"}
        numTicks={5}
        axisClassName="leftAxis"
      />
    </svg>
  );
}

export default VerticalMultibarChart;
