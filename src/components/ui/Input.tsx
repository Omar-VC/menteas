import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={[
          "flex h-10 w-full rounded-md border border-slate-600 bg-slate-950/50 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";