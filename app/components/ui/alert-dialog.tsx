import { useEffect, useRef, useCallback } from "react";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose();
      }}
      className="fixed inset-0 z-50 m-auto max-h-[85vh] w-full max-w-lg rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-md open:animate-in open:fade-in open:zoom-in-95 duration-200 ease-out"
    >
      {open && children}
    </dialog>
  );
}

export function AlertDialogTrigger({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  if (asChild) return <>{children}</>;
  return <button {...props}>{children}</button>;
}

export function AlertDialogContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function AlertDialogHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 flex flex-col space-y-2 text-center sm:text-left ${className}`}>{children}</div>;
}

export function AlertDialogTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function AlertDialogDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}

export function AlertDialogFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>{children}</div>;
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AlertDialogAction({ children, className = "", ...props }: AlertDialogActionProps) {
  return (
    <button
      {...props}
      className={`inline-flex h-10 min-h-[40px] items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground select-none transition-all duration-100 ease-out active:scale-[0.97] active:opacity-90 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AlertDialogCancel({ children, className = "", ...props }: AlertDialogCancelProps) {
  return (
    <button
      {...props}
      className={`inline-flex h-10 min-h-[40px] items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold select-none transition-all duration-100 ease-out active:scale-[0.97] active:opacity-90 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
