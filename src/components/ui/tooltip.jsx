import * as React from "react"
import { cn } from "@/lib/utils"

export function Tooltip({ children, content, position = "top", className }) {
  const [isVisible, setIsVisible] = React.useState(false);
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          className={cn(
            "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none",
            positionClasses[position],
            className
          )}
        >
          {content}
          <div className={cn(
            "absolute w-2 h-2 bg-gray-900 transform rotate-45",
            position === "top" && "top-full left-1/2 -translate-x-1/2 -translate-y-1/2",
            position === "bottom" && "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
            position === "left" && "left-full top-1/2 -translate-y-1/2 -translate-x-1/2",
            position === "right" && "right-full top-1/2 -translate-y-1/2 translate-x-1/2"
          )} />
        </div>
      )}
    </div>
  );
}

export function InfoBadge({ children, tooltip }) {
  return (
    <Tooltip content={tooltip}>
      <span className="inline-flex items-center justify-center w-4 h-4 ml-1 text-xs font-medium text-gray-500 bg-gray-200 rounded-full cursor-help hover:bg-gray-300">
        ?
      </span>
    </Tooltip>
  );
}

