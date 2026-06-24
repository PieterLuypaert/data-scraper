import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

/**
 * useToast — returns { toast, dismiss }.
 *
 *   const { toast } = useToast();
 *   toast({ title: "Klaar!", description: "...", variant: "success" });
 *
 * Variants: "success" | "error" | "info" | "loading". A "loading" toast stays
 * until dismissed (or until you call toast.update / dismiss with its id).
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
}

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts) => {
    const id = ++idCounter;
    const duration =
      opts.duration ?? (opts.variant === "loading" ? Infinity : 4000);
    setToasts((prev) => [...prev, { id, ...opts, duration }]);
    return id;
  }, []);

  // Update an existing toast (e.g. turn a "loading" toast into "success").
  const update = useCallback((id, opts) => {
    setToasts((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...opts,
              duration:
                opts.duration ??
                (opts.variant === "loading" ? Infinity : 4000),
            }
          : t
      )
    );
  }, []);

  const value = { toast, dismiss, update };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function Toaster({ toasts, onDismiss }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3 sm:top-6 sm:right-6">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

const VARIANTS = {
  success: {
    Icon: CheckCircle2,
    iconClass: "text-emerald-500",
    ring: "before:from-emerald-400 before:to-teal-500",
  },
  error: {
    Icon: AlertCircle,
    iconClass: "text-rose-500",
    ring: "before:from-rose-400 before:to-red-500",
  },
  info: {
    Icon: Info,
    iconClass: "text-indigo-500",
    ring: "before:from-indigo-400 before:to-violet-500",
  },
  loading: {
    Icon: Loader2,
    iconClass: "text-indigo-500 animate-spin",
    ring: "before:from-indigo-400 before:to-violet-500",
  },
};

function ToastItem({ toast, onDismiss }) {
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef();
  const variant = VARIANTS[toast.variant] || VARIANTS.info;
  const { Icon } = variant;

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (toast.duration === Infinity) return;
    timerRef.current = setTimeout(close, toast.duration);
    return () => clearTimeout(timerRef.current);
  }, [toast.duration, close]);

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => clearTimeout(timerRef.current)}
      onMouseLeave={() => {
        if (toast.duration !== Infinity) timerRef.current = setTimeout(close, 2000);
      }}
      className={cn(
        "pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-4 pr-10 shadow-elevated backdrop-blur-2xl transition-all duration-200",
        // Gradient accent bar on the left edge.
        "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gradient-to-b before:content-['']",
        variant.ring,
        leaving
          ? "translate-x-3 opacity-0"
          : "animate-fade-in-up opacity-100"
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", variant.iconClass)} />
      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        )}
        {toast.description && (
          <p className="mt-0.5 break-words text-sm leading-relaxed text-gray-500">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action.onClick?.();
              close();
            }}
            className="mt-2 rounded-lg border border-indigo-200 bg-white/70 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={close}
        aria-label="Sluiten"
        className="absolute right-2 top-2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-500/10 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
