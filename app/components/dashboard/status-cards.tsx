import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Activity } from "lucide-react";

export function StatusCards() {
  const [isOnline, setIsOnline] = useState(true);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setIsProduction(
      typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        !window.location.hostname.startsWith("127.") &&
        !window.location.hostname.startsWith("192.168.")
    );

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {/* Website Status Card */}
      <Card className="group relative overflow-hidden border border-border/70 bg-card/60 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-500/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Koneksi Web
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground tracking-tight">
              <span className={`relative flex h-2.5 w-2.5`}>
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isOnline ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
              </span>
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
            <span>Domain:</span>
            <span className="font-mono text-foreground/80">madura.dev</span>
          </p>
        </CardContent>
      </Card>

      {/* Environment Card */}
      <Card className="group relative overflow-hidden border border-border/70 bg-card/60 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-500/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Environment
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 transition-transform group-hover:scale-110">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {isProduction ? "Production" : "Local Dev"}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isProduction ? "Server publik aktif" : "Lingkungan pengujian lokal"}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
