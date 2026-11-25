import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const base = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors";

const variants: Record<string, string> = {
  default: "bg-slate-700 text-slate-100 border-slate-600",
  secondary: "bg-slate-600 text-slate-100 border-slate-500",
  destructive: "bg-red-900/20 text-red-400 border-red-900/30",
  outline: "border-slate-600 text-slate-400 bg-transparent",
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[base, variants[variant], className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";