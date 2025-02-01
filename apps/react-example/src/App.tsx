import "./style.css";
import { ResizableSplitView } from "@repo/react";

export function App() {
  return (
    <div>
      <ResizableSplitView
        style={{
          width: 400,
          height: 600,
        }}
        options={{
          direction: "vertical",
          initialSize: 300,
          thresholds: [50, 300, 480],
          thresholdGuard: 30,
          minSize: 50,
          maxSize: 480,
          paneIds: ["area1", "area2"],
        }}
      ></ResizableSplitView>
    </div>
  );
}
