import { useState } from "react";
import { Info, HelpCircle, Lightbulb, ChevronDown } from "lucide-react";
import { Card, CardContent } from "./card";

export function HelpText({
  children,
  type = "info",
  title,
  collapsible = false,
  open: openProp,
  onOpenChange,
}) {
  const styles = {
    info: {
      panel: "border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-sky-50",
      accent: "bg-indigo-500",
      badge: "bg-indigo-100 text-indigo-600",
      title: "text-indigo-900",
      body: "text-indigo-900/80",
    },
    tip: {
      panel: "border-amber-200/70 bg-gradient-to-br from-amber-50 to-yellow-50",
      accent: "bg-amber-500",
      badge: "bg-amber-100 text-amber-600",
      title: "text-amber-900",
      body: "text-amber-900/80",
    },
    warning: {
      panel: "border-orange-200/70 bg-gradient-to-br from-orange-50 to-amber-50",
      accent: "bg-orange-500",
      badge: "bg-orange-100 text-orange-600",
      title: "text-orange-900",
      body: "text-orange-900/80",
    },
  };

  const icons = {
    info: Info,
    tip: Lightbulb,
    warning: HelpCircle,
  };

  const Icon = icons[type] || Info;
  const s = styles[type] || styles.info;

  const [openState, setOpenState] = useState(true);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = (next) => {
    onOpenChange?.(next);
    if (openProp === undefined) setOpenState(next);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border shadow-soft ${s.panel}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${s.accent}`} />
      <div className="pl-4">
        <button
          type="button"
          onClick={collapsible ? () => setOpen(!open) : undefined}
          className={`flex w-full items-center gap-3 px-3 py-3 text-left ${
            collapsible ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <span
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${s.badge}`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          {title && (
            <span className={`flex-1 text-sm font-semibold ${s.title}`}>
              {title}
            </span>
          )}
          {collapsible && (
            <ChevronDown
              className={`h-4 w-4 flex-shrink-0 ${s.title} transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
        {open && (
          <div className={`px-3 pb-3 pl-[2.75rem] text-sm leading-relaxed ${s.body}`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionLabel 
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {Icon && <Icon className="h-12 w-12 text-gray-400 mb-4" />}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 max-w-md mb-4">{description}</p>
        {action && actionLabel && (
          <button
            onClick={action}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

