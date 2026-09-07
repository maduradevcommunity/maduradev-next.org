import { Link } from "react-router";
import { Globe, Users2, Share2 } from "lucide-react";

const partners = [
  "bangkalan-dev.webp",
  "pamekasan-dev.webp",
  "sampang-dev.webp",
  "sumenep-dev.webp",
  "demtimcod.webp",
];

const programmingTags = [
  "PHP",
  "JAVASCRIPT",
  "PYTHON",
  "GOLANG",
  "RUST",
  "KOTLIN",
  "DART",
  "TYPESCRIPT",
  "ELIXIR",
  "PERL",
  "JAVA"
];

const quickLinks = [
  { name: "Media", url: "/media" },
  { name: "Telegram", url: "/telegram" },
  { name: "Instagram", url: "/instagram" },
  { name: "GitHub", url: "/github" },
  { name: "Hubungi Kami", url: "mailto:info.maduradev@gmail.com" },
  { name: "Komunitas", url: "/community" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-24 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand & Partners */}
        <div className="space-y-8">
          <div>
            <div className="text-2xl font-black text-slate-50 mb-4 tracking-tighter">
              MaduraDev
            </div>
            <p className="leading-relaxed text-sm">
              Memberdayakan talenta teknologi di Madura melalui kolaborasi,
              edukasi, dan inovasi terbuka.
            </p>
          </div>
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-slate-500 mb-4">
              Community Partners
            </p>
            <div className="flex flex-wrap gap-4 items-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              {partners.map((partner, i) => (
                <img
                  key={i}
                  src={`/partners/${partner}`}
                  alt={partner.replace(".webp", "")}
                  className="h-8 object-contain"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Programming Languages */}
        <div>
          <p className="font-label text-[10px] uppercase tracking-widest text-slate-500 mb-6">
            Bahasa Pemrograman
          </p>
          <div className="flex flex-wrap gap-2">
            {programmingTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/10 text-white rounded-full font-label text-[10px] font-bold hover:bg-primary transition-colors cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:text-right">
          <p className="font-label text-[10px] uppercase tracking-widest text-slate-500 mb-6">
            Quick Links
          </p>
          <div className="flex flex-col gap-3">
            {quickLinks.map((link, i) =>
              link.url.startsWith("/") ? (
                <Link
                  key={i}
                  to={link.url}
                  className="text-sm hover:text-primary transition-colors font-label uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={i}
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-sm hover:text-primary transition-colors font-label uppercase tracking-widest"
                >
                  {link.name}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-label uppercase tracking-widest">
        <p>
          © {new Date().getFullYear()} MaduraDev. Built for the local developer
          ecosystem.
        </p>
        <div className="flex gap-6">
          <Link
            to="/privacy-policy"
            className="hover:text-slate-50 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-of-service"
            className="hover:text-slate-50 transition-colors"
          >
            Terms of Service
          </Link>
        </div>
        <div className="flex gap-4">
          <Globe size={16} />
          <Users2 size={16} />
          <Share2 size={16} />
        </div>
      </div>
    </footer>
  );
}
