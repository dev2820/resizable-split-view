type Direction = "horizontal" | "vertical";

interface ResizableSplitViewOptions {
  initialSize: number;
  minSize?: number;
  maxSize?: number;
  direction: Direction;
  thresholds?: number[];
  paneIds: string[];
}

class ResizableSplitView {
  private container: HTMLElement;
  private pane1: HTMLElement | undefined;
  private pane2: HTMLElement | undefined;
  private handle: HTMLElement | undefined;
  private options: ResizableSplitViewOptions;
  private isDragging: boolean = false;
  private pointerId: number = -1;

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
    this.pane1.id = this.options.paneIds[0];
    this.pane2.id = this.options.paneIds[1];
    this.pane1.style.flex = `0 0 ${this.options.initialSize}px`;
    this.pane2.style.flex = "1";

    this.handle.classList.add("resizable-split-view__handler");
    this.handle.classList.add(isHorizontal ? "pos-horizontal" : "pos-vertical");
    this.handle!.style.top = `${this.options.initialSize}px`;
    this.handle.style.cursor = isHorizontal ? "col-resize" : "row-resize";
    this.container.style.flexDirection = isHorizontal ? "row" : "column";

    this.handleEvents();

    return this;
  }

  private handleEvents() {
    this.handle?.addEventListener("pointerdown", this.onPointerDown.bind(this));
    this.handle?.addEventListener("pointermove", this.onPointerMove.bind(this));
    this.handle?.addEventListener("pointerup", this.onPointerUp.bind(this));
  }

  private onPointerDown(event: PointerEvent) {
    this.isDragging = true;
    this.pointerId = event.pointerId;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  private onPointerMove(event: PointerEvent) {
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
    event.preventDefault();
  }

  private onPointerUp(event: PointerEvent) {
    this.isDragging = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(this.pointerId);
    event.preventDefault();
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
