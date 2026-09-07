import React, { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const variantClasses: Record<string, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  outline: "border border-border bg-background hover:bg-muted text-foreground",
  ghost: "hover:bg-muted text-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
};

const sizeClasses: Record<string, string> = {
  default: "h-10 min-h-[40px] px-4 py-2",
  sm: "h-9 min-h-[38px] rounded-lg px-3.5 text-sm",
  lg: "h-12 min-h-[48px] rounded-xl px-8 text-base font-semibold",
  icon: "h-10 w-10 min-w-[40px] min-h-[40px] p-0",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const classes = `inline-flex items-center justify-center gap-2 rounded-xl font-medium text-sm select-none cursor-pointer
      transition-all duration-100 ease-out
      active:scale-[0.97] active:opacity-90
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
      disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100
      ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: `${classes} ${(children as React.ReactElement<any>).props.className || ""}`.trim(),
        ref,
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
