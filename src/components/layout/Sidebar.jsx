import {
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";
import { t } from "../../i18n";
import { cn } from "@/lib/utils";
import { navGroups, tabById } from "../../config/navigation";

const sidebarPanelClass =
  "relative flex flex-col overflow-hidden border-r-4 border-violet-300/60 bg-white/55 backdrop-blur-2xl";

function SidebarAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0">
      <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-violet-400/15 blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 via-transparent to-violet-50/20" />
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="relative border-t border-indigo-200/40 bg-white/25 px-6 py-4 text-xs text-gray-400">
      <p className="truncate">Developed by Pieter Luypaert</p>
    </div>
  );
}

function SidebarNav({ activeTab, onSelectTab, expandedGroups, onToggleGroup }) {
  return (
    <nav className="flex flex-col gap-3">
      {navGroups.map((group) => {
        const isOpen = expandedGroups[group.key];
        return (
          <div key={group.key}>
            <button
              type="button"
              onClick={() => onToggleGroup(group.key)}
              aria-expanded={isOpen}
              className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-400/90 transition-colors hover:bg-white/40 hover:text-indigo-600"
            >
              <span>{t(`tabGroups.${group.key}`)}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
            {isOpen && (
              <div className="flex flex-col gap-1">
                {group.ids.map((id) => {
                  const tab = tabById(id);
                  if (!tab) return null;
                  const Icon = tab.icon;
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onSelectTab(id)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-semibold transition-all duration-200",
                        isActive
                          ? "bg-white/95 text-indigo-800 shadow-soft ring-1 ring-indigo-200/80"
                          : "text-gray-600 hover:bg-white/55 hover:text-indigo-700 hover:shadow-sm hover:ring-1 hover:ring-indigo-100/70"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-gray-100/80 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[17px] w-[17px]",
                            isActive ? "text-white" : "text-current"
                          )}
                        />
                      </span>
                      <span className={cn("truncate", isActive && "font-bold")}>
                        {tab.getLabel()}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  activeTab,
  onSelectTab,
  expandedGroups,
  onToggleGroup,
  sidebarCollapsed,
  setSidebarCollapsed,
  sidebarOpen,
  setSidebarOpen,
}) {
  const navProps = { activeTab, onSelectTab, expandedGroups, onToggleGroup };

  return (
    <>
      {/* Sidebar (desktop) — animate width so it glides instead of snapping */}
      <aside
        aria-hidden={sidebarCollapsed}
        className={cn(
          "sticky top-0 hidden h-screen flex-shrink-0 overflow-hidden border-violet-300/60 bg-white/55 backdrop-blur-2xl",
          "transition-[width] duration-300 ease-in-out motion-reduce:transition-none lg:block",
          sidebarCollapsed ? "lg:w-0 border-r-0" : "lg:w-72 border-r-4"
        )}
      >
        {/* Fixed-width inner shell keeps content from squishing mid-animation */}
        <div className="relative flex h-full w-72 flex-col">
          <SidebarAmbient />
          {/* Collapse control lives inside the header so it never overlaps the
              main content area (was a tab protruding over the content edge). */}
          <button
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Sidebar inklappen"
            title="Sidebar inklappen"
            tabIndex={sidebarCollapsed ? -1 : 0}
            className="absolute right-3 top-3 z-10 hidden rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/70 hover:text-indigo-700 lg:flex"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
          <div className="relative px-6 pt-7 pb-5">
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gradient-brand">
              {t("app.title")}
            </h1>
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-500">
              {t("app.description")}
            </p>
          </div>
          <div className="relative flex-1 overflow-y-auto scrollbar-none px-3 pb-6">
            <SidebarNav {...navProps} />
          </div>
          <SidebarFooter />
        </div>
      </aside>

      {/* Desktop expand handle on the left edge (only when collapsed) */}
      <button
        onClick={() => setSidebarCollapsed(false)}
        aria-label="Sidebar uitklappen"
        title="Sidebar uitklappen"
        tabIndex={sidebarCollapsed ? 0 : -1}
        className={cn(
          "fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 rounded-r-xl border border-l-0 border-indigo-500/60 bg-indigo-600 py-8 pl-2 pr-2.5 text-white shadow-soft backdrop-blur transition-all duration-300 ease-in-out hover:bg-indigo-700",
          sidebarCollapsed
            ? "translate-x-0 opacity-100 lg:flex"
            : "-translate-x-full opacity-0 lg:flex lg:pointer-events-none"
        )}
      >
        <PanelLeftOpen className="h-4 w-4" />
      </button>

      {/* Mobile slide-over sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className={`absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col shadow-elevated animate-fade-in-up ${sidebarPanelClass}`}
          >
            <SidebarAmbient />
            <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-extrabold tracking-tight text-gradient-brand">
                  {t("app.title")}
                </h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/70 hover:text-indigo-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1 overflow-y-auto scrollbar-none px-3 pb-6">
              <SidebarNav {...navProps} />
            </div>
            <SidebarFooter />
          </aside>
        </div>
      )}
    </>
  );
}
