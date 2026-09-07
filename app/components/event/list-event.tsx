import { useState, useMemo } from "react";
import { Link } from "react-router";
import { motion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  CircleCheck, 
  Search, 
  Globe,
  SlidersHorizontal,
  Inbox
} from "lucide-react";
import { isEventNew, type EventDisplay } from "@/lib/event";
import { appleSprings } from "@/lib/springs";
import { triggerHaptic } from "@/lib/haptics";

interface ListEventProps {
  events: EventDisplay[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const cardVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: appleSprings.default,
  },
};

export default function ListEvent({ events }: ListEventProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("semua");
  const [selectedStatus, setSelectedStatus] = useState("semua"); // "mendatang" | "selesai" | "semua"

  // Formats available in current events
  const formats = useMemo(() => {
    const set = new Set(events.map(e => e.format));
    return ["semua", ...Array.from(set)];
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // 1. Search Query filter
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description_small.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Format filter
      const matchesFormat = selectedFormat === "semua" || event.format === selectedFormat;
      
      // 3. Status filter
      const isUpcoming = isEventNew(event.event_date, event.event_time);
      let matchesStatus = true;
      if (selectedStatus === "mendatang") {
        matchesStatus = isUpcoming;
      } else if (selectedStatus === "selesai") {
        matchesStatus = !isUpcoming;
      }

      return matchesSearch && matchesFormat && matchesStatus;
    });
  }, [events, searchQuery, selectedFormat, selectedStatus]);

  return (
    <div className="space-y-10">
      
      {/* Search & Filter Bar */}
      <div className="bg-card/65 backdrop-blur-md rounded-3xl border border-border/50 p-6 md:p-8 editorial-shadow space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari event (e.g. Workshop, DevFest)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 rounded-2xl bg-background/50 border-border/50 text-foreground text-sm focus-visible:ring-primary/40 focus-visible:border-primary/50"
            />
          </div>

          {/* Status Segment Filter */}
          <div className="flex bg-muted/60 p-1.5 rounded-2xl border border-border/40 self-start lg:self-auto">
            <button
              onClick={() => {
                triggerHaptic("light");
                setSelectedStatus("mendatang");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest select-none cursor-pointer transition-all active:scale-95 ${
                selectedStatus === "mendatang"
                  ? "bg-card text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mendatang
            </button>
            <button
              onClick={() => {
                triggerHaptic("light");
                setSelectedStatus("selesai");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest select-none cursor-pointer transition-all active:scale-95 ${
                selectedStatus === "selesai"
                  ? "bg-card text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Selesai
            </button>
            <button
              onClick={() => {
                triggerHaptic("light");
                setSelectedStatus("semua");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest select-none cursor-pointer transition-all active:scale-95 ${
                selectedStatus === "semua"
                  ? "bg-card text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Format Tags */}
        <div className="border-t border-border/40 pt-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Format Event</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {formats.map((format) => (
              <button
                key={format}
                onClick={() => {
                  triggerHaptic("light");
                  setSelectedFormat(format);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border select-none cursor-pointer active:scale-95 ${
                  selectedFormat === format
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-95"
                    : "bg-background/40 hover:bg-background/80 text-muted-foreground hover:text-foreground border-border/50"
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Grid Listing */}
      {filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={appleSprings.default}
          className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md p-16 text-center editorial-shadow max-w-xl mx-auto flex flex-col items-center"
        >
          <Inbox className="w-16 h-16 mb-4 text-muted-foreground/40" />
          <p className="text-foreground font-bold text-xl mb-2 font-display">
            Event tidak ditemukan
          </p>
          <p className="text-sm text-muted-foreground">
            Coba ubah kata kunci pencarian atau sesuaikan filter format/status Anda.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {filteredEvents.map((event) => {
            const isUpcoming = isEventNew(event.event_date, event.event_time);
            return (
              <motion.div
                key={event.id}
                variants={cardVariants}
                whileHover={{ y: -5, transition: appleSprings.snappy }}
                className="group flex flex-col justify-between rounded-3xl overflow-hidden border border-border/50 bg-card/60 backdrop-blur-md hover:border-primary/50 transition-colors duration-200 editorial-shadow"
              >
                {/* Image Section */}
                <Link
                  to={`/events/${event.slug}`}
                  className="relative aspect-[16/10] overflow-hidden block bg-muted/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-transparent to-primary/10 z-10 group-hover:from-background/30 transition-colors duration-500" />
                  
                  {event.image ? (
                    <img
                      src={
                        event.image.startsWith("http")
                          ? event.image
                          : `/${event.image}`
                      }
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                      <Calendar className="w-12 h-12 text-primary/30" />
                    </div>
                  )}

                  {/* Absolute Tags */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                    {isUpcoming ? (
                      <span className="px-3 py-1 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-widest rounded-full shadow-md w-max">
                        Upcoming
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-[9px] font-bold uppercase tracking-widest rounded-full shadow-md w-max">
                        Selesai
                      </span>
                    )}
                    <span className="px-3 py-1 bg-background/85 backdrop-blur-md text-foreground text-[9px] font-bold uppercase tracking-widest rounded-full shadow-md w-max border border-border/40">
                      {event.online ? "Online" : "Offline"}
                    </span>
                  </div>
                </Link>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/10 px-2.5 py-1 rounded-md w-max block">
                      {event.format}
                    </span>
                    
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-2 font-display">
                      {event.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                      {event.description_small}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-border/40">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span className="font-semibold">{event.tanggal}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        {event.online ? (
                          <Globe className="w-3.5 h-3.5 text-primary mt-0.5" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-primary mt-0.5" />
                        )}
                        <div
                          className="font-medium text-foreground/80 line-clamp-1 leading-relaxed text-[11px]"
                          dangerouslySetInnerHTML={{ __html: event.location }}
                        />
                      </div>
                    </div>

                    <div className="flex pt-1">
                      <Link to={`/events/${event.slug}`} className="w-full">
                        <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-4 rounded-xl text-xs w-full shadow-md group-hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5">
                          Lihat Detail
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
