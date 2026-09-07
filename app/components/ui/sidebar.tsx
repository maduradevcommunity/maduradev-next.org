import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { PanelLeftClose, PanelLeft, Menu, X } from "lucide-react";

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
}

export const SidebarContext = createContext<SidebarContextValue>({
  open: true,
  toggle: () => { },
  setOpen: () => { },
  isMobile: false,
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    let prevWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
    const initialMobile = window.innerWidth < 768;
    setIsMobile(initialMobile);
    // On mobile start closed, on desktop start open
    setOpen(!initialMobile);

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // Only act if the width actually changed (avoids mobile vertical scroll address bar triggers)
      if (currentWidth !== prevWidth) {
        const wasMobile = prevWidth < 768;
        const nowMobile = currentWidth < 768;
        prevWidth = currentWidth;
        setIsMobile(nowMobile);
        if (!wasMobile && nowMobile) {
          setOpen(false);
        } else if (wasMobile && !nowMobile) {
          setOpen(true);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, toggle, setOpen, isMobile }}>
      <div className="flex min-h-screen">{children}</div>
    </SidebarContext.Provider>
  );
}

export function SidebarInset({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-1 flex-col min-w-0 ${className}`}>{children}</div>;
}

import { triggerHaptic } from "@/lib/haptics";

export function SidebarTrigger({ className = "" }: { className?: string }) {
  const { open, toggle, isMobile } = useContext(SidebarContext);

  const handleToggle = () => {
    triggerHaptic("light");
    toggle();
  };

  return (
    <button
      onClick={handleToggle}
      title={open ? "Tutup Sidebar" : "Buka Sidebar"}
      className={`inline-flex h-10 w-10 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/80 shadow-2xs select-none transition-all duration-100 ease-out active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      {isMobile ? (
        open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />
      ) : (
        open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />)}
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

export function Sidebar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { open, isMobile, setOpen } = useContext(SidebarContext);

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              triggerHaptic("light");
              setOpen(false);
            }}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border/80 bg-card/95 backdrop-blur-2xl text-foreground shadow-2xl transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "-translate-x-full"
            } ${className}`}
        >
          {children}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={`sticky top-0 z-30 flex h-screen flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground transition-[width] duration-300 ${open ? "w-64" : "w-16"
        } ${className}`}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { open } = useContext(SidebarContext);
  return (
    <div className={`px-3 py-3 ${!open ? "flex items-center justify-center" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function SidebarContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 ${className}`}>{children}</div>;
}

export function SidebarFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-3 py-2 ${className}`}>{children}</div>;
}

export function SidebarGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-1 ${className}`}>{children}</div>;
}

export function SidebarGroupLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { open } = useContext(SidebarContext);
  if (!open) return null;
  return (
    <div className={`px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${className}`}>
      {children}
    </div>
  );
}

export function SidebarGroupContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function SidebarMenu({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <ul className={`space-y-1 ${className}`}>{children}</ul>;
}

export function SidebarMenuItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <li className={className}>{children}</li>;
}

interface SidebarMenuButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
}

export function SidebarMenuButton({
  children,
  asChild,
  isActive,
  tooltip,
  onClick,
  className = "",
}: SidebarMenuButtonProps) {
  const { open } = useContext(SidebarContext);

  const defaultStateClass = isActive
    ? "bg-primary text-white dark:text-primary-foreground font-semibold shadow-xs"
    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent";

  const buttonClass = `group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
    !open ? "justify-center px-0" : ""
  } ${className || defaultStateClass}`;

  if (asChild) {
    return (
      <div className={buttonClass} title={!open ? tooltip : undefined}>
        {children}
      </div>
    );
  }

  return (
    <button onClick={onClick} className={buttonClass} title={!open ? tooltip : undefined}>
      {children}
    </button>
  );
}

export function SidebarRail() {
  return null;
}
