import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

interface ImageLogoProps {
  className?: string;
  size?: number;
}

export default function ImageLogo({ className = "h-7 w-7", size = 28 }: ImageLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logo_light = "/logos/logo_madura.png";
  const logo_dark = "/logos/logo_madura_light.png";

  const currentTheme = theme === "system" ? "light" : theme;
  const imgUrl = currentTheme === "light" ? logo_light : logo_dark;

  if (!mounted) {
    return <div className={`animate-pulse bg-muted rounded-lg shrink-0 ${className}`} />;
  }

  return (
    <img
      src={imgUrl}
      alt="MaduraDev Logo"
      width={size}
      height={size}
      className={`object-contain shrink-0 ${className}`}
    />
  );
}
