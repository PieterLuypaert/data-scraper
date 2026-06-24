import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

// Distance from the viewport edge the tooltip is never allowed to cross.
const VIEWPORT_PADDING = 8;
// Gap between the trigger and the tooltip.
const GAP = 8;

/**
 * Tooltip that always stays within the viewport.
 *
 * The bubble is rendered in a portal with `position: fixed`, positioned from
 * the trigger's bounding box and then clamped into the viewport. `position` is
 * the *preferred* side (default "top"); it auto-flips top/bottom when there
 * isn't enough room, and the text wraps within a max width so long content can
 * never run off the right edge.
 */
export function Tooltip({ children, content, position = "top", className }) {
  const [visible, setVisible] = React.useState(false);
  const [style, setStyle] = React.useState({ top: 0, left: 0, visibility: "hidden" });
  const triggerRef = React.useRef(null);
  const tooltipRef = React.useRef(null);

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    const tip = tooltipRef.current;
    if (!trigger || !tip) return;

    const t = trigger.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let place = position;
    // Flip vertically if the preferred side has no room.
    if (place === "top" && t.top - th - GAP < VIEWPORT_PADDING) place = "bottom";
    else if (place === "bottom" && t.bottom + th + GAP > vh - VIEWPORT_PADDING) place = "top";

    let top;
    let left;
    if (place === "top") {
      top = t.top - th - GAP;
      left = t.left + t.width / 2 - tw / 2;
    } else if (place === "bottom") {
      top = t.bottom + GAP;
      left = t.left + t.width / 2 - tw / 2;
    } else if (place === "left") {
      left = t.left - tw - GAP;
      top = t.top + t.height / 2 - th / 2;
    } else {
      left = t.right + GAP;
      top = t.top + t.height / 2 - th / 2;
    }

    // Clamp into the viewport so the bubble is always fully visible.
    left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - tw - VIEWPORT_PADDING));
    top = Math.max(VIEWPORT_PADDING, Math.min(top, vh - th - VIEWPORT_PADDING));

    setStyle({ top, left, visibility: "visible" });
  }, [position]);

  // Measure + position once the bubble is in the DOM (and whenever content changes).
  React.useLayoutEffect(() => {
    if (visible) updatePosition();
  }, [visible, content, updatePosition]);

  // Keep it anchored while scrolling/resizing.
  React.useEffect(() => {
    if (!visible) return;
    const onMove = () => updatePosition();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [visible, updatePosition]);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: "fixed",
              top: style.top,
              left: style.left,
              visibility: style.visibility,
              maxWidth: `min(20rem, calc(100vw - ${VIEWPORT_PADDING * 2}px))`,
            }}
            className={cn(
              "z-[60] rounded-md bg-gray-900 px-3 py-2 text-sm leading-snug text-white shadow-lg",
              "whitespace-normal break-words pointer-events-none",
              className
            )}
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  );
}

export function InfoBadge({ tooltip }) {
  return (
    <Tooltip content={tooltip}>
      <span
        tabIndex={0}
        className="inline-flex items-center justify-center w-4 h-4 ml-1 text-xs font-medium text-gray-500 bg-gray-200 rounded-full cursor-help hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        ?
      </span>
    </Tooltip>
  );
}
