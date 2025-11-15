import { Info, HelpCircle, Lightbulb } from "lucide-react";
import { Card, CardContent } from "./card";

export function HelpText({ children, type = "info", title }) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    tip: "bg-yellow-50 border-yellow-200 text-yellow-900",
    warning: "bg-orange-50 border-orange-200 text-orange-900",
  };

  const icons = {
    info: Info,
    tip: Lightbulb,
    warning: HelpCircle,
  };

  const Icon = icons[type] || Info;

  return (
    <div className={`rounded-lg border p-3 ${styles[type]}`}>
      <div className="flex items-start gap-2">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-sm">{children}</div>
        </div>
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

