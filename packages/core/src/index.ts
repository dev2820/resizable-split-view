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
  private handle: HTMLElement | undefined;
  private options: ResizableSplitViewOptions;
  private isDragging: boolean = false;
  private pointerId: number = -1;
  private originPos: number = -1;

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
    const { direction } = this.options;
    const containerRect = this.container.getBoundingClientRect();
    const handleRect = this.handle!.getBoundingClientRect();
    if (direction === "horizontal") {
      const xPos = handleRect.left - containerRect.left;
      this.originPos = xPos;
    } else {
      const yPos = handleRect.top - containerRect.top;
      this.originPos = yPos;
    }
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  private onPointerMove(event: PointerEvent) {
    if (!this.isDragging) return;

    const { direction, minSize = 0, maxSize = Infinity } = this.options;
    const containerRect = this.container.getBoundingClientRect();
    let newSize: number;

    if (direction === "horizontal") {
      const xPos = event.clientX - containerRect.left;
      newSize = Math.max(minSize, Math.min(xPos, maxSize));
    } else {
      const yPos = event.clientY - containerRect.top;
      newSize = Math.max(minSize, Math.min(yPos, maxSize));
    }

    this.pane1!.style.flex = `0 0 ${newSize}px`;
    this.handle!.style.top = `${newSize}px`;

    event.preventDefault();
  }

  private onPointerUp(event: PointerEvent) {
    this.isDragging = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(this.pointerId);

    const {
      direction,
      thresholds = [],
      maxSize = Infinity,
      minSize = 0,
      thresholdGuard = 30,
    } = this.options;
    const containerRect = this.container.getBoundingClientRect();

    /**
     * ease-in
     */
    if (direction === "horizontal") {
      const xPos = event.clientX - containerRect.left;
      const closestThreshold = findClosestThreshold(thresholds, xPos);
      if (xPos >= maxSize || xPos <= minSize) {
        return;
      }
      this.handle!.style.transition = "left 0.2s ease-out";
      this.handle!.style.left = `${closestThreshold}px`;
      this.pane1!.style.transition = "flex-basis 0.2s ease-out";
      this.pane1!.style.flex = `0 0 ${closestThreshold}px`;
    } else {
      const yPos = event.clientY - containerRect.top;
      const dy = yPos - this.originPos;
      if (Math.abs(dy) < thresholdGuard) {
        // 가드보다 적게 움직였다면 가드 위치로 원위치
        this.handle!.style.transition = "top 0.2s ease-out";
        this.handle!.style.top = `${this.originPos}px`;
        this.pane1!.style.transition = "flex-basis 0.2s ease-out";
        this.pane1!.style.flex = `0 0 ${this.originPos}px`;

        // 요소에 transitionend 이벤트 리스너 추가
        this.handle!.addEventListener(
          "transitionend",
          (event) => {
            (event.target as HTMLElement).style.transition = "";
          },
          { once: true }
        );
        this.pane1!.addEventListener(
          "transitionend",
          (event) => {
            (event.target as HTMLElement).style.transition = "";
          },
          {
            once: true,
          }
        );
      } else {
        // 가드보다 크게 움직였다면 다음 threshold로 이동
        const goDown = dy > 0;
        if (goDown) {
          const nextThreshold = findNextThreshold(thresholds, yPos);
          this.handle!.style.transition = "top 0.2s ease-out";
          this.handle!.style.top = `${nextThreshold}px`;
          this.pane1!.style.transition = "flex-basis 0.2s ease-out";
          this.pane1!.style.flex = `0 0 ${nextThreshold}px`;

          // 요소에 transitionend 이벤트 리스너 추가
          this.handle!.addEventListener(
            "transitionend",
            (event) => {
              (event.target as HTMLElement).style.transition = "";
            },
            { once: true }
          );
          this.pane1!.addEventListener(
            "transitionend",
            (event) => {
              (event.target as HTMLElement).style.transition = "";
            },
            {
              once: true,
            }
          );
        } else {
          const nextThreshold = findPrevThreshold(thresholds, yPos);
          this.handle!.style.transition = "top 0.2s ease-out";
          this.handle!.style.top = `${nextThreshold}px`;
          this.pane1!.style.transition = "flex-basis 0.2s ease-out";
          this.pane1!.style.flex = `0 0 ${nextThreshold}px`;

          // 요소에 transitionend 이벤트 리스너 추가
          this.handle!.addEventListener(
            "transitionend",
            (event) => {
              (event.target as HTMLElement).style.transition = "";
            },
            { once: true }
          );
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
      }
    }

    event.preventDefault();
    this.originPos = -1;
  }
}

export default ResizableSplitView;

const findPrevThreshold = (thresholds: number[], pos: number) => {
  /**
   * 다음 threshold를 찾는다.
   */
  let prev = -1;
  for (let i = thresholds.length; i >= 0; i--) {
    if (pos > thresholds[i]) {
      prev = thresholds[i];
      break;
    }
  }

  return prev;
};
const findNextThreshold = (thresholds: number[], pos: number) => {
  /**
   * 다음 threshold를 찾는다.
   */
  let next = -1;
  for (let i = 0; i < thresholds.length; i++) {
    if (pos < thresholds[i]) {
      next = thresholds[i];
      break;
    }
  }

  return next;
};
const findClosestThreshold = (thresholds: number[], pos: number) => {
  /**
   * 가장 가까운 threshold를 찾는다.
   */
  let closest = -1;
  let smallestGap = Infinity;
  for (let i = 0; i < thresholds.length; i++) {
    const gap = Math.abs(thresholds[i] - pos);
    if (gap < smallestGap) {
      smallestGap = gap;
      closest = thresholds[i];
    }
  }

  return closest;
};
