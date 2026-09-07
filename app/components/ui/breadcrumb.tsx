import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <nav aria-label="breadcrumb" className={className}>{children}</nav>;
}

export function BreadcrumbList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <ol className={`flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}>{children}</ol>;
}

export function BreadcrumbItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <li className={`flex items-center gap-1.5 ${className}`}>{children}</li>;
}

export function BreadcrumbSeparator({ className = "" }: { className?: string } = {}) {
  return <ChevronRight className={`h-4 w-4 text-muted-foreground ${className}`} />;
}

export function BreadcrumbLink({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean } & React.ComponentProps<typeof Link>) {
  if (asChild) {
    return <Link {...props} className="transition-colors hover:text-foreground">{children}</Link>;
  }
  return <Link {...props} className="transition-colors hover:text-foreground">{children}</Link>;
}

export function BreadcrumbPage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-medium text-foreground ${className}`}>{children}</span>;
}
