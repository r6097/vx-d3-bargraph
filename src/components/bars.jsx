import React, { useMemo } from "react";
import { Bar } from "@vx/shape";
import { Group } from "@vx/group";
import { GradientTealBlue } from "@vx/gradient";
import letterFrequency from "@vx/mock-data/lib/mocks/letterFrequency";
import { AxisBottom, AxisLeft } from "@vx/axis";
import { scaleBand, scaleLinear } from "@vx/scale";
import { Tooltip, useTooltip, defaultStyles } from "@vx/tooltip";
import { localPoint } from '@vx/event';

import "../styles/chart.css";

const data = letterFrequency.slice(5);
const marginTop = 50;
const marginBot = 70;

const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
};

// accessors
const getLetter = (d) => d.letter;
const getLetterFrequency = (d) => d.frequency * 100;

export default function Bars({ width, height, events = false }) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  // bounds
  const xMax = width;
  const yMax = height - (marginTop + marginBot);

  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand({
        range: [0, xMax],
        round: true,
        domain: data.map(getLetter),
        padding: 0.4,
      }),
    [xMax]
  );
  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...data.map(getLetterFrequency))],
      }),
    [yMax]
  );

  var title = "Distribution of Typed Letters"
  var tooltipTimeout;
  const paddingForLeftAxis = 80;

  return width < 10 ? null : (
    <>
      <h3 style={{textAlign: "center"}}>{title}</h3>
      <svg width={width + paddingForLeftAxis} height={height}>
        <GradientTealBlue id="teal" />
        <rect width={width + paddingForLeftAxis} height={height} fill="url(#teal)" rx={14} />
        <Group top={marginTop} left={paddingForLeftAxis}>
          {data.map((d) => {
            const letter = getLetter(d);
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - yScale(getLetterFrequency(d));
            const barX = xScale(letter);
            const barY = yMax - barHeight;
            return (
              <Bar
                key={`bar-${letter}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="rgba(23, 233, 217, .5)"
                onClick={() => {
                  if (events)
                    alert(`clicked: ${JSON.stringify(Object.values(d))}`);
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
                    tooltipData: d,
                    tooltipLeft: coords.x + paddingForLeftAxis,
                    tooltipTop: coords.y,
                  });
                }}
              />
            );
          })}
        </Group>
        <AxisBottom
          label="Letter Frequency"
          labelClassName="vx-label black"
          labelOffset={25}
          left={paddingForLeftAxis}
          hideAxisLine
          scale={xScale}
          numTicks={xScale.bandwidth()}
          top={yMax + marginTop}
        />
        <AxisLeft
          label="Frequency Key is Typed"
          labelClassName="vx-label black"
          top={marginTop}
          left={paddingForLeftAxis}
          scale={yScale}
        />
      </svg>

      {tooltipOpen && tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div style={{ color: "Green" }}>
            <strong>Letter: {tooltipData.letter}</strong>
          </div>
          <div>Frequency: {tooltipData.frequency}</div>
          <div>
            <small></small>
          </div>
        </Tooltip>
      )}
    </>
  );
}
