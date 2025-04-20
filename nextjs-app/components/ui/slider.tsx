import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className="block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 will-change-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1"
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

const SwitchLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("text-sm font-medium", className)} {...props} />
));
SwitchLabel.displayName = "SwitchLabel";

const SwitchWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center space-x-2", className)} {...props} />
));
SwitchWrapper.displayName = "SwitchWrapper";

export { Switch, SwitchLabel, SwitchWrapper };
