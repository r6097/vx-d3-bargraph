import { useState } from "react";
import BarGroup from "./components/bargroup";
import Bars from "./components/bars";
import HeatMapGraph from "./components/heatmap";
import HeatMapGraphRect from "./components/heatmapsquare";
import VerticalBarChart from "./components/vertical_bar_chart";
import VerticalMultibarChart from "./components/vertical_multibar_chart";
import StackedBars from "./components/stackedbars";
import "./App.css";

/* NOTE : Using React v.17.0.1 to resolve @vx dependency issue */
// Did this by editing react, react-dom dependency version in package.json
// Removed all other dependencies
// Edited index.js to match React 17 standards
// Deleted node_modules
// Deleted package-lock.json
// run npm i
// run npm i react-scripts

// for vertical bar chart
let data = {
  title: "Awesome Chart Title",
  xLabel: "Awesome x-axis Label",
  yLabel: "Awesome y-axis Label",
  values: [
    { x: "A", y: 1 },
    { x: "B", y: 2 },
    { x: "C", y: 3 },
    { x: "E", y: 2 },
    { x: "F", y: 1 },
  ],
};

let gdata = [
  {
    x: "A",
    label: "label",
    "best": 0.75,
    "worst": 0.25,
  },
  // {
  //   x: "B",
  //   label: "label",
  //   best: 0.65,
  //   worst: 0.35,
  // },
];


function App() {
  const [chart, setChart] = useState("bars");
  const displayChart = (chart) => {
    switch (chart) {
      case "bargroup":
        return <BarGroup width={800} height={500} events={true} />;
      case "bars":
        return <Bars width={800} height={500} events={true} />;
      case "heatcircle":
        return <HeatMapGraph width={600} height={600} events={true} />;
      case "heatrect":
        return <HeatMapGraphRect width={600} height={600} events={true} />;
      case "vertbar":
        return (
          <VerticalBarChart
            data={data.values}
            xKey={"x"}
            yKey={["y"]}
            title={data.title}
            xLabel={data.xLabel}
            yLabel={data.yLabel}
            elemID={"container"} // this is the id of the parent div
            tickStyle={"horizontal"}
          />
        );
      case "multibar":
        return (
          <VerticalMultibarChart
            width={600}
            data={gdata}
            x0key="label"
            xLabel="Best vs Worst somethings"
            x1Keys={["best", "worst"]}
            tickStyle="diagonal"
            tickWidth={190}
            tickVOffset={200}
            tickHOffset={-60}
          />
        );
      case "stackedbars":
        return(
          <StackedBars
            width={800}
            height={600}
          />
        )
      default:
        return <></>;
    }
  };
  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          paddingBottom: "20px",
        }}
      >
        <button onClick={() => setChart("bars")}>Simple Bars</button>
        <button onClick={() => setChart("bargroup")}>Bargroup</button>
        <button onClick={() => setChart("stackedbars")}>Stacked Bars</button>
        <button onClick={() => setChart("heatcircle")}>Heatmap Circles</button>
        <button onClick={() => setChart("heatrect")}>Heatmap Rectangles</button>
        <button onClick={() => setChart("vertbar")}>KYS Vertical Bar</button>
        <button onClick={() => setChart("multibar")}>KYS Vertical Multi Bar</button>
      </div>
      <div className="App-header">{displayChart(chart)}</div>
    </div>
  );
}

export default App;
