import {
  require_react_dom
} from "./chunk-UP6LQVYV.js";
import {
  require_react
} from "./chunk-TWJRYSII.js";
import {
  __toESM
} from "./chunk-DC5AMYBS.js";

// node_modules/@tanstack/react-virtual/dist/esm/index.js
var React = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());

// node_modules/@tanstack/virtual-core/dist/esm/utils.js
function memo(getDeps, fn, opts) {
  let deps = opts.initialDeps ?? [];
  let result;
  function memoizedFunction() {
    var _a, _b, _c, _d;
    let depTime;
    if (opts.key && ((_a = opts.debug) == null ? void 0 : _a.call(opts))) depTime = Date.now();
    const newDeps = getDeps();
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep);
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    let resultTime;
    if (opts.key && ((_b = opts.debug) == null ? void 0 : _b.call(opts))) resultTime = Date.now();
    result = fn(...newDeps);
    if (opts.key && ((_c = opts.debug) == null ? void 0 : _c.call(opts))) {
      const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
      const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
      const resultFpsPercentage = resultEndTime / 16;
      const pad = (str, num) => {
        str = String(str);
        while (str.length < num) {
          str = " " + str;
        }
        return str;
      };
      console.info(
        `%c⏱ ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * resultFpsPercentage, 120)
        )}deg 100% 31%);`,
        opts == null ? void 0 : opts.key
      );
    }
    (_d = opts == null ? void 0 : opts.onChange) == null ? void 0 : _d.call(opts, result);
    return result;
  }
  memoizedFunction.updateDeps = (newDeps) => {
    deps = newDeps;
  };
  return memoizedFunction;
}
function notUndefined(value, msg) {
  if (value === void 0) {
    throw new Error(`Unexpected undefined${msg ? `: ${msg}` : ""}`);
  } else {
    return value;
  }
}
var approxEqual = (a10, b7) => Math.abs(a10 - b7) < 1;
var debounce = (targetWindow, fn, ms) => {
  let timeoutId;
  return function(...args) {
    targetWindow.clearTimeout(timeoutId);
    timeoutId = targetWindow.setTimeout(() => fn.apply(this, args), ms);
  };
};

// node_modules/@tanstack/virtual-core/dist/esm/index.js
var defaultKeyExtractor = (index) => index;
var defaultRangeExtractor = (range) => {
  const start = Math.max(range.startIndex - range.overscan, 0);
  const end = Math.min(range.endIndex + range.overscan, range.count - 1);
  const arr = [];
  for (let i8 = start; i8 <= end; i8++) {
    arr.push(i8);
  }
  return arr;
};
var observeElementRect = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  const handler = (rect) => {
    const { width, height } = rect;
    cb({ width: Math.round(width), height: Math.round(height) });
  };
  handler(element.getBoundingClientRect());
  if (!targetWindow.ResizeObserver) {
    return () => {
    };
  }
  const observer = new targetWindow.ResizeObserver((entries) => {
    const run = () => {
      const entry = entries[0];
      if (entry == null ? void 0 : entry.borderBoxSize) {
        const box = entry.borderBoxSize[0];
        if (box) {
          handler({ width: box.inlineSize, height: box.blockSize });
          return;
        }
      }
      handler(element.getBoundingClientRect());
    };
    instance.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
  });
  observer.observe(element, { box: "border-box" });
  return () => {
    observer.unobserve(element);
  };
};
var addEventListenerOptions = {
  passive: true
};
var supportsScrollend = typeof window == "undefined" ? true : "onscrollend" in window;
var observeElementOffset = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  let offset = 0;
  const fallback = instance.options.useScrollendEvent && supportsScrollend ? () => void 0 : debounce(
    targetWindow,
    () => {
      cb(offset, false);
    },
    instance.options.isScrollingResetDelay
  );
  const createHandler = (isScrolling) => () => {
    const { horizontal, isRtl } = instance.options;
    offset = horizontal ? element["scrollLeft"] * (isRtl && -1 || 1) : element["scrollTop"];
    fallback();
    cb(offset, isScrolling);
  };
  const handler = createHandler(true);
  const endHandler = createHandler(false);
  endHandler();
  element.addEventListener("scroll", handler, addEventListenerOptions);
  const registerScrollendEvent = instance.options.useScrollendEvent && supportsScrollend;
  if (registerScrollendEvent) {
    element.addEventListener("scrollend", endHandler, addEventListenerOptions);
  }
  return () => {
    element.removeEventListener("scroll", handler);
    if (registerScrollendEvent) {
      element.removeEventListener("scrollend", endHandler);
    }
  };
};
var measureElement = (element, entry, instance) => {
  if (entry == null ? void 0 : entry.borderBoxSize) {
    const box = entry.borderBoxSize[0];
    if (box) {
      const size = Math.round(
        box[instance.options.horizontal ? "inlineSize" : "blockSize"]
      );
      return size;
    }
  }
  return Math.round(
    element.getBoundingClientRect()[instance.options.horizontal ? "width" : "height"]
  );
};
var elementScroll = (offset, {
  adjustments = 0,
  behavior
}, instance) => {
  var _a, _b;
  const toOffset = offset + adjustments;
  (_b = (_a = instance.scrollElement) == null ? void 0 : _a.scrollTo) == null ? void 0 : _b.call(_a, {
    [instance.options.horizontal ? "left" : "top"]: toOffset,
    behavior
  });
};
var Virtualizer = class {
  constructor(opts) {
    this.unsubs = [];
    this.scrollElement = null;
    this.targetWindow = null;
    this.isScrolling = false;
    this.scrollToIndexTimeoutId = null;
    this.measurementsCache = [];
    this.itemSizeCache = /* @__PURE__ */ new Map();
    this.pendingMeasuredCacheIndexes = [];
    this.scrollRect = null;
    this.scrollOffset = null;
    this.scrollDirection = null;
    this.scrollAdjustments = 0;
    this.elementsCache = /* @__PURE__ */ new Map();
    this.observer = /* @__PURE__ */ (() => {
      let _ro = null;
      const get = () => {
        if (_ro) {
          return _ro;
        }
        if (!this.targetWindow || !this.targetWindow.ResizeObserver) {
          return null;
        }
        return _ro = new this.targetWindow.ResizeObserver((entries) => {
          entries.forEach((entry) => {
            const run = () => {
              this._measureElement(entry.target, entry);
            };
            this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
          });
        });
      };
      return {
        disconnect: () => {
          var _a;
          (_a = get()) == null ? void 0 : _a.disconnect();
          _ro = null;
        },
        observe: (target) => {
          var _a;
          return (_a = get()) == null ? void 0 : _a.observe(target, { box: "border-box" });
        },
        unobserve: (target) => {
          var _a;
          return (_a = get()) == null ? void 0 : _a.unobserve(target);
        }
      };
    })();
    this.range = null;
    this.setOptions = (opts2) => {
      Object.entries(opts2).forEach(([key, value]) => {
        if (typeof value === "undefined") delete opts2[key];
      });
      this.options = {
        debug: false,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: false,
        getItemKey: defaultKeyExtractor,
        rangeExtractor: defaultRangeExtractor,
        onChange: () => {
        },
        measureElement,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        isScrollingResetDelay: 150,
        enabled: true,
        isRtl: false,
        useScrollendEvent: false,
        useAnimationFrameWithResizeObserver: false,
        ...opts2
      };
    };
    this.notify = (sync) => {
      var _a, _b;
      (_b = (_a = this.options).onChange) == null ? void 0 : _b.call(_a, this, sync);
    };
    this.maybeNotify = memo(
      () => {
        this.calculateRange();
        return [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ];
      },
      (isScrolling) => {
        this.notify(isScrolling);
      },
      {
        key: "maybeNotify",
        debug: () => this.options.debug,
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    );
    this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((d16) => d16());
      this.unsubs = [];
      this.observer.disconnect();
      this.scrollElement = null;
      this.targetWindow = null;
    };
    this._didMount = () => {
      return () => {
        this.cleanup();
      };
    };
    this._willUpdate = () => {
      var _a;
      const scrollElement = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== scrollElement) {
        this.cleanup();
        if (!scrollElement) {
          this.maybeNotify();
          return;
        }
        this.scrollElement = scrollElement;
        if (this.scrollElement && "ownerDocument" in this.scrollElement) {
          this.targetWindow = this.scrollElement.ownerDocument.defaultView;
        } else {
          this.targetWindow = ((_a = this.scrollElement) == null ? void 0 : _a.window) ?? null;
        }
        this.elementsCache.forEach((cached) => {
          this.observer.observe(cached);
        });
        this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        });
        this.unsubs.push(
          this.options.observeElementRect(this, (rect) => {
            this.scrollRect = rect;
            this.maybeNotify();
          })
        );
        this.unsubs.push(
          this.options.observeElementOffset(this, (offset, isScrolling) => {
            this.scrollAdjustments = 0;
            this.scrollDirection = isScrolling ? this.getScrollOffset() < offset ? "forward" : "backward" : null;
            this.scrollOffset = offset;
            this.isScrolling = isScrolling;
            this.maybeNotify();
          })
        );
      }
    };
    this.getSize = () => {
      if (!this.options.enabled) {
        this.scrollRect = null;
        return 0;
      }
      this.scrollRect = this.scrollRect ?? this.options.initialRect;
      return this.scrollRect[this.options.horizontal ? "width" : "height"];
    };
    this.getScrollOffset = () => {
      if (!this.options.enabled) {
        this.scrollOffset = null;
        return 0;
      }
      this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset === "function" ? this.options.initialOffset() : this.options.initialOffset);
      return this.scrollOffset;
    };
    this.getFurthestMeasurement = (measurements, index) => {
      const furthestMeasurementsFound = /* @__PURE__ */ new Map();
      const furthestMeasurements = /* @__PURE__ */ new Map();
      for (let m12 = index - 1; m12 >= 0; m12--) {
        const measurement = measurements[m12];
        if (furthestMeasurementsFound.has(measurement.lane)) {
          continue;
        }
        const previousFurthestMeasurement = furthestMeasurements.get(
          measurement.lane
        );
        if (previousFurthestMeasurement == null || measurement.end > previousFurthestMeasurement.end) {
          furthestMeasurements.set(measurement.lane, measurement);
        } else if (measurement.end < previousFurthestMeasurement.end) {
          furthestMeasurementsFound.set(measurement.lane, true);
        }
        if (furthestMeasurementsFound.size === this.options.lanes) {
          break;
        }
      }
      return furthestMeasurements.size === this.options.lanes ? Array.from(furthestMeasurements.values()).sort((a10, b7) => {
        if (a10.end === b7.end) {
          return a10.index - b7.index;
        }
        return a10.end - b7.end;
      })[0] : void 0;
    };
    this.getMeasurementOptions = memo(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled
      ],
      (count, paddingStart, scrollMargin, getItemKey, enabled) => {
        this.pendingMeasuredCacheIndexes = [];
        return {
          count,
          paddingStart,
          scrollMargin,
          getItemKey,
          enabled
        };
      },
      {
        key: false
      }
    );
    this.getMeasurements = memo(
      () => [this.getMeasurementOptions(), this.itemSizeCache],
      ({ count, paddingStart, scrollMargin, getItemKey, enabled }, itemSizeCache) => {
        if (!enabled) {
          this.measurementsCache = [];
          this.itemSizeCache.clear();
          return [];
        }
        if (this.measurementsCache.length === 0) {
          this.measurementsCache = this.options.initialMeasurementsCache;
          this.measurementsCache.forEach((item) => {
            this.itemSizeCache.set(item.key, item.size);
          });
        }
        const min = this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
        this.pendingMeasuredCacheIndexes = [];
        const measurements = this.measurementsCache.slice(0, min);
        for (let i8 = min; i8 < count; i8++) {
          const key = getItemKey(i8);
          const furthestMeasurement = this.options.lanes === 1 ? measurements[i8 - 1] : this.getFurthestMeasurement(measurements, i8);
          const start = furthestMeasurement ? furthestMeasurement.end + this.options.gap : paddingStart + scrollMargin;
          const measuredSize = itemSizeCache.get(key);
          const size = typeof measuredSize === "number" ? measuredSize : this.options.estimateSize(i8);
          const end = start + size;
          const lane = furthestMeasurement ? furthestMeasurement.lane : i8 % this.options.lanes;
          measurements[i8] = {
            index: i8,
            start,
            size,
            end,
            key,
            lane
          };
        }
        this.measurementsCache = measurements;
        return measurements;
      },
      {
        key: "getMeasurements",
        debug: () => this.options.debug
      }
    );
    this.calculateRange = memo(
      () => [
        this.getMeasurements(),
        this.getSize(),
        this.getScrollOffset(),
        this.options.lanes
      ],
      (measurements, outerSize, scrollOffset, lanes) => {
        return this.range = measurements.length > 0 && outerSize > 0 ? calculateRange({
          measurements,
          outerSize,
          scrollOffset,
          lanes
        }) : null;
      },
      {
        key: "calculateRange",
        debug: () => this.options.debug
      }
    );
    this.getVirtualIndexes = memo(
      () => {
        let startIndex = null;
        let endIndex = null;
        const range = this.calculateRange();
        if (range) {
          startIndex = range.startIndex;
          endIndex = range.endIndex;
        }
        this.maybeNotify.updateDeps([this.isScrolling, startIndex, endIndex]);
        return [
          this.options.rangeExtractor,
          this.options.overscan,
          this.options.count,
          startIndex,
          endIndex
        ];
      },
      (rangeExtractor, overscan, count, startIndex, endIndex) => {
        return startIndex === null || endIndex === null ? [] : rangeExtractor({
          startIndex,
          endIndex,
          overscan,
          count
        });
      },
      {
        key: "getVirtualIndexes",
        debug: () => this.options.debug
      }
    );
    this.indexFromElement = (node) => {
      const attributeName = this.options.indexAttribute;
      const indexStr = node.getAttribute(attributeName);
      if (!indexStr) {
        console.warn(
          `Missing attribute name '${attributeName}={index}' on measured element.`
        );
        return -1;
      }
      return parseInt(indexStr, 10);
    };
    this._measureElement = (node, entry) => {
      const index = this.indexFromElement(node);
      const item = this.measurementsCache[index];
      if (!item) {
        return;
      }
      const key = item.key;
      const prevNode = this.elementsCache.get(key);
      if (prevNode !== node) {
        if (prevNode) {
          this.observer.unobserve(prevNode);
        }
        this.observer.observe(node);
        this.elementsCache.set(key, node);
      }
      if (node.isConnected) {
        this.resizeItem(index, this.options.measureElement(node, entry, this));
      }
    };
    this.resizeItem = (index, size) => {
      const item = this.measurementsCache[index];
      if (!item) {
        return;
      }
      const itemSize = this.itemSizeCache.get(item.key) ?? item.size;
      const delta = size - itemSize;
      if (delta !== 0) {
        if (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(item, delta, this) : item.start < this.getScrollOffset() + this.scrollAdjustments) {
          if (this.options.debug) {
            console.info("correction", delta);
          }
          this._scrollToOffset(this.getScrollOffset(), {
            adjustments: this.scrollAdjustments += delta,
            behavior: void 0
          });
        }
        this.pendingMeasuredCacheIndexes.push(item.index);
        this.itemSizeCache = new Map(this.itemSizeCache.set(item.key, size));
        this.notify(false);
      }
    };
    this.measureElement = (node) => {
      if (!node) {
        this.elementsCache.forEach((cached, key) => {
          if (!cached.isConnected) {
            this.observer.unobserve(cached);
            this.elementsCache.delete(key);
          }
        });
        return;
      }
      this._measureElement(node, void 0);
    };
    this.getVirtualItems = memo(
      () => [this.getVirtualIndexes(), this.getMeasurements()],
      (indexes, measurements) => {
        const virtualItems = [];
        for (let k3 = 0, len = indexes.length; k3 < len; k3++) {
          const i8 = indexes[k3];
          const measurement = measurements[i8];
          virtualItems.push(measurement);
        }
        return virtualItems;
      },
      {
        key: "getVirtualItems",
        debug: () => this.options.debug
      }
    );
    this.getVirtualItemForOffset = (offset) => {
      const measurements = this.getMeasurements();
      if (measurements.length === 0) {
        return void 0;
      }
      return notUndefined(
        measurements[findNearestBinarySearch(
          0,
          measurements.length - 1,
          (index) => notUndefined(measurements[index]).start,
          offset
        )]
      );
    };
    this.getOffsetForAlignment = (toOffset, align, itemSize = 0) => {
      const size = this.getSize();
      const scrollOffset = this.getScrollOffset();
      if (align === "auto") {
        align = toOffset >= scrollOffset + size ? "end" : "start";
      }
      if (align === "center") {
        toOffset += (itemSize - size) / 2;
      } else if (align === "end") {
        toOffset -= size;
      }
      const scrollSizeProp = this.options.horizontal ? "scrollWidth" : "scrollHeight";
      const scrollSize = this.scrollElement ? "document" in this.scrollElement ? this.scrollElement.document.documentElement[scrollSizeProp] : this.scrollElement[scrollSizeProp] : 0;
      const maxOffset = scrollSize - size;
      return Math.max(Math.min(maxOffset, toOffset), 0);
    };
    this.getOffsetForIndex = (index, align = "auto") => {
      index = Math.max(0, Math.min(index, this.options.count - 1));
      const item = this.measurementsCache[index];
      if (!item) {
        return void 0;
      }
      const size = this.getSize();
      const scrollOffset = this.getScrollOffset();
      if (align === "auto") {
        if (item.end >= scrollOffset + size - this.options.scrollPaddingEnd) {
          align = "end";
        } else if (item.start <= scrollOffset + this.options.scrollPaddingStart) {
          align = "start";
        } else {
          return [scrollOffset, align];
        }
      }
      const toOffset = align === "end" ? item.end + this.options.scrollPaddingEnd : item.start - this.options.scrollPaddingStart;
      return [
        this.getOffsetForAlignment(toOffset, align, item.size),
        align
      ];
    };
    this.isDynamicMode = () => this.elementsCache.size > 0;
    this.cancelScrollToIndex = () => {
      if (this.scrollToIndexTimeoutId !== null && this.targetWindow) {
        this.targetWindow.clearTimeout(this.scrollToIndexTimeoutId);
        this.scrollToIndexTimeoutId = null;
      }
    };
    this.scrollToOffset = (toOffset, { align = "start", behavior } = {}) => {
      this.cancelScrollToIndex();
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      this._scrollToOffset(this.getOffsetForAlignment(toOffset, align), {
        adjustments: void 0,
        behavior
      });
    };
    this.scrollToIndex = (index, { align: initialAlign = "auto", behavior } = {}) => {
      index = Math.max(0, Math.min(index, this.options.count - 1));
      this.cancelScrollToIndex();
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      const offsetAndAlign = this.getOffsetForIndex(index, initialAlign);
      if (!offsetAndAlign) return;
      const [offset, align] = offsetAndAlign;
      this._scrollToOffset(offset, { adjustments: void 0, behavior });
      if (behavior !== "smooth" && this.isDynamicMode() && this.targetWindow) {
        this.scrollToIndexTimeoutId = this.targetWindow.setTimeout(() => {
          this.scrollToIndexTimeoutId = null;
          const elementInDOM = this.elementsCache.has(
            this.options.getItemKey(index)
          );
          if (elementInDOM) {
            const [latestOffset] = notUndefined(
              this.getOffsetForIndex(index, align)
            );
            if (!approxEqual(latestOffset, this.getScrollOffset())) {
              this.scrollToIndex(index, { align, behavior });
            }
          } else {
            this.scrollToIndex(index, { align, behavior });
          }
        });
      }
    };
    this.scrollBy = (delta, { behavior } = {}) => {
      this.cancelScrollToIndex();
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      this._scrollToOffset(this.getScrollOffset() + delta, {
        adjustments: void 0,
        behavior
      });
    };
    this.getTotalSize = () => {
      var _a;
      const measurements = this.getMeasurements();
      let end;
      if (measurements.length === 0) {
        end = this.options.paddingStart;
      } else if (this.options.lanes === 1) {
        end = ((_a = measurements[measurements.length - 1]) == null ? void 0 : _a.end) ?? 0;
      } else {
        const endByLane = Array(this.options.lanes).fill(null);
        let endIndex = measurements.length - 1;
        while (endIndex >= 0 && endByLane.some((val) => val === null)) {
          const item = measurements[endIndex];
          if (endByLane[item.lane] === null) {
            endByLane[item.lane] = item.end;
          }
          endIndex--;
        }
        end = Math.max(...endByLane.filter((val) => val !== null));
      }
      return Math.max(
        end - this.options.scrollMargin + this.options.paddingEnd,
        0
      );
    };
    this._scrollToOffset = (offset, {
      adjustments,
      behavior
    }) => {
      this.options.scrollToFn(offset, { behavior, adjustments }, this);
    };
    this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map();
      this.notify(false);
    };
    this.setOptions(opts);
  }
};
var findNearestBinarySearch = (low, high, getCurrentValue, value) => {
  while (low <= high) {
    const middle = (low + high) / 2 | 0;
    const currentValue = getCurrentValue(middle);
    if (currentValue < value) {
      low = middle + 1;
    } else if (currentValue > value) {
      high = middle - 1;
    } else {
      return middle;
    }
  }
  if (low > 0) {
    return low - 1;
  } else {
    return 0;
  }
};
function calculateRange({
  measurements,
  outerSize,
  scrollOffset,
  lanes
}) {
  const lastIndex = measurements.length - 1;
  const getOffset = (index) => measurements[index].start;
  if (measurements.length <= lanes) {
    return {
      startIndex: 0,
      endIndex: lastIndex
    };
  }
  let startIndex = findNearestBinarySearch(
    0,
    lastIndex,
    getOffset,
    scrollOffset
  );
  let endIndex = startIndex;
  if (lanes === 1) {
    while (endIndex < lastIndex && measurements[endIndex].end < scrollOffset + outerSize) {
      endIndex++;
    }
  } else if (lanes > 1) {
    const endPerLane = Array(lanes).fill(0);
    while (endIndex < lastIndex && endPerLane.some((pos) => pos < scrollOffset + outerSize)) {
      const item = measurements[endIndex];
      endPerLane[item.lane] = item.end;
      endIndex++;
    }
    const startPerLane = Array(lanes).fill(scrollOffset + outerSize);
    while (startIndex >= 0 && startPerLane.some((pos) => pos >= scrollOffset)) {
      const item = measurements[startIndex];
      startPerLane[item.lane] = item.start;
      startIndex--;
    }
    startIndex = Math.max(0, startIndex - startIndex % lanes);
    endIndex = Math.min(lastIndex, endIndex + (lanes - 1 - endIndex % lanes));
  }
  return { startIndex, endIndex };
}

// node_modules/@tanstack/react-virtual/dist/esm/index.js
var useIsomorphicLayoutEffect = typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;
function useVirtualizerBase(options) {
  const rerender = React.useReducer(() => ({}), {})[1];
  const resolvedOptions = {
    ...options,
    onChange: (instance2, sync) => {
      var _a;
      if (sync) {
        (0, import_react_dom.flushSync)(rerender);
      } else {
        rerender();
      }
      (_a = options.onChange) == null ? void 0 : _a.call(options, instance2, sync);
    }
  };
  const [instance] = React.useState(
    () => new Virtualizer(resolvedOptions)
  );
  instance.setOptions(resolvedOptions);
  useIsomorphicLayoutEffect(() => {
    return instance._didMount();
  }, []);
  useIsomorphicLayoutEffect(() => {
    return instance._willUpdate();
  });
  return instance;
}
function useVirtualizer(options) {
  return useVirtualizerBase({
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    ...options
  });
}

// node_modules/@headlessui/react/dist/components/combobox/combobox.js
var import_react19 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/hooks/use-computed.js
var import_react3 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/hooks/use-iso-morphic-effect.js
var import_react = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/env.js
var i = Object.defineProperty;
var d = (t18, e4, n7) => e4 in t18 ? i(t18, e4, { enumerable: true, configurable: true, writable: true, value: n7 }) : t18[e4] = n7;
var r = (t18, e4, n7) => (d(t18, typeof e4 != "symbol" ? e4 + "" : e4, n7), n7);
var o = class {
  constructor() {
    r(this, "current", this.detect());
    r(this, "handoffState", "pending");
    r(this, "currentId", 0);
  }
  set(e4) {
    this.current !== e4 && (this.handoffState = "pending", this.currentId = 0, this.current = e4);
  }
  reset() {
    this.set(this.detect());
  }
  nextId() {
    return ++this.currentId;
  }
  get isServer() {
    return this.current === "server";
  }
  get isClient() {
    return this.current === "client";
  }
  detect() {
    return typeof window == "undefined" || typeof document == "undefined" ? "server" : "client";
  }
  handoff() {
    this.handoffState === "pending" && (this.handoffState = "complete");
  }
  get isHandoffComplete() {
    return this.handoffState === "complete";
  }
};
var s = new o();

// node_modules/@headlessui/react/dist/hooks/use-iso-morphic-effect.js
var l = (e4, f14) => {
  s.isServer ? (0, import_react.useEffect)(e4, f14) : (0, import_react.useLayoutEffect)(e4, f14);
};

// node_modules/@headlessui/react/dist/hooks/use-latest-value.js
var import_react2 = __toESM(require_react(), 1);
function s2(e4) {
  let r9 = (0, import_react2.useRef)(e4);
  return l(() => {
    r9.current = e4;
  }, [e4]), r9;
}

// node_modules/@headlessui/react/dist/hooks/use-computed.js
function i2(e4, o13) {
  let [u13, t18] = (0, import_react3.useState)(e4), r9 = s2(e4);
  return l(() => t18(r9.current), [r9, t18, ...o13]), u13;
}

// node_modules/@headlessui/react/dist/hooks/use-controllable.js
var import_react5 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/hooks/use-event.js
var import_react4 = __toESM(require_react(), 1);
var o2 = function(t18) {
  let e4 = s2(t18);
  return import_react4.default.useCallback((...r9) => e4.current(...r9), [e4]);
};

// node_modules/@headlessui/react/dist/hooks/use-controllable.js
function T(l13, r9, c13) {
  let [i8, s17] = (0, import_react5.useState)(c13), e4 = l13 !== void 0, t18 = (0, import_react5.useRef)(e4), u13 = (0, import_react5.useRef)(false), d16 = (0, import_react5.useRef)(false);
  return e4 && !t18.current && !u13.current ? (u13.current = true, t18.current = e4, console.error("A component is changing from uncontrolled to controlled. This may be caused by the value changing from undefined to a defined value, which should not happen.")) : !e4 && t18.current && !d16.current && (d16.current = true, t18.current = e4, console.error("A component is changing from controlled to uncontrolled. This may be caused by the value changing from a defined value to undefined, which should not happen.")), [e4 ? l13 : i8, o2((n7) => (e4 || s17(n7), r9 == null ? void 0 : r9(n7)))];
}

// node_modules/@headlessui/react/dist/hooks/use-disposables.js
var import_react6 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/micro-task.js
function t3(e4) {
  typeof queueMicrotask == "function" ? queueMicrotask(e4) : Promise.resolve().then(e4).catch((o13) => setTimeout(() => {
    throw o13;
  }));
}

// node_modules/@headlessui/react/dist/utils/disposables.js
function o4() {
  let n7 = [], r9 = { addEventListener(e4, t18, s17, a10) {
    return e4.addEventListener(t18, s17, a10), r9.add(() => e4.removeEventListener(t18, s17, a10));
  }, requestAnimationFrame(...e4) {
    let t18 = requestAnimationFrame(...e4);
    return r9.add(() => cancelAnimationFrame(t18));
  }, nextFrame(...e4) {
    return r9.requestAnimationFrame(() => r9.requestAnimationFrame(...e4));
  }, setTimeout(...e4) {
    let t18 = setTimeout(...e4);
    return r9.add(() => clearTimeout(t18));
  }, microTask(...e4) {
    let t18 = { current: true };
    return t3(() => {
      t18.current && e4[0]();
    }), r9.add(() => {
      t18.current = false;
    });
  }, style(e4, t18, s17) {
    let a10 = e4.style.getPropertyValue(t18);
    return Object.assign(e4.style, { [t18]: s17 }), this.add(() => {
      Object.assign(e4.style, { [t18]: a10 });
    });
  }, group(e4) {
    let t18 = o4();
    return e4(t18), this.add(() => t18.dispose());
  }, add(e4) {
    return n7.push(e4), () => {
      let t18 = n7.indexOf(e4);
      if (t18 >= 0) for (let s17 of n7.splice(t18, 1)) s17();
    };
  }, dispose() {
    for (let e4 of n7.splice(0)) e4();
  } };
  return r9;
}

