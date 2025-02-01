import ResizableSplitViewCore, { ResizableSplitViewOptions } from "@repo/core";
import { ComponentProps, useEffect, useRef } from "react";

type ResizableSplitViewProps = ComponentProps<"div"> & {
  options: ResizableSplitViewOptions;
};
export function ResizableSplitView(props: ResizableSplitViewProps) {
  const { options, ...rest } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    new ResizableSplitViewCore(containerRef.current, options);
  }, [containerRef.current]);

  return <div ref={containerRef} {...rest}></div>;
}
