import ResizableSplitViewCore, { ResizableSplitViewOptions } from "@repo/core";
import { Children, ComponentProps, memo, useEffect, useRef } from "react";

type ResizableSplitViewProps = ComponentProps<"div"> & {
  options: ResizableSplitViewOptions;
};
export const ResizableSplitView = memo(function (
  props: ResizableSplitViewProps
) {
  const { options, children, ...rest } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const [child1, child2] = Children.toArray(children);
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const core = new ResizableSplitViewCore(containerRef.current, options);

    return () => {
      core.destroy();
    };
  }, [containerRef.current]);

  return (
    <div ref={containerRef} {...rest}>
      {child1}
      {child2}
    </div>
  );
});
