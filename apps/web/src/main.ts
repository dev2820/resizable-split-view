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
  initialSize: 400,
  paneIds: ["area1", "area2"],
});
