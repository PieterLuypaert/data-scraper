import { cn } from "@/lib/utils";

const sizes = {
  narrow: "max-w-3xl",
  default: "max-w-4xl",
  wide: "max-w-7xl",
};

export function PageShell({ children, className, size = "default", centered = false }) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        sizes[size],
        centered && "flex flex-col items-center text-center",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  highlight,
  description,
  actions,
  align = "left",
  className,
}) {
  const isCenter = align === "center";

  return (
    <div className={cn("mb-8", isCenter && "text-center", className)}>
      <div
        className={cn(
          "flex gap-4",
          isCenter ? "flex-col items-center" : "items-start justify-between"
        )}
      >
        <div className={cn("min-w-0", isCenter && "flex flex-col items-center")}>
          <h1
            className={cn(
              "text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl",
              isCenter && "md:text-5xl"
            )}
          >
            {title}
            {highlight && (
              <>
                {" "}
                <span className="text-gradient-brand">{highlight}</span>
              </>
            )}
          </h1>
          {description && (
            <div
              className={cn(
                "mt-3 text-sm text-gray-500 md:text-base",
                isCenter ? "max-w-xl" : "max-w-2xl"
              )}
            >
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex flex-shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

export function PageTabs({ tabs, active, onChange, className }) {
  return (
    <div
      className={cn(
        "mb-6 inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-indigo-200/40 bg-white/60 p-1 shadow-soft backdrop-blur-sm",
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150",
              isActive
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
