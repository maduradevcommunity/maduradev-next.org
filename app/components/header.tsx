import { Link, useLocation } from "react-router";
import { SimpleThemeToggle } from "./simple-theme-toggle";

const navLinks = [
  {
    name: "Home",
    url: "/",
  },
  {
    name: "Event",
    url: "/events",
  },
  {
    name: "Team",
    url: "/teams",
  },
  {
    name: "Media",
    url: "/media",
  },
];

export default function Navbar() {
  const pathname = useLocation().pathname;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/30 bg-background/75 backdrop-blur-2xl backdrop-saturate-180 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black tracking-tighter text-primary select-none active:scale-[0.98] transition-transform">
            MaduraDev
          </Link>
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((item, i) => {
              const isActive = item.url === '/' ? pathname === '/' : pathname?.startsWith(item.url);
              return (
                <Link
                  key={i}
                  to={item.url}
                  className={`text-xs font-label font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all duration-150 select-none ${
                    isActive
                      ? "text-primary bg-primary/10 shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SimpleThemeToggle />
          <Link to="/telegram" className="hidden sm:block">
            <button className="bg-primary hover:bg-primary/95 text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm select-none transition-all duration-100 ease-out active:scale-[0.97] active:opacity-90 shadow-md shadow-primary/25 cursor-pointer">
              Join Now
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
