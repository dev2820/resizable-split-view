import "./style.css";
import "@repo/core/style";
import ResizableSplitView from "@repo/core";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="container">
  </div>
`;

const container = document.getElementById("container")!;
new ResizableSplitView(container, {
  direction: "vertical",
  initialSize: 300,
  thresholds: [50, 300, 480],
  thresholdGuard: 50,
  minSize: 50,
  maxSize: 480,
  paneIds: ["area1", "area2"],
});
