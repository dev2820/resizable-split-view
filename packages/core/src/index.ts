import { clamp } from "./utils/clamp";

type Direction = "horizontal" | "vertical";

interface ResizableSplitViewOptions {
  initialSize: number;
  minSize?: number;
  maxSize?: number;
  direction: Direction;
  thresholds?: number[];
  thresholdGuard?: number;
  paneIds: string[];
}

class ResizableSplitView {
  private container: HTMLElement;
  private pane1: HTMLElement | undefined;
  private pane2: HTMLElement | undefined;
  private options: ResizableSplitViewOptions;
  private isDragging: boolean = false;
  private pointerId: number = -1;
  private startPos: number = -1; // 변화가 시작할 때 포인터의 위치
  private currentPos: number = -1; // 변화중인 포인터의 위치
  private originSize: number = 0; // pane1의 실제 사이즈 (px)
  private size: number = 0; // pane1의 실제 사이즈 (px)

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

    this.container.appendChild(this.pane1);
    this.container.appendChild(this.pane2);

    this.pane1.classList.add("resizable-split-view__pane1");
    this.pane2.classList.add("resizable-split-view__pane2");
    this.pane1.id = this.options.paneIds[0];
    this.pane2.id = this.options.paneIds[1];
    this.pane1.style.flex = `0 0 ${this.options.initialSize}px`;
    this.pane2.style.flex = "1";

    this.container.style.display = "flex";
    this.container.style.position = "relative";
    this.container.style.flexDirection = isHorizontal ? "row" : "column";
    this.originSize = this.size = this.options.initialSize;
    this.handleEvents();

    return this;
  }

  private handleEvents() {
    this.container?.addEventListener(
      "pointerdown",
      this.onPointerDown.bind(this)
    );
    this.container?.addEventListener(
      "pointermove",
      this.onPointerMove.bind(this)
    );
    this.container?.addEventListener("pointerup", this.onPointerUp.bind(this));
  }

  private onPointerDown(event: PointerEvent) {
    this.isDragging = true;
    this.pointerId = event.pointerId;
    const { clientX: pointerX, clientY: pointerY } = event;
    const { direction } = this.options;
    // const containerRect = this.container.getBoundingClientRect();

    if (direction === "horizontal") {
      // const xPos = Math.max(pointerX - containerRect.left, 0);
      this.startPos = pointerX;
    } else {
      // const yPos = Math.max(pointerY - containerRect.top, 0);
      this.startPos = pointerY;
    }
    this.currentPos = this.startPos;

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  private onPointerMove(event: PointerEvent) {
    if (!this.isDragging) return;

    const { direction, minSize = 0, maxSize = Infinity } = this.options;
    // const containerRect = this.container.getBoundingClientRect();

    if (direction === "horizontal") {
      this.currentPos = event.clientX;
    } else {
      this.currentPos = event.clientY;
    }
    const diff = this.currentPos - this.startPos;
    this.size = clamp(
      minSize,
      maxSize,
      this.originSize + this.changeToPx(diff)
    );

    this.pane1!.style.flex = `0 0 ${this.size}px`;

    event.preventDefault();
  }

  private onPointerUp(event: PointerEvent) {
    this.isDragging = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(this.pointerId);

    const { thresholds = [], thresholdGuard = 30 } = this.options;

    /**
     * ease-in
     */
    const diff = this.currentPos - this.startPos;
    const d = Math.abs(diff);
    if (d < thresholdGuard) {
      this.changeSizeOfPane1(this.originSize);
    } else {
      // 가드보다 크게 움직였다면 다음 threshold로 이동
      const nextThreshold =
        diff > 0
          ? findNextThreshold(thresholds, this.size)
          : findPrevThreshold(thresholds, this.size);

      this.changeSizeOfPane1(nextThreshold!);
      this.originSize = nextThreshold!;
    }

    event.preventDefault();
  }

  changeSizeOfPane1(to: number) {
    this.pane1!.style.transition = "flex-basis 0.15s ease-out";
    this.pane1!.style.flex = `0 0 ${to}px`;
    // 요소에 transitionend 이벤트 리스너 추가
    this.pane1!.addEventListener(
      "transitionend",
      (event) => {
        (event.target as HTMLElement).style.transition = "";
      },
      {
        once: true,
      }
    );
  }
  changeToPx(change: number) {
    const alpha = 1.2; // 가변률
    return change * alpha;
  }
}

export default ResizableSplitView;

const findPrevThreshold = (thresholds: number[], pos: number) => {
  /**
   * 이전 threshold를 찾는다.
   */
  for (let i = thresholds.length; i >= 0; i--) {
    if (pos > thresholds[i]) {
      return thresholds[i];
    }
  }

  return thresholds.at(0);
};
const findNextThreshold = (thresholds: number[], pos: number) => {
  /**
   * 다음 threshold를 찾는다.
   */
  for (let i = 0; i < thresholds.length; i++) {
    if (pos < thresholds[i]) {
      return thresholds[i];
    }
  }

  return thresholds.at(-1);
};
