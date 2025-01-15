type Direction = "horizontal" | "vertical";

interface ResizableSplitViewOptions {
  initialSize: number;
  minSize?: number;
  maxSize?: number;
  direction: Direction;
  thresholds?: number[];
}

class ResizableSplitView {
  private container: HTMLElement;
  private pane1: HTMLElement | undefined;
  private pane2: HTMLElement | undefined;
  private handle: HTMLElement | undefined;
  private options: ResizableSplitViewOptions;
  private isDragging: boolean = false;

  constructor(container: HTMLElement, options: ResizableSplitViewOptions) {
    this.container = container;
    this.options = options;
    this.init();
  }

  private init() {
    const isHorizontal = this.options.direction === "horizontal";
    this.container.classList.add("resizable-split-view__container");
    // Pane과 Handle element를 만들고 스타일을 초기화
    this.pane1 = document.createElement("div");
    this.pane2 = document.createElement("div");
    this.handle = document.createElement("div");

    this.container.appendChild(this.pane1);
    this.container.appendChild(this.pane2);
    this.container.appendChild(this.handle);

    this.pane1.classList.add("resizable-split-view__pane1");
    this.pane2.classList.add("resizable-split-view__pane2");
    this.pane1.style.flex = `0 0 ${this.options.initialSize}px`;
    this.pane2.style.flex = "1";

    this.handle.classList.add("resizable-split-view__handler");
    this.handle.classList.add(isHorizontal ? "pos-horizontal" : "pos-vertical");
    this.handle.style.cursor = isHorizontal ? "col-resize" : "row-resize";
    this.container.style.flexDirection = isHorizontal ? "row" : "column";

    this.handleEvents();

    return this;
  }

  private handleEvents() {
    this.handle?.addEventListener("mousedown", this.onDragStart.bind(this));
    this.container.addEventListener("mousemove", this.onDragMove.bind(this));
    this.container.addEventListener("mouseup", this.onDragEnd.bind(this));
  }

  private onDragStart(event: MouseEvent) {
    this.isDragging = true;
    event.preventDefault();
  }

  private onDragMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const {
      direction,
      minSize = 0,
      maxSize = Infinity,
      thresholds = [],
    } = this.options;
    const containerRect = this.container.getBoundingClientRect();
    let newSize: number;

    if (direction === "horizontal") {
      const xPos = event.clientX - containerRect.left;
      newSize = Math.max(minSize, Math.min(xPos, maxSize));
    } else {
      const yPos = event.clientY - containerRect.top;
      newSize = Math.max(minSize, Math.min(yPos, maxSize));
    }

    this.applyThresholds(newSize, thresholds);
  }

  private onDragEnd() {
    this.isDragging = false;
  }

  private applyThresholds(size: number, thresholds: number[]) {
    if (!this.pane1 || !this.pane2) {
      throw new Error("ResizableSplitView: init ResizableSplitView first");
    }
    const { minSize = 0 } = this.options;

    // Threshold를 순회하면서 크기를 조정
    for (const threshold of thresholds) {
      if (size < threshold) {
        size = minSize;
        break;
      } else if (size >= threshold) {
        size = threshold;
      }
    }

    this.pane1.style.flex = `0 0 ${size}px`;
    this.pane2.style.flex = "1";
    this.handle!.style.top = `${size}px`;
  }
}

export default ResizableSplitView;
