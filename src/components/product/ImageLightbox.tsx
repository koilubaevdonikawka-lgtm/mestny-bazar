import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

export interface LightboxImage {
  url: string;
  alt: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const MAX_SCALE = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const SWIPE_THRESHOLD_PX = 60;
const CLOSE_SWIPE_THRESHOLD_PX = 90;
const DOUBLE_TAP_MS = 300;
const TAP_MOVEMENT_PX = 10;

interface DragOrigin {
  startX: number;
  startY: number;
  originX?: number;
  originY?: number;
}

function touchDistance(a: Touch, b: Touch): number {
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

/**
 * Задача №244 — hand-rolled pinch/pan/double-tap, deliberately not a
 * library: this project has no gesture dependency yet, and the actual
 * gesture surface needed (pinch to scale, drag to pan once zoomed, double
 * tap/click to toggle, swipe to switch photos, swipe-down to dismiss) is
 * compact enough to implement directly against touch/mouse events without
 * pulling one in. Not built on the existing shadcn/Radix Dialog — Radix's
 * own pointer-capture and outside-click/focus-trap handling would fight
 * this component's raw multi-touch tracking; a plain fixed-position
 * overlay gives full, predictable control over every touch event instead.
 */
export function ImageLightbox({ images, index, onIndexChange, onClose }: ImageLightboxProps) {
  const { t } = useTranslation();
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragY, setDragY] = useState(0);

  const pinch = useRef<{ startDistance: number; startScale: number } | null>(null);
  const pan = useRef<DragOrigin | null>(null);
  const swipe = useRef<DragOrigin | null>(null);
  const mouseDrag = useRef<DragOrigin | null>(null);
  const lastTap = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const image = images[index];

  useEffect(() => {
    // A zoom/pan left over from the previous photo would be disorienting
    // on the next one (opened fresh, or swiped to inside the lightbox).
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [index]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const clampTranslate = (next: { x: number; y: number }, currentScale: number, rect: DOMRect) => {
    const maxX = (rect.width * (currentScale - 1)) / 2;
    const maxY = (rect.height * (currentScale - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  };

  /** Keeps the point under the finger/cursor stationary while scaling. */
  const zoomAt = (nextScale: number, clientX: number, clientY: number, rect: DOMRect) => {
    const originX = clientX - rect.left - rect.width / 2;
    const originY = clientY - rect.top - rect.height / 2;
    const ratio = nextScale / scale;
    setTranslate((t) => ({
      x: (t.x - originX) * ratio + originX,
      y: (t.y - originY) * ratio + originY,
    }));
    setScale(nextScale);
  };

  const toggleZoom = (clientX: number, clientY: number, rect: DOMRect) => {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      zoomAt(DOUBLE_TAP_ZOOM, clientX, clientY, rect);
    }
  };

  // preventDefault on every phase (start/move/end) — this overlay owns all
  // touch interaction inside it: without this, the browser's own native
  // pinch-zoom/double-tap-zoom/scroll can fight the custom gesture tracking
  // above, and — the concrete bug this caught — a plain tap still gets a
  // synthesized `click` a moment after touchend, which (once this closes
  // and exposes the real page underneath) could land on whatever page
  // element happens to sit at that same point, e.g. the header's back
  // button, and navigate away right after closing. React attaches JSX
  // onTouchStart/Move/End as PASSIVE listeners (silently ignoring
  // preventDefault, only warning in the console) — attached natively below
  // instead, the one reliable way to actually get a non-passive listener.
  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      pinch.current = {
        startDistance: touchDistance(e.touches[0], e.touches[1]),
        startScale: scale,
      };
      pan.current = null;
      swipe.current = null;
      return;
    }
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (scale > 1) {
        pan.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          originX: translate.x,
          originY: translate.y,
        };
      } else {
        swipe.current = { startX: touch.clientX, startY: touch.clientY };
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && pinch.current) {
      const newDistance = touchDistance(e.touches[0], e.touches[1]);
      setScale(
        Math.min(
          MAX_SCALE,
          Math.max(1, pinch.current.startScale * (newDistance / pinch.current.startDistance)),
        ),
      );
      return;
    }
    if (e.touches.length === 1 && pan.current) {
      const touch = e.touches[0];
      const rect = containerRef.current!.getBoundingClientRect();
      setTranslate(
        clampTranslate(
          {
            x: (pan.current.originX ?? 0) + (touch.clientX - pan.current.startX),
            y: (pan.current.originY ?? 0) + (touch.clientY - pan.current.startY),
          },
          scale,
          rect,
        ),
      );
      return;
    }
    if (e.touches.length === 1 && swipe.current) {
      // Live-follow only the vertical swipe-down-to-close gesture — a
      // visible drag gives the fullscreen viewer weight, matching the
      // standard "drag the photo down to dismiss" convention.
      const deltaY = e.touches[0].clientY - swipe.current.startY;
      if (deltaY > 0) setDragY(deltaY);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    if (pinch.current) {
      pinch.current = null;
      if (scale <= 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
      return;
    }

    const wasPanning = pan.current !== null;
    const start = pan.current ?? swipe.current;
    pan.current = null;
    swipe.current = null;
    setDragY(0);
    if (!start) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.startX;
    const deltaY = touch.clientY - start.startY;
    const wasTap = Math.abs(deltaX) < TAP_MOVEMENT_PX && Math.abs(deltaY) < TAP_MOVEMENT_PX;
    const isDoubleTap = wasTap && Date.now() - lastTap.current < DOUBLE_TAP_MS;
    lastTap.current = isDoubleTap ? 0 : wasTap ? Date.now() : 0;

    if (isDoubleTap) {
      toggleZoom(touch.clientX, touch.clientY, containerRef.current!.getBoundingClientRect());
      return;
    }
    if (wasPanning) return;

    if (wasTap) {
      // A tap on the empty backdrop/margin around the photo closes the
      // viewer; a tap ON the photo itself does nothing on its own — it
      // waits to see whether a second tap follows within DOUBLE_TAP_MS to
      // become a zoom toggle instead, so double-tapping the photo is never
      // short-circuited by an early close on its first tap.
      if ((e.target as HTMLElement).tagName !== "IMG") onClose();
      return;
    }

    if (deltaY > CLOSE_SWIPE_THRESHOLD_PX && Math.abs(deltaY) > Math.abs(deltaX)) {
      onClose();
      return;
    }
    if (images.length > 1) {
      if (deltaX <= -SWIPE_THRESHOLD_PX) onIndexChange((index + 1) % images.length);
      else if (deltaX >= SWIPE_THRESHOLD_PX)
        onIndexChange((index - 1 + images.length) % images.length);
    }
  };

  // Attached natively below (not as JSX onTouchStart/Move/End props) —
  // React marks those passive, which makes preventDefault above a silent
  // no-op (only a console warning). Refs keep the listeners themselves
  // stable (attached once) while always calling the latest render's
  // closures, so this doesn't need to detach/reattach on every state change.
  const touchStartRef = useRef(handleTouchStart);
  const touchMoveRef = useRef(handleTouchMove);
  const touchEndRef = useRef(handleTouchEnd);
  touchStartRef.current = handleTouchStart;
  touchMoveRef.current = handleTouchMove;
  touchEndRef.current = handleTouchEnd;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onStart = (e: TouchEvent) => touchStartRef.current(e);
    const onMove = (e: TouchEvent) => touchMoveRef.current(e);
    const onEnd = (e: TouchEvent) => touchEndRef.current(e);
    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, []);

  // Desktop extras (Задача №244, п.2 — "на усмотрение"): double-click
  // toggles zoom, Ctrl/Cmd+wheel adjusts it, drag pans once zoomed.
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    zoomAt(Math.min(MAX_SCALE, Math.max(1, scale - e.deltaY * 0.01)), e.clientX, e.clientY, rect);
  };
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    mouseDrag.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: translate.x,
      originY: translate.y,
    };
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseDrag.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTranslate(
      clampTranslate(
        {
          x: (mouseDrag.current.originX ?? 0) + (e.clientX - mouseDrag.current.startX),
          y: (mouseDrag.current.originY ?? 0) + (e.clientY - mouseDrag.current.startY),
        },
        scale,
        rect,
      ),
    );
  };
  const handleMouseUp = () => {
    mouseDrag.current = null;
  };

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      style={{ opacity: 1 - Math.min(dragY / 400, 0.6) }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={t("common.close")}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-sm">
          {index + 1} / {images.length}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative flex h-full w-full touch-none select-none items-center justify-center overflow-hidden"
        style={{ transform: `translateY(${dragY}px)` }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={image.url}
          alt={image.alt}
          className="max-h-full max-w-full object-contain"
          // Deliberately on the <img> itself, not the full-screen gesture
          // wrapper above: object-contain means the element's own box
          // already matches exactly what's visibly drawn (no letterboxed
          // margin inside it), so stopping propagation here — and only
          // here — lets a click/tap on the empty backdrop around the photo
          // still bubble up to the overlay's onClose, while a click ON the
          // photo doesn't.
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => {
            e.stopPropagation();
            toggleZoom(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
          }}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            // Skipped mid-gesture (reading refs directly, not state, is
            // intentional here — pinch/pan/mouse-drag all trigger a
            // re-render via their own setState calls, so this stays in
            // sync) so a raw pinch/pan/drag tracks the finger 1:1 with no
            // easing lag; only a discrete toggle (double tap/click, wheel)
            // gets an animated snap.
            transition:
              pan.current || pinch.current || mouseDrag.current
                ? "none"
                : "transform 0.15s ease-out",
            cursor: scale > 1 ? "grab" : "zoom-in",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
