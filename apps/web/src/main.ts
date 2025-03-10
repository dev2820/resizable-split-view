import "./style.css";
import ResizableSplitView from "@repo/core";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="container">
    <div id="area1">pane1</div>
    <div id="area2">pane2</div>
  </div>
`;

const container = document.getElementById("container")!;
new ResizableSplitView(container, {
  direction: "vertical",
  initialSize: 300,
  thresholds: [50, 300, 480],
  thresholdGuard: 30,
  minSize: 50,
  maxSize: 480,
  paneIds: ["area1", "area2"],
});
