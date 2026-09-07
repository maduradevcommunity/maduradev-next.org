import { triggerHaptic } from "@/lib/haptics";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked = false, onCheckedChange, disabled, className = "" }: SwitchProps) {
  const handleClick = () => {
    if (disabled) return;
    triggerHaptic("light");
    onCheckedChange?.(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent select-none
        transition-colors duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        active:scale-[0.98]
        ${checked ? "bg-primary" : "bg-input"} ${className}`}
    >
      <span
        className={`pointer-events-none block h-5 rounded-full bg-background shadow-md ring-0
          transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          group-active:w-6
          ${checked ? "w-5 translate-x-5" : "w-5 translate-x-0"}`}
      />
    </button>
  );
}

