import { Home, Users, Calendar, Camera, Newspaper } from "lucide-react";
import { Link, useLocation } from "react-router";

const leftItems = [
  { icon: Home, label: "Home", url: "/" },
  { icon: Users, label: "Teams", url: "/teams" },
];

const rightItems = [
  { icon: Calendar, label: "Events", url: "/events" },
  { icon: Newspaper, label: "Media", url: "/media" },
];

export default function MobileNav() {
  const pathname = useLocation().pathname;

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname?.startsWith(url);

  return (
    <>
      <svg className="pointer-events-none fixed -z-50 w-0 h-0 opacity-0" aria-hidden="true">
        <filter id="liquid-glass">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            seed="2"
            result="turb"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turb"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* Floating Liquid Glass Dock */}
      <nav className="fixed md:hidden bottom-3 inset-x-3 max-w-md mx-auto z-50 pointer-events-auto">
        <div className="relative">
          {/* Glass background layer with overflow-hidden for internal effects */}
          <div
            className="
              absolute inset-0 rounded-[28px] overflow-hidden
              border border-white/70 dark:border-white/15
              bg-white/80 dark:bg-zinc-900/80
              backdrop-blur-2xl backdrop-saturate-200
              shadow-[0_12px_36px_-4px_rgba(0,0,0,0.16),inset_0_1.5px_2px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.06)]
              dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(255,255,255,0.05)]
              transition-all duration-300
            "
            style={{
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
              backdropFilter: "blur(24px) saturate(190%)",
            }}
          >
            {/* Subtle noise overlay texture for physical glass depth */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.05] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
              aria-hidden="true"
            />

            {/* Liquid Top Rim Light Highlight */}
            <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white dark:via-white/40 to-transparent" />

            {/* Organic ambient liquid gradient glow */}
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-20 bg-primary/20 dark:bg-primary/25 rounded-full blur-2xl" />
          </div>

          {/* Nav Items Content - No overflow-hidden so center floating button never gets cut off */}
          <div className="relative flex justify-around items-center px-3 py-2 z-10">
            {/* Left tabs */}
            {leftItems.map(({ icon: Icon, label, url }) => {
              const active = isActive(url);
              return (
                <Link
                  key={label}
                  to={url}
                  className="flex flex-col items-center justify-center min-w-14 py-1 group active:scale-95 transition-transform duration-150"
                >
                  <div
                    className={`
                      w-10 h-8 flex items-center justify-center rounded-2xl
                      transition-all duration-300 relative
                      ${active
                        ? "bg-primary/15 dark:bg-primary/25 text-primary border border-primary/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_2px_8px_rgba(var(--primary),0.2)]"
                        : "text-foreground/70 dark:text-muted-foreground group-hover:text-foreground group-hover:bg-black/5 dark:group-hover:bg-white/5"
                      }
                    `}
                  >
                    <Icon
                      size={20}
                      strokeWidth={active ? 2.4 : 1.8}
                      className="transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>
                  <span
                    className={`
                      text-[10px] leading-tight tracking-tight mt-0.5
                      transition-colors duration-200
                      ${active ? "text-primary font-bold" : "text-foreground/75 dark:text-muted-foreground font-medium group-hover:text-foreground"}
                    `}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}

            {/* Center Twibbon / Camera Button - Liquid Glass Droplet (unclipped) */}
            <Link
              to="/twibbon"
              className="flex flex-col items-center justify-center min-w-14 -mt-6 group"
            >
              <div className="p-1.5 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-white dark:border-white/25 shadow-xl shadow-primary/25 group-active:scale-90 transition-transform duration-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-b from-primary via-primary/95 to-primary/85 text-primary-foreground flex items-center justify-center shadow-[0_8px_20px_-2px_rgba(var(--primary),0.5),inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.25)] group-hover:shadow-[0_10px_24px_-2px_rgba(var(--primary),0.6),inset_0_2px_4px_rgba(255,255,255,0.8)] transition-all duration-300">
                  <Camera
                    size={22}
                    strokeWidth={2.2}
                    className="group-hover:scale-110 transition-transform duration-200 drop-shadow-sm"
                  />
                </div>
              </div>
              <span className="text-[10px] font-semibold leading-tight tracking-tight text-foreground/80 dark:text-foreground/80 group-hover:text-primary mt-1 transition-colors">
                Twibbon
              </span>
            </Link>

            {/* Right tabs */}
            {rightItems.map(({ icon: Icon, label, url }) => {
              const active = isActive(url);
              return (
                <Link
                  key={label}
                  to={url}
                  className="flex flex-col items-center justify-center min-w-14 py-1 group active:scale-95 transition-transform duration-150"
                >
                  <div
                    className={`
                      w-10 h-8 flex items-center justify-center rounded-2xl
                      transition-all duration-300 relative
                      ${active
                        ? "bg-primary/15 dark:bg-primary/25 text-primary border border-primary/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_2px_8px_rgba(var(--primary),0.2)]"
                        : "text-foreground/70 dark:text-muted-foreground group-hover:text-foreground group-hover:bg-black/5 dark:group-hover:bg-white/5"
                      }
                    `}
                  >
                    <Icon
                      size={20}
                      strokeWidth={active ? 2.4 : 1.8}
                      className="transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>
                  <span
                    className={`
                      text-[10px] leading-tight tracking-tight mt-0.5
                      transition-colors duration-200
                      ${active ? "text-primary font-bold" : "text-foreground/75 dark:text-muted-foreground font-medium group-hover:text-foreground"}
                    `}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