// node_modules/@headlessui/react/dist/hooks/use-disposables.js
function p() {
  let [e4] = (0, import_react6.useState)(o4);
  return (0, import_react6.useEffect)(() => () => e4.dispose(), [e4]), e4;
}

// node_modules/@headlessui/react/dist/hooks/use-id.js
var import_react7 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/hooks/use-server-handoff-complete.js
var t4 = __toESM(require_react(), 1);
function s5() {
  let r9 = typeof document == "undefined";
  return "useSyncExternalStore" in t4 ? ((o13) => o13.useSyncExternalStore)(t4)(() => () => {
  }, () => false, () => !r9) : false;
}
function l2() {
  let r9 = s5(), [e4, n7] = t4.useState(s.isHandoffComplete);
  return e4 && s.isHandoffComplete === false && n7(false), t4.useEffect(() => {
    e4 !== true && n7(true);
  }, [e4]), t4.useEffect(() => s.handoff(), []), r9 ? false : e4;
}

// node_modules/@headlessui/react/dist/hooks/use-id.js
var o6;
var I = (o6 = import_react7.default.useId) != null ? o6 : function() {
  let n7 = l2(), [e4, u13] = import_react7.default.useState(n7 ? () => s.nextId() : null);
  return l(() => {
    e4 === null && u13(s.nextId());
  }, [e4]), e4 != null ? "" + e4 : void 0;
};

// node_modules/@headlessui/react/dist/hooks/use-outside-click.js
var import_react10 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/match.js
function u(r9, n7, ...a10) {
  if (r9 in n7) {
    let e4 = n7[r9];
    return typeof e4 == "function" ? e4(...a10) : e4;
  }
  let t18 = new Error(`Tried to handle "${r9}" but there is no handler defined. Only defined handlers are: ${Object.keys(n7).map((e4) => `"${e4}"`).join(", ")}.`);
  throw Error.captureStackTrace && Error.captureStackTrace(t18, u), t18;
}

// node_modules/@headlessui/react/dist/utils/owner.js
function o7(r9) {
  return s.isServer ? null : r9 instanceof Node ? r9.ownerDocument : r9 != null && r9.hasOwnProperty("current") && r9.current instanceof Node ? r9.current.ownerDocument : document;
}

// node_modules/@headlessui/react/dist/utils/focus-management.js
var c2 = ["[contentEditable=true]", "[tabindex]", "a[href]", "area[href]", "button:not([disabled])", "iframe", "input:not([disabled])", "select:not([disabled])", "textarea:not([disabled])"].map((e4) => `${e4}:not([tabindex='-1'])`).join(",");
var M = ((n7) => (n7[n7.First = 1] = "First", n7[n7.Previous = 2] = "Previous", n7[n7.Next = 4] = "Next", n7[n7.Last = 8] = "Last", n7[n7.WrapAround = 16] = "WrapAround", n7[n7.NoScroll = 32] = "NoScroll", n7))(M || {});
var N = ((o13) => (o13[o13.Error = 0] = "Error", o13[o13.Overflow = 1] = "Overflow", o13[o13.Success = 2] = "Success", o13[o13.Underflow = 3] = "Underflow", o13))(N || {});
var F = ((t18) => (t18[t18.Previous = -1] = "Previous", t18[t18.Next = 1] = "Next", t18))(F || {});
function f2(e4 = document.body) {
  return e4 == null ? [] : Array.from(e4.querySelectorAll(c2)).sort((r9, t18) => Math.sign((r9.tabIndex || Number.MAX_SAFE_INTEGER) - (t18.tabIndex || Number.MAX_SAFE_INTEGER)));
}
var T2 = ((t18) => (t18[t18.Strict = 0] = "Strict", t18[t18.Loose = 1] = "Loose", t18))(T2 || {});
function h(e4, r9 = 0) {
  var t18;
  return e4 === ((t18 = o7(e4)) == null ? void 0 : t18.body) ? false : u(r9, { [0]() {
    return e4.matches(c2);
  }, [1]() {
    let l13 = e4;
    for (; l13 !== null; ) {
      if (l13.matches(c2)) return true;
      l13 = l13.parentElement;
    }
    return false;
  } });
}
function D(e4) {
  let r9 = o7(e4);
  o4().nextFrame(() => {
    r9 && !h(r9.activeElement, 0) && y(e4);
  });
}
var w = ((t18) => (t18[t18.Keyboard = 0] = "Keyboard", t18[t18.Mouse = 1] = "Mouse", t18))(w || {});
typeof window != "undefined" && typeof document != "undefined" && (document.addEventListener("keydown", (e4) => {
  e4.metaKey || e4.altKey || e4.ctrlKey || (document.documentElement.dataset.headlessuiFocusVisible = "");
}, true), document.addEventListener("click", (e4) => {
  e4.detail === 1 ? delete document.documentElement.dataset.headlessuiFocusVisible : e4.detail === 0 && (document.documentElement.dataset.headlessuiFocusVisible = "");
}, true));
function y(e4) {
  e4 == null || e4.focus({ preventScroll: true });
}
var S = ["textarea", "input"].join(",");
function H(e4) {
  var r9, t18;
  return (t18 = (r9 = e4 == null ? void 0 : e4.matches) == null ? void 0 : r9.call(e4, S)) != null ? t18 : false;
}
function I2(e4, r9 = (t18) => t18) {
  return e4.slice().sort((t18, l13) => {
    let o13 = r9(t18), i8 = r9(l13);
    if (o13 === null || i8 === null) return 0;
    let n7 = o13.compareDocumentPosition(i8);
    return n7 & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : n7 & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
  });
}
function _(e4, r9) {
  return O(f2(), r9, { relativeTo: e4 });
}
function O(e4, r9, { sorted: t18 = true, relativeTo: l13 = null, skipElements: o13 = [] } = {}) {
  let i8 = Array.isArray(e4) ? e4.length > 0 ? e4[0].ownerDocument : document : e4.ownerDocument, n7 = Array.isArray(e4) ? t18 ? I2(e4) : e4 : f2(e4);
  o13.length > 0 && n7.length > 1 && (n7 = n7.filter((s17) => !o13.includes(s17))), l13 = l13 != null ? l13 : i8.activeElement;
  let E8 = (() => {
    if (r9 & 5) return 1;
    if (r9 & 10) return -1;
    throw new Error("Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last");
  })(), x4 = (() => {
    if (r9 & 1) return 0;
    if (r9 & 2) return Math.max(0, n7.indexOf(l13)) - 1;
    if (r9 & 4) return Math.max(0, n7.indexOf(l13)) + 1;
    if (r9 & 8) return n7.length - 1;
    throw new Error("Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last");
  })(), p7 = r9 & 32 ? { preventScroll: true } : {}, d16 = 0, a10 = n7.length, u13;
  do {
    if (d16 >= a10 || d16 + a10 <= 0) return 0;
    let s17 = x4 + d16;
    if (r9 & 16) s17 = (s17 + a10) % a10;
    else {
      if (s17 < 0) return 3;
      if (s17 >= a10) return 1;
    }
    u13 = n7[s17], u13 == null || u13.focus(p7), d16 += E8;
  } while (u13 !== i8.activeElement);
  return r9 & 6 && H(u13) && u13.select(), 2;
}

// node_modules/@headlessui/react/dist/utils/platform.js
function t6() {
  return /iPhone/gi.test(window.navigator.platform) || /Mac/gi.test(window.navigator.platform) && window.navigator.maxTouchPoints > 0;
}
function i3() {
  return /Android/gi.test(window.navigator.userAgent);
}
function n() {
  return t6() || i3();
}

// node_modules/@headlessui/react/dist/hooks/use-document-event.js
var import_react8 = __toESM(require_react(), 1);
function d2(e4, r9, n7) {
  let o13 = s2(r9);
  (0, import_react8.useEffect)(() => {
    function t18(u13) {
      o13.current(u13);
    }
    return document.addEventListener(e4, t18, n7), () => document.removeEventListener(e4, t18, n7);
  }, [e4, n7]);
}

// node_modules/@headlessui/react/dist/hooks/use-window-event.js
var import_react9 = __toESM(require_react(), 1);
function s6(e4, r9, n7) {
  let o13 = s2(r9);
  (0, import_react9.useEffect)(() => {
    function t18(i8) {
      o13.current(i8);
    }
    return window.addEventListener(e4, t18, n7), () => window.removeEventListener(e4, t18, n7);
  }, [e4, n7]);
}

// node_modules/@headlessui/react/dist/hooks/use-outside-click.js
function y2(s17, m12, a10 = true) {
  let i8 = (0, import_react10.useRef)(false);
  (0, import_react10.useEffect)(() => {
    requestAnimationFrame(() => {
      i8.current = a10;
    });
  }, [a10]);
  function c13(e4, r9) {
    if (!i8.current || e4.defaultPrevented) return;
    let t18 = r9(e4);
    if (t18 === null || !t18.getRootNode().contains(t18) || !t18.isConnected) return;
    let E8 = function u13(n7) {
      return typeof n7 == "function" ? u13(n7()) : Array.isArray(n7) || n7 instanceof Set ? n7 : [n7];
    }(s17);
    for (let u13 of E8) {
      if (u13 === null) continue;
      let n7 = u13 instanceof HTMLElement ? u13 : u13.current;
      if (n7 != null && n7.contains(t18) || e4.composed && e4.composedPath().includes(n7)) return;
    }
    return !h(t18, T2.Loose) && t18.tabIndex !== -1 && e4.preventDefault(), m12(e4, t18);
  }
  let o13 = (0, import_react10.useRef)(null);
  d2("pointerdown", (e4) => {
    var r9, t18;
    i8.current && (o13.current = ((t18 = (r9 = e4.composedPath) == null ? void 0 : r9.call(e4)) == null ? void 0 : t18[0]) || e4.target);
  }, true), d2("mousedown", (e4) => {
    var r9, t18;
    i8.current && (o13.current = ((t18 = (r9 = e4.composedPath) == null ? void 0 : r9.call(e4)) == null ? void 0 : t18[0]) || e4.target);
  }, true), d2("click", (e4) => {
    n() || o13.current && (c13(e4, () => o13.current), o13.current = null);
  }, true), d2("touchend", (e4) => c13(e4, () => e4.target instanceof HTMLElement ? e4.target : null), true), s6("blur", (e4) => c13(e4, () => window.document.activeElement instanceof HTMLIFrameElement ? window.document.activeElement : null), true);
}

// node_modules/@headlessui/react/dist/hooks/use-owner.js
var import_react11 = __toESM(require_react(), 1);
function n2(...e4) {
  return (0, import_react11.useMemo)(() => o7(...e4), [...e4]);
}

// node_modules/@headlessui/react/dist/hooks/use-resolve-button-type.js
var import_react12 = __toESM(require_react(), 1);
function i4(t18) {
  var n7;
  if (t18.type) return t18.type;
  let e4 = (n7 = t18.as) != null ? n7 : "button";
  if (typeof e4 == "string" && e4.toLowerCase() === "button") return "button";
}
function T3(t18, e4) {
  let [n7, u13] = (0, import_react12.useState)(() => i4(t18));
  return l(() => {
    u13(i4(t18));
  }, [t18.type, t18.as]), l(() => {
    n7 || e4.current && e4.current instanceof HTMLButtonElement && !e4.current.hasAttribute("type") && u13("button");
  }, [n7, e4]), n7;
}

// node_modules/@headlessui/react/dist/hooks/use-sync-refs.js
var import_react13 = __toESM(require_react(), 1);
var u2 = Symbol();
function T4(t18, n7 = true) {
  return Object.assign(t18, { [u2]: n7 });
}
function y3(...t18) {
  let n7 = (0, import_react13.useRef)(t18);
  (0, import_react13.useEffect)(() => {
    n7.current = t18;
  }, [t18]);
  let c13 = o2((e4) => {
    for (let o13 of n7.current) o13 != null && (typeof o13 == "function" ? o13(e4) : o13.current = e4);
  });
  return t18.every((e4) => e4 == null || (e4 == null ? void 0 : e4[u2])) ? void 0 : c13;
}

// node_modules/@headlessui/react/dist/hooks/use-tracked-pointer.js
var import_react14 = __toESM(require_react(), 1);
function t8(e4) {
  return [e4.screenX, e4.screenY];
}
function u3() {
  let e4 = (0, import_react14.useRef)([-1, -1]);
  return { wasMoved(r9) {
    let n7 = t8(r9);
    return e4.current[0] === n7[0] && e4.current[1] === n7[1] ? false : (e4.current = n7, true);
  }, update(r9) {
    e4.current = t8(r9);
  } };
}

// node_modules/@headlessui/react/dist/hooks/use-tree-walker.js
var import_react15 = __toESM(require_react(), 1);
function F2({ container: e4, accept: t18, walk: r9, enabled: c13 = true }) {
  let o13 = (0, import_react15.useRef)(t18), l13 = (0, import_react15.useRef)(r9);
  (0, import_react15.useEffect)(() => {
    o13.current = t18, l13.current = r9;
  }, [t18, r9]), l(() => {
    if (!e4 || !c13) return;
    let n7 = o7(e4);
    if (!n7) return;
    let f14 = o13.current, p7 = l13.current, d16 = Object.assign((i8) => f14(i8), { acceptNode: f14 }), u13 = n7.createTreeWalker(e4, NodeFilter.SHOW_ELEMENT, d16, false);
    for (; u13.nextNode(); ) p7(u13.currentNode);
  }, [e4, c13, o13, l13]);
}

// node_modules/@headlessui/react/dist/hooks/use-watch.js
var import_react16 = __toESM(require_react(), 1);
function m3(u13, t18) {
  let e4 = (0, import_react16.useRef)([]), r9 = o2(u13);
  (0, import_react16.useEffect)(() => {
    let o13 = [...e4.current];
    for (let [n7, a10] of t18.entries()) if (e4.current[n7] !== a10) {
      let l13 = r9(t18, o13);
      return e4.current = t18, l13;
    }
  }, [r9, ...t18]);
}

// node_modules/@headlessui/react/dist/utils/render.js
var import_react17 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/class-names.js
function t9(...r9) {
  return Array.from(new Set(r9.flatMap((n7) => typeof n7 == "string" ? n7.split(" ") : []))).filter(Boolean).join(" ");
}

// node_modules/@headlessui/react/dist/utils/render.js
var O2 = ((n7) => (n7[n7.None = 0] = "None", n7[n7.RenderStrategy = 1] = "RenderStrategy", n7[n7.Static = 2] = "Static", n7))(O2 || {});
var v = ((e4) => (e4[e4.Unmount = 0] = "Unmount", e4[e4.Hidden = 1] = "Hidden", e4))(v || {});
function C({ ourProps: r9, theirProps: t18, slot: e4, defaultTag: n7, features: o13, visible: a10 = true, name: f14, mergeRefs: l13 }) {
  l13 = l13 != null ? l13 : k;
  let s17 = R(t18, r9);
  if (a10) return m4(s17, e4, n7, f14, l13);
  let y7 = o13 != null ? o13 : 0;
  if (y7 & 2) {
    let { static: u13 = false, ...d16 } = s17;
    if (u13) return m4(d16, e4, n7, f14, l13);
  }
  if (y7 & 1) {
    let { unmount: u13 = true, ...d16 } = s17;
    return u(u13 ? 0 : 1, { [0]() {
      return null;
    }, [1]() {
      return m4({ ...d16, hidden: true, style: { display: "none" } }, e4, n7, f14, l13);
    } });
  }
  return m4(s17, e4, n7, f14, l13);
}
function m4(r9, t18 = {}, e4, n7, o13) {
  let { as: a10 = e4, children: f14, refName: l13 = "ref", ...s17 } = F3(r9, ["unmount", "static"]), y7 = r9.ref !== void 0 ? { [l13]: r9.ref } : {}, u13 = typeof f14 == "function" ? f14(t18) : f14;
  "className" in s17 && s17.className && typeof s17.className == "function" && (s17.className = s17.className(t18));
  let d16 = {};
  if (t18) {
    let i8 = false, c13 = [];
    for (let [T7, p7] of Object.entries(t18)) typeof p7 == "boolean" && (i8 = true), p7 === true && c13.push(T7);
    i8 && (d16["data-headlessui-state"] = c13.join(" "));
  }
  if (a10 === import_react17.Fragment && Object.keys(x(s17)).length > 0) {
    if (!(0, import_react17.isValidElement)(u13) || Array.isArray(u13) && u13.length > 1) throw new Error(['Passing props on "Fragment"!', "", `The current component <${n7} /> is rendering a "Fragment".`, "However we need to passthrough the following props:", Object.keys(s17).map((p7) => `  - ${p7}`).join(`
`), "", "You can apply a few solutions:", ['Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".', "Render a single element as the child so that we can forward the props onto that element."].map((p7) => `  - ${p7}`).join(`
`)].join(`
`));
    let i8 = u13.props, c13 = typeof (i8 == null ? void 0 : i8.className) == "function" ? (...p7) => t9(i8 == null ? void 0 : i8.className(...p7), s17.className) : t9(i8 == null ? void 0 : i8.className, s17.className), T7 = c13 ? { className: c13 } : {};
    return (0, import_react17.cloneElement)(u13, Object.assign({}, R(u13.props, x(F3(s17, ["ref"]))), d16, y7, { ref: o13(u13.ref, y7.ref) }, T7));
  }
  return (0, import_react17.createElement)(a10, Object.assign({}, F3(s17, ["ref"]), a10 !== import_react17.Fragment && y7, a10 !== import_react17.Fragment && d16), u13);
}
function I3() {
  let r9 = (0, import_react17.useRef)([]), t18 = (0, import_react17.useCallback)((e4) => {
    for (let n7 of r9.current) n7 != null && (typeof n7 == "function" ? n7(e4) : n7.current = e4);
  }, []);
  return (...e4) => {
    if (!e4.every((n7) => n7 == null)) return r9.current = e4, t18;
  };
}
function k(...r9) {
  return r9.every((t18) => t18 == null) ? void 0 : (t18) => {
    for (let e4 of r9) e4 != null && (typeof e4 == "function" ? e4(t18) : e4.current = t18);
  };
}
function R(...r9) {
  var n7;
  if (r9.length === 0) return {};
  if (r9.length === 1) return r9[0];
  let t18 = {}, e4 = {};
  for (let o13 of r9) for (let a10 in o13) a10.startsWith("on") && typeof o13[a10] == "function" ? ((n7 = e4[a10]) != null || (e4[a10] = []), e4[a10].push(o13[a10])) : t18[a10] = o13[a10];
  if (t18.disabled || t18["aria-disabled"]) return Object.assign(t18, Object.fromEntries(Object.keys(e4).map((o13) => [o13, void 0])));
  for (let o13 in e4) Object.assign(t18, { [o13](a10, ...f14) {
    let l13 = e4[o13];
    for (let s17 of l13) {
      if ((a10 instanceof Event || (a10 == null ? void 0 : a10.nativeEvent) instanceof Event) && a10.defaultPrevented) return;
      s17(a10, ...f14);
    }
  } });
  return t18;
}
function U(r9) {
  var t18;
  return Object.assign((0, import_react17.forwardRef)(r9), { displayName: (t18 = r9.displayName) != null ? t18 : r9.name });
}
function x(r9) {
  let t18 = Object.assign({}, r9);
  for (let e4 in t18) t18[e4] === void 0 && delete t18[e4];
  return t18;
}
function F3(r9, t18 = []) {
  let e4 = Object.assign({}, r9);
  for (let n7 of t18) n7 in e4 && delete e4[n7];
  return e4;
}

