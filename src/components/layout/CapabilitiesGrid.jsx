import { ArrowRight } from "lucide-react";
import { t } from "../../i18n";
import { featureIds, tabById } from "../../config/navigation";

export function CapabilitiesGrid({ onSelectTab }) {
  return (
    <div className="mx-auto mt-8 w-full max-w-5xl md:mt-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-200" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {t("app.discoverMore")}
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-200" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {featureIds.map((id) => {
          const tab = tabById(id);
          if (!tab) return null;
          const Icon = tab.icon;
          return (
            <button
              key={id}
              onClick={() => onSelectTab(id)}
              className="group flex items-start gap-3 rounded-xl border border-gray-200/80 bg-white/70 p-3.5 text-left shadow-soft backdrop-blur transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-elevated"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                  <span className="truncate">{tab.getLabel()}</span>
                  <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 -translate-x-1 text-indigo-500 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                  {tab.getTooltip()}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
