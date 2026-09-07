import { useRef } from "react";
import { useInView, motion } from "motion/react";
import { Link } from "react-router";
import { Globe } from "lucide-react";
import { appleSprings } from "@/lib/springs";

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface TeamMember {
  id: number;
  name: string;
  position: string;
  description: string;
  avatar_url: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  portfolio?: string;
}

interface TeamClientProps {
  members: TeamMember[];
}

export default function TeamClient({ members }: TeamClientProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: appleSprings.default,
    },
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10" ref={ref}>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={appleSprings.default}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Our Base
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-4 font-display">
              Core <span className="text-primary italic">Team</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Orang-orang di balik layar yang menjalankan roda komunitas
              MaduraDev dan menggerakkan inisiatif-inisiatif teknologi lokal.
            </p>
          </motion.div>
          <div className="hidden md:flex gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-border" />
            <div className="w-2 h-2 rounded-full bg-border" />
          </div>
        </div>

        {/* Team Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {members.map((member) => (
            <motion.div
              key={member.id}
              className="group relative bg-card p-6 rounded-2xl border border-border/60 hover:border-primary/40 transition-colors duration-200"
              variants={itemVariants}
              whileHover={{ y: -5, transition: appleSprings.snappy }}
            >
              <Link
                to={`/teams/${nameToSlug(member.name)}`}
                className="absolute inset-0 z-10"
                aria-label={`Lihat profil ${member.name}`}
              />
              {/* Avatar */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-secondary border-2 border-background">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-display font-bold text-muted-foreground/40">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200 mb-1">
                  {member.name}
                </h4>
                <div className="inline-block px-2.5 py-0.5 bg-secondary/80 text-secondary-foreground rounded text-[10px] font-bold uppercase tracking-widest mb-3">
                  {member.position}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {member.description || "Core member of MaduraDev"}
                </p>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-2 relative z-20">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-muted/30 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                      <LinkedinIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-muted/30 text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground hover:border-border">
                      <GithubIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {member.portfolio && (
                    <a href={member.portfolio} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-muted/30 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {member.instagram && (
                    <a href={member.instagram} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-muted/30 text-muted-foreground transition-all hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/30">
                      <InstagramIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