// node_modules/@headlessui/react/dist/internal/hidden.js
var p2 = "div";
var s8 = ((e4) => (e4[e4.None = 1] = "None", e4[e4.Focusable = 2] = "Focusable", e4[e4.Hidden = 4] = "Hidden", e4))(s8 || {});
function l4(d16, o13) {
  var n7;
  let { features: t18 = 1, ...e4 } = d16, r9 = { ref: o13, "aria-hidden": (t18 & 2) === 2 ? true : (n7 = e4["aria-hidden"]) != null ? n7 : void 0, hidden: (t18 & 4) === 4 ? true : void 0, style: { position: "fixed", top: 1, left: 1, width: 1, height: 0, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0", ...(t18 & 4) === 4 && (t18 & 2) !== 2 && { display: "none" } } };
  return C({ ourProps: r9, theirProps: e4, slot: {}, defaultTag: p2, name: "Hidden" });
}
var u4 = U(l4);

// node_modules/@headlessui/react/dist/internal/open-closed.js
var import_react18 = __toESM(require_react(), 1);
var n3 = (0, import_react18.createContext)(null);
n3.displayName = "OpenClosedContext";
var d5 = ((e4) => (e4[e4.Open = 1] = "Open", e4[e4.Closed = 2] = "Closed", e4[e4.Closing = 4] = "Closing", e4[e4.Opening = 8] = "Opening", e4))(d5 || {});
function u5() {
  return (0, import_react18.useContext)(n3);
}
function s9({ value: o13, children: r9 }) {
  return import_react18.default.createElement(n3.Provider, { value: o13 }, r9);
}

// node_modules/@headlessui/react/dist/utils/document-ready.js
function t11(n7) {
  function e4() {
    document.readyState !== "loading" && (n7(), document.removeEventListener("DOMContentLoaded", e4));
  }
  typeof window != "undefined" && typeof document != "undefined" && (document.addEventListener("DOMContentLoaded", e4), e4());
}

// node_modules/@headlessui/react/dist/utils/active-element-history.js
var t12 = [];
t11(() => {
  function e4(n7) {
    n7.target instanceof HTMLElement && n7.target !== document.body && t12[0] !== n7.target && (t12.unshift(n7.target), t12 = t12.filter((r9) => r9 != null && r9.isConnected), t12.splice(10));
  }
  window.addEventListener("click", e4, { capture: true }), window.addEventListener("mousedown", e4, { capture: true }), window.addEventListener("focus", e4, { capture: true }), document.body.addEventListener("click", e4, { capture: true }), document.body.addEventListener("mousedown", e4, { capture: true }), document.body.addEventListener("focus", e4, { capture: true });
});

// node_modules/@headlessui/react/dist/utils/bugs.js
function r2(n7) {
  let e4 = n7.parentElement, l13 = null;
  for (; e4 && !(e4 instanceof HTMLFieldSetElement); ) e4 instanceof HTMLLegendElement && (l13 = e4), e4 = e4.parentElement;
  let t18 = (e4 == null ? void 0 : e4.getAttribute("disabled")) === "";
  return t18 && i6(l13) ? false : t18;
}
function i6(n7) {
  if (!n7) return false;
  let e4 = n7.previousElementSibling;
  for (; e4 !== null; ) {
    if (e4 instanceof HTMLLegendElement) return false;
    e4 = e4.previousElementSibling;
  }
  return true;
}

// node_modules/@headlessui/react/dist/utils/calculate-active-index.js
function u6(l13) {
  throw new Error("Unexpected object: " + l13);
}
var c3 = ((i8) => (i8[i8.First = 0] = "First", i8[i8.Previous = 1] = "Previous", i8[i8.Next = 2] = "Next", i8[i8.Last = 3] = "Last", i8[i8.Specific = 4] = "Specific", i8[i8.Nothing = 5] = "Nothing", i8))(c3 || {});
function f5(l13, n7) {
  let t18 = n7.resolveItems();
  if (t18.length <= 0) return null;
  let r9 = n7.resolveActiveIndex(), s17 = r9 != null ? r9 : -1;
  switch (l13.focus) {
    case 0: {
      for (let e4 = 0; e4 < t18.length; ++e4) if (!n7.resolveDisabled(t18[e4], e4, t18)) return e4;
      return r9;
    }
    case 1: {
      for (let e4 = s17 - 1; e4 >= 0; --e4) if (!n7.resolveDisabled(t18[e4], e4, t18)) return e4;
      return r9;
    }
    case 2: {
      for (let e4 = s17 + 1; e4 < t18.length; ++e4) if (!n7.resolveDisabled(t18[e4], e4, t18)) return e4;
      return r9;
    }
    case 3: {
      for (let e4 = t18.length - 1; e4 >= 0; --e4) if (!n7.resolveDisabled(t18[e4], e4, t18)) return e4;
      return r9;
    }
    case 4: {
      for (let e4 = 0; e4 < t18.length; ++e4) if (n7.resolveId(t18[e4], e4, t18) === l13.id) return e4;
      return r9;
    }
    case 5:
      return null;
    default:
      u6(l13);
  }
}

// node_modules/@headlessui/react/dist/utils/form.js
function e(i8 = {}, s17 = null, t18 = []) {
  for (let [r9, n7] of Object.entries(i8)) o10(t18, f6(s17, r9), n7);
  return t18;
}
function f6(i8, s17) {
  return i8 ? i8 + "[" + s17 + "]" : s17;
}
function o10(i8, s17, t18) {
  if (Array.isArray(t18)) for (let [r9, n7] of t18.entries()) o10(i8, f6(s17, r9.toString()), n7);
  else t18 instanceof Date ? i8.push([s17, t18.toISOString()]) : typeof t18 == "boolean" ? i8.push([s17, t18 ? "1" : "0"]) : typeof t18 == "string" ? i8.push([s17, t18]) : typeof t18 == "number" ? i8.push([s17, `${t18}`]) : t18 == null ? i8.push([s17, ""]) : e(t18, s17, i8);
}
function p4(i8) {
  var t18, r9;
  let s17 = (t18 = i8 == null ? void 0 : i8.form) != null ? t18 : i8.closest("form");
  if (s17) {
    for (let n7 of s17.elements) if (n7 !== i8 && (n7.tagName === "INPUT" && n7.type === "submit" || n7.tagName === "BUTTON" && n7.type === "submit" || n7.nodeName === "INPUT" && n7.type === "image")) {
      n7.click();
      return;
    }
    (r9 = s17.requestSubmit) == null || r9.call(s17);
  }
}

// node_modules/@headlessui/react/dist/components/keyboard.js
var o11 = ((r9) => (r9.Space = " ", r9.Enter = "Enter", r9.Escape = "Escape", r9.Backspace = "Backspace", r9.Delete = "Delete", r9.ArrowLeft = "ArrowLeft", r9.ArrowUp = "ArrowUp", r9.ArrowRight = "ArrowRight", r9.ArrowDown = "ArrowDown", r9.Home = "Home", r9.End = "End", r9.PageUp = "PageUp", r9.PageDown = "PageDown", r9.Tab = "Tab", r9))(o11 || {});

// node_modules/@headlessui/react/dist/components/combobox/combobox.js
var $e = ((o13) => (o13[o13.Open = 0] = "Open", o13[o13.Closed = 1] = "Closed", o13))($e || {});
var qe = ((o13) => (o13[o13.Single = 0] = "Single", o13[o13.Multi = 1] = "Multi", o13))(qe || {});
var ze = ((a10) => (a10[a10.Pointer = 0] = "Pointer", a10[a10.Focus = 1] = "Focus", a10[a10.Other = 2] = "Other", a10))(ze || {});
var Ye = ((e4) => (e4[e4.OpenCombobox = 0] = "OpenCombobox", e4[e4.CloseCombobox = 1] = "CloseCombobox", e4[e4.GoToOption = 2] = "GoToOption", e4[e4.RegisterOption = 3] = "RegisterOption", e4[e4.UnregisterOption = 4] = "UnregisterOption", e4[e4.RegisterLabel = 5] = "RegisterLabel", e4[e4.SetActivationTrigger = 6] = "SetActivationTrigger", e4[e4.UpdateVirtualOptions = 7] = "UpdateVirtualOptions", e4))(Ye || {});
function de(t18, r9 = (o13) => o13) {
  let o13 = t18.activeOptionIndex !== null ? t18.options[t18.activeOptionIndex] : null, a10 = r9(t18.options.slice()), i8 = a10.length > 0 && a10[0].dataRef.current.order !== null ? a10.sort((p7, c13) => p7.dataRef.current.order - c13.dataRef.current.order) : I2(a10, (p7) => p7.dataRef.current.domRef.current), u13 = o13 ? i8.indexOf(o13) : null;
  return u13 === -1 && (u13 = null), { options: i8, activeOptionIndex: u13 };
}
var Qe = { [1](t18) {
  var r9;
  return (r9 = t18.dataRef.current) != null && r9.disabled || t18.comboboxState === 1 ? t18 : { ...t18, activeOptionIndex: null, comboboxState: 1 };
}, [0](t18) {
  var r9, o13;
  if ((r9 = t18.dataRef.current) != null && r9.disabled || t18.comboboxState === 0) return t18;
  if ((o13 = t18.dataRef.current) != null && o13.value) {
    let a10 = t18.dataRef.current.calculateIndex(t18.dataRef.current.value);
    if (a10 !== -1) return { ...t18, activeOptionIndex: a10, comboboxState: 0 };
  }
  return { ...t18, comboboxState: 0 };
}, [2](t18, r9) {
  var u13, p7, c13, e4, l13;
  if ((u13 = t18.dataRef.current) != null && u13.disabled || (p7 = t18.dataRef.current) != null && p7.optionsRef.current && !((c13 = t18.dataRef.current) != null && c13.optionsPropsRef.current.static) && t18.comboboxState === 1) return t18;
  if (t18.virtual) {
    let T7 = r9.focus === c3.Specific ? r9.idx : f5(r9, { resolveItems: () => t18.virtual.options, resolveActiveIndex: () => {
      var f14, v6;
      return (v6 = (f14 = t18.activeOptionIndex) != null ? f14 : t18.virtual.options.findIndex((S10) => !t18.virtual.disabled(S10))) != null ? v6 : null;
    }, resolveDisabled: t18.virtual.disabled, resolveId() {
      throw new Error("Function not implemented.");
    } }), g5 = (e4 = r9.trigger) != null ? e4 : 2;
    return t18.activeOptionIndex === T7 && t18.activationTrigger === g5 ? t18 : { ...t18, activeOptionIndex: T7, activationTrigger: g5 };
  }
  let o13 = de(t18);
  if (o13.activeOptionIndex === null) {
    let T7 = o13.options.findIndex((g5) => !g5.dataRef.current.disabled);
    T7 !== -1 && (o13.activeOptionIndex = T7);
  }
  let a10 = r9.focus === c3.Specific ? r9.idx : f5(r9, { resolveItems: () => o13.options, resolveActiveIndex: () => o13.activeOptionIndex, resolveId: (T7) => T7.id, resolveDisabled: (T7) => T7.dataRef.current.disabled }), i8 = (l13 = r9.trigger) != null ? l13 : 2;
  return t18.activeOptionIndex === a10 && t18.activationTrigger === i8 ? t18 : { ...t18, ...o13, activeOptionIndex: a10, activationTrigger: i8 };
}, [3]: (t18, r9) => {
  var u13, p7, c13;
  if ((u13 = t18.dataRef.current) != null && u13.virtual) return { ...t18, options: [...t18.options, r9.payload] };
  let o13 = r9.payload, a10 = de(t18, (e4) => (e4.push(o13), e4));
  t18.activeOptionIndex === null && (p7 = t18.dataRef.current) != null && p7.isSelected(r9.payload.dataRef.current.value) && (a10.activeOptionIndex = a10.options.indexOf(o13));
  let i8 = { ...t18, ...a10, activationTrigger: 2 };
  return (c13 = t18.dataRef.current) != null && c13.__demoMode && t18.dataRef.current.value === void 0 && (i8.activeOptionIndex = 0), i8;
}, [4]: (t18, r9) => {
  var a10;
  if ((a10 = t18.dataRef.current) != null && a10.virtual) return { ...t18, options: t18.options.filter((i8) => i8.id !== r9.id) };
  let o13 = de(t18, (i8) => {
    let u13 = i8.findIndex((p7) => p7.id === r9.id);
    return u13 !== -1 && i8.splice(u13, 1), i8;
  });
  return { ...t18, ...o13, activationTrigger: 2 };
}, [5]: (t18, r9) => t18.labelId === r9.id ? t18 : { ...t18, labelId: r9.id }, [6]: (t18, r9) => t18.activationTrigger === r9.trigger ? t18 : { ...t18, activationTrigger: r9.trigger }, [7]: (t18, r9) => {
  var a10;
  if (((a10 = t18.virtual) == null ? void 0 : a10.options) === r9.options) return t18;
  let o13 = t18.activeOptionIndex;
  if (t18.activeOptionIndex !== null) {
    let i8 = r9.options.indexOf(t18.virtual.options[t18.activeOptionIndex]);
    i8 !== -1 ? o13 = i8 : o13 = null;
  }
  return { ...t18, activeOptionIndex: o13, virtual: Object.assign({}, t18.virtual, { options: r9.options }) };
} };
var be = (0, import_react19.createContext)(null);
be.displayName = "ComboboxActionsContext";
function ee(t18) {
  let r9 = (0, import_react19.useContext)(be);
  if (r9 === null) {
    let o13 = new Error(`<${t18} /> is missing a parent <Combobox /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(o13, ee), o13;
  }
  return r9;
}
var Ce = (0, import_react19.createContext)(null);
function Ze(t18) {
  var c13;
  let r9 = j2("VirtualProvider"), [o13, a10] = (0, import_react19.useMemo)(() => {
    let e4 = r9.optionsRef.current;
    if (!e4) return [0, 0];
    let l13 = window.getComputedStyle(e4);
    return [parseFloat(l13.paddingBlockStart || l13.paddingTop), parseFloat(l13.paddingBlockEnd || l13.paddingBottom)];
  }, [r9.optionsRef.current]), i8 = useVirtualizer({ scrollPaddingStart: o13, scrollPaddingEnd: a10, count: r9.virtual.options.length, estimateSize() {
    return 40;
  }, getScrollElement() {
    var e4;
    return (e4 = r9.optionsRef.current) != null ? e4 : null;
  }, overscan: 12 }), [u13, p7] = (0, import_react19.useState)(0);
  return l(() => {
    p7((e4) => e4 + 1);
  }, [(c13 = r9.virtual) == null ? void 0 : c13.options]), import_react19.default.createElement(Ce.Provider, { value: i8 }, import_react19.default.createElement("div", { style: { position: "relative", width: "100%", height: `${i8.getTotalSize()}px` }, ref: (e4) => {
    if (e4) {
      if (typeof process != "undefined" && process.env.JEST_WORKER_ID !== void 0 || r9.activationTrigger === 0) return;
      r9.activeOptionIndex !== null && r9.virtual.options.length > r9.activeOptionIndex && i8.scrollToIndex(r9.activeOptionIndex);
    }
  } }, i8.getVirtualItems().map((e4) => {
    var l13;
    return import_react19.default.createElement(import_react19.Fragment, { key: e4.key }, import_react19.default.cloneElement((l13 = t18.children) == null ? void 0 : l13.call(t18, { option: r9.virtual.options[e4.index], open: r9.comboboxState === 0 }), { key: `${u13}-${e4.key}`, "data-index": e4.index, "aria-setsize": r9.virtual.options.length, "aria-posinset": e4.index + 1, style: { position: "absolute", top: 0, left: 0, transform: `translateY(${e4.start}px)`, overflowAnchor: "none" } }));
  })));
}
var ce = (0, import_react19.createContext)(null);
ce.displayName = "ComboboxDataContext";
function j2(t18) {
  let r9 = (0, import_react19.useContext)(ce);
  if (r9 === null) {
    let o13 = new Error(`<${t18} /> is missing a parent <Combobox /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(o13, j2), o13;
  }
  return r9;
}
function et(t18, r9) {
  return u(r9.type, Qe, t18, r9);
}
var tt = import_react19.Fragment;
function ot(t18, r9) {
  var fe4;
  let { value: o13, defaultValue: a10, onChange: i8, form: u13, name: p7, by: c13 = null, disabled: e4 = false, __demoMode: l13 = false, nullable: T7 = false, multiple: g5 = false, immediate: f14 = false, virtual: v6 = null, ...S10 } = t18, R4 = false, s17 = null, [I11 = g5 ? [] : void 0, V5] = T(o13, i8, a10), [_5, E8] = (0, import_react19.useReducer)(et, { dataRef: (0, import_react19.createRef)(), comboboxState: l13 ? 0 : 1, options: [], virtual: s17 ? { options: s17.options, disabled: (fe4 = s17.disabled) != null ? fe4 : () => false } : null, activeOptionIndex: null, activationTrigger: 2, labelId: null }), k3 = (0, import_react19.useRef)(false), J6 = (0, import_react19.useRef)({ static: false, hold: false }), K4 = (0, import_react19.useRef)(null), z4 = (0, import_react19.useRef)(null), te5 = (0, import_react19.useRef)(null), X5 = (0, import_react19.useRef)(null), x4 = o2(typeof c13 == "string" ? (d16, b7) => {
    let P5 = c13;
    return (d16 == null ? void 0 : d16[P5]) === (b7 == null ? void 0 : b7[P5]);
  } : c13 != null ? c13 : (d16, b7) => d16 === b7), O4 = o2((d16) => s17 ? c13 === null ? s17.options.indexOf(d16) : s17.options.findIndex((b7) => x4(b7, d16)) : _5.options.findIndex((b7) => x4(b7.dataRef.current.value, d16))), L2 = (0, import_react19.useCallback)((d16) => u(n7.mode, { [1]: () => I11.some((b7) => x4(b7, d16)), [0]: () => x4(I11, d16) }), [I11]), oe5 = o2((d16) => _5.activeOptionIndex === O4(d16)), n7 = (0, import_react19.useMemo)(() => ({ ..._5, immediate: R4, optionsPropsRef: J6, labelRef: K4, inputRef: z4, buttonRef: te5, optionsRef: X5, value: I11, defaultValue: a10, disabled: e4, mode: g5 ? 1 : 0, virtual: _5.virtual, get activeOptionIndex() {
    if (k3.current && _5.activeOptionIndex === null && (s17 ? s17.options.length > 0 : _5.options.length > 0)) {
      if (s17) {
        let b7 = s17.options.findIndex((P5) => {
          var G4, Y3;
          return !((Y3 = (G4 = s17 == null ? void 0 : s17.disabled) == null ? void 0 : G4.call(s17, P5)) != null && Y3);
        });
        if (b7 !== -1) return b7;
      }
      let d16 = _5.options.findIndex((b7) => !b7.dataRef.current.disabled);
      if (d16 !== -1) return d16;
    }
    return _5.activeOptionIndex;
  }, calculateIndex: O4, compare: x4, isSelected: L2, isActive: oe5, nullable: T7, __demoMode: l13 }), [I11, a10, e4, g5, T7, l13, _5, s17]);
  l(() => {
    s17 && E8({ type: 7, options: s17.options });
  }, [s17, s17 == null ? void 0 : s17.options]), l(() => {
    _5.dataRef.current = n7;
  }, [n7]), y2([n7.buttonRef, n7.inputRef, n7.optionsRef], () => le3.closeCombobox(), n7.comboboxState === 0);
  let F10 = (0, import_react19.useMemo)(() => {
    var d16, b7, P5;
    return { open: n7.comboboxState === 0, disabled: e4, activeIndex: n7.activeOptionIndex, activeOption: n7.activeOptionIndex === null ? null : n7.virtual ? n7.virtual.options[(d16 = n7.activeOptionIndex) != null ? d16 : 0] : (P5 = (b7 = n7.options[n7.activeOptionIndex]) == null ? void 0 : b7.dataRef.current.value) != null ? P5 : null, value: I11 };
  }, [n7, e4, I11]), A3 = o2(() => {
    if (n7.activeOptionIndex !== null) {
      if (n7.virtual) ae3(n7.virtual.options[n7.activeOptionIndex]);
      else {
        let { dataRef: d16 } = n7.options[n7.activeOptionIndex];
        ae3(d16.current.value);
      }
      le3.goToOption(c3.Specific, n7.activeOptionIndex);
    }
  }), h9 = o2(() => {
    E8({ type: 0 }), k3.current = true;
  }), C7 = o2(() => {
    E8({ type: 1 }), k3.current = false;
  }), D7 = o2((d16, b7, P5) => (k3.current = false, d16 === c3.Specific ? E8({ type: 2, focus: c3.Specific, idx: b7, trigger: P5 }) : E8({ type: 2, focus: d16, trigger: P5 }))), N7 = o2((d16, b7) => (E8({ type: 3, payload: { id: d16, dataRef: b7 } }), () => {
    n7.isActive(b7.current.value) && (k3.current = true), E8({ type: 4, id: d16 });
  })), ye6 = o2((d16) => (E8({ type: 5, id: d16 }), () => E8({ type: 5, id: null }))), ae3 = o2((d16) => u(n7.mode, { [0]() {
    return V5 == null ? void 0 : V5(d16);
  }, [1]() {
    let b7 = n7.value.slice(), P5 = b7.findIndex((G4) => x4(G4, d16));
    return P5 === -1 ? b7.push(d16) : b7.splice(P5, 1), V5 == null ? void 0 : V5(b7);
  } })), Re4 = o2((d16) => {
    E8({ type: 6, trigger: d16 });
  }), le3 = (0, import_react19.useMemo)(() => ({ onChange: ae3, registerOption: N7, registerLabel: ye6, goToOption: D7, closeCombobox: C7, openCombobox: h9, setActivationTrigger: Re4, selectActiveOption: A3 }), []), Ae5 = r9 === null ? {} : { ref: r9 }, ne5 = (0, import_react19.useRef)(null), Se5 = p();
  return (0, import_react19.useEffect)(() => {
    ne5.current && a10 !== void 0 && Se5.addEventListener(ne5.current, "reset", () => {
      V5 == null || V5(a10);
    });
  }, [ne5, V5]), import_react19.default.createElement(be.Provider, { value: le3 }, import_react19.default.createElement(ce.Provider, { value: n7 }, import_react19.default.createElement(s9, { value: u(n7.comboboxState, { [0]: d5.Open, [1]: d5.Closed }) }, p7 != null && I11 != null && e({ [p7]: I11 }).map(([d16, b7], P5) => import_react19.default.createElement(u4, { features: s8.Hidden, ref: P5 === 0 ? (G4) => {
    var Y3;
    ne5.current = (Y3 = G4 == null ? void 0 : G4.closest("form")) != null ? Y3 : null;
  } : void 0, ...x({ key: d16, as: "input", type: "hidden", hidden: true, readOnly: true, form: u13, disabled: e4, name: d16, value: b7 }) })), C({ ourProps: Ae5, theirProps: S10, slot: F10, defaultTag: tt, name: "Combobox" }))));
}
var nt = "input";
function rt(t18, r9) {
  var X5, x4, O4, L2, oe5;
  let o13 = I(), { id: a10 = `headlessui-combobox-input-${o13}`, onChange: i8, displayValue: u13, type: p7 = "text", ...c13 } = t18, e4 = j2("Combobox.Input"), l13 = ee("Combobox.Input"), T7 = y3(e4.inputRef, r9), g5 = n2(e4.inputRef), f14 = (0, import_react19.useRef)(false), v6 = p(), S10 = o2(() => {
    l13.onChange(null), e4.optionsRef.current && (e4.optionsRef.current.scrollTop = 0), l13.goToOption(c3.Nothing);
  }), R4 = function() {
    var n7;
    return typeof u13 == "function" && e4.value !== void 0 ? (n7 = u13(e4.value)) != null ? n7 : "" : typeof e4.value == "string" ? e4.value : "";
  }();
  m3(([n7, F10], [A3, h9]) => {
    if (f14.current) return;
    let C7 = e4.inputRef.current;
    C7 && ((h9 === 0 && F10 === 1 || n7 !== A3) && (C7.value = n7), requestAnimationFrame(() => {
      if (f14.current || !C7 || (g5 == null ? void 0 : g5.activeElement) !== C7) return;
      let { selectionStart: D7, selectionEnd: N7 } = C7;
      Math.abs((N7 != null ? N7 : 0) - (D7 != null ? D7 : 0)) === 0 && D7 === 0 && C7.setSelectionRange(C7.value.length, C7.value.length);
    }));
  }, [R4, e4.comboboxState, g5]), m3(([n7], [F10]) => {
    if (n7 === 0 && F10 === 1) {
      if (f14.current) return;
      let A3 = e4.inputRef.current;
      if (!A3) return;
      let h9 = A3.value, { selectionStart: C7, selectionEnd: D7, selectionDirection: N7 } = A3;
      A3.value = "", A3.value = h9, N7 !== null ? A3.setSelectionRange(C7, D7, N7) : A3.setSelectionRange(C7, D7);
    }
  }, [e4.comboboxState]);
  let s17 = (0, import_react19.useRef)(false), I11 = o2(() => {
    s17.current = true;
  }), V5 = o2(() => {
    v6.nextFrame(() => {
      s17.current = false;
    });
  }), _5 = o2((n7) => {
    switch (f14.current = true, n7.key) {
      case o11.Enter:
        if (f14.current = false, e4.comboboxState !== 0 || s17.current) return;
        if (n7.preventDefault(), n7.stopPropagation(), e4.activeOptionIndex === null) {
          l13.closeCombobox();
          return;
        }
        l13.selectActiveOption(), e4.mode === 0 && l13.closeCombobox();
        break;
      case o11.ArrowDown:
        return f14.current = false, n7.preventDefault(), n7.stopPropagation(), u(e4.comboboxState, { [0]: () => l13.goToOption(c3.Next), [1]: () => l13.openCombobox() });
      case o11.ArrowUp:
        return f14.current = false, n7.preventDefault(), n7.stopPropagation(), u(e4.comboboxState, { [0]: () => l13.goToOption(c3.Previous), [1]: () => {
          l13.openCombobox(), v6.nextFrame(() => {
            e4.value || l13.goToOption(c3.Last);
          });
        } });
      case o11.Home:
        if (n7.shiftKey) break;
        return f14.current = false, n7.preventDefault(), n7.stopPropagation(), l13.goToOption(c3.First);
      case o11.PageUp:
        return f14.current = false, n7.preventDefault(), n7.stopPropagation(), l13.goToOption(c3.First);
      case o11.End:
        if (n7.shiftKey) break;
        return f14.current = false, n7.preventDefault(), n7.stopPropagation(), l13.goToOption(c3.Last);
      case o11.PageDown:
        return f14.current = false, n7.preventDefault(), n7.stopPropagation(), l13.goToOption(c3.Last);
      case o11.Escape:
        return f14.current = false, e4.comboboxState !== 0 ? void 0 : (n7.preventDefault(), e4.optionsRef.current && !e4.optionsPropsRef.current.static && n7.stopPropagation(), e4.nullable && e4.mode === 0 && e4.value === null && S10(), l13.closeCombobox());
      case o11.Tab:
        if (f14.current = false, e4.comboboxState !== 0) return;
        e4.mode === 0 && e4.activationTrigger !== 1 && l13.selectActiveOption(), l13.closeCombobox();
        break;
    }
  }), E8 = o2((n7) => {
    i8 == null || i8(n7), e4.nullable && e4.mode === 0 && n7.target.value === "" && S10(), l13.openCombobox();
  }), k3 = o2((n7) => {
    var A3, h9, C7;
    let F10 = (A3 = n7.relatedTarget) != null ? A3 : t12.find((D7) => D7 !== n7.currentTarget);
    if (f14.current = false, !((h9 = e4.optionsRef.current) != null && h9.contains(F10)) && !((C7 = e4.buttonRef.current) != null && C7.contains(F10)) && e4.comboboxState === 0) return n7.preventDefault(), e4.mode === 0 && (e4.nullable && e4.value === null ? S10() : e4.activationTrigger !== 1 && l13.selectActiveOption()), l13.closeCombobox();
  }), J6 = o2((n7) => {
    var A3, h9, C7;
    let F10 = (A3 = n7.relatedTarget) != null ? A3 : t12.find((D7) => D7 !== n7.currentTarget);
    (h9 = e4.buttonRef.current) != null && h9.contains(F10) || (C7 = e4.optionsRef.current) != null && C7.contains(F10) || e4.disabled || e4.immediate && e4.comboboxState !== 0 && (l13.openCombobox(), v6.nextFrame(() => {
      l13.setActivationTrigger(1);
    }));
  }), K4 = i2(() => {
    if (e4.labelId) return [e4.labelId].join(" ");
  }, [e4.labelId]), z4 = (0, import_react19.useMemo)(() => ({ open: e4.comboboxState === 0, disabled: e4.disabled }), [e4]), te5 = { ref: T7, id: a10, role: "combobox", type: p7, "aria-controls": (X5 = e4.optionsRef.current) == null ? void 0 : X5.id, "aria-expanded": e4.comboboxState === 0, "aria-activedescendant": e4.activeOptionIndex === null ? void 0 : e4.virtual ? (x4 = e4.options.find((n7) => {
    var F10;
    return !((F10 = e4.virtual) != null && F10.disabled(n7.dataRef.current.value)) && e4.compare(n7.dataRef.current.value, e4.virtual.options[e4.activeOptionIndex]);
  })) == null ? void 0 : x4.id : (O4 = e4.options[e4.activeOptionIndex]) == null ? void 0 : O4.id, "aria-labelledby": K4, "aria-autocomplete": "list", defaultValue: (oe5 = (L2 = t18.defaultValue) != null ? L2 : e4.defaultValue !== void 0 ? u13 == null ? void 0 : u13(e4.defaultValue) : null) != null ? oe5 : e4.defaultValue, disabled: e4.disabled, onCompositionStart: I11, onCompositionEnd: V5, onKeyDown: _5, onChange: E8, onFocus: J6, onBlur: k3 };
  return C({ ourProps: te5, theirProps: c13, slot: z4, defaultTag: nt, name: "Combobox.Input" });
}
var at = "button";
function lt(t18, r9) {
  var S10;
  let o13 = j2("Combobox.Button"), a10 = ee("Combobox.Button"), i8 = y3(o13.buttonRef, r9), u13 = I(), { id: p7 = `headlessui-combobox-button-${u13}`, ...c13 } = t18, e4 = p(), l13 = o2((R4) => {
    switch (R4.key) {
      case o11.ArrowDown:
        return R4.preventDefault(), R4.stopPropagation(), o13.comboboxState === 1 && a10.openCombobox(), e4.nextFrame(() => {
          var s17;
          return (s17 = o13.inputRef.current) == null ? void 0 : s17.focus({ preventScroll: true });
        });
      case o11.ArrowUp:
        return R4.preventDefault(), R4.stopPropagation(), o13.comboboxState === 1 && (a10.openCombobox(), e4.nextFrame(() => {
          o13.value || a10.goToOption(c3.Last);
        })), e4.nextFrame(() => {
          var s17;
          return (s17 = o13.inputRef.current) == null ? void 0 : s17.focus({ preventScroll: true });
        });
      case o11.Escape:
        return o13.comboboxState !== 0 ? void 0 : (R4.preventDefault(), o13.optionsRef.current && !o13.optionsPropsRef.current.static && R4.stopPropagation(), a10.closeCombobox(), e4.nextFrame(() => {
          var s17;
          return (s17 = o13.inputRef.current) == null ? void 0 : s17.focus({ preventScroll: true });
        }));
      default:
        return;
    }
  }), T7 = o2((R4) => {
    if (r2(R4.currentTarget)) return R4.preventDefault();
    o13.comboboxState === 0 ? a10.closeCombobox() : (R4.preventDefault(), a10.openCombobox()), e4.nextFrame(() => {
      var s17;
      return (s17 = o13.inputRef.current) == null ? void 0 : s17.focus({ preventScroll: true });
    });
  }), g5 = i2(() => {
    if (o13.labelId) return [o13.labelId, p7].join(" ");
  }, [o13.labelId, p7]), f14 = (0, import_react19.useMemo)(() => ({ open: o13.comboboxState === 0, disabled: o13.disabled, value: o13.value }), [o13]), v6 = { ref: i8, id: p7, type: T3(t18, o13.buttonRef), tabIndex: -1, "aria-haspopup": "listbox", "aria-controls": (S10 = o13.optionsRef.current) == null ? void 0 : S10.id, "aria-expanded": o13.comboboxState === 0, "aria-labelledby": g5, disabled: o13.disabled, onClick: T7, onKeyDown: l13 };
  return C({ ourProps: v6, theirProps: c13, slot: f14, defaultTag: at, name: "Combobox.Button" });
}
var it = "label";
function ut(t18, r9) {
  let o13 = I(), { id: a10 = `headlessui-combobox-label-${o13}`, ...i8 } = t18, u13 = j2("Combobox.Label"), p7 = ee("Combobox.Label"), c13 = y3(u13.labelRef, r9);
  l(() => p7.registerLabel(a10), [a10]);
  let e4 = o2(() => {
    var g5;
    return (g5 = u13.inputRef.current) == null ? void 0 : g5.focus({ preventScroll: true });
  }), l13 = (0, import_react19.useMemo)(() => ({ open: u13.comboboxState === 0, disabled: u13.disabled }), [u13]);
  return C({ ourProps: { ref: c13, id: a10, onClick: e4 }, theirProps: i8, slot: l13, defaultTag: it, name: "Combobox.Label" });
}
var pt = "ul";
var st = O2.RenderStrategy | O2.Static;
function dt(t18, r9) {
  let o13 = I(), { id: a10 = `headlessui-combobox-options-${o13}`, hold: i8 = false, ...u13 } = t18, p7 = j2("Combobox.Options"), c13 = y3(p7.optionsRef, r9), e4 = u5(), l13 = (() => e4 !== null ? (e4 & d5.Open) === d5.Open : p7.comboboxState === 0)();
  l(() => {
    var v6;
    p7.optionsPropsRef.current.static = (v6 = t18.static) != null ? v6 : false;
  }, [p7.optionsPropsRef, t18.static]), l(() => {
    p7.optionsPropsRef.current.hold = i8;
  }, [p7.optionsPropsRef, i8]), F2({ container: p7.optionsRef.current, enabled: p7.comboboxState === 0, accept(v6) {
    return v6.getAttribute("role") === "option" ? NodeFilter.FILTER_REJECT : v6.hasAttribute("role") ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
  }, walk(v6) {
    v6.setAttribute("role", "none");
  } });
  let T7 = i2(() => {
    var v6, S10;
    return (S10 = p7.labelId) != null ? S10 : (v6 = p7.buttonRef.current) == null ? void 0 : v6.id;
  }, [p7.labelId, p7.buttonRef.current]), g5 = (0, import_react19.useMemo)(() => ({ open: p7.comboboxState === 0, option: void 0 }), [p7]), f14 = { "aria-labelledby": T7, role: "listbox", "aria-multiselectable": p7.mode === 1 ? true : void 0, id: a10, ref: c13 };
  return p7.virtual && p7.comboboxState === 0 && Object.assign(u13, { children: import_react19.default.createElement(Ze, null, u13.children) }), C({ ourProps: f14, theirProps: u13, slot: g5, defaultTag: pt, features: st, visible: l13, name: "Combobox.Options" });
}
var bt = "li";
function ct(t18, r9) {
  var X5;
  let o13 = I(), { id: a10 = `headlessui-combobox-option-${o13}`, disabled: i8 = false, value: u13, order: p7 = null, ...c13 } = t18, e4 = j2("Combobox.Option"), l13 = ee("Combobox.Option"), T7 = e4.virtual ? e4.activeOptionIndex === e4.calculateIndex(u13) : e4.activeOptionIndex === null ? false : ((X5 = e4.options[e4.activeOptionIndex]) == null ? void 0 : X5.id) === a10, g5 = e4.isSelected(u13), f14 = (0, import_react19.useRef)(null), v6 = s2({ disabled: i8, value: u13, domRef: f14, order: p7 }), S10 = (0, import_react19.useContext)(Ce), R4 = y3(r9, f14, S10 ? S10.measureElement : null), s17 = o2(() => l13.onChange(u13));
  l(() => l13.registerOption(a10, v6), [v6, a10]);
  let I11 = (0, import_react19.useRef)(!(e4.virtual || e4.__demoMode));
  l(() => {
    if (!e4.virtual || !e4.__demoMode) return;
    let x4 = o4();
    return x4.requestAnimationFrame(() => {
      I11.current = true;
    }), x4.dispose;
  }, [e4.virtual, e4.__demoMode]), l(() => {
    if (!I11.current || e4.comboboxState !== 0 || !T7 || e4.activationTrigger === 0) return;
    let x4 = o4();
    return x4.requestAnimationFrame(() => {
      var O4, L2;
      (L2 = (O4 = f14.current) == null ? void 0 : O4.scrollIntoView) == null || L2.call(O4, { block: "nearest" });
    }), x4.dispose;
  }, [f14, T7, e4.comboboxState, e4.activationTrigger, e4.activeOptionIndex]);
  let V5 = o2((x4) => {
    var O4;
    if (i8 || (O4 = e4.virtual) != null && O4.disabled(u13)) return x4.preventDefault();
    s17(), n() || requestAnimationFrame(() => {
      var L2;
      return (L2 = e4.inputRef.current) == null ? void 0 : L2.focus({ preventScroll: true });
    }), e4.mode === 0 && requestAnimationFrame(() => l13.closeCombobox());
  }), _5 = o2(() => {
    var O4;
    if (i8 || (O4 = e4.virtual) != null && O4.disabled(u13)) return l13.goToOption(c3.Nothing);
    let x4 = e4.calculateIndex(u13);
    l13.goToOption(c3.Specific, x4);
  }), E8 = u3(), k3 = o2((x4) => E8.update(x4)), J6 = o2((x4) => {
    var L2;
    if (!E8.wasMoved(x4) || i8 || (L2 = e4.virtual) != null && L2.disabled(u13) || T7) return;
    let O4 = e4.calculateIndex(u13);
    l13.goToOption(c3.Specific, O4, 0);
  }), K4 = o2((x4) => {
    var O4;
    E8.wasMoved(x4) && (i8 || (O4 = e4.virtual) != null && O4.disabled(u13) || T7 && (e4.optionsPropsRef.current.hold || l13.goToOption(c3.Nothing)));
  }), z4 = (0, import_react19.useMemo)(() => ({ active: T7, selected: g5, disabled: i8 }), [T7, g5, i8]);
  return C({ ourProps: { id: a10, ref: R4, role: "option", tabIndex: i8 === true ? void 0 : -1, "aria-disabled": i8 === true ? true : void 0, "aria-selected": g5, disabled: void 0, onClick: V5, onFocus: _5, onPointerEnter: k3, onMouseEnter: k3, onPointerMove: J6, onMouseMove: J6, onPointerLeave: K4, onMouseLeave: K4 }, theirProps: c13, slot: z4, defaultTag: bt, name: "Combobox.Option" });
}
var ft = U(ot);
var mt = U(lt);
var Tt = U(rt);
var xt = U(ut);
var gt = U(dt);
var vt = U(ct);
var qt = Object.assign(ft, { Input: Tt, Button: mt, Label: xt, Options: gt, Option: vt });

// node_modules/@headlessui/react/dist/components/dialog/dialog.js
var import_react30 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/components/focus-trap/focus-trap.js
var import_react24 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/hooks/use-event-listener.js
var import_react20 = __toESM(require_react(), 1);
function E3(n7, e4, a10, t18) {
  let i8 = s2(a10);
  (0, import_react20.useEffect)(() => {
    n7 = n7 != null ? n7 : window;
    function r9(o13) {
      i8.current(o13);
    }
    return n7.addEventListener(e4, r9, t18), () => n7.removeEventListener(e4, r9, t18);
  }, [n7, e4, t18]);
}

// node_modules/@headlessui/react/dist/hooks/use-is-mounted.js
var import_react21 = __toESM(require_react(), 1);
function f7() {
  let e4 = (0, import_react21.useRef)(false);
  return l(() => (e4.current = true, () => {
    e4.current = false;
  }), []), e4;
}

// node_modules/@headlessui/react/dist/hooks/use-on-unmount.js
var import_react22 = __toESM(require_react(), 1);
function c4(t18) {
  let r9 = o2(t18), e4 = (0, import_react22.useRef)(false);
  (0, import_react22.useEffect)(() => (e4.current = false, () => {
    e4.current = true, t3(() => {
      e4.current && r9();
    });
  }), [r9]);
}

// node_modules/@headlessui/react/dist/hooks/use-tab-direction.js
var import_react23 = __toESM(require_react(), 1);
var s10 = ((r9) => (r9[r9.Forwards = 0] = "Forwards", r9[r9.Backwards = 1] = "Backwards", r9))(s10 || {});
function n5() {
  let e4 = (0, import_react23.useRef)(0);
  return s6("keydown", (o13) => {
    o13.key === "Tab" && (e4.current = o13.shiftKey ? 1 : 0);
  }, true), e4;
}

// node_modules/@headlessui/react/dist/components/focus-trap/focus-trap.js
function P2(t18) {
  if (!t18) return /* @__PURE__ */ new Set();
  if (typeof t18 == "function") return new Set(t18());
  let n7 = /* @__PURE__ */ new Set();
  for (let e4 of t18.current) e4.current instanceof HTMLElement && n7.add(e4.current);
  return n7;
}
var X = "div";
var _2 = ((r9) => (r9[r9.None = 1] = "None", r9[r9.InitialFocus = 2] = "InitialFocus", r9[r9.TabLock = 4] = "TabLock", r9[r9.FocusLock = 8] = "FocusLock", r9[r9.RestoreFocus = 16] = "RestoreFocus", r9[r9.All = 30] = "All", r9))(_2 || {});
function z(t18, n7) {
  let e4 = (0, import_react24.useRef)(null), o13 = y3(e4, n7), { initialFocus: l13, containers: c13, features: r9 = 30, ...s17 } = t18;
  l2() || (r9 = 1);
  let i8 = n2(e4);
  Y({ ownerDocument: i8 }, Boolean(r9 & 16));
  let u13 = Z({ ownerDocument: i8, container: e4, initialFocus: l13 }, Boolean(r9 & 2));
  $({ ownerDocument: i8, container: e4, containers: c13, previousActiveElement: u13 }, Boolean(r9 & 8));
  let y7 = n5(), R4 = o2((a10) => {
    let m12 = e4.current;
    if (!m12) return;
    ((B4) => B4())(() => {
      u(y7.current, { [s10.Forwards]: () => {
        O(m12, M.First, { skipElements: [a10.relatedTarget] });
      }, [s10.Backwards]: () => {
        O(m12, M.Last, { skipElements: [a10.relatedTarget] });
      } });
    });
  }), h9 = p(), H6 = (0, import_react24.useRef)(false), j5 = { ref: o13, onKeyDown(a10) {
    a10.key == "Tab" && (H6.current = true, h9.requestAnimationFrame(() => {
      H6.current = false;
    }));
  }, onBlur(a10) {
    let m12 = P2(c13);
    e4.current instanceof HTMLElement && m12.add(e4.current);
    let T7 = a10.relatedTarget;
    T7 instanceof HTMLElement && T7.dataset.headlessuiFocusGuard !== "true" && (S3(m12, T7) || (H6.current ? O(e4.current, u(y7.current, { [s10.Forwards]: () => M.Next, [s10.Backwards]: () => M.Previous }) | M.WrapAround, { relativeTo: a10.target }) : a10.target instanceof HTMLElement && y(a10.target)));
  } };
  return import_react24.default.createElement(import_react24.default.Fragment, null, Boolean(r9 & 4) && import_react24.default.createElement(u4, { as: "button", type: "button", "data-headlessui-focus-guard": true, onFocus: R4, features: s8.Focusable }), C({ ourProps: j5, theirProps: s17, defaultTag: X, name: "FocusTrap" }), Boolean(r9 & 4) && import_react24.default.createElement(u4, { as: "button", type: "button", "data-headlessui-focus-guard": true, onFocus: R4, features: s8.Focusable }));
}
var D2 = U(z);
var de2 = Object.assign(D2, { features: _2 });
function Q(t18 = true) {
  let n7 = (0, import_react24.useRef)(t12.slice());
  return m3(([e4], [o13]) => {
    o13 === true && e4 === false && t3(() => {
      n7.current.splice(0);
    }), o13 === false && e4 === true && (n7.current = t12.slice());
  }, [t18, t12, n7]), o2(() => {
    var e4;
    return (e4 = n7.current.find((o13) => o13 != null && o13.isConnected)) != null ? e4 : null;
  });
}
function Y({ ownerDocument: t18 }, n7) {
  let e4 = Q(n7);
  m3(() => {
    n7 || (t18 == null ? void 0 : t18.activeElement) === (t18 == null ? void 0 : t18.body) && y(e4());
  }, [n7]), c4(() => {
    n7 && y(e4());
  });
}
function Z({ ownerDocument: t18, container: n7, initialFocus: e4 }, o13) {
  let l13 = (0, import_react24.useRef)(null), c13 = f7();
  return m3(() => {
    if (!o13) return;
    let r9 = n7.current;
    r9 && t3(() => {
      if (!c13.current) return;
      let s17 = t18 == null ? void 0 : t18.activeElement;
      if (e4 != null && e4.current) {
        if ((e4 == null ? void 0 : e4.current) === s17) {
          l13.current = s17;
          return;
        }
      } else if (r9.contains(s17)) {
        l13.current = s17;
        return;
      }
      e4 != null && e4.current ? y(e4.current) : O(r9, M.First) === N.Error && console.warn("There are no focusable elements inside the <FocusTrap />"), l13.current = t18 == null ? void 0 : t18.activeElement;
    });
  }, [o13]), l13;
}
function $({ ownerDocument: t18, container: n7, containers: e4, previousActiveElement: o13 }, l13) {
  let c13 = f7();
  E3(t18 == null ? void 0 : t18.defaultView, "focus", (r9) => {
    if (!l13 || !c13.current) return;
    let s17 = P2(e4);
    n7.current instanceof HTMLElement && s17.add(n7.current);
    let i8 = o13.current;
    if (!i8) return;
    let u13 = r9.target;
    u13 && u13 instanceof HTMLElement ? S3(s17, u13) ? (o13.current = u13, y(u13)) : (r9.preventDefault(), r9.stopPropagation(), y(i8)) : y(o13.current);
  }, true);
}
function S3(t18, n7) {
  for (let e4 of t18) if (e4.contains(n7)) return true;
  return false;
}

// node_modules/@headlessui/react/dist/components/portal/portal.js
var import_react26 = __toESM(require_react(), 1);
var import_react_dom2 = __toESM(require_react_dom(), 1);

// node_modules/@headlessui/react/dist/internal/portal-force-root.js
var import_react25 = __toESM(require_react(), 1);
var e2 = (0, import_react25.createContext)(false);
function a2() {
  return (0, import_react25.useContext)(e2);
}
function l6(o13) {
  return import_react25.default.createElement(e2.Provider, { value: o13.force }, o13.children);
}

// node_modules/@headlessui/react/dist/components/portal/portal.js
function F4(p7) {
  let n7 = a2(), l13 = (0, import_react26.useContext)(_3), e4 = n2(p7), [a10, o13] = (0, import_react26.useState)(() => {
    if (!n7 && l13 !== null || s.isServer) return null;
    let t18 = e4 == null ? void 0 : e4.getElementById("headlessui-portal-root");
    if (t18) return t18;
    if (e4 === null) return null;
    let r9 = e4.createElement("div");
    return r9.setAttribute("id", "headlessui-portal-root"), e4.body.appendChild(r9);
  });
  return (0, import_react26.useEffect)(() => {
    a10 !== null && (e4 != null && e4.body.contains(a10) || e4 == null || e4.body.appendChild(a10));
  }, [a10, e4]), (0, import_react26.useEffect)(() => {
    n7 || l13 !== null && o13(l13.current);
  }, [l13, o13, n7]), a10;
}
var U3 = import_react26.Fragment;
function N3(p7, n7) {
  let l13 = p7, e4 = (0, import_react26.useRef)(null), a10 = y3(T4((u13) => {
    e4.current = u13;
  }), n7), o13 = n2(e4), t18 = F4(e4), [r9] = (0, import_react26.useState)(() => {
    var u13;
    return s.isServer ? null : (u13 = o13 == null ? void 0 : o13.createElement("div")) != null ? u13 : null;
  }), i8 = (0, import_react26.useContext)(f8), v6 = l2();
  return l(() => {
    !t18 || !r9 || t18.contains(r9) || (r9.setAttribute("data-headlessui-portal", ""), t18.appendChild(r9));
  }, [t18, r9]), l(() => {
    if (r9 && i8) return i8.register(r9);
  }, [i8, r9]), c4(() => {
    var u13;
    !t18 || !r9 || (r9 instanceof Node && t18.contains(r9) && t18.removeChild(r9), t18.childNodes.length <= 0 && ((u13 = t18.parentElement) == null || u13.removeChild(t18)));
  }), v6 ? !t18 || !r9 ? null : (0, import_react_dom2.createPortal)(C({ ourProps: { ref: a10 }, theirProps: l13, defaultTag: U3, name: "Portal" }), r9) : null;
}
var S4 = import_react26.Fragment;
var _3 = (0, import_react26.createContext)(null);
function j3(p7, n7) {
  let { target: l13, ...e4 } = p7, o13 = { ref: y3(n7) };
  return import_react26.default.createElement(_3.Provider, { value: l13 }, C({ ourProps: o13, theirProps: e4, defaultTag: S4, name: "Popover.Group" }));
}
var f8 = (0, import_react26.createContext)(null);
function ee2() {
  let p7 = (0, import_react26.useContext)(f8), n7 = (0, import_react26.useRef)([]), l13 = o2((o13) => (n7.current.push(o13), p7 && p7.register(o13), () => e4(o13))), e4 = o2((o13) => {
    let t18 = n7.current.indexOf(o13);
    t18 !== -1 && n7.current.splice(t18, 1), p7 && p7.unregister(o13);
  }), a10 = (0, import_react26.useMemo)(() => ({ register: l13, unregister: e4, portals: n7 }), [l13, e4, n7]);
  return [n7, (0, import_react26.useMemo)(() => function({ children: t18 }) {
    return import_react26.default.createElement(f8.Provider, { value: a10 }, t18);
  }, [a10])];
}
var D3 = U(N3);
var I4 = U(j3);
var te = Object.assign(D3, { Group: I4 });

// node_modules/@headlessui/react/dist/use-sync-external-store-shim/index.js
var e3 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/use-sync-external-store-shim/useSyncExternalStoreShimClient.js
var l7 = __toESM(require_react(), 1);
function i7(e4, t18) {
  return e4 === t18 && (e4 !== 0 || 1 / e4 === 1 / t18) || e4 !== e4 && t18 !== t18;
}
var d9 = typeof Object.is == "function" ? Object.is : i7;
var { useState: u8, useEffect: h3, useLayoutEffect: f9, useDebugValue: p5 } = l7;
function y4(e4, t18, c13) {
  const a10 = t18(), [{ inst: n7 }, o13] = u8({ inst: { value: a10, getSnapshot: t18 } });
  return f9(() => {
    n7.value = a10, n7.getSnapshot = t18, r5(n7) && o13({ inst: n7 });
  }, [e4, a10, t18]), h3(() => (r5(n7) && o13({ inst: n7 }), e4(() => {
    r5(n7) && o13({ inst: n7 });
  })), [e4]), p5(a10), a10;
}
function r5(e4) {
  const t18 = e4.getSnapshot, c13 = e4.value;
  try {
    const a10 = t18();
    return !d9(c13, a10);
  } catch {
    return true;
  }
}

// node_modules/@headlessui/react/dist/use-sync-external-store-shim/useSyncExternalStoreShimServer.js
function t15(r9, e4, n7) {
  return e4();
}

// node_modules/@headlessui/react/dist/use-sync-external-store-shim/index.js
var r6 = typeof window != "undefined" && typeof window.document != "undefined" && typeof window.document.createElement != "undefined";
var s12 = !r6;
var c6 = s12 ? t15 : y4;
var a3 = "useSyncExternalStore" in e3 ? ((n7) => n7.useSyncExternalStore)(e3) : c6;

// node_modules/@headlessui/react/dist/hooks/use-store.js
function S5(t18) {
  return a3(t18.subscribe, t18.getSnapshot, t18.getSnapshot);
}

// node_modules/@headlessui/react/dist/utils/store.js
function a4(o13, r9) {
  let t18 = o13(), n7 = /* @__PURE__ */ new Set();
  return { getSnapshot() {
    return t18;
  }, subscribe(e4) {
    return n7.add(e4), () => n7.delete(e4);
  }, dispatch(e4, ...s17) {
    let i8 = r9[e4].call(t18, ...s17);
    i8 && (t18 = i8, n7.forEach((c13) => c13()));
  } };
}

// node_modules/@headlessui/react/dist/hooks/document-overflow/adjust-scrollbar-padding.js
function c7() {
  let o13;
  return { before({ doc: e4 }) {
    var l13;
    let n7 = e4.documentElement;
    o13 = ((l13 = e4.defaultView) != null ? l13 : window).innerWidth - n7.clientWidth;
  }, after({ doc: e4, d: n7 }) {
    let t18 = e4.documentElement, l13 = t18.clientWidth - t18.offsetWidth, r9 = o13 - l13;
    n7.style(t18, "paddingRight", `${r9}px`);
  } };
}

// node_modules/@headlessui/react/dist/hooks/document-overflow/handle-ios-locking.js
function d10() {
  return t6() ? { before({ doc: r9, d: l13, meta: c13 }) {
    function o13(a10) {
      return c13.containers.flatMap((n7) => n7()).some((n7) => n7.contains(a10));
    }
    l13.microTask(() => {
      var s17;
      if (window.getComputedStyle(r9.documentElement).scrollBehavior !== "auto") {
        let t18 = o4();
        t18.style(r9.documentElement, "scrollBehavior", "auto"), l13.add(() => l13.microTask(() => t18.dispose()));
      }
      let a10 = (s17 = window.scrollY) != null ? s17 : window.pageYOffset, n7 = null;
      l13.addEventListener(r9, "click", (t18) => {
        if (t18.target instanceof HTMLElement) try {
          let e4 = t18.target.closest("a");
          if (!e4) return;
          let { hash: f14 } = new URL(e4.href), i8 = r9.querySelector(f14);
          i8 && !o13(i8) && (n7 = i8);
        } catch {
        }
      }, true), l13.addEventListener(r9, "touchstart", (t18) => {
        if (t18.target instanceof HTMLElement) if (o13(t18.target)) {
          let e4 = t18.target;
          for (; e4.parentElement && o13(e4.parentElement); ) e4 = e4.parentElement;
          l13.style(e4, "overscrollBehavior", "contain");
        } else l13.style(t18.target, "touchAction", "none");
      }), l13.addEventListener(r9, "touchmove", (t18) => {
        if (t18.target instanceof HTMLElement) if (o13(t18.target)) {
          let e4 = t18.target;
          for (; e4.parentElement && e4.dataset.headlessuiPortal !== "" && !(e4.scrollHeight > e4.clientHeight || e4.scrollWidth > e4.clientWidth); ) e4 = e4.parentElement;
          e4.dataset.headlessuiPortal === "" && t18.preventDefault();
        } else t18.preventDefault();
      }, { passive: false }), l13.add(() => {
        var e4;
        let t18 = (e4 = window.scrollY) != null ? e4 : window.pageYOffset;
        a10 !== t18 && window.scrollTo(0, a10), n7 && n7.isConnected && (n7.scrollIntoView({ block: "nearest" }), n7 = null);
      });
    });
  } } : {};
}

// node_modules/@headlessui/react/dist/hooks/document-overflow/prevent-scroll.js
function l8() {
  return { before({ doc: e4, d: o13 }) {
    o13.style(e4.documentElement, "overflow", "hidden");
  } };
}

// node_modules/@headlessui/react/dist/hooks/document-overflow/overflow-store.js
function m6(e4) {
  let n7 = {};
  for (let t18 of e4) Object.assign(n7, t18(n7));
  return n7;
}
var a5 = a4(() => /* @__PURE__ */ new Map(), { PUSH(e4, n7) {
  var o13;
  let t18 = (o13 = this.get(e4)) != null ? o13 : { doc: e4, count: 0, d: o4(), meta: /* @__PURE__ */ new Set() };
  return t18.count++, t18.meta.add(n7), this.set(e4, t18), this;
}, POP(e4, n7) {
  let t18 = this.get(e4);
  return t18 && (t18.count--, t18.meta.delete(n7)), this;
}, SCROLL_PREVENT({ doc: e4, d: n7, meta: t18 }) {
  let o13 = { doc: e4, d: n7, meta: m6(t18) }, c13 = [d10(), c7(), l8()];
  c13.forEach(({ before: r9 }) => r9 == null ? void 0 : r9(o13)), c13.forEach(({ after: r9 }) => r9 == null ? void 0 : r9(o13));
}, SCROLL_ALLOW({ d: e4 }) {
  e4.dispose();
}, TEARDOWN({ doc: e4 }) {
  this.delete(e4);
} });
a5.subscribe(() => {
  let e4 = a5.getSnapshot(), n7 = /* @__PURE__ */ new Map();
  for (let [t18] of e4) n7.set(t18, t18.documentElement.style.overflow);
  for (let t18 of e4.values()) {
    let o13 = n7.get(t18.doc) === "hidden", c13 = t18.count !== 0;
    (c13 && !o13 || !c13 && o13) && a5.dispatch(t18.count > 0 ? "SCROLL_PREVENT" : "SCROLL_ALLOW", t18), t18.count === 0 && a5.dispatch("TEARDOWN", t18);
  }
});

// node_modules/@headlessui/react/dist/hooks/document-overflow/use-document-overflow.js
function p6(e4, r9, n7) {
  let f14 = S5(a5), o13 = e4 ? f14.get(e4) : void 0, i8 = o13 ? o13.count > 0 : false;
  return l(() => {
    if (!(!e4 || !r9)) return a5.dispatch("PUSH", e4, n7), () => a5.dispatch("POP", e4, n7);
  }, [r9, e4]), i8;
}

// node_modules/@headlessui/react/dist/hooks/use-inert.js
var u9 = /* @__PURE__ */ new Map();
var t16 = /* @__PURE__ */ new Map();
function b(r9, l13 = true) {
  l(() => {
    var o13;
    if (!l13) return;
    let e4 = typeof r9 == "function" ? r9() : r9.current;
    if (!e4) return;
    function a10() {
      var d16;
      if (!e4) return;
      let i8 = (d16 = t16.get(e4)) != null ? d16 : 1;
      if (i8 === 1 ? t16.delete(e4) : t16.set(e4, i8 - 1), i8 !== 1) return;
      let n7 = u9.get(e4);
      n7 && (n7["aria-hidden"] === null ? e4.removeAttribute("aria-hidden") : e4.setAttribute("aria-hidden", n7["aria-hidden"]), e4.inert = n7.inert, u9.delete(e4));
    }
    let f14 = (o13 = t16.get(e4)) != null ? o13 : 0;
    return t16.set(e4, f14 + 1), f14 !== 0 || (u9.set(e4, { "aria-hidden": e4.getAttribute("aria-hidden"), inert: e4.inert }), e4.setAttribute("aria-hidden", "true"), e4.inert = true), a10;
  }, [r9, l13]);
}

// node_modules/@headlessui/react/dist/hooks/use-root-containers.js
var import_react27 = __toESM(require_react(), 1);
function N4({ defaultContainers: o13 = [], portals: r9, mainTreeNodeRef: u13 } = {}) {
  var f14;
  let t18 = (0, import_react27.useRef)((f14 = u13 == null ? void 0 : u13.current) != null ? f14 : null), l13 = n2(t18), c13 = o2(() => {
    var i8, s17, a10;
    let n7 = [];
    for (let e4 of o13) e4 !== null && (e4 instanceof HTMLElement ? n7.push(e4) : "current" in e4 && e4.current instanceof HTMLElement && n7.push(e4.current));
    if (r9 != null && r9.current) for (let e4 of r9.current) n7.push(e4);
    for (let e4 of (i8 = l13 == null ? void 0 : l13.querySelectorAll("html > *, body > *")) != null ? i8 : []) e4 !== document.body && e4 !== document.head && e4 instanceof HTMLElement && e4.id !== "headlessui-portal-root" && (e4.contains(t18.current) || e4.contains((a10 = (s17 = t18.current) == null ? void 0 : s17.getRootNode()) == null ? void 0 : a10.host) || n7.some((L2) => e4.contains(L2)) || n7.push(e4));
    return n7;
  });
  return { resolveContainers: c13, contains: o2((n7) => c13().some((i8) => i8.contains(n7))), mainTreeNodeRef: t18, MainTreeNode: (0, import_react27.useMemo)(() => function() {
    return u13 != null ? null : import_react27.default.createElement(u4, { features: s8.Hidden, ref: t18 });
  }, [t18, u13]) };
}
function y5() {
  let o13 = (0, import_react27.useRef)(null);
  return { mainTreeNodeRef: o13, MainTreeNode: (0, import_react27.useMemo)(() => function() {
    return import_react27.default.createElement(u4, { features: s8.Hidden, ref: o13 });
  }, [o13]) };
}

// node_modules/@headlessui/react/dist/internal/stack-context.js
var import_react28 = __toESM(require_react(), 1);
var a6 = (0, import_react28.createContext)(() => {
});
a6.displayName = "StackContext";
var s13 = ((e4) => (e4[e4.Add = 0] = "Add", e4[e4.Remove = 1] = "Remove", e4))(s13 || {});
function x2() {
  return (0, import_react28.useContext)(a6);
}
function b2({ children: i8, onUpdate: r9, type: e4, element: n7, enabled: u13 }) {
  let l13 = x2(), o13 = o2((...t18) => {
    r9 == null || r9(...t18), l13(...t18);
  });
  return l(() => {
    let t18 = u13 === void 0 || u13 === true;
    return t18 && o13(0, e4, n7), () => {
      t18 && o13(1, e4, n7);
    };
  }, [o13, e4, n7, u13]), import_react28.default.createElement(a6.Provider, { value: o13 }, i8);
}

// node_modules/@headlessui/react/dist/components/description/description.js
var import_react29 = __toESM(require_react(), 1);
var d13 = (0, import_react29.createContext)(null);
function f10() {
  let r9 = (0, import_react29.useContext)(d13);
  if (r9 === null) {
    let t18 = new Error("You used a <Description /> component, but it is not inside a relevant parent.");
    throw Error.captureStackTrace && Error.captureStackTrace(t18, f10), t18;
  }
  return r9;
}
function w3() {
  let [r9, t18] = (0, import_react29.useState)([]);
  return [r9.length > 0 ? r9.join(" ") : void 0, (0, import_react29.useMemo)(() => function(e4) {
    let i8 = o2((s17) => (t18((o13) => [...o13, s17]), () => t18((o13) => {
      let p7 = o13.slice(), c13 = p7.indexOf(s17);
      return c13 !== -1 && p7.splice(c13, 1), p7;
    }))), n7 = (0, import_react29.useMemo)(() => ({ register: i8, slot: e4.slot, name: e4.name, props: e4.props }), [i8, e4.slot, e4.name, e4.props]);
    return import_react29.default.createElement(d13.Provider, { value: n7 }, e4.children);
  }, [t18])];
}
var I5 = "p";
function S6(r9, t18) {
  let a10 = I(), { id: e4 = `headlessui-description-${a10}`, ...i8 } = r9, n7 = f10(), s17 = y3(t18);
  l(() => n7.register(e4), [e4, n7.register]);
  let o13 = { ref: s17, ...n7.props, id: e4 };
  return C({ ourProps: o13, theirProps: i8, slot: n7.slot || {}, defaultTag: I5, name: n7.name || "Description" });
}
var h4 = U(S6);
var G = Object.assign(h4, {});

// node_modules/@headlessui/react/dist/components/dialog/dialog.js
var Me = ((r9) => (r9[r9.Open = 0] = "Open", r9[r9.Closed = 1] = "Closed", r9))(Me || {});
var we = ((e4) => (e4[e4.SetTitleId = 0] = "SetTitleId", e4))(we || {});
var He = { [0](o13, e4) {
  return o13.titleId === e4.id ? o13 : { ...o13, titleId: e4.id };
} };
var I6 = (0, import_react30.createContext)(null);
I6.displayName = "DialogContext";
function b3(o13) {
  let e4 = (0, import_react30.useContext)(I6);
  if (e4 === null) {
    let r9 = new Error(`<${o13} /> is missing a parent <Dialog /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(r9, b3), r9;
  }
  return e4;
}
function Be(o13, e4, r9 = () => [document.body]) {
  p6(o13, e4, (i8) => {
    var n7;
    return { containers: [...(n7 = i8.containers) != null ? n7 : [], r9] };
  });
}
function Ge(o13, e4) {
  return u(e4.type, He, o13, e4);
}
var Ne = "div";
var Ue = O2.RenderStrategy | O2.Static;
function We(o13, e4) {
  let r9 = I(), { id: i8 = `headlessui-dialog-${r9}`, open: n7, onClose: l13, initialFocus: s17, role: a10 = "dialog", __demoMode: T7 = false, ...m12 } = o13, [M7, f14] = (0, import_react30.useState)(0), U7 = (0, import_react30.useRef)(false);
  a10 = function() {
    return a10 === "dialog" || a10 === "alertdialog" ? a10 : (U7.current || (U7.current = true, console.warn(`Invalid role [${a10}] passed to <Dialog />. Only \`dialog\` and and \`alertdialog\` are supported. Using \`dialog\` instead.`)), "dialog");
  }();
  let E8 = u5();
  n7 === void 0 && E8 !== null && (n7 = (E8 & d5.Open) === d5.Open);
  let D7 = (0, import_react30.useRef)(null), ee8 = y3(D7, e4), g5 = n2(D7), W = o13.hasOwnProperty("open") || E8 !== null, $6 = o13.hasOwnProperty("onClose");
  if (!W && !$6) throw new Error("You have to provide an `open` and an `onClose` prop to the `Dialog` component.");
  if (!W) throw new Error("You provided an `onClose` prop to the `Dialog`, but forgot an `open` prop.");
  if (!$6) throw new Error("You provided an `open` prop to the `Dialog`, but forgot an `onClose` prop.");
  if (typeof n7 != "boolean") throw new Error(`You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${n7}`);
  if (typeof l13 != "function") throw new Error(`You provided an \`onClose\` prop to the \`Dialog\`, but the value is not a function. Received: ${l13}`);
  let p7 = n7 ? 0 : 1, [h9, te5] = (0, import_react30.useReducer)(Ge, { titleId: null, descriptionId: null, panelRef: (0, import_react30.createRef)() }), P5 = o2(() => l13(false)), Y3 = o2((t18) => te5({ type: 0, id: t18 })), S10 = l2() ? T7 ? false : p7 === 0 : false, x4 = M7 > 1, j5 = (0, import_react30.useContext)(I6) !== null, [oe5, re5] = ee2(), ne5 = { get current() {
    var t18;
    return (t18 = h9.panelRef.current) != null ? t18 : D7.current;
  } }, { resolveContainers: w6, mainTreeNodeRef: L2, MainTreeNode: le3 } = N4({ portals: oe5, defaultContainers: [ne5] }), ae3 = x4 ? "parent" : "leaf", J6 = E8 !== null ? (E8 & d5.Closing) === d5.Closing : false, ie5 = /* @__PURE__ */ (() => j5 || J6 ? false : S10)(), se4 = (0, import_react30.useCallback)(() => {
    var t18, c13;
    return (c13 = Array.from((t18 = g5 == null ? void 0 : g5.querySelectorAll("body > *")) != null ? t18 : []).find((d16) => d16.id === "headlessui-portal-root" ? false : d16.contains(L2.current) && d16 instanceof HTMLElement)) != null ? c13 : null;
  }, [L2]);
  b(se4, ie5);
  let pe2 = /* @__PURE__ */ (() => x4 ? true : S10)(), de6 = (0, import_react30.useCallback)(() => {
    var t18, c13;
    return (c13 = Array.from((t18 = g5 == null ? void 0 : g5.querySelectorAll("[data-headlessui-portal]")) != null ? t18 : []).find((d16) => d16.contains(L2.current) && d16 instanceof HTMLElement)) != null ? c13 : null;
  }, [L2]);
  b(de6, pe2);
  let ue7 = /* @__PURE__ */ (() => !(!S10 || x4))();
  y2(w6, (t18) => {
    t18.preventDefault(), P5();
  }, ue7);
  let fe4 = /* @__PURE__ */ (() => !(x4 || p7 !== 0))();
  E3(g5 == null ? void 0 : g5.defaultView, "keydown", (t18) => {
    fe4 && (t18.defaultPrevented || t18.key === o11.Escape && (t18.preventDefault(), t18.stopPropagation(), P5()));
  });
  let ge5 = /* @__PURE__ */ (() => !(J6 || p7 !== 0 || j5))();
  Be(g5, ge5, w6), (0, import_react30.useEffect)(() => {
    if (p7 !== 0 || !D7.current) return;
    let t18 = new ResizeObserver((c13) => {
      for (let d16 of c13) {
        let F10 = d16.target.getBoundingClientRect();
        F10.x === 0 && F10.y === 0 && F10.width === 0 && F10.height === 0 && P5();
      }
    });
    return t18.observe(D7.current), () => t18.disconnect();
  }, [p7, D7, P5]);
  let [Te3, ce4] = w3(), De4 = (0, import_react30.useMemo)(() => [{ dialogState: p7, close: P5, setTitleId: Y3 }, h9], [p7, h9, P5, Y3]), X5 = (0, import_react30.useMemo)(() => ({ open: p7 === 0 }), [p7]), me4 = { ref: ee8, id: i8, role: a10, "aria-modal": p7 === 0 ? true : void 0, "aria-labelledby": h9.titleId, "aria-describedby": Te3 };
  return import_react30.default.createElement(b2, { type: "Dialog", enabled: p7 === 0, element: D7, onUpdate: o2((t18, c13) => {
    c13 === "Dialog" && u(t18, { [s13.Add]: () => f14((d16) => d16 + 1), [s13.Remove]: () => f14((d16) => d16 - 1) });
  }) }, import_react30.default.createElement(l6, { force: true }, import_react30.default.createElement(te, null, import_react30.default.createElement(I6.Provider, { value: De4 }, import_react30.default.createElement(te.Group, { target: D7 }, import_react30.default.createElement(l6, { force: false }, import_react30.default.createElement(ce4, { slot: X5, name: "Dialog.Description" }, import_react30.default.createElement(de2, { initialFocus: s17, containers: w6, features: S10 ? u(ae3, { parent: de2.features.RestoreFocus, leaf: de2.features.All & ~de2.features.FocusLock }) : de2.features.None }, import_react30.default.createElement(re5, null, C({ ourProps: me4, theirProps: m12, slot: X5, defaultTag: Ne, features: Ue, visible: p7 === 0, name: "Dialog" }))))))))), import_react30.default.createElement(le3, null));
}
var $e2 = "div";
function Ye2(o13, e4) {
  let r9 = I(), { id: i8 = `headlessui-dialog-overlay-${r9}`, ...n7 } = o13, [{ dialogState: l13, close: s17 }] = b3("Dialog.Overlay"), a10 = y3(e4), T7 = o2((f14) => {
    if (f14.target === f14.currentTarget) {
      if (r2(f14.currentTarget)) return f14.preventDefault();
      f14.preventDefault(), f14.stopPropagation(), s17();
    }
  }), m12 = (0, import_react30.useMemo)(() => ({ open: l13 === 0 }), [l13]);
  return C({ ourProps: { ref: a10, id: i8, "aria-hidden": true, onClick: T7 }, theirProps: n7, slot: m12, defaultTag: $e2, name: "Dialog.Overlay" });
}
var je = "div";
function Je(o13, e4) {
  let r9 = I(), { id: i8 = `headlessui-dialog-backdrop-${r9}`, ...n7 } = o13, [{ dialogState: l13 }, s17] = b3("Dialog.Backdrop"), a10 = y3(e4);
  (0, import_react30.useEffect)(() => {
    if (s17.panelRef.current === null) throw new Error("A <Dialog.Backdrop /> component is being used, but a <Dialog.Panel /> component is missing.");
  }, [s17.panelRef]);
  let T7 = (0, import_react30.useMemo)(() => ({ open: l13 === 0 }), [l13]);
  return import_react30.default.createElement(l6, { force: true }, import_react30.default.createElement(te, null, C({ ourProps: { ref: a10, id: i8, "aria-hidden": true }, theirProps: n7, slot: T7, defaultTag: je, name: "Dialog.Backdrop" })));
}
var Xe = "div";
function Ke(o13, e4) {
  let r9 = I(), { id: i8 = `headlessui-dialog-panel-${r9}`, ...n7 } = o13, [{ dialogState: l13 }, s17] = b3("Dialog.Panel"), a10 = y3(e4, s17.panelRef), T7 = (0, import_react30.useMemo)(() => ({ open: l13 === 0 }), [l13]), m12 = o2((f14) => {
    f14.stopPropagation();
  });
  return C({ ourProps: { ref: a10, id: i8, onClick: m12 }, theirProps: n7, slot: T7, defaultTag: Xe, name: "Dialog.Panel" });
}
var Ve2 = "h2";
function qe2(o13, e4) {
  let r9 = I(), { id: i8 = `headlessui-dialog-title-${r9}`, ...n7 } = o13, [{ dialogState: l13, setTitleId: s17 }] = b3("Dialog.Title"), a10 = y3(e4);
  (0, import_react30.useEffect)(() => (s17(i8), () => s17(null)), [i8, s17]);
  let T7 = (0, import_react30.useMemo)(() => ({ open: l13 === 0 }), [l13]);
  return C({ ourProps: { ref: a10, id: i8 }, theirProps: n7, slot: T7, defaultTag: Ve2, name: "Dialog.Title" });
}
var ze2 = U(We);
var Qe2 = U(Je);
var Ze2 = U(Ke);
var et2 = U(Ye2);
var tt2 = U(qe2);
var _t = Object.assign(ze2, { Backdrop: Qe2, Panel: Ze2, Overlay: et2, Title: tt2, Description: G });

// node_modules/@headlessui/react/dist/components/disclosure/disclosure.js
var import_react32 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/start-transition.js
var import_react31 = __toESM(require_react(), 1);
var t17;
var a7 = (t17 = import_react31.default.startTransition) != null ? t17 : function(i8) {
  i8();
};

// node_modules/@headlessui/react/dist/components/disclosure/disclosure.js
var Q2 = ((o13) => (o13[o13.Open = 0] = "Open", o13[o13.Closed = 1] = "Closed", o13))(Q2 || {});
var V2 = ((t18) => (t18[t18.ToggleDisclosure = 0] = "ToggleDisclosure", t18[t18.CloseDisclosure = 1] = "CloseDisclosure", t18[t18.SetButtonId = 2] = "SetButtonId", t18[t18.SetPanelId = 3] = "SetPanelId", t18[t18.LinkPanel = 4] = "LinkPanel", t18[t18.UnlinkPanel = 5] = "UnlinkPanel", t18))(V2 || {});
var Y2 = { [0]: (e4) => ({ ...e4, disclosureState: u(e4.disclosureState, { [0]: 1, [1]: 0 }) }), [1]: (e4) => e4.disclosureState === 1 ? e4 : { ...e4, disclosureState: 1 }, [4](e4) {
  return e4.linkedPanel === true ? e4 : { ...e4, linkedPanel: true };
}, [5](e4) {
  return e4.linkedPanel === false ? e4 : { ...e4, linkedPanel: false };
}, [2](e4, n7) {
  return e4.buttonId === n7.buttonId ? e4 : { ...e4, buttonId: n7.buttonId };
}, [3](e4, n7) {
  return e4.panelId === n7.panelId ? e4 : { ...e4, panelId: n7.panelId };
} };
var M3 = (0, import_react32.createContext)(null);
M3.displayName = "DisclosureContext";
function _4(e4) {
  let n7 = (0, import_react32.useContext)(M3);
  if (n7 === null) {
    let o13 = new Error(`<${e4} /> is missing a parent <Disclosure /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(o13, _4), o13;
  }
  return n7;
}
var v2 = (0, import_react32.createContext)(null);
v2.displayName = "DisclosureAPIContext";
function K2(e4) {
  let n7 = (0, import_react32.useContext)(v2);
  if (n7 === null) {
    let o13 = new Error(`<${e4} /> is missing a parent <Disclosure /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(o13, K2), o13;
  }
  return n7;
}
var F5 = (0, import_react32.createContext)(null);
F5.displayName = "DisclosurePanelContext";
function Z2() {
  return (0, import_react32.useContext)(F5);
}
function ee3(e4, n7) {
  return u(n7.type, Y2, e4, n7);
}
var te2 = import_react32.Fragment;
function ne(e4, n7) {
  let { defaultOpen: o13 = false, ...i8 } = e4, f14 = (0, import_react32.useRef)(null), l13 = y3(n7, T4((u13) => {
    f14.current = u13;
  }, e4.as === void 0 || e4.as === import_react32.Fragment)), t18 = (0, import_react32.useRef)(null), d16 = (0, import_react32.useRef)(null), s17 = (0, import_react32.useReducer)(ee3, { disclosureState: o13 ? 0 : 1, linkedPanel: false, buttonRef: d16, panelRef: t18, buttonId: null, panelId: null }), [{ disclosureState: c13, buttonId: a10 }, D7] = s17, p7 = o2((u13) => {
    D7({ type: 1 });
    let y7 = o7(f14);
    if (!y7 || !a10) return;
    let r9 = (() => u13 ? u13 instanceof HTMLElement ? u13 : u13.current instanceof HTMLElement ? u13.current : y7.getElementById(a10) : y7.getElementById(a10))();
    r9 == null || r9.focus();
  }), P5 = (0, import_react32.useMemo)(() => ({ close: p7 }), [p7]), T7 = (0, import_react32.useMemo)(() => ({ open: c13 === 0, close: p7 }), [c13, p7]), C7 = { ref: l13 };
  return import_react32.default.createElement(M3.Provider, { value: s17 }, import_react32.default.createElement(v2.Provider, { value: P5 }, import_react32.default.createElement(s9, { value: u(c13, { [0]: d5.Open, [1]: d5.Closed }) }, C({ ourProps: C7, theirProps: i8, slot: T7, defaultTag: te2, name: "Disclosure" }))));
}
var le = "button";
function oe(e4, n7) {
  let o13 = I(), { id: i8 = `headlessui-disclosure-button-${o13}`, ...f14 } = e4, [l13, t18] = _4("Disclosure.Button"), d16 = Z2(), s17 = d16 === null ? false : d16 === l13.panelId, c13 = (0, import_react32.useRef)(null), a10 = y3(c13, n7, s17 ? null : l13.buttonRef), D7 = I3();
  (0, import_react32.useEffect)(() => {
    if (!s17) return t18({ type: 2, buttonId: i8 }), () => {
      t18({ type: 2, buttonId: null });
    };
  }, [i8, t18, s17]);
  let p7 = o2((r9) => {
    var m12;
    if (s17) {
      if (l13.disclosureState === 1) return;
      switch (r9.key) {
        case o11.Space:
        case o11.Enter:
          r9.preventDefault(), r9.stopPropagation(), t18({ type: 0 }), (m12 = l13.buttonRef.current) == null || m12.focus();
          break;
      }
    } else switch (r9.key) {
      case o11.Space:
      case o11.Enter:
        r9.preventDefault(), r9.stopPropagation(), t18({ type: 0 });
        break;
    }
  }), P5 = o2((r9) => {
    switch (r9.key) {
      case o11.Space:
        r9.preventDefault();
        break;
    }
  }), T7 = o2((r9) => {
    var m12;
    r2(r9.currentTarget) || e4.disabled || (s17 ? (t18({ type: 0 }), (m12 = l13.buttonRef.current) == null || m12.focus()) : t18({ type: 0 }));
  }), C7 = (0, import_react32.useMemo)(() => ({ open: l13.disclosureState === 0 }), [l13]), u13 = T3(e4, c13), y7 = s17 ? { ref: a10, type: u13, onKeyDown: p7, onClick: T7 } : { ref: a10, id: i8, type: u13, "aria-expanded": l13.disclosureState === 0, "aria-controls": l13.linkedPanel ? l13.panelId : void 0, onKeyDown: p7, onKeyUp: P5, onClick: T7 };
  return C({ mergeRefs: D7, ourProps: y7, theirProps: f14, slot: C7, defaultTag: le, name: "Disclosure.Button" });
}
var re = "div";
var se = O2.RenderStrategy | O2.Static;
function ue2(e4, n7) {
  let o13 = I(), { id: i8 = `headlessui-disclosure-panel-${o13}`, ...f14 } = e4, [l13, t18] = _4("Disclosure.Panel"), { close: d16 } = K2("Disclosure.Panel"), s17 = I3(), c13 = y3(n7, l13.panelRef, (T7) => {
    a7(() => t18({ type: T7 ? 4 : 5 }));
  });
  (0, import_react32.useEffect)(() => (t18({ type: 3, panelId: i8 }), () => {
    t18({ type: 3, panelId: null });
  }), [i8, t18]);
  let a10 = u5(), D7 = (() => a10 !== null ? (a10 & d5.Open) === d5.Open : l13.disclosureState === 0)(), p7 = (0, import_react32.useMemo)(() => ({ open: l13.disclosureState === 0, close: d16 }), [l13, d16]), P5 = { ref: c13, id: i8 };
  return import_react32.default.createElement(F5.Provider, { value: l13.panelId }, C({ mergeRefs: s17, ourProps: P5, theirProps: f14, slot: p7, defaultTag: re, features: se, visible: D7, name: "Disclosure.Panel" }));
}
var ie2 = U(ne);
var ae = U(oe);
var pe = U(ue2);
var Ae2 = Object.assign(ie2, { Button: ae, Panel: pe });

// node_modules/@headlessui/react/dist/components/listbox/listbox.js
var import_react34 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/hooks/use-text-value.js
var import_react33 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/get-text-value.js
var a8 = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
function o12(e4) {
  var r9, i8;
  let n7 = (r9 = e4.innerText) != null ? r9 : "", t18 = e4.cloneNode(true);
  if (!(t18 instanceof HTMLElement)) return n7;
  let u13 = false;
  for (let f14 of t18.querySelectorAll('[hidden],[aria-hidden],[role="img"]')) f14.remove(), u13 = true;
  let l13 = u13 ? (i8 = t18.innerText) != null ? i8 : "" : n7;
  return a8.test(l13) && (l13 = l13.replace(a8, "")), l13;
}
function g3(e4) {
  let n7 = e4.getAttribute("aria-label");
  if (typeof n7 == "string") return n7.trim();
  let t18 = e4.getAttribute("aria-labelledby");
  if (t18) {
    let u13 = t18.split(" ").map((l13) => {
      let r9 = document.getElementById(l13);
      if (r9) {
        let i8 = r9.getAttribute("aria-label");
        return typeof i8 == "string" ? i8.trim() : o12(r9).trim();
      }
      return null;
    }).filter(Boolean);
    if (u13.length > 0) return u13.join(", ");
  }
  return o12(e4).trim();
}

// node_modules/@headlessui/react/dist/hooks/use-text-value.js
function s14(c13) {
  let t18 = (0, import_react33.useRef)(""), r9 = (0, import_react33.useRef)("");
  return o2(() => {
    let e4 = c13.current;
    if (!e4) return "";
    let u13 = e4.innerText;
    if (t18.current === u13) return r9.current;
    let n7 = g3(e4).trim().toLowerCase();
    return t18.current = u13, r9.current = n7, n7;
  });
}

// node_modules/@headlessui/react/dist/components/listbox/listbox.js
var Be2 = ((n7) => (n7[n7.Open = 0] = "Open", n7[n7.Closed = 1] = "Closed", n7))(Be2 || {});
var He2 = ((n7) => (n7[n7.Single = 0] = "Single", n7[n7.Multi = 1] = "Multi", n7))(He2 || {});
var Ge2 = ((n7) => (n7[n7.Pointer = 0] = "Pointer", n7[n7.Other = 1] = "Other", n7))(Ge2 || {});
var Ne2 = ((i8) => (i8[i8.OpenListbox = 0] = "OpenListbox", i8[i8.CloseListbox = 1] = "CloseListbox", i8[i8.GoToOption = 2] = "GoToOption", i8[i8.Search = 3] = "Search", i8[i8.ClearSearch = 4] = "ClearSearch", i8[i8.RegisterOption = 5] = "RegisterOption", i8[i8.UnregisterOption = 6] = "UnregisterOption", i8[i8.RegisterLabel = 7] = "RegisterLabel", i8))(Ne2 || {});
function z2(e4, a10 = (n7) => n7) {
  let n7 = e4.activeOptionIndex !== null ? e4.options[e4.activeOptionIndex] : null, r9 = I2(a10(e4.options.slice()), (t18) => t18.dataRef.current.domRef.current), l13 = n7 ? r9.indexOf(n7) : null;
  return l13 === -1 && (l13 = null), { options: r9, activeOptionIndex: l13 };
}
var je2 = { [1](e4) {
  return e4.dataRef.current.disabled || e4.listboxState === 1 ? e4 : { ...e4, activeOptionIndex: null, listboxState: 1 };
}, [0](e4) {
  if (e4.dataRef.current.disabled || e4.listboxState === 0) return e4;
  let a10 = e4.activeOptionIndex, { isSelected: n7 } = e4.dataRef.current, r9 = e4.options.findIndex((l13) => n7(l13.dataRef.current.value));
  return r9 !== -1 && (a10 = r9), { ...e4, listboxState: 0, activeOptionIndex: a10 };
}, [2](e4, a10) {
  var l13;
  if (e4.dataRef.current.disabled || e4.listboxState === 1) return e4;
  let n7 = z2(e4), r9 = f5(a10, { resolveItems: () => n7.options, resolveActiveIndex: () => n7.activeOptionIndex, resolveId: (t18) => t18.id, resolveDisabled: (t18) => t18.dataRef.current.disabled });
  return { ...e4, ...n7, searchQuery: "", activeOptionIndex: r9, activationTrigger: (l13 = a10.trigger) != null ? l13 : 1 };
}, [3]: (e4, a10) => {
  if (e4.dataRef.current.disabled || e4.listboxState === 1) return e4;
  let r9 = e4.searchQuery !== "" ? 0 : 1, l13 = e4.searchQuery + a10.value.toLowerCase(), p7 = (e4.activeOptionIndex !== null ? e4.options.slice(e4.activeOptionIndex + r9).concat(e4.options.slice(0, e4.activeOptionIndex + r9)) : e4.options).find((i8) => {
    var b7;
    return !i8.dataRef.current.disabled && ((b7 = i8.dataRef.current.textValue) == null ? void 0 : b7.startsWith(l13));
  }), u13 = p7 ? e4.options.indexOf(p7) : -1;
  return u13 === -1 || u13 === e4.activeOptionIndex ? { ...e4, searchQuery: l13 } : { ...e4, searchQuery: l13, activeOptionIndex: u13, activationTrigger: 1 };
}, [4](e4) {
  return e4.dataRef.current.disabled || e4.listboxState === 1 || e4.searchQuery === "" ? e4 : { ...e4, searchQuery: "" };
}, [5]: (e4, a10) => {
  let n7 = { id: a10.id, dataRef: a10.dataRef }, r9 = z2(e4, (l13) => [...l13, n7]);
  return e4.activeOptionIndex === null && e4.dataRef.current.isSelected(a10.dataRef.current.value) && (r9.activeOptionIndex = r9.options.indexOf(n7)), { ...e4, ...r9 };
}, [6]: (e4, a10) => {
  let n7 = z2(e4, (r9) => {
    let l13 = r9.findIndex((t18) => t18.id === a10.id);
    return l13 !== -1 && r9.splice(l13, 1), r9;
  });
  return { ...e4, ...n7, activationTrigger: 1 };
}, [7]: (e4, a10) => ({ ...e4, labelId: a10.id }) };
var J = (0, import_react34.createContext)(null);
J.displayName = "ListboxActionsContext";
function k2(e4) {
  let a10 = (0, import_react34.useContext)(J);
  if (a10 === null) {
    let n7 = new Error(`<${e4} /> is missing a parent <Listbox /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(n7, k2), n7;
  }
  return a10;
}
var q2 = (0, import_react34.createContext)(null);
q2.displayName = "ListboxDataContext";
function w4(e4) {
  let a10 = (0, import_react34.useContext)(q2);
  if (a10 === null) {
    let n7 = new Error(`<${e4} /> is missing a parent <Listbox /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(n7, w4), n7;
  }
  return a10;
}
function Ve3(e4, a10) {
  return u(a10.type, je2, e4, a10);
}
var Ke2 = import_react34.Fragment;
function Qe3(e4, a10) {
  let { value: n7, defaultValue: r9, form: l13, name: t18, onChange: p7, by: u13 = (s17, c13) => s17 === c13, disabled: i8 = false, horizontal: b7 = false, multiple: R4 = false, ...m12 } = e4;
  const P5 = b7 ? "horizontal" : "vertical";
  let S10 = y3(a10), [g5 = R4 ? [] : void 0, x4] = T(n7, p7, r9), [T7, o13] = (0, import_react34.useReducer)(Ve3, { dataRef: (0, import_react34.createRef)(), listboxState: 1, options: [], searchQuery: "", labelId: null, activeOptionIndex: null, activationTrigger: 1 }), L2 = (0, import_react34.useRef)({ static: false, hold: false }), U7 = (0, import_react34.useRef)(null), B4 = (0, import_react34.useRef)(null), W = (0, import_react34.useRef)(null), I11 = o2(typeof u13 == "string" ? (s17, c13) => {
    let O4 = u13;
    return (s17 == null ? void 0 : s17[O4]) === (c13 == null ? void 0 : c13[O4]);
  } : u13), A3 = (0, import_react34.useCallback)((s17) => u(d16.mode, { [1]: () => g5.some((c13) => I11(c13, s17)), [0]: () => I11(g5, s17) }), [g5]), d16 = (0, import_react34.useMemo)(() => ({ ...T7, value: g5, disabled: i8, mode: R4 ? 1 : 0, orientation: P5, compare: I11, isSelected: A3, optionsPropsRef: L2, labelRef: U7, buttonRef: B4, optionsRef: W }), [g5, i8, R4, T7]);
  l(() => {
    T7.dataRef.current = d16;
  }, [d16]), y2([d16.buttonRef, d16.optionsRef], (s17, c13) => {
    var O4;
    o13({ type: 1 }), h(c13, T2.Loose) || (s17.preventDefault(), (O4 = d16.buttonRef.current) == null || O4.focus());
  }, d16.listboxState === 0);
  let H6 = (0, import_react34.useMemo)(() => ({ open: d16.listboxState === 0, disabled: i8, value: g5 }), [d16, i8, g5]), ie5 = o2((s17) => {
    let c13 = d16.options.find((O4) => O4.id === s17);
    c13 && X5(c13.dataRef.current.value);
  }), re5 = o2(() => {
    if (d16.activeOptionIndex !== null) {
      let { dataRef: s17, id: c13 } = d16.options[d16.activeOptionIndex];
      X5(s17.current.value), o13({ type: 2, focus: c3.Specific, id: c13 });
    }
  }), ae3 = o2(() => o13({ type: 0 })), le3 = o2(() => o13({ type: 1 })), se4 = o2((s17, c13, O4) => s17 === c3.Specific ? o13({ type: 2, focus: c3.Specific, id: c13, trigger: O4 }) : o13({ type: 2, focus: s17, trigger: O4 })), pe2 = o2((s17, c13) => (o13({ type: 5, id: s17, dataRef: c13 }), () => o13({ type: 6, id: s17 }))), ue7 = o2((s17) => (o13({ type: 7, id: s17 }), () => o13({ type: 7, id: null }))), X5 = o2((s17) => u(d16.mode, { [0]() {
    return x4 == null ? void 0 : x4(s17);
  }, [1]() {
    let c13 = d16.value.slice(), O4 = c13.findIndex((C7) => I11(C7, s17));
    return O4 === -1 ? c13.push(s17) : c13.splice(O4, 1), x4 == null ? void 0 : x4(c13);
  } })), de6 = o2((s17) => o13({ type: 3, value: s17 })), ce4 = o2(() => o13({ type: 4 })), fe4 = (0, import_react34.useMemo)(() => ({ onChange: X5, registerOption: pe2, registerLabel: ue7, goToOption: se4, closeListbox: le3, openListbox: ae3, selectActiveOption: re5, selectOption: ie5, search: de6, clearSearch: ce4 }), []), Te3 = { ref: S10 }, G4 = (0, import_react34.useRef)(null), be4 = p();
  return (0, import_react34.useEffect)(() => {
    G4.current && r9 !== void 0 && be4.addEventListener(G4.current, "reset", () => {
      x4 == null || x4(r9);
    });
  }, [G4, x4]), import_react34.default.createElement(J.Provider, { value: fe4 }, import_react34.default.createElement(q2.Provider, { value: d16 }, import_react34.default.createElement(s9, { value: u(d16.listboxState, { [0]: d5.Open, [1]: d5.Closed }) }, t18 != null && g5 != null && e({ [t18]: g5 }).map(([s17, c13], O4) => import_react34.default.createElement(u4, { features: s8.Hidden, ref: O4 === 0 ? (C7) => {
    var Y3;
    G4.current = (Y3 = C7 == null ? void 0 : C7.closest("form")) != null ? Y3 : null;
  } : void 0, ...x({ key: s17, as: "input", type: "hidden", hidden: true, readOnly: true, form: l13, disabled: i8, name: s17, value: c13 }) })), C({ ourProps: Te3, theirProps: m12, slot: H6, defaultTag: Ke2, name: "Listbox" }))));
}
var We2 = "button";
function Xe2(e4, a10) {
  var x4;
  let n7 = I(), { id: r9 = `headlessui-listbox-button-${n7}`, ...l13 } = e4, t18 = w4("Listbox.Button"), p7 = k2("Listbox.Button"), u13 = y3(t18.buttonRef, a10), i8 = p(), b7 = o2((T7) => {
    switch (T7.key) {
      case o11.Space:
      case o11.Enter:
      case o11.ArrowDown:
        T7.preventDefault(), p7.openListbox(), i8.nextFrame(() => {
          t18.value || p7.goToOption(c3.First);
        });
        break;
      case o11.ArrowUp:
        T7.preventDefault(), p7.openListbox(), i8.nextFrame(() => {
          t18.value || p7.goToOption(c3.Last);
        });
        break;
    }
  }), R4 = o2((T7) => {
    switch (T7.key) {
      case o11.Space:
        T7.preventDefault();
        break;
    }
  }), m12 = o2((T7) => {
    if (r2(T7.currentTarget)) return T7.preventDefault();
    t18.listboxState === 0 ? (p7.closeListbox(), i8.nextFrame(() => {
      var o13;
      return (o13 = t18.buttonRef.current) == null ? void 0 : o13.focus({ preventScroll: true });
    })) : (T7.preventDefault(), p7.openListbox());
  }), P5 = i2(() => {
    if (t18.labelId) return [t18.labelId, r9].join(" ");
  }, [t18.labelId, r9]), S10 = (0, import_react34.useMemo)(() => ({ open: t18.listboxState === 0, disabled: t18.disabled, value: t18.value }), [t18]), g5 = { ref: u13, id: r9, type: T3(e4, t18.buttonRef), "aria-haspopup": "listbox", "aria-controls": (x4 = t18.optionsRef.current) == null ? void 0 : x4.id, "aria-expanded": t18.listboxState === 0, "aria-labelledby": P5, disabled: t18.disabled, onKeyDown: b7, onKeyUp: R4, onClick: m12 };
  return C({ ourProps: g5, theirProps: l13, slot: S10, defaultTag: We2, name: "Listbox.Button" });
}
var $e3 = "label";
function ze3(e4, a10) {
  let n7 = I(), { id: r9 = `headlessui-listbox-label-${n7}`, ...l13 } = e4, t18 = w4("Listbox.Label"), p7 = k2("Listbox.Label"), u13 = y3(t18.labelRef, a10);
  l(() => p7.registerLabel(r9), [r9]);
  let i8 = o2(() => {
    var m12;
    return (m12 = t18.buttonRef.current) == null ? void 0 : m12.focus({ preventScroll: true });
  }), b7 = (0, import_react34.useMemo)(() => ({ open: t18.listboxState === 0, disabled: t18.disabled }), [t18]);
  return C({ ourProps: { ref: u13, id: r9, onClick: i8 }, theirProps: l13, slot: b7, defaultTag: $e3, name: "Listbox.Label" });
}
var Je2 = "ul";
var qe3 = O2.RenderStrategy | O2.Static;
function Ye3(e4, a10) {
  var T7;
  let n7 = I(), { id: r9 = `headlessui-listbox-options-${n7}`, ...l13 } = e4, t18 = w4("Listbox.Options"), p7 = k2("Listbox.Options"), u13 = y3(t18.optionsRef, a10), i8 = p(), b7 = p(), R4 = u5(), m12 = (() => R4 !== null ? (R4 & d5.Open) === d5.Open : t18.listboxState === 0)();
  (0, import_react34.useEffect)(() => {
    var L2;
    let o13 = t18.optionsRef.current;
    o13 && t18.listboxState === 0 && o13 !== ((L2 = o7(o13)) == null ? void 0 : L2.activeElement) && o13.focus({ preventScroll: true });
  }, [t18.listboxState, t18.optionsRef]);
  let P5 = o2((o13) => {
    switch (b7.dispose(), o13.key) {
      case o11.Space:
        if (t18.searchQuery !== "") return o13.preventDefault(), o13.stopPropagation(), p7.search(o13.key);
      case o11.Enter:
        if (o13.preventDefault(), o13.stopPropagation(), t18.activeOptionIndex !== null) {
          let { dataRef: L2 } = t18.options[t18.activeOptionIndex];
          p7.onChange(L2.current.value);
        }
        t18.mode === 0 && (p7.closeListbox(), o4().nextFrame(() => {
          var L2;
          return (L2 = t18.buttonRef.current) == null ? void 0 : L2.focus({ preventScroll: true });
        }));
        break;
      case u(t18.orientation, { vertical: o11.ArrowDown, horizontal: o11.ArrowRight }):
        return o13.preventDefault(), o13.stopPropagation(), p7.goToOption(c3.Next);
      case u(t18.orientation, { vertical: o11.ArrowUp, horizontal: o11.ArrowLeft }):
        return o13.preventDefault(), o13.stopPropagation(), p7.goToOption(c3.Previous);
      case o11.Home:
      case o11.PageUp:
        return o13.preventDefault(), o13.stopPropagation(), p7.goToOption(c3.First);
      case o11.End:
      case o11.PageDown:
        return o13.preventDefault(), o13.stopPropagation(), p7.goToOption(c3.Last);
      case o11.Escape:
        return o13.preventDefault(), o13.stopPropagation(), p7.closeListbox(), i8.nextFrame(() => {
          var L2;
          return (L2 = t18.buttonRef.current) == null ? void 0 : L2.focus({ preventScroll: true });
        });
      case o11.Tab:
        o13.preventDefault(), o13.stopPropagation();
        break;
      default:
        o13.key.length === 1 && (p7.search(o13.key), b7.setTimeout(() => p7.clearSearch(), 350));
        break;
    }
  }), S10 = i2(() => {
    var o13;
    return (o13 = t18.buttonRef.current) == null ? void 0 : o13.id;
  }, [t18.buttonRef.current]), g5 = (0, import_react34.useMemo)(() => ({ open: t18.listboxState === 0 }), [t18]), x4 = { "aria-activedescendant": t18.activeOptionIndex === null || (T7 = t18.options[t18.activeOptionIndex]) == null ? void 0 : T7.id, "aria-multiselectable": t18.mode === 1 ? true : void 0, "aria-labelledby": S10, "aria-orientation": t18.orientation, id: r9, onKeyDown: P5, role: "listbox", tabIndex: 0, ref: u13 };
  return C({ ourProps: x4, theirProps: l13, slot: g5, defaultTag: Je2, features: qe3, visible: m12, name: "Listbox.Options" });
}
var Ze3 = "li";
function et3(e4, a10) {
  let n7 = I(), { id: r9 = `headlessui-listbox-option-${n7}`, disabled: l13 = false, value: t18, ...p7 } = e4, u13 = w4("Listbox.Option"), i8 = k2("Listbox.Option"), b7 = u13.activeOptionIndex !== null ? u13.options[u13.activeOptionIndex].id === r9 : false, R4 = u13.isSelected(t18), m12 = (0, import_react34.useRef)(null), P5 = s14(m12), S10 = s2({ disabled: l13, value: t18, domRef: m12, get textValue() {
    return P5();
  } }), g5 = y3(a10, m12);
  l(() => {
    if (u13.listboxState !== 0 || !b7 || u13.activationTrigger === 0) return;
    let A3 = o4();
    return A3.requestAnimationFrame(() => {
      var d16, H6;
      (H6 = (d16 = m12.current) == null ? void 0 : d16.scrollIntoView) == null || H6.call(d16, { block: "nearest" });
    }), A3.dispose;
  }, [m12, b7, u13.listboxState, u13.activationTrigger, u13.activeOptionIndex]), l(() => i8.registerOption(r9, S10), [S10, r9]);
  let x4 = o2((A3) => {
    if (l13) return A3.preventDefault();
    i8.onChange(t18), u13.mode === 0 && (i8.closeListbox(), o4().nextFrame(() => {
      var d16;
      return (d16 = u13.buttonRef.current) == null ? void 0 : d16.focus({ preventScroll: true });
    }));
  }), T7 = o2(() => {
    if (l13) return i8.goToOption(c3.Nothing);
    i8.goToOption(c3.Specific, r9);
  }), o13 = u3(), L2 = o2((A3) => o13.update(A3)), U7 = o2((A3) => {
    o13.wasMoved(A3) && (l13 || b7 || i8.goToOption(c3.Specific, r9, 0));
  }), B4 = o2((A3) => {
    o13.wasMoved(A3) && (l13 || b7 && i8.goToOption(c3.Nothing));
  }), W = (0, import_react34.useMemo)(() => ({ active: b7, selected: R4, disabled: l13 }), [b7, R4, l13]);
  return C({ ourProps: { id: r9, ref: g5, role: "option", tabIndex: l13 === true ? void 0 : -1, "aria-disabled": l13 === true ? true : void 0, "aria-selected": R4, disabled: void 0, onClick: x4, onFocus: T7, onPointerEnter: L2, onMouseEnter: L2, onPointerMove: U7, onMouseMove: U7, onPointerLeave: B4, onMouseLeave: B4 }, theirProps: p7, slot: W, defaultTag: Ze3, name: "Listbox.Option" });
}
var tt3 = U(Qe3);
var ot2 = U(Xe2);
var nt2 = U(ze3);
var it2 = U(Ye3);
var rt2 = U(et3);
var It = Object.assign(tt3, { Button: ot2, Label: nt2, Options: it2, Option: rt2 });

// node_modules/@headlessui/react/dist/components/menu/menu.js
var import_react35 = __toESM(require_react(), 1);
var me2 = ((r9) => (r9[r9.Open = 0] = "Open", r9[r9.Closed = 1] = "Closed", r9))(me2 || {});
var de3 = ((r9) => (r9[r9.Pointer = 0] = "Pointer", r9[r9.Other = 1] = "Other", r9))(de3 || {});
var fe = ((a10) => (a10[a10.OpenMenu = 0] = "OpenMenu", a10[a10.CloseMenu = 1] = "CloseMenu", a10[a10.GoToItem = 2] = "GoToItem", a10[a10.Search = 3] = "Search", a10[a10.ClearSearch = 4] = "ClearSearch", a10[a10.RegisterItem = 5] = "RegisterItem", a10[a10.UnregisterItem = 6] = "UnregisterItem", a10))(fe || {});
function w5(e4, u13 = (r9) => r9) {
  let r9 = e4.activeItemIndex !== null ? e4.items[e4.activeItemIndex] : null, s17 = I2(u13(e4.items.slice()), (t18) => t18.dataRef.current.domRef.current), i8 = r9 ? s17.indexOf(r9) : null;
  return i8 === -1 && (i8 = null), { items: s17, activeItemIndex: i8 };
}
var Te = { [1](e4) {
  return e4.menuState === 1 ? e4 : { ...e4, activeItemIndex: null, menuState: 1 };
}, [0](e4) {
  return e4.menuState === 0 ? e4 : { ...e4, __demoMode: false, menuState: 0 };
}, [2]: (e4, u13) => {
  var i8;
  let r9 = w5(e4), s17 = f5(u13, { resolveItems: () => r9.items, resolveActiveIndex: () => r9.activeItemIndex, resolveId: (t18) => t18.id, resolveDisabled: (t18) => t18.dataRef.current.disabled });
  return { ...e4, ...r9, searchQuery: "", activeItemIndex: s17, activationTrigger: (i8 = u13.trigger) != null ? i8 : 1 };
}, [3]: (e4, u13) => {
  let s17 = e4.searchQuery !== "" ? 0 : 1, i8 = e4.searchQuery + u13.value.toLowerCase(), o13 = (e4.activeItemIndex !== null ? e4.items.slice(e4.activeItemIndex + s17).concat(e4.items.slice(0, e4.activeItemIndex + s17)) : e4.items).find((l13) => {
    var m12;
    return ((m12 = l13.dataRef.current.textValue) == null ? void 0 : m12.startsWith(i8)) && !l13.dataRef.current.disabled;
  }), a10 = o13 ? e4.items.indexOf(o13) : -1;
  return a10 === -1 || a10 === e4.activeItemIndex ? { ...e4, searchQuery: i8 } : { ...e4, searchQuery: i8, activeItemIndex: a10, activationTrigger: 1 };
}, [4](e4) {
  return e4.searchQuery === "" ? e4 : { ...e4, searchQuery: "", searchActiveItemIndex: null };
}, [5]: (e4, u13) => {
  let r9 = w5(e4, (s17) => [...s17, { id: u13.id, dataRef: u13.dataRef }]);
  return { ...e4, ...r9 };
}, [6]: (e4, u13) => {
  let r9 = w5(e4, (s17) => {
    let i8 = s17.findIndex((t18) => t18.id === u13.id);
    return i8 !== -1 && s17.splice(i8, 1), s17;
  });
  return { ...e4, ...r9, activationTrigger: 1 };
} };
var U4 = (0, import_react35.createContext)(null);
U4.displayName = "MenuContext";
function C3(e4) {
  let u13 = (0, import_react35.useContext)(U4);
  if (u13 === null) {
    let r9 = new Error(`<${e4} /> is missing a parent <Menu /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(r9, C3), r9;
  }
  return u13;
}
function ye3(e4, u13) {
  return u(u13.type, Te, e4, u13);
}
var Ie2 = import_react35.Fragment;
function Me2(e4, u13) {
  let { __demoMode: r9 = false, ...s17 } = e4, i8 = (0, import_react35.useReducer)(ye3, { __demoMode: r9, menuState: r9 ? 0 : 1, buttonRef: (0, import_react35.createRef)(), itemsRef: (0, import_react35.createRef)(), items: [], searchQuery: "", activeItemIndex: null, activationTrigger: 1 }), [{ menuState: t18, itemsRef: o13, buttonRef: a10 }, l13] = i8, m12 = y3(u13);
  y2([a10, o13], (g5, R4) => {
    var p7;
    l13({ type: 1 }), h(R4, T2.Loose) || (g5.preventDefault(), (p7 = a10.current) == null || p7.focus());
  }, t18 === 0);
  let I11 = o2(() => {
    l13({ type: 1 });
  }), A3 = (0, import_react35.useMemo)(() => ({ open: t18 === 0, close: I11 }), [t18, I11]), f14 = { ref: m12 };
  return import_react35.default.createElement(U4.Provider, { value: i8 }, import_react35.default.createElement(s9, { value: u(t18, { [0]: d5.Open, [1]: d5.Closed }) }, C({ ourProps: f14, theirProps: s17, slot: A3, defaultTag: Ie2, name: "Menu" })));
}
var ge2 = "button";
function Re(e4, u13) {
  var R4;
  let r9 = I(), { id: s17 = `headlessui-menu-button-${r9}`, ...i8 } = e4, [t18, o13] = C3("Menu.Button"), a10 = y3(t18.buttonRef, u13), l13 = p(), m12 = o2((p7) => {
    switch (p7.key) {
      case o11.Space:
      case o11.Enter:
      case o11.ArrowDown:
        p7.preventDefault(), p7.stopPropagation(), o13({ type: 0 }), l13.nextFrame(() => o13({ type: 2, focus: c3.First }));
        break;
      case o11.ArrowUp:
        p7.preventDefault(), p7.stopPropagation(), o13({ type: 0 }), l13.nextFrame(() => o13({ type: 2, focus: c3.Last }));
        break;
    }
  }), I11 = o2((p7) => {
    switch (p7.key) {
      case o11.Space:
        p7.preventDefault();
        break;
    }
  }), A3 = o2((p7) => {
    if (r2(p7.currentTarget)) return p7.preventDefault();
    e4.disabled || (t18.menuState === 0 ? (o13({ type: 1 }), l13.nextFrame(() => {
      var M7;
      return (M7 = t18.buttonRef.current) == null ? void 0 : M7.focus({ preventScroll: true });
    })) : (p7.preventDefault(), o13({ type: 0 })));
  }), f14 = (0, import_react35.useMemo)(() => ({ open: t18.menuState === 0 }), [t18]), g5 = { ref: a10, id: s17, type: T3(e4, t18.buttonRef), "aria-haspopup": "menu", "aria-controls": (R4 = t18.itemsRef.current) == null ? void 0 : R4.id, "aria-expanded": t18.menuState === 0, onKeyDown: m12, onKeyUp: I11, onClick: A3 };
  return C({ ourProps: g5, theirProps: i8, slot: f14, defaultTag: ge2, name: "Menu.Button" });
}
var Ae3 = "div";
var be2 = O2.RenderStrategy | O2.Static;
function Ee2(e4, u13) {
  var M7, b7;
  let r9 = I(), { id: s17 = `headlessui-menu-items-${r9}`, ...i8 } = e4, [t18, o13] = C3("Menu.Items"), a10 = y3(t18.itemsRef, u13), l13 = n2(t18.itemsRef), m12 = p(), I11 = u5(), A3 = (() => I11 !== null ? (I11 & d5.Open) === d5.Open : t18.menuState === 0)();
  (0, import_react35.useEffect)(() => {
    let n7 = t18.itemsRef.current;
    n7 && t18.menuState === 0 && n7 !== (l13 == null ? void 0 : l13.activeElement) && n7.focus({ preventScroll: true });
  }, [t18.menuState, t18.itemsRef, l13]), F2({ container: t18.itemsRef.current, enabled: t18.menuState === 0, accept(n7) {
    return n7.getAttribute("role") === "menuitem" ? NodeFilter.FILTER_REJECT : n7.hasAttribute("role") ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
  }, walk(n7) {
    n7.setAttribute("role", "none");
  } });
  let f14 = o2((n7) => {
    var E8, x4;
    switch (m12.dispose(), n7.key) {
      case o11.Space:
        if (t18.searchQuery !== "") return n7.preventDefault(), n7.stopPropagation(), o13({ type: 3, value: n7.key });
      case o11.Enter:
        if (n7.preventDefault(), n7.stopPropagation(), o13({ type: 1 }), t18.activeItemIndex !== null) {
          let { dataRef: S10 } = t18.items[t18.activeItemIndex];
          (x4 = (E8 = S10.current) == null ? void 0 : E8.domRef.current) == null || x4.click();
        }
        D(t18.buttonRef.current);
        break;
      case o11.ArrowDown:
        return n7.preventDefault(), n7.stopPropagation(), o13({ type: 2, focus: c3.Next });
      case o11.ArrowUp:
        return n7.preventDefault(), n7.stopPropagation(), o13({ type: 2, focus: c3.Previous });
      case o11.Home:
      case o11.PageUp:
        return n7.preventDefault(), n7.stopPropagation(), o13({ type: 2, focus: c3.First });
      case o11.End:
      case o11.PageDown:
        return n7.preventDefault(), n7.stopPropagation(), o13({ type: 2, focus: c3.Last });
      case o11.Escape:
        n7.preventDefault(), n7.stopPropagation(), o13({ type: 1 }), o4().nextFrame(() => {
          var S10;
          return (S10 = t18.buttonRef.current) == null ? void 0 : S10.focus({ preventScroll: true });
        });
        break;
      case o11.Tab:
        n7.preventDefault(), n7.stopPropagation(), o13({ type: 1 }), o4().nextFrame(() => {
          _(t18.buttonRef.current, n7.shiftKey ? M.Previous : M.Next);
        });
        break;
      default:
        n7.key.length === 1 && (o13({ type: 3, value: n7.key }), m12.setTimeout(() => o13({ type: 4 }), 350));
        break;
    }
  }), g5 = o2((n7) => {
    switch (n7.key) {
      case o11.Space:
        n7.preventDefault();
        break;
    }
  }), R4 = (0, import_react35.useMemo)(() => ({ open: t18.menuState === 0 }), [t18]), p7 = { "aria-activedescendant": t18.activeItemIndex === null || (M7 = t18.items[t18.activeItemIndex]) == null ? void 0 : M7.id, "aria-labelledby": (b7 = t18.buttonRef.current) == null ? void 0 : b7.id, id: s17, onKeyDown: f14, onKeyUp: g5, role: "menu", tabIndex: 0, ref: a10 };
  return C({ ourProps: p7, theirProps: i8, slot: R4, defaultTag: Ae3, features: be2, visible: A3, name: "Menu.Items" });
}
var Se = import_react35.Fragment;
function xe2(e4, u13) {
  let r9 = I(), { id: s17 = `headlessui-menu-item-${r9}`, disabled: i8 = false, ...t18 } = e4, [o13, a10] = C3("Menu.Item"), l13 = o13.activeItemIndex !== null ? o13.items[o13.activeItemIndex].id === s17 : false, m12 = (0, import_react35.useRef)(null), I11 = y3(u13, m12);
  l(() => {
    if (o13.__demoMode || o13.menuState !== 0 || !l13 || o13.activationTrigger === 0) return;
    let T7 = o4();
    return T7.requestAnimationFrame(() => {
      var P5, B4;
      (B4 = (P5 = m12.current) == null ? void 0 : P5.scrollIntoView) == null || B4.call(P5, { block: "nearest" });
    }), T7.dispose;
  }, [o13.__demoMode, m12, l13, o13.menuState, o13.activationTrigger, o13.activeItemIndex]);
  let A3 = s14(m12), f14 = (0, import_react35.useRef)({ disabled: i8, domRef: m12, get textValue() {
    return A3();
  } });
  l(() => {
    f14.current.disabled = i8;
  }, [f14, i8]), l(() => (a10({ type: 5, id: s17, dataRef: f14 }), () => a10({ type: 6, id: s17 })), [f14, s17]);
  let g5 = o2(() => {
    a10({ type: 1 });
  }), R4 = o2((T7) => {
    if (i8) return T7.preventDefault();
    a10({ type: 1 }), D(o13.buttonRef.current);
  }), p7 = o2(() => {
    if (i8) return a10({ type: 2, focus: c3.Nothing });
    a10({ type: 2, focus: c3.Specific, id: s17 });
  }), M7 = u3(), b7 = o2((T7) => M7.update(T7)), n7 = o2((T7) => {
    M7.wasMoved(T7) && (i8 || l13 || a10({ type: 2, focus: c3.Specific, id: s17, trigger: 0 }));
  }), E8 = o2((T7) => {
    M7.wasMoved(T7) && (i8 || l13 && a10({ type: 2, focus: c3.Nothing }));
  }), x4 = (0, import_react35.useMemo)(() => ({ active: l13, disabled: i8, close: g5 }), [l13, i8, g5]);
  return C({ ourProps: { id: s17, ref: I11, role: "menuitem", tabIndex: i8 === true ? void 0 : -1, "aria-disabled": i8 === true ? true : void 0, disabled: void 0, onClick: R4, onFocus: p7, onPointerEnter: b7, onMouseEnter: b7, onPointerMove: n7, onMouseMove: n7, onPointerLeave: E8, onMouseLeave: E8 }, theirProps: t18, slot: x4, defaultTag: Se, name: "Menu.Item" });
}
var Pe3 = U(Me2);
var ve = U(Re);
var he = U(Ee2);
var De = U(xe2);
var qe4 = Object.assign(Pe3, { Button: ve, Items: he, Item: De });

// node_modules/@headlessui/react/dist/components/popover/popover.js
var import_react36 = __toESM(require_react(), 1);
var he2 = ((u13) => (u13[u13.Open = 0] = "Open", u13[u13.Closed = 1] = "Closed", u13))(he2 || {});
var He3 = ((e4) => (e4[e4.TogglePopover = 0] = "TogglePopover", e4[e4.ClosePopover = 1] = "ClosePopover", e4[e4.SetButton = 2] = "SetButton", e4[e4.SetButtonId = 3] = "SetButtonId", e4[e4.SetPanel = 4] = "SetPanel", e4[e4.SetPanelId = 5] = "SetPanelId", e4))(He3 || {});
var Ge3 = { [0]: (t18) => {
  let o13 = { ...t18, popoverState: u(t18.popoverState, { [0]: 1, [1]: 0 }) };
  return o13.popoverState === 0 && (o13.__demoMode = false), o13;
}, [1](t18) {
  return t18.popoverState === 1 ? t18 : { ...t18, popoverState: 1 };
}, [2](t18, o13) {
  return t18.button === o13.button ? t18 : { ...t18, button: o13.button };
}, [3](t18, o13) {
  return t18.buttonId === o13.buttonId ? t18 : { ...t18, buttonId: o13.buttonId };
}, [4](t18, o13) {
  return t18.panel === o13.panel ? t18 : { ...t18, panel: o13.panel };
}, [5](t18, o13) {
  return t18.panelId === o13.panelId ? t18 : { ...t18, panelId: o13.panelId };
} };
var ue3 = (0, import_react36.createContext)(null);
ue3.displayName = "PopoverContext";
function oe2(t18) {
  let o13 = (0, import_react36.useContext)(ue3);
  if (o13 === null) {
    let u13 = new Error(`<${t18} /> is missing a parent <Popover /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(u13, oe2), u13;
  }
  return o13;
}
var ie3 = (0, import_react36.createContext)(null);
ie3.displayName = "PopoverAPIContext";
function fe2(t18) {
  let o13 = (0, import_react36.useContext)(ie3);
  if (o13 === null) {
    let u13 = new Error(`<${t18} /> is missing a parent <Popover /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(u13, fe2), u13;
  }
  return o13;
}
var Pe4 = (0, import_react36.createContext)(null);
Pe4.displayName = "PopoverGroupContext";
function Ee3() {
  return (0, import_react36.useContext)(Pe4);
}
var re2 = (0, import_react36.createContext)(null);
re2.displayName = "PopoverPanelContext";
function Ne3() {
  return (0, import_react36.useContext)(re2);
}
function ke(t18, o13) {
  return u(o13.type, Ge3, t18, o13);
}
var we2 = "div";
function Ue2(t18, o13) {
  var B4;
  let { __demoMode: u13 = false, ...M7 } = t18, x4 = (0, import_react36.useRef)(null), n7 = y3(o13, T4((l13) => {
    x4.current = l13;
  })), e4 = (0, import_react36.useRef)([]), c13 = (0, import_react36.useReducer)(ke, { __demoMode: u13, popoverState: u13 ? 0 : 1, buttons: e4, button: null, buttonId: null, panel: null, panelId: null, beforePanelSentinel: (0, import_react36.createRef)(), afterPanelSentinel: (0, import_react36.createRef)() }), [{ popoverState: f14, button: s17, buttonId: I11, panel: a10, panelId: v6, beforePanelSentinel: y7, afterPanelSentinel: A3 }, P5] = c13, p7 = n2((B4 = x4.current) != null ? B4 : s17), E8 = (0, import_react36.useMemo)(() => {
    if (!s17 || !a10) return false;
    for (let W of document.querySelectorAll("body > *")) if (Number(W == null ? void 0 : W.contains(s17)) ^ Number(W == null ? void 0 : W.contains(a10))) return true;
    let l13 = f2(), S10 = l13.indexOf(s17), q6 = (S10 + l13.length - 1) % l13.length, U7 = (S10 + 1) % l13.length, z4 = l13[q6], be4 = l13[U7];
    return !a10.contains(z4) && !a10.contains(be4);
  }, [s17, a10]), F10 = s2(I11), D7 = s2(v6), _5 = (0, import_react36.useMemo)(() => ({ buttonId: F10, panelId: D7, close: () => P5({ type: 1 }) }), [F10, D7, P5]), O4 = Ee3(), L2 = O4 == null ? void 0 : O4.registerPopover, $6 = o2(() => {
    var l13;
    return (l13 = O4 == null ? void 0 : O4.isFocusWithinPopoverGroup()) != null ? l13 : (p7 == null ? void 0 : p7.activeElement) && ((s17 == null ? void 0 : s17.contains(p7.activeElement)) || (a10 == null ? void 0 : a10.contains(p7.activeElement)));
  });
  (0, import_react36.useEffect)(() => L2 == null ? void 0 : L2(_5), [L2, _5]);
  let [i8, b7] = ee2(), T7 = N4({ mainTreeNodeRef: O4 == null ? void 0 : O4.mainTreeNodeRef, portals: i8, defaultContainers: [s17, a10] });
  E3(p7 == null ? void 0 : p7.defaultView, "focus", (l13) => {
    var S10, q6, U7, z4;
    l13.target !== window && l13.target instanceof HTMLElement && f14 === 0 && ($6() || s17 && a10 && (T7.contains(l13.target) || (q6 = (S10 = y7.current) == null ? void 0 : S10.contains) != null && q6.call(S10, l13.target) || (z4 = (U7 = A3.current) == null ? void 0 : U7.contains) != null && z4.call(U7, l13.target) || P5({ type: 1 })));
  }, true), y2(T7.resolveContainers, (l13, S10) => {
    P5({ type: 1 }), h(S10, T2.Loose) || (l13.preventDefault(), s17 == null || s17.focus());
  }, f14 === 0);
  let d16 = o2((l13) => {
    P5({ type: 1 });
    let S10 = (() => l13 ? l13 instanceof HTMLElement ? l13 : "current" in l13 && l13.current instanceof HTMLElement ? l13.current : s17 : s17)();
    S10 == null || S10.focus();
  }), r9 = (0, import_react36.useMemo)(() => ({ close: d16, isPortalled: E8 }), [d16, E8]), m12 = (0, import_react36.useMemo)(() => ({ open: f14 === 0, close: d16 }), [f14, d16]), g5 = { ref: n7 };
  return import_react36.default.createElement(re2.Provider, { value: null }, import_react36.default.createElement(ue3.Provider, { value: c13 }, import_react36.default.createElement(ie3.Provider, { value: r9 }, import_react36.default.createElement(s9, { value: u(f14, { [0]: d5.Open, [1]: d5.Closed }) }, import_react36.default.createElement(b7, null, C({ ourProps: g5, theirProps: M7, slot: m12, defaultTag: we2, name: "Popover" }), import_react36.default.createElement(T7.MainTreeNode, null))))));
}
var We3 = "button";
function Ke3(t18, o13) {
  let u13 = I(), { id: M7 = `headlessui-popover-button-${u13}`, ...x4 } = t18, [n7, e4] = oe2("Popover.Button"), { isPortalled: c13 } = fe2("Popover.Button"), f14 = (0, import_react36.useRef)(null), s17 = `headlessui-focus-sentinel-${I()}`, I11 = Ee3(), a10 = I11 == null ? void 0 : I11.closeOthers, y7 = Ne3() !== null;
  (0, import_react36.useEffect)(() => {
    if (!y7) return e4({ type: 3, buttonId: M7 }), () => {
      e4({ type: 3, buttonId: null });
    };
  }, [y7, M7, e4]);
  let [A3] = (0, import_react36.useState)(() => Symbol()), P5 = y3(f14, o13, y7 ? null : (r9) => {
    if (r9) n7.buttons.current.push(A3);
    else {
      let m12 = n7.buttons.current.indexOf(A3);
      m12 !== -1 && n7.buttons.current.splice(m12, 1);
    }
    n7.buttons.current.length > 1 && console.warn("You are already using a <Popover.Button /> but only 1 <Popover.Button /> is supported."), r9 && e4({ type: 2, button: r9 });
  }), p7 = y3(f14, o13), E8 = n2(f14), F10 = o2((r9) => {
    var m12, g5, B4;
    if (y7) {
      if (n7.popoverState === 1) return;
      switch (r9.key) {
        case o11.Space:
        case o11.Enter:
          r9.preventDefault(), (g5 = (m12 = r9.target).click) == null || g5.call(m12), e4({ type: 1 }), (B4 = n7.button) == null || B4.focus();
          break;
      }
    } else switch (r9.key) {
      case o11.Space:
      case o11.Enter:
        r9.preventDefault(), r9.stopPropagation(), n7.popoverState === 1 && (a10 == null || a10(n7.buttonId)), e4({ type: 0 });
        break;
      case o11.Escape:
        if (n7.popoverState !== 0) return a10 == null ? void 0 : a10(n7.buttonId);
        if (!f14.current || E8 != null && E8.activeElement && !f14.current.contains(E8.activeElement)) return;
        r9.preventDefault(), r9.stopPropagation(), e4({ type: 1 });
        break;
    }
  }), D7 = o2((r9) => {
    y7 || r9.key === o11.Space && r9.preventDefault();
  }), _5 = o2((r9) => {
    var m12, g5;
    r2(r9.currentTarget) || t18.disabled || (y7 ? (e4({ type: 1 }), (m12 = n7.button) == null || m12.focus()) : (r9.preventDefault(), r9.stopPropagation(), n7.popoverState === 1 && (a10 == null || a10(n7.buttonId)), e4({ type: 0 }), (g5 = n7.button) == null || g5.focus()));
  }), O4 = o2((r9) => {
    r9.preventDefault(), r9.stopPropagation();
  }), L2 = n7.popoverState === 0, $6 = (0, import_react36.useMemo)(() => ({ open: L2 }), [L2]), i8 = T3(t18, f14), b7 = y7 ? { ref: p7, type: i8, onKeyDown: F10, onClick: _5 } : { ref: P5, id: n7.buttonId, type: i8, "aria-expanded": n7.popoverState === 0, "aria-controls": n7.panel ? n7.panelId : void 0, onKeyDown: F10, onKeyUp: D7, onClick: _5, onMouseDown: O4 }, T7 = n5(), d16 = o2(() => {
    let r9 = n7.panel;
    if (!r9) return;
    function m12() {
      u(T7.current, { [s10.Forwards]: () => O(r9, M.First), [s10.Backwards]: () => O(r9, M.Last) }) === N.Error && O(f2().filter((B4) => B4.dataset.headlessuiFocusGuard !== "true"), u(T7.current, { [s10.Forwards]: M.Next, [s10.Backwards]: M.Previous }), { relativeTo: n7.button });
    }
    m12();
  });
  return import_react36.default.createElement(import_react36.default.Fragment, null, C({ ourProps: b7, theirProps: x4, slot: $6, defaultTag: We3, name: "Popover.Button" }), L2 && !y7 && c13 && import_react36.default.createElement(u4, { id: s17, features: s8.Focusable, "data-headlessui-focus-guard": true, as: "button", type: "button", onFocus: d16 }));
}
var je3 = "div";
var Ve4 = O2.RenderStrategy | O2.Static;
function $e4(t18, o13) {
  let u13 = I(), { id: M7 = `headlessui-popover-overlay-${u13}`, ...x4 } = t18, [{ popoverState: n7 }, e4] = oe2("Popover.Overlay"), c13 = y3(o13), f14 = u5(), s17 = (() => f14 !== null ? (f14 & d5.Open) === d5.Open : n7 === 0)(), I11 = o2((y7) => {
    if (r2(y7.currentTarget)) return y7.preventDefault();
    e4({ type: 1 });
  }), a10 = (0, import_react36.useMemo)(() => ({ open: n7 === 0 }), [n7]);
  return C({ ourProps: { ref: c13, id: M7, "aria-hidden": true, onClick: I11 }, theirProps: x4, slot: a10, defaultTag: je3, features: Ve4, visible: s17, name: "Popover.Overlay" });
}
var Je3 = "div";
var Xe3 = O2.RenderStrategy | O2.Static;
function Ye4(t18, o13) {
  let u13 = I(), { id: M7 = `headlessui-popover-panel-${u13}`, focus: x4 = false, ...n7 } = t18, [e4, c13] = oe2("Popover.Panel"), { close: f14, isPortalled: s17 } = fe2("Popover.Panel"), I11 = `headlessui-focus-sentinel-before-${I()}`, a10 = `headlessui-focus-sentinel-after-${I()}`, v6 = (0, import_react36.useRef)(null), y7 = y3(v6, o13, (i8) => {
    c13({ type: 4, panel: i8 });
  }), A3 = n2(v6), P5 = I3();
  l(() => (c13({ type: 5, panelId: M7 }), () => {
    c13({ type: 5, panelId: null });
  }), [M7, c13]);
  let p7 = u5(), E8 = (() => p7 !== null ? (p7 & d5.Open) === d5.Open : e4.popoverState === 0)(), F10 = o2((i8) => {
    var b7;
    switch (i8.key) {
      case o11.Escape:
        if (e4.popoverState !== 0 || !v6.current || A3 != null && A3.activeElement && !v6.current.contains(A3.activeElement)) return;
        i8.preventDefault(), i8.stopPropagation(), c13({ type: 1 }), (b7 = e4.button) == null || b7.focus();
        break;
    }
  });
  (0, import_react36.useEffect)(() => {
    var i8;
    t18.static || e4.popoverState === 1 && ((i8 = t18.unmount) == null || i8) && c13({ type: 4, panel: null });
  }, [e4.popoverState, t18.unmount, t18.static, c13]), (0, import_react36.useEffect)(() => {
    if (e4.__demoMode || !x4 || e4.popoverState !== 0 || !v6.current) return;
    let i8 = A3 == null ? void 0 : A3.activeElement;
    v6.current.contains(i8) || O(v6.current, M.First);
  }, [e4.__demoMode, x4, v6, e4.popoverState]);
  let D7 = (0, import_react36.useMemo)(() => ({ open: e4.popoverState === 0, close: f14 }), [e4, f14]), _5 = { ref: y7, id: M7, onKeyDown: F10, onBlur: x4 && e4.popoverState === 0 ? (i8) => {
    var T7, d16, r9, m12, g5;
    let b7 = i8.relatedTarget;
    b7 && v6.current && ((T7 = v6.current) != null && T7.contains(b7) || (c13({ type: 1 }), ((r9 = (d16 = e4.beforePanelSentinel.current) == null ? void 0 : d16.contains) != null && r9.call(d16, b7) || (g5 = (m12 = e4.afterPanelSentinel.current) == null ? void 0 : m12.contains) != null && g5.call(m12, b7)) && b7.focus({ preventScroll: true })));
  } : void 0, tabIndex: -1 }, O4 = n5(), L2 = o2(() => {
    let i8 = v6.current;
    if (!i8) return;
    function b7() {
      u(O4.current, { [s10.Forwards]: () => {
        var d16;
        O(i8, M.First) === N.Error && ((d16 = e4.afterPanelSentinel.current) == null || d16.focus());
      }, [s10.Backwards]: () => {
        var T7;
        (T7 = e4.button) == null || T7.focus({ preventScroll: true });
      } });
    }
    b7();
  }), $6 = o2(() => {
    let i8 = v6.current;
    if (!i8) return;
    function b7() {
      u(O4.current, { [s10.Forwards]: () => {
        var B4;
        if (!e4.button) return;
        let T7 = f2(), d16 = T7.indexOf(e4.button), r9 = T7.slice(0, d16 + 1), g5 = [...T7.slice(d16 + 1), ...r9];
        for (let l13 of g5.slice()) if (l13.dataset.headlessuiFocusGuard === "true" || (B4 = e4.panel) != null && B4.contains(l13)) {
          let S10 = g5.indexOf(l13);
          S10 !== -1 && g5.splice(S10, 1);
        }
        O(g5, M.First, { sorted: false });
      }, [s10.Backwards]: () => {
        var d16;
        O(i8, M.Previous) === N.Error && ((d16 = e4.button) == null || d16.focus());
      } });
    }
    b7();
  });
  return import_react36.default.createElement(re2.Provider, { value: M7 }, E8 && s17 && import_react36.default.createElement(u4, { id: I11, ref: e4.beforePanelSentinel, features: s8.Focusable, "data-headlessui-focus-guard": true, as: "button", type: "button", onFocus: L2 }), C({ mergeRefs: P5, ourProps: _5, theirProps: n7, slot: D7, defaultTag: Je3, features: Xe3, visible: E8, name: "Popover.Panel" }), E8 && s17 && import_react36.default.createElement(u4, { id: a10, ref: e4.afterPanelSentinel, features: s8.Focusable, "data-headlessui-focus-guard": true, as: "button", type: "button", onFocus: $6 }));
}
var qe5 = "div";
function ze4(t18, o13) {
  let u13 = (0, import_react36.useRef)(null), M7 = y3(u13, o13), [x4, n7] = (0, import_react36.useState)([]), e4 = y5(), c13 = o2((P5) => {
    n7((p7) => {
      let E8 = p7.indexOf(P5);
      if (E8 !== -1) {
        let F10 = p7.slice();
        return F10.splice(E8, 1), F10;
      }
      return p7;
    });
  }), f14 = o2((P5) => (n7((p7) => [...p7, P5]), () => c13(P5))), s17 = o2(() => {
    var E8;
    let P5 = o7(u13);
    if (!P5) return false;
    let p7 = P5.activeElement;
    return (E8 = u13.current) != null && E8.contains(p7) ? true : x4.some((F10) => {
      var D7, _5;
      return ((D7 = P5.getElementById(F10.buttonId.current)) == null ? void 0 : D7.contains(p7)) || ((_5 = P5.getElementById(F10.panelId.current)) == null ? void 0 : _5.contains(p7));
    });
  }), I11 = o2((P5) => {
    for (let p7 of x4) p7.buttonId.current !== P5 && p7.close();
  }), a10 = (0, import_react36.useMemo)(() => ({ registerPopover: f14, unregisterPopover: c13, isFocusWithinPopoverGroup: s17, closeOthers: I11, mainTreeNodeRef: e4.mainTreeNodeRef }), [f14, c13, s17, I11, e4.mainTreeNodeRef]), v6 = (0, import_react36.useMemo)(() => ({}), []), y7 = t18, A3 = { ref: M7 };
  return import_react36.default.createElement(Pe4.Provider, { value: a10 }, C({ ourProps: A3, theirProps: y7, slot: v6, defaultTag: qe5, name: "Popover.Group" }), import_react36.default.createElement(e4.MainTreeNode, null));
}
var Qe4 = U(Ue2);
var Ze4 = U(Ke3);
var et4 = U($e4);
var tt4 = U(Ye4);
var ot3 = U(ze4);
var Ct = Object.assign(Qe4, { Button: Ze4, Overlay: et4, Panel: tt4, Group: ot3 });

// node_modules/@headlessui/react/dist/components/radio-group/radio-group.js
var import_react39 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/components/label/label.js
var import_react37 = __toESM(require_react(), 1);
var d14 = (0, import_react37.createContext)(null);
function u12() {
  let a10 = (0, import_react37.useContext)(d14);
  if (a10 === null) {
    let t18 = new Error("You used a <Label /> component, but it is not inside a relevant parent.");
    throw Error.captureStackTrace && Error.captureStackTrace(t18, u12), t18;
  }
  return a10;
}
function F6() {
  let [a10, t18] = (0, import_react37.useState)([]);
  return [a10.length > 0 ? a10.join(" ") : void 0, (0, import_react37.useMemo)(() => function(e4) {
    let s17 = o2((r9) => (t18((l13) => [...l13, r9]), () => t18((l13) => {
      let n7 = l13.slice(), p7 = n7.indexOf(r9);
      return p7 !== -1 && n7.splice(p7, 1), n7;
    }))), o13 = (0, import_react37.useMemo)(() => ({ register: s17, slot: e4.slot, name: e4.name, props: e4.props }), [s17, e4.slot, e4.name, e4.props]);
    return import_react37.default.createElement(d14.Provider, { value: o13 }, e4.children);
  }, [t18])];
}
var A = "label";
function h8(a10, t18) {
  let i8 = I(), { id: e4 = `headlessui-label-${i8}`, passive: s17 = false, ...o13 } = a10, r9 = u12(), l13 = y3(t18);
  l(() => r9.register(e4), [e4, r9.register]);
  let n7 = { ref: l13, ...r9.props, id: e4 };
  return s17 && ("onClick" in n7 && (delete n7.htmlFor, delete n7.onClick), "onClick" in o13 && delete o13.onClick), C({ ourProps: n7, theirProps: o13, slot: r9.slot || {}, defaultTag: A, name: r9.name || "Label" });
}
var v4 = U(h8);
var B2 = Object.assign(v4, {});

// node_modules/@headlessui/react/dist/hooks/use-flags.js
var import_react38 = __toESM(require_react(), 1);
function c10(a10 = 0) {
  let [l13, r9] = (0, import_react38.useState)(a10), t18 = f7(), o13 = (0, import_react38.useCallback)((e4) => {
    t18.current && r9((u13) => u13 | e4);
  }, [l13, t18]), m12 = (0, import_react38.useCallback)((e4) => Boolean(l13 & e4), [l13]), s17 = (0, import_react38.useCallback)((e4) => {
    t18.current && r9((u13) => u13 & ~e4);
  }, [r9, t18]), g5 = (0, import_react38.useCallback)((e4) => {
    t18.current && r9((u13) => u13 ^ e4);
  }, [r9]);
  return { flags: l13, addFlag: o13, hasFlag: m12, removeFlag: s17, toggleFlag: g5 };
}

// node_modules/@headlessui/react/dist/components/radio-group/radio-group.js
var Ge4 = ((t18) => (t18[t18.RegisterOption = 0] = "RegisterOption", t18[t18.UnregisterOption = 1] = "UnregisterOption", t18))(Ge4 || {});
var Ce2 = { [0](o13, r9) {
  let t18 = [...o13.options, { id: r9.id, element: r9.element, propsRef: r9.propsRef }];
  return { ...o13, options: I2(t18, (p7) => p7.element.current) };
}, [1](o13, r9) {
  let t18 = o13.options.slice(), p7 = o13.options.findIndex((T7) => T7.id === r9.id);
  return p7 === -1 ? o13 : (t18.splice(p7, 1), { ...o13, options: t18 });
} };
var B3 = (0, import_react39.createContext)(null);
B3.displayName = "RadioGroupDataContext";
function oe3(o13) {
  let r9 = (0, import_react39.useContext)(B3);
  if (r9 === null) {
    let t18 = new Error(`<${o13} /> is missing a parent <RadioGroup /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(t18, oe3), t18;
  }
  return r9;
}
var $3 = (0, import_react39.createContext)(null);
$3.displayName = "RadioGroupActionsContext";
function ne2(o13) {
  let r9 = (0, import_react39.useContext)($3);
  if (r9 === null) {
    let t18 = new Error(`<${o13} /> is missing a parent <RadioGroup /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(t18, ne2), t18;
  }
  return r9;
}
function ke2(o13, r9) {
  return u(r9.type, Ce2, o13, r9);
}
var Le2 = "div";
function he3(o13, r9) {
  let t18 = I(), { id: p7 = `headlessui-radiogroup-${t18}`, value: T7, defaultValue: v6, form: M7, name: m12, onChange: H6, by: G4 = (e4, i8) => e4 === i8, disabled: P5 = false, ...N7 } = o13, y7 = o2(typeof G4 == "string" ? (e4, i8) => {
    let n7 = G4;
    return (e4 == null ? void 0 : e4[n7]) === (i8 == null ? void 0 : i8[n7]);
  } : G4), [A3, L2] = (0, import_react39.useReducer)(ke2, { options: [] }), a10 = A3.options, [h9, R4] = F6(), [C7, U7] = w3(), k3 = (0, import_react39.useRef)(null), W = y3(k3, r9), [l13, s17] = T(T7, H6, v6), b7 = (0, import_react39.useMemo)(() => a10.find((e4) => !e4.propsRef.current.disabled), [a10]), x4 = (0, import_react39.useMemo)(() => a10.some((e4) => y7(e4.propsRef.current.value, l13)), [a10, l13]), d16 = o2((e4) => {
    var n7;
    if (P5 || y7(e4, l13)) return false;
    let i8 = (n7 = a10.find((f14) => y7(f14.propsRef.current.value, e4))) == null ? void 0 : n7.propsRef.current;
    return i8 != null && i8.disabled ? false : (s17 == null || s17(e4), true);
  });
  F2({ container: k3.current, accept(e4) {
    return e4.getAttribute("role") === "radio" ? NodeFilter.FILTER_REJECT : e4.hasAttribute("role") ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
  }, walk(e4) {
    e4.setAttribute("role", "none");
  } });
  let F10 = o2((e4) => {
    let i8 = k3.current;
    if (!i8) return;
    let n7 = o7(i8), f14 = a10.filter((u13) => u13.propsRef.current.disabled === false).map((u13) => u13.element.current);
    switch (e4.key) {
      case o11.Enter:
        p4(e4.currentTarget);
        break;
      case o11.ArrowLeft:
      case o11.ArrowUp:
        if (e4.preventDefault(), e4.stopPropagation(), O(f14, M.Previous | M.WrapAround) === N.Success) {
          let g5 = a10.find((K4) => K4.element.current === (n7 == null ? void 0 : n7.activeElement));
          g5 && d16(g5.propsRef.current.value);
        }
        break;
      case o11.ArrowRight:
      case o11.ArrowDown:
        if (e4.preventDefault(), e4.stopPropagation(), O(f14, M.Next | M.WrapAround) === N.Success) {
          let g5 = a10.find((K4) => K4.element.current === (n7 == null ? void 0 : n7.activeElement));
          g5 && d16(g5.propsRef.current.value);
        }
        break;
      case o11.Space:
        {
          e4.preventDefault(), e4.stopPropagation();
          let u13 = a10.find((g5) => g5.element.current === (n7 == null ? void 0 : n7.activeElement));
          u13 && d16(u13.propsRef.current.value);
        }
        break;
    }
  }), c13 = o2((e4) => (L2({ type: 0, ...e4 }), () => L2({ type: 1, id: e4.id }))), w6 = (0, import_react39.useMemo)(() => ({ value: l13, firstOption: b7, containsCheckedOption: x4, disabled: P5, compare: y7, ...A3 }), [l13, b7, x4, P5, y7, A3]), ie5 = (0, import_react39.useMemo)(() => ({ registerOption: c13, change: d16 }), [c13, d16]), ae3 = { ref: W, id: p7, role: "radiogroup", "aria-labelledby": h9, "aria-describedby": C7, onKeyDown: F10 }, pe2 = (0, import_react39.useMemo)(() => ({ value: l13 }), [l13]), I11 = (0, import_react39.useRef)(null), le3 = p();
  return (0, import_react39.useEffect)(() => {
    I11.current && v6 !== void 0 && le3.addEventListener(I11.current, "reset", () => {
      d16(v6);
    });
  }, [I11, d16]), import_react39.default.createElement(U7, { name: "RadioGroup.Description" }, import_react39.default.createElement(R4, { name: "RadioGroup.Label" }, import_react39.default.createElement($3.Provider, { value: ie5 }, import_react39.default.createElement(B3.Provider, { value: w6 }, m12 != null && l13 != null && e({ [m12]: l13 }).map(([e4, i8], n7) => import_react39.default.createElement(u4, { features: s8.Hidden, ref: n7 === 0 ? (f14) => {
    var u13;
    I11.current = (u13 = f14 == null ? void 0 : f14.closest("form")) != null ? u13 : null;
  } : void 0, ...x({ key: e4, as: "input", type: "radio", checked: i8 != null, hidden: true, readOnly: true, form: M7, disabled: P5, name: e4, value: i8 }) })), C({ ourProps: ae3, theirProps: N7, slot: pe2, defaultTag: Le2, name: "RadioGroup" })))));
}
var xe3 = ((t18) => (t18[t18.Empty = 1] = "Empty", t18[t18.Active = 2] = "Active", t18))(xe3 || {});
var Fe2 = "div";
function we3(o13, r9) {
  var F10;
  let t18 = I(), { id: p7 = `headlessui-radiogroup-option-${t18}`, value: T7, disabled: v6 = false, ...M7 } = o13, m12 = (0, import_react39.useRef)(null), H6 = y3(m12, r9), [G4, P5] = F6(), [N7, y7] = w3(), { addFlag: A3, removeFlag: L2, hasFlag: a10 } = c10(1), h9 = s2({ value: T7, disabled: v6 }), R4 = oe3("RadioGroup.Option"), C7 = ne2("RadioGroup.Option");
  l(() => C7.registerOption({ id: p7, element: m12, propsRef: h9 }), [p7, C7, m12, h9]);
  let U7 = o2((c13) => {
    var w6;
    if (r2(c13.currentTarget)) return c13.preventDefault();
    C7.change(T7) && (A3(2), (w6 = m12.current) == null || w6.focus());
  }), k3 = o2((c13) => {
    if (r2(c13.currentTarget)) return c13.preventDefault();
    A3(2);
  }), W = o2(() => L2(2)), l13 = ((F10 = R4.firstOption) == null ? void 0 : F10.id) === p7, s17 = R4.disabled || v6, b7 = R4.compare(R4.value, T7), x4 = { ref: H6, id: p7, role: "radio", "aria-checked": b7 ? "true" : "false", "aria-labelledby": G4, "aria-describedby": N7, "aria-disabled": s17 ? true : void 0, tabIndex: (() => s17 ? -1 : b7 || !R4.containsCheckedOption && l13 ? 0 : -1)(), onClick: s17 ? void 0 : U7, onFocus: s17 ? void 0 : k3, onBlur: s17 ? void 0 : W }, d16 = (0, import_react39.useMemo)(() => ({ checked: b7, disabled: s17, active: a10(2) }), [b7, s17, a10]);
  return import_react39.default.createElement(y7, { name: "RadioGroup.Description" }, import_react39.default.createElement(P5, { name: "RadioGroup.Label" }, C({ ourProps: x4, theirProps: M7, slot: d16, defaultTag: Fe2, name: "RadioGroup.Option" })));
}
var Ie3 = U(he3);
var Se2 = U(we3);
var it3 = Object.assign(Ie3, { Option: Se2, Label: B2, Description: G });

// node_modules/@headlessui/react/dist/components/switch/switch.js
var import_react40 = __toESM(require_react(), 1);
var S8 = (0, import_react40.createContext)(null);
S8.displayName = "GroupContext";
var ee6 = import_react40.Fragment;
function te4(r9) {
  var u13;
  let [n7, p7] = (0, import_react40.useState)(null), [c13, T7] = F6(), [o13, b7] = w3(), a10 = (0, import_react40.useMemo)(() => ({ switch: n7, setSwitch: p7, labelledby: c13, describedby: o13 }), [n7, p7, c13, o13]), d16 = {}, y7 = r9;
  return import_react40.default.createElement(b7, { name: "Switch.Description" }, import_react40.default.createElement(T7, { name: "Switch.Label", props: { htmlFor: (u13 = a10.switch) == null ? void 0 : u13.id, onClick(m12) {
    n7 && (m12.currentTarget.tagName === "LABEL" && m12.preventDefault(), n7.click(), n7.focus({ preventScroll: true }));
  } } }, import_react40.default.createElement(S8.Provider, { value: a10 }, C({ ourProps: d16, theirProps: y7, defaultTag: ee6, name: "Switch.Group" }))));
}
var ne3 = "button";
function re3(r9, n7) {
  var E8;
  let p7 = I(), { id: c13 = `headlessui-switch-${p7}`, checked: T7, defaultChecked: o13 = false, onChange: b7, disabled: a10 = false, name: d16, value: y7, form: u13, ...m12 } = r9, t18 = (0, import_react40.useContext)(S8), f14 = (0, import_react40.useRef)(null), C7 = y3(f14, n7, t18 === null ? null : t18.setSwitch), [i8, s17] = T(T7, b7, o13), w6 = o2(() => s17 == null ? void 0 : s17(!i8)), L2 = o2((e4) => {
    if (r2(e4.currentTarget)) return e4.preventDefault();
    e4.preventDefault(), w6();
  }), x4 = o2((e4) => {
    e4.key === o11.Space ? (e4.preventDefault(), w6()) : e4.key === o11.Enter && p4(e4.currentTarget);
  }), v6 = o2((e4) => e4.preventDefault()), G4 = (0, import_react40.useMemo)(() => ({ checked: i8 }), [i8]), R4 = { id: c13, ref: C7, role: "switch", type: T3(r9, f14), tabIndex: r9.tabIndex === -1 ? 0 : (E8 = r9.tabIndex) != null ? E8 : 0, "aria-checked": i8, "aria-labelledby": t18 == null ? void 0 : t18.labelledby, "aria-describedby": t18 == null ? void 0 : t18.describedby, disabled: a10, onClick: L2, onKeyUp: x4, onKeyPress: v6 }, k3 = p();
  return (0, import_react40.useEffect)(() => {
    var _5;
    let e4 = (_5 = f14.current) == null ? void 0 : _5.closest("form");
    e4 && o13 !== void 0 && k3.addEventListener(e4, "reset", () => {
      s17(o13);
    });
  }, [f14, s17]), import_react40.default.createElement(import_react40.default.Fragment, null, d16 != null && i8 && import_react40.default.createElement(u4, { features: s8.Hidden, ...x({ as: "input", type: "checkbox", hidden: true, readOnly: true, disabled: a10, form: u13, checked: i8, name: d16, value: y7 }) }), C({ ourProps: R4, theirProps: m12, slot: G4, defaultTag: ne3, name: "Switch" }));
}
var oe4 = U(re3);
var ie4 = te4;
var _e2 = Object.assign(oe4, { Group: ie4, Label: B2, Description: G });

// node_modules/@headlessui/react/dist/components/tabs/tabs.js
var import_react42 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/internal/focus-sentinel.js
var import_react41 = __toESM(require_react(), 1);
function b5({ onFocus: n7 }) {
  let [r9, o13] = (0, import_react41.useState)(true), u13 = f7();
  return r9 ? import_react41.default.createElement(u4, { as: "button", type: "button", features: s8.Focusable, onFocus: (a10) => {
    a10.preventDefault();
    let e4, i8 = 50;
    function t18() {
      if (i8-- <= 0) {
        e4 && cancelAnimationFrame(e4);
        return;
      }
      if (n7()) {
        if (cancelAnimationFrame(e4), !u13.current) return;
        o13(false);
        return;
      }
      e4 = requestAnimationFrame(t18);
    }
    e4 = requestAnimationFrame(t18);
  } }) : null;
}

// node_modules/@headlessui/react/dist/utils/stable-collection.js
var r8 = __toESM(require_react(), 1);
var s16 = r8.createContext(null);
function a9() {
  return { groups: /* @__PURE__ */ new Map(), get(n7, t18) {
    var c13;
    let e4 = this.groups.get(n7);
    e4 || (e4 = /* @__PURE__ */ new Map(), this.groups.set(n7, e4));
    let l13 = (c13 = e4.get(t18)) != null ? c13 : 0;
    e4.set(t18, l13 + 1);
    let o13 = Array.from(e4.keys()).indexOf(t18);
    function i8() {
      let u13 = e4.get(t18);
      u13 > 1 ? e4.set(t18, u13 - 1) : e4.delete(t18);
    }
    return [o13, i8];
  } };
}
function C5({ children: n7 }) {
  let t18 = r8.useRef(a9());
  return r8.createElement(s16.Provider, { value: t18 }, n7);
}
function d15(n7) {
  let t18 = r8.useContext(s16);
  if (!t18) throw new Error("You must wrap your component in a <StableCollection>");
  let e4 = f13(), [l13, o13] = t18.current.get(n7, e4);
  return r8.useEffect(() => o13, []), l13;
}
function f13() {
  var l13, o13, i8;
  let n7 = (i8 = (o13 = (l13 = r8.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) == null ? void 0 : l13.ReactCurrentOwner) == null ? void 0 : o13.current) != null ? i8 : null;
  if (!n7) return Symbol();
  let t18 = [], e4 = n7;
  for (; e4; ) t18.push(e4.index), e4 = e4.return;
  return "$." + t18.join(".");
}

// node_modules/@headlessui/react/dist/components/tabs/tabs.js
var ue5 = ((t18) => (t18[t18.Forwards = 0] = "Forwards", t18[t18.Backwards = 1] = "Backwards", t18))(ue5 || {});
var Te2 = ((l13) => (l13[l13.Less = -1] = "Less", l13[l13.Equal = 0] = "Equal", l13[l13.Greater = 1] = "Greater", l13))(Te2 || {});
var de5 = ((a10) => (a10[a10.SetSelectedIndex = 0] = "SetSelectedIndex", a10[a10.RegisterTab = 1] = "RegisterTab", a10[a10.UnregisterTab = 2] = "UnregisterTab", a10[a10.RegisterPanel = 3] = "RegisterPanel", a10[a10.UnregisterPanel = 4] = "UnregisterPanel", a10))(de5 || {});
var ce3 = { [0](e4, n7) {
  var i8;
  let t18 = I2(e4.tabs, (c13) => c13.current), l13 = I2(e4.panels, (c13) => c13.current), o13 = t18.filter((c13) => {
    var p7;
    return !((p7 = c13.current) != null && p7.hasAttribute("disabled"));
  }), a10 = { ...e4, tabs: t18, panels: l13 };
  if (n7.index < 0 || n7.index > t18.length - 1) {
    let c13 = u(Math.sign(n7.index - e4.selectedIndex), { [-1]: () => 1, [0]: () => u(Math.sign(n7.index), { [-1]: () => 0, [0]: () => 0, [1]: () => 1 }), [1]: () => 0 });
    if (o13.length === 0) return a10;
    let p7 = u(c13, { [0]: () => t18.indexOf(o13[0]), [1]: () => t18.indexOf(o13[o13.length - 1]) });
    return { ...a10, selectedIndex: p7 === -1 ? e4.selectedIndex : p7 };
  }
  let T7 = t18.slice(0, n7.index), m12 = [...t18.slice(n7.index), ...T7].find((c13) => o13.includes(c13));
  if (!m12) return a10;
  let b7 = (i8 = t18.indexOf(m12)) != null ? i8 : e4.selectedIndex;
  return b7 === -1 && (b7 = e4.selectedIndex), { ...a10, selectedIndex: b7 };
}, [1](e4, n7) {
  if (e4.tabs.includes(n7.tab)) return e4;
  let t18 = e4.tabs[e4.selectedIndex], l13 = I2([...e4.tabs, n7.tab], (a10) => a10.current), o13 = e4.selectedIndex;
  return e4.info.current.isControlled || (o13 = l13.indexOf(t18), o13 === -1 && (o13 = e4.selectedIndex)), { ...e4, tabs: l13, selectedIndex: o13 };
}, [2](e4, n7) {
  return { ...e4, tabs: e4.tabs.filter((t18) => t18 !== n7.tab) };
}, [3](e4, n7) {
  return e4.panels.includes(n7.panel) ? e4 : { ...e4, panels: I2([...e4.panels, n7.panel], (t18) => t18.current) };
}, [4](e4, n7) {
  return { ...e4, panels: e4.panels.filter((t18) => t18 !== n7.panel) };
} };
var X3 = (0, import_react42.createContext)(null);
X3.displayName = "TabsDataContext";
function F8(e4) {
  let n7 = (0, import_react42.useContext)(X3);
  if (n7 === null) {
    let t18 = new Error(`<${e4} /> is missing a parent <Tab.Group /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(t18, F8), t18;
  }
  return n7;
}
var $4 = (0, import_react42.createContext)(null);
$4.displayName = "TabsActionsContext";
function q4(e4) {
  let n7 = (0, import_react42.useContext)($4);
  if (n7 === null) {
    let t18 = new Error(`<${e4} /> is missing a parent <Tab.Group /> component.`);
    throw Error.captureStackTrace && Error.captureStackTrace(t18, q4), t18;
  }
  return n7;
}
function fe3(e4, n7) {
  return u(n7.type, ce3, e4, n7);
}
var be3 = import_react42.Fragment;
function me3(e4, n7) {
  let { defaultIndex: t18 = 0, vertical: l13 = false, manual: o13 = false, onChange: a10, selectedIndex: T7 = null, ...R4 } = e4;
  const m12 = l13 ? "vertical" : "horizontal", b7 = o13 ? "manual" : "auto";
  let i8 = T7 !== null, c13 = s2({ isControlled: i8 }), p7 = y3(n7), [u13, f14] = (0, import_react42.useReducer)(fe3, { info: c13, selectedIndex: T7 != null ? T7 : t18, tabs: [], panels: [] }), P5 = (0, import_react42.useMemo)(() => ({ selectedIndex: u13.selectedIndex }), [u13.selectedIndex]), g5 = s2(a10 || (() => {
  })), E8 = s2(u13.tabs), L2 = (0, import_react42.useMemo)(() => ({ orientation: m12, activation: b7, ...u13 }), [m12, b7, u13]), A3 = o2((s17) => (f14({ type: 1, tab: s17 }), () => f14({ type: 2, tab: s17 }))), S10 = o2((s17) => (f14({ type: 3, panel: s17 }), () => f14({ type: 4, panel: s17 }))), k3 = o2((s17) => {
    h9.current !== s17 && g5.current(s17), i8 || f14({ type: 0, index: s17 });
  }), h9 = s2(i8 ? e4.selectedIndex : u13.selectedIndex), W = (0, import_react42.useMemo)(() => ({ registerTab: A3, registerPanel: S10, change: k3 }), []);
  l(() => {
    f14({ type: 0, index: T7 != null ? T7 : t18 });
  }, [T7]), l(() => {
    if (h9.current === void 0 || u13.tabs.length <= 0) return;
    let s17 = I2(u13.tabs, (d16) => d16.current);
    s17.some((d16, M7) => u13.tabs[M7] !== d16) && k3(s17.indexOf(u13.tabs[h9.current]));
  });
  let O4 = { ref: p7 };
  return import_react42.default.createElement(C5, null, import_react42.default.createElement($4.Provider, { value: W }, import_react42.default.createElement(X3.Provider, { value: L2 }, L2.tabs.length <= 0 && import_react42.default.createElement(b5, { onFocus: () => {
    var s17, r9;
    for (let d16 of E8.current) if (((s17 = d16.current) == null ? void 0 : s17.tabIndex) === 0) return (r9 = d16.current) == null || r9.focus(), true;
    return false;
  } }), C({ ourProps: O4, theirProps: R4, slot: P5, defaultTag: be3, name: "Tabs" }))));
}
var Pe5 = "div";
function ye4(e4, n7) {
  let { orientation: t18, selectedIndex: l13 } = F8("Tab.List"), o13 = y3(n7);
  return C({ ourProps: { ref: o13, role: "tablist", "aria-orientation": t18 }, theirProps: e4, slot: { selectedIndex: l13 }, defaultTag: Pe5, name: "Tabs.List" });
}
var xe4 = "button";
function ge4(e4, n7) {
  var O4, s17;
  let t18 = I(), { id: l13 = `headlessui-tabs-tab-${t18}`, ...o13 } = e4, { orientation: a10, activation: T7, selectedIndex: R4, tabs: m12, panels: b7 } = F8("Tab"), i8 = q4("Tab"), c13 = F8("Tab"), p7 = (0, import_react42.useRef)(null), u13 = y3(p7, n7);
  l(() => i8.registerTab(p7), [i8, p7]);
  let f14 = d15("tabs"), P5 = m12.indexOf(p7);
  P5 === -1 && (P5 = f14);
  let g5 = P5 === R4, E8 = o2((r9) => {
    var M7;
    let d16 = r9();
    if (d16 === N.Success && T7 === "auto") {
      let K4 = (M7 = o7(p7)) == null ? void 0 : M7.activeElement, z4 = c13.tabs.findIndex((te5) => te5.current === K4);
      z4 !== -1 && i8.change(z4);
    }
    return d16;
  }), L2 = o2((r9) => {
    let d16 = m12.map((K4) => K4.current).filter(Boolean);
    if (r9.key === o11.Space || r9.key === o11.Enter) {
      r9.preventDefault(), r9.stopPropagation(), i8.change(P5);
      return;
    }
    switch (r9.key) {
      case o11.Home:
      case o11.PageUp:
        return r9.preventDefault(), r9.stopPropagation(), E8(() => O(d16, M.First));
      case o11.End:
      case o11.PageDown:
        return r9.preventDefault(), r9.stopPropagation(), E8(() => O(d16, M.Last));
    }
    if (E8(() => u(a10, { vertical() {
      return r9.key === o11.ArrowUp ? O(d16, M.Previous | M.WrapAround) : r9.key === o11.ArrowDown ? O(d16, M.Next | M.WrapAround) : N.Error;
    }, horizontal() {
      return r9.key === o11.ArrowLeft ? O(d16, M.Previous | M.WrapAround) : r9.key === o11.ArrowRight ? O(d16, M.Next | M.WrapAround) : N.Error;
    } })) === N.Success) return r9.preventDefault();
  }), A3 = (0, import_react42.useRef)(false), S10 = o2(() => {
    var r9;
    A3.current || (A3.current = true, (r9 = p7.current) == null || r9.focus({ preventScroll: true }), i8.change(P5), t3(() => {
      A3.current = false;
    }));
  }), k3 = o2((r9) => {
    r9.preventDefault();
  }), h9 = (0, import_react42.useMemo)(() => {
    var r9;
    return { selected: g5, disabled: (r9 = e4.disabled) != null ? r9 : false };
  }, [g5, e4.disabled]), W = { ref: u13, onKeyDown: L2, onMouseDown: k3, onClick: S10, id: l13, role: "tab", type: T3(e4, p7), "aria-controls": (s17 = (O4 = b7[P5]) == null ? void 0 : O4.current) == null ? void 0 : s17.id, "aria-selected": g5, tabIndex: g5 ? 0 : -1 };
  return C({ ourProps: W, theirProps: o13, slot: h9, defaultTag: xe4, name: "Tabs.Tab" });
}
var Ee4 = "div";
function Ae4(e4, n7) {
  let { selectedIndex: t18 } = F8("Tab.Panels"), l13 = y3(n7), o13 = (0, import_react42.useMemo)(() => ({ selectedIndex: t18 }), [t18]);
  return C({ ourProps: { ref: l13 }, theirProps: e4, slot: o13, defaultTag: Ee4, name: "Tabs.Panels" });
}
var Re2 = "div";
var Le3 = O2.RenderStrategy | O2.Static;
function _e3(e4, n7) {
  var E8, L2, A3, S10;
  let t18 = I(), { id: l13 = `headlessui-tabs-panel-${t18}`, tabIndex: o13 = 0, ...a10 } = e4, { selectedIndex: T7, tabs: R4, panels: m12 } = F8("Tab.Panel"), b7 = q4("Tab.Panel"), i8 = (0, import_react42.useRef)(null), c13 = y3(i8, n7);
  l(() => b7.registerPanel(i8), [b7, i8, l13]);
  let p7 = d15("panels"), u13 = m12.indexOf(i8);
  u13 === -1 && (u13 = p7);
  let f14 = u13 === T7, P5 = (0, import_react42.useMemo)(() => ({ selected: f14 }), [f14]), g5 = { ref: c13, id: l13, role: "tabpanel", "aria-labelledby": (L2 = (E8 = R4[u13]) == null ? void 0 : E8.current) == null ? void 0 : L2.id, tabIndex: f14 ? o13 : -1 };
  return !f14 && ((A3 = a10.unmount) == null || A3) && !((S10 = a10.static) != null && S10) ? import_react42.default.createElement(u4, { as: "span", "aria-hidden": "true", ...g5 }) : C({ ourProps: g5, theirProps: a10, slot: P5, defaultTag: Re2, features: Le3, visible: f14, name: "Tabs.Panel" });
}
var Se3 = U(ge4);
var Ie4 = U(me3);
var De2 = U(ye4);
var Fe3 = U(Ae4);
var he4 = U(_e3);
var $e5 = Object.assign(Se3, { Group: Ie4, List: De2, Panels: Fe3, Panel: he4 });

// node_modules/@headlessui/react/dist/components/transitions/transition.js
var import_react43 = __toESM(require_react(), 1);

// node_modules/@headlessui/react/dist/utils/once.js
function l12(r9) {
  let e4 = { called: false };
  return (...t18) => {
    if (!e4.called) return e4.called = true, r9(...t18);
  };
}

// node_modules/@headlessui/react/dist/components/transitions/utils/transition.js
function g4(t18, ...e4) {
  t18 && e4.length > 0 && t18.classList.add(...e4);
}
function v5(t18, ...e4) {
  t18 && e4.length > 0 && t18.classList.remove(...e4);
}
function b6(t18, e4) {
  let n7 = o4();
  if (!t18) return n7.dispose;
  let { transitionDuration: m12, transitionDelay: a10 } = getComputedStyle(t18), [u13, p7] = [m12, a10].map((l13) => {
    let [r9 = 0] = l13.split(",").filter(Boolean).map((i8) => i8.includes("ms") ? parseFloat(i8) : parseFloat(i8) * 1e3).sort((i8, T7) => T7 - i8);
    return r9;
  }), o13 = u13 + p7;
  if (o13 !== 0) {
    n7.group((r9) => {
      r9.setTimeout(() => {
        e4(), r9.dispose();
      }, o13), r9.addEventListener(t18, "transitionrun", (i8) => {
        i8.target === i8.currentTarget && r9.dispose();
      });
    });
    let l13 = n7.addEventListener(t18, "transitionend", (r9) => {
      r9.target === r9.currentTarget && (e4(), l13());
    });
  } else e4();
  return n7.add(() => e4()), n7.dispose;
}
function M5(t18, e4, n7, m12) {
  let a10 = n7 ? "enter" : "leave", u13 = o4(), p7 = m12 !== void 0 ? l12(m12) : () => {
  };
  a10 === "enter" && (t18.removeAttribute("hidden"), t18.style.display = "");
  let o13 = u(a10, { enter: () => e4.enter, leave: () => e4.leave }), l13 = u(a10, { enter: () => e4.enterTo, leave: () => e4.leaveTo }), r9 = u(a10, { enter: () => e4.enterFrom, leave: () => e4.leaveFrom });
  return v5(t18, ...e4.base, ...e4.enter, ...e4.enterTo, ...e4.enterFrom, ...e4.leave, ...e4.leaveFrom, ...e4.leaveTo, ...e4.entered), g4(t18, ...e4.base, ...o13, ...r9), u13.nextFrame(() => {
    v5(t18, ...e4.base, ...o13, ...r9), g4(t18, ...e4.base, ...o13, ...l13), b6(t18, () => (v5(t18, ...e4.base, ...o13), g4(t18, ...e4.base, ...e4.entered), p7()));
  }), u13.dispose;
}

// node_modules/@headlessui/react/dist/hooks/use-transition.js
function D6({ immediate: t18, container: s17, direction: n7, classes: u13, onStart: a10, onStop: c13 }) {
  let l13 = f7(), d16 = p(), e4 = s2(n7);
  l(() => {
    t18 && (e4.current = "enter");
  }, [t18]), l(() => {
    let r9 = o4();
    d16.add(r9.dispose);
    let i8 = s17.current;
    if (i8 && e4.current !== "idle" && l13.current) return r9.dispose(), a10.current(e4.current), r9.add(M5(i8, u13.current, e4.current === "enter", () => {
      r9.dispose(), c13.current(e4.current);
    })), r9.dispose;
  }, [n7]);
}

// node_modules/@headlessui/react/dist/components/transitions/transition.js
function S9(t18 = "") {
  return t18.split(/\s+/).filter((n7) => n7.length > 1);
}
var I10 = (0, import_react43.createContext)(null);
I10.displayName = "TransitionContext";
var Se4 = ((r9) => (r9.Visible = "visible", r9.Hidden = "hidden", r9))(Se4 || {});
function ye5() {
  let t18 = (0, import_react43.useContext)(I10);
  if (t18 === null) throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");
  return t18;
}
function xe5() {
  let t18 = (0, import_react43.useContext)(M6);
  if (t18 === null) throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");
  return t18;
}
var M6 = (0, import_react43.createContext)(null);
M6.displayName = "NestingContext";
function U6(t18) {
  return "children" in t18 ? U6(t18.children) : t18.current.filter(({ el: n7 }) => n7.current !== null).filter(({ state: n7 }) => n7 === "visible").length > 0;
}
function se3(t18, n7) {
  let r9 = s2(t18), s17 = (0, import_react43.useRef)([]), R4 = f7(), D7 = p(), p7 = o2((i8, e4 = v.Hidden) => {
    let a10 = s17.current.findIndex(({ el: o13 }) => o13 === i8);
    a10 !== -1 && (u(e4, { [v.Unmount]() {
      s17.current.splice(a10, 1);
    }, [v.Hidden]() {
      s17.current[a10].state = "hidden";
    } }), D7.microTask(() => {
      var o13;
      !U6(s17) && R4.current && ((o13 = r9.current) == null || o13.call(r9));
    }));
  }), x4 = o2((i8) => {
    let e4 = s17.current.find(({ el: a10 }) => a10 === i8);
    return e4 ? e4.state !== "visible" && (e4.state = "visible") : s17.current.push({ el: i8, state: "visible" }), () => p7(i8, v.Unmount);
  }), h9 = (0, import_react43.useRef)([]), v6 = (0, import_react43.useRef)(Promise.resolve()), u13 = (0, import_react43.useRef)({ enter: [], leave: [], idle: [] }), g5 = o2((i8, e4, a10) => {
    h9.current.splice(0), n7 && (n7.chains.current[e4] = n7.chains.current[e4].filter(([o13]) => o13 !== i8)), n7 == null || n7.chains.current[e4].push([i8, new Promise((o13) => {
      h9.current.push(o13);
    })]), n7 == null || n7.chains.current[e4].push([i8, new Promise((o13) => {
      Promise.all(u13.current[e4].map(([f14, N7]) => N7)).then(() => o13());
    })]), e4 === "enter" ? v6.current = v6.current.then(() => n7 == null ? void 0 : n7.wait.current).then(() => a10(e4)) : a10(e4);
  }), d16 = o2((i8, e4, a10) => {
    Promise.all(u13.current[e4].splice(0).map(([o13, f14]) => f14)).then(() => {
      var o13;
      (o13 = h9.current.shift()) == null || o13();
    }).then(() => a10(e4));
  });
  return (0, import_react43.useMemo)(() => ({ children: s17, register: x4, unregister: p7, onStart: g5, onStop: d16, wait: v6, chains: u13 }), [x4, p7, s17, g5, d16, u13, v6]);
}
function Ne4() {
}
var Pe6 = ["beforeEnter", "afterEnter", "beforeLeave", "afterLeave"];
function ae2(t18) {
  var r9;
  let n7 = {};
  for (let s17 of Pe6) n7[s17] = (r9 = t18[s17]) != null ? r9 : Ne4;
  return n7;
}
function Re3(t18) {
  let n7 = (0, import_react43.useRef)(ae2(t18));
  return (0, import_react43.useEffect)(() => {
    n7.current = ae2(t18);
  }, [t18]), n7;
}
var De3 = "div";
var le2 = O2.RenderStrategy;
function He4(t18, n7) {
  var Q5, Y3;
  let { beforeEnter: r9, afterEnter: s17, beforeLeave: R4, afterLeave: D7, enter: p7, enterFrom: x4, enterTo: h9, entered: v6, leave: u13, leaveFrom: g5, leaveTo: d16, ...i8 } = t18, e4 = (0, import_react43.useRef)(null), a10 = y3(e4, n7), o13 = (Q5 = i8.unmount) == null || Q5 ? v.Unmount : v.Hidden, { show: f14, appear: N7, initial: T7 } = ye5(), [l13, j5] = (0, import_react43.useState)(f14 ? "visible" : "hidden"), z4 = xe5(), { register: L2, unregister: O4 } = z4;
  (0, import_react43.useEffect)(() => L2(e4), [L2, e4]), (0, import_react43.useEffect)(() => {
    if (o13 === v.Hidden && e4.current) {
      if (f14 && l13 !== "visible") {
        j5("visible");
        return;
      }
      return u(l13, { ["hidden"]: () => O4(e4), ["visible"]: () => L2(e4) });
    }
  }, [l13, e4, L2, O4, f14, o13]);
  let k3 = s2({ base: S9(i8.className), enter: S9(p7), enterFrom: S9(x4), enterTo: S9(h9), entered: S9(v6), leave: S9(u13), leaveFrom: S9(g5), leaveTo: S9(d16) }), V5 = Re3({ beforeEnter: r9, afterEnter: s17, beforeLeave: R4, afterLeave: D7 }), G4 = l2();
  (0, import_react43.useEffect)(() => {
    if (G4 && l13 === "visible" && e4.current === null) throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?");
  }, [e4, l13, G4]);
  let Te3 = T7 && !N7, K4 = N7 && f14 && T7, de6 = /* @__PURE__ */ (() => !G4 || Te3 ? "idle" : f14 ? "enter" : "leave")(), H6 = c10(0), fe4 = o2((C7) => u(C7, { enter: () => {
    H6.addFlag(d5.Opening), V5.current.beforeEnter();
  }, leave: () => {
    H6.addFlag(d5.Closing), V5.current.beforeLeave();
  }, idle: () => {
  } })), me4 = o2((C7) => u(C7, { enter: () => {
    H6.removeFlag(d5.Opening), V5.current.afterEnter();
  }, leave: () => {
    H6.removeFlag(d5.Closing), V5.current.afterLeave();
  }, idle: () => {
  } })), w6 = se3(() => {
    j5("hidden"), O4(e4);
  }, z4), B4 = (0, import_react43.useRef)(false);
  D6({ immediate: K4, container: e4, classes: k3, direction: de6, onStart: s2((C7) => {
    B4.current = true, w6.onStart(e4, C7, fe4);
  }), onStop: s2((C7) => {
    B4.current = false, w6.onStop(e4, C7, me4), C7 === "leave" && !U6(w6) && (j5("hidden"), O4(e4));
  }) });
  let P5 = i8, ce4 = { ref: a10 };
  return K4 ? P5 = { ...P5, className: t9(i8.className, ...k3.current.enter, ...k3.current.enterFrom) } : B4.current && (P5.className = t9(i8.className, (Y3 = e4.current) == null ? void 0 : Y3.className), P5.className === "" && delete P5.className), import_react43.default.createElement(M6.Provider, { value: w6 }, import_react43.default.createElement(s9, { value: u(l13, { ["visible"]: d5.Open, ["hidden"]: d5.Closed }) | H6.flags }, C({ ourProps: ce4, theirProps: P5, defaultTag: De3, features: le2, visible: l13 === "visible", name: "Transition.Child" })));
}
function Fe4(t18, n7) {
  let { show: r9, appear: s17 = false, unmount: R4 = true, ...D7 } = t18, p7 = (0, import_react43.useRef)(null), x4 = y3(p7, n7);
  l2();
  let h9 = u5();
  if (r9 === void 0 && h9 !== null && (r9 = (h9 & d5.Open) === d5.Open), ![true, false].includes(r9)) throw new Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");
  let [v6, u13] = (0, import_react43.useState)(r9 ? "visible" : "hidden"), g5 = se3(() => {
    u13("hidden");
  }), [d16, i8] = (0, import_react43.useState)(true), e4 = (0, import_react43.useRef)([r9]);
  l(() => {
    d16 !== false && e4.current[e4.current.length - 1] !== r9 && (e4.current.push(r9), i8(false));
  }, [e4, r9]);
  let a10 = (0, import_react43.useMemo)(() => ({ show: r9, appear: s17, initial: d16 }), [r9, s17, d16]);
  (0, import_react43.useEffect)(() => {
    if (r9) u13("visible");
    else if (!U6(g5)) u13("hidden");
    else {
      let T7 = p7.current;
      if (!T7) return;
      let l13 = T7.getBoundingClientRect();
      l13.x === 0 && l13.y === 0 && l13.width === 0 && l13.height === 0 && u13("hidden");
    }
  }, [r9, g5]);
  let o13 = { unmount: R4 }, f14 = o2(() => {
    var T7;
    d16 && i8(false), (T7 = t18.beforeEnter) == null || T7.call(t18);
  }), N7 = o2(() => {
    var T7;
    d16 && i8(false), (T7 = t18.beforeLeave) == null || T7.call(t18);
  });
  return import_react43.default.createElement(M6.Provider, { value: g5 }, import_react43.default.createElement(I10.Provider, { value: a10 }, C({ ourProps: { ...o13, as: import_react43.Fragment, children: import_react43.default.createElement(ue6, { ref: x4, ...o13, ...D7, beforeEnter: f14, beforeLeave: N7 }) }, theirProps: {}, defaultTag: import_react43.Fragment, features: le2, visible: v6 === "visible", name: "Transition" })));
}
function _e4(t18, n7) {
  let r9 = (0, import_react43.useContext)(I10) !== null, s17 = u5() !== null;
  return import_react43.default.createElement(import_react43.default.Fragment, null, !r9 && s17 ? import_react43.default.createElement(q5, { ref: n7, ...t18 }) : import_react43.default.createElement(ue6, { ref: n7, ...t18 }));
}
var q5 = U(Fe4);
var ue6 = U(He4);
var Le4 = U(_e4);
var qe6 = Object.assign(q5, { Child: Le4, Root: q5 });
export {
  qt as Combobox,
  _t as Dialog,
  Ae2 as Disclosure,
  de2 as FocusTrap,
  It as Listbox,
  qe4 as Menu,
  Ct as Popover,
  te as Portal,
  it3 as RadioGroup,
  _e2 as Switch,
  $e5 as Tab,
  qe6 as Transition
};
//# sourceMappingURL=@headlessui_react.js.map
