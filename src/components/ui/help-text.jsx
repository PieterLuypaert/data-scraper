import { useState } from "react";
import { Info, HelpCircle, Lightbulb, ChevronDown, Sparkles } from "lucide-react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";

const TYPE_LABELS = {
  info: "Info",
  tip: "Tip",
  warning: "Let op",
};

const styles = {
  info: {
    panel:
      "border-indigo-200/50 bg-gradient-to-br from-indigo-50/95 via-white/80 to-sky-50/70",
    glow: "bg-indigo-400/20",
    iconWrap: "bg-white/90 text-indigo-600 shadow-sm ring-1 ring-indigo-200/50",
    chip: "bg-indigo-100/90 text-indigo-700 ring-indigo-200/60",
    title: "text-indigo-950",
    body: "text-indigo-900/80 [&_code]:rounded-md [&_code]:bg-white/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8rem] [&_code]:text-indigo-800 [&_code]:ring-1 [&_code]:ring-indigo-200/40 [&_strong]:font-semibold",
    chevron: "text-indigo-500",
  },
  tip: {
    panel:
      "border-amber-200/50 bg-gradient-to-br from-amber-50/95 via-white/80 to-yellow-50/60",
    glow: "bg-amber-400/20",
    iconWrap: "bg-white/90 text-amber-600 shadow-sm ring-1 ring-amber-200/50",
    chip: "bg-amber-100/90 text-amber-800 ring-amber-200/60",
    title: "text-amber-950",
    body: "text-amber-950/75 [&_code]:rounded-md [&_code]:bg-white/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8rem] [&_code]:text-amber-900 [&_code]:ring-1 [&_code]:ring-amber-200/40 [&_strong]:font-semibold",
    chevron: "text-amber-600",
  },
  warning: {
    panel:
      "border-orange-200/50 bg-gradient-to-br from-orange-50/95 via-white/80 to-amber-50/60",
    glow: "bg-orange-400/20",
    iconWrap: "bg-white/90 text-orange-600 shadow-sm ring-1 ring-orange-200/50",
    chip: "bg-orange-100/90 text-orange-800 ring-orange-200/60",
    title: "text-orange-950",
    body: "text-orange-950/75 [&_code]:rounded-md [&_code]:bg-white/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8rem] [&_code]:text-orange-900 [&_code]:ring-1 [&_code]:ring-orange-200/40 [&_strong]:font-semibold",
    chevron: "text-orange-600",
  },
};

const icons = {
  info: Info,
  tip: Lightbulb,
  warning: HelpCircle,
};

export function HelpText({
  children,
  type = "info",
  title,
  collapsible = false,
  open: openProp,
  onOpenChange,
}) {
  const s = styles[type] || styles.info;
  const Icon = icons[type] || Info;
  const typeLabel = TYPE_LABELS[type] || "Info";
  const showTitle =
    title && title.toLowerCase() !== typeLabel.toLowerCase();

  const [openState, setOpenState] = useState(true);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = (next) => {
    onOpenChange?.(next);
    if (openProp === undefined) setOpenState(next);
  };

  const bodyClassName = cn("text-sm leading-relaxed", s.body);

  const HeaderTag = collapsible ? "button" : "div";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border shadow-soft backdrop-blur-sm transition-shadow duration-200 hover:shadow-elevated",
        s.panel
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl",
          s.glow
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-8 -left-4 h-20 w-20 rounded-full blur-2xl opacity-60",
          s.glow
        )}
      />

      <div className="relative p-4 sm:p-5">
        <HeaderTag
          type={collapsible ? "button" : undefined}
          onClick={collapsible ? () => setOpen(!open) : undefined}
          className={cn(
            "flex w-full gap-3.5 text-left sm:gap-4",
            collapsible && "cursor-pointer"
          )}
        >
          <span
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11",
              s.iconWrap
            )}
          >
            <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                  s.chip
                )}
              >
                {type === "tip" && <Sparkles className="mr-1 h-3 w-3" />}
                {typeLabel}
              </span>
              {collapsible && (
                <ChevronDown
                  className={cn(
                    "ml-auto h-4 w-4 flex-shrink-0 transition-transform duration-200",
                    s.chevron,
                    open && "rotate-180"
                  )}
                />
              )}
            </div>

            {showTitle && (
              <p className={cn("mt-2 text-sm font-bold sm:text-base", s.title)}>
                {title}
              </p>
            )}

            {!collapsible && (
              <div className={cn("mt-2", bodyClassName)}>{children}</div>
            )}
          </div>
        </HeaderTag>

        {collapsible && (
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out",
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              <div className={cn("pt-3 pl-[3.25rem] sm:pl-[3.75rem]", bodyClassName)}>
                {children}
              </div>
            </div>
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
  actionLabel,
}) {
  return (
    <Card className="border-dashed border-indigo-200/60 bg-indigo-50/20">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {Icon && <Icon className="mb-4 h-12 w-12 text-indigo-300" />}
        <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
        <p className="mb-4 max-w-md text-sm text-gray-500">{description}</p>
        {action && actionLabel && <Button onClick={action}>{actionLabel}</Button>}
      </CardContent>
    </Card>
  );
}
