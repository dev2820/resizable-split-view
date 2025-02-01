import { useState } from "react";
import "./style.css";
import { ResizableSplitView } from "@repo/react";

export function App() {
  const [count1, setCount1] = useState<number>(0);
  const [count2, setCount2] = useState<number>(0);
  const [idForRerender, setIdForRerender] = useState<string>("");
  return (
    <div>
      <button onClick={() => setIdForRerender(new Date().toISOString())}>
        make rerender
      </button>
      <ResizableSplitView
        id={idForRerender}
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
      >
        <div id="area1">
          pane1: {count1}{" "}
          <button onClick={() => setCount1((v) => v + 1)}>count</button>
        </div>
        <div id="area2">
          pane2: {count2}
          <button onClick={() => setCount2((v) => v + 1)}>count</button>
        </div>
        <div>rest of children will be ignored</div>
      </ResizableSplitView>
    </div>
  );
}
