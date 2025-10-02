import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-lg border px-4 py-2 text-base bg-white/70 backdrop-blur-sm border-white/40 transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:bg-white/80 hover:border-white/50",
        "focus-visible:bg-white/90 focus-visible:border-indigo-400/60 focus-visible:ring-4 focus-visible:ring-indigo-500/20",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
