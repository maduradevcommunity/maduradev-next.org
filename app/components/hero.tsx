import { motion, type Variants } from "motion/react";
import { Send, Users } from "lucide-react";
import { Link } from "react-router";
import { appleSprings } from "@/lib/springs";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: appleSprings.default,
  },
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-28 pb-12 md:py-24">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #0058be 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Content */}
        <motion.div
          className="lg:col-span-7"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-6"
          >
            <span className="font-label text-[10px] font-bold uppercase tracking-widest">
              Est. 2021
            </span>
            <span className="w-1 h-1 rounded-full bg-primary" />
            <span className="font-label text-[10px] font-bold uppercase tracking-widest">
              Madura Developer
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-8xl font-black text-foreground leading-[0.9] tracking-tighter mb-8 font-display"
          >
            Wadahnya <br />
            <span className="text-primary italic">Developer Madura</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10"
          >
            MaduraDev adalah komunitas developer yang berbasis di Madura. Kami hadir sebagai wadah bagi para pegiat IT lokal untuk belajar, berbagi, dan berkolaborasi dalam membangun ekosistem digital yang positif dan berkelanjutan di Madura.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/telegram">
              <button className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all editorial-shadow active:scale-95">
                <Send size={20} />
                Join Telegram Group
              </button>
            </Link>
            <Link to="/events">
              <button className="flex items-center justify-center gap-2 border-2 border-border/50 text-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-muted/50 transition-all active:scale-95">
                Explore Events
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Image Card */}
        <motion.div
          className="lg:col-span-5 relative"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={appleSprings.gentle}
        >
          <div className="aspect-square rounded-3xl overflow-hidden editorial-shadow bg-muted border border-border/50 relative group">
            <img
              src="/bersama.png"
              alt="Community Collaboration"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute bottom-2 left-6 right-6 p-6 glass-nav rounded-2xl border border-white/20 group-hover:backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center overflow-hidden"
                    >
                      <Users size={20} className="text-primary" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">500+ Members</p>
                  <p className="text-xs text-muted-foreground">
                    Active in community
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 w-32 h-32 border-t-4 border-r-4 border-secondary opacity-20 hidden md:block" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary rounded-full blur-3xl opacity-20" />
        </motion.div>
      </div>
    </section>
  );
}
