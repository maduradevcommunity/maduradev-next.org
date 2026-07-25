import { useEffect, useRef, useState, memo } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { getEvent, isEventNew } from "@/lib/event";
import {
  Link,
  Form,
  useActionData,
  useNavigation,
  useLoaderData,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  ArrowLeft,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, type Variants } from "motion/react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};


export async function loader({ request, params }: LoaderFunctionArgs) {
  const supabase = createClient(request);
  const slug = params.slug!;
  const event = await getEvent(supabase, slug);

  if (!event) {
    throw new Response("Event tidak ditemukan", { status: 404 });
  }

  let registrationCount = 0;
  let currentUserRegistration = null;
  let loggedInUser = null;

  if (event.type === "internal" && event.rsvp_enabled) {
    const adminClient = createAdminClient();

    // Fetch registrations to count active seats (ignoring expired pending payments)
    const { data: regList, error: regListError } = await adminClient
      .from("event_registrations")
      .select("status, registered_at")
      .eq("event_id", event.id);

    if (!regListError && regList) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      registrationCount = regList.filter((reg) =>
        reg.status === "confirmed" ||
        (reg.status === "pending_payment" && reg.registered_at > fiveMinutesAgo)
      ).length;
    }

    // Fetch logged in user and check if already registered
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      loggedInUser = {
        email: user.email || "",
        name: user.user_metadata?.full_name || "",
      };

      const { data: regData } = await adminClient
        .from("event_registrations")
        .select("*")
        .eq("event_id", event.id)
        .eq("email", user.email)
        .maybeSingle();

      if (regData) {
        let paymentUrl = null;
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const isExpired = regData.status === "pending_payment" && regData.registered_at <= fiveMinutesAgo;

        if (regData.status === "pending_payment" && !isExpired && event.price) {
          const projectSlug = process.env.PAKASIR_PROJECT_SLUG || "";
          const requestUrl = new URL(request.url);
          const redirectUrl = `${requestUrl.protocol}//${requestUrl.host}/ticket/${regData.checkin_token}`;
          paymentUrl = `https://app.pakasir.com/pay/${projectSlug}/${event.price}?order_id=${regData.id}&redirect=${encodeURIComponent(redirectUrl)}`;
        }

        currentUserRegistration = {
          ...regData,
          isExpired,
          paymentUrl,
        };
      }
    }
  }

  return {
    event,
    isNew: isEventNew(event.event_date, event.event_time),
    registrationCount,
    currentUserRegistration,
    loggedInUser,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const supabase = createClient(request);
  const slug = params.slug!;
  const event = await getEvent(supabase, slug);

  if (!event || event.type !== "internal" || !event.rsvp_enabled) {
    return { errors: { general: "Pendaftaran RSVP tidak aktif untuk event ini." } };
  }

  // Check event date
  if (!isEventNew(event.event_date, event.event_time)) {
    return { errors: { general: "Pendaftaran ditutup karena event sudah selesai." } };
  }

  const formData = await request.formData();
  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim();
  const whatsappRaw = (formData.get("whatsapp") as string || "").trim();
  const institution = (formData.get("institution") as string || "").trim();
  const kabupaten = (formData.get("kabupaten") as string || "").trim();
  const role = (formData.get("role") as string || "").trim();
  const reason = (formData.get("reason") as string || "").trim();

  // Validate fields
  const errors: Record<string, string> = {};

  if (!name || name.length < 3) {
    errors.name = "Nama lengkap wajib diisi dan minimal 3 karakter.";
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = "Format email tidak valid.";
  }

  // WhatsApp check
  const whatsappCleaned = whatsappRaw.replace(/[^\d+]/g, "");
  if (!whatsappCleaned || !/^(\+62|0)8\d+$/.test(whatsappCleaned) || whatsappCleaned.length < 10 || whatsappCleaned.length > 15) {
    errors.whatsapp = "Nomor WhatsApp harus berformat Indonesia (mulai dengan 08 atau +62) dan panjang 10-15 digit.";
  }

  if (!institution) {
    errors.institution = "Asal Instansi/Sekolah wajib diisi.";
  }

  if (!kabupaten || kabupaten.length < 2) {
    errors.kabupaten = "Kabupaten wajib diisi.";
  }

  if (reason && reason.length > 500) {
    errors.reason = "Alasan ikut event maksimal 500 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const adminClient = createAdminClient();

  // Check double registration
  const { data: existingReg } = await adminClient
    .from("event_registrations")
    .select("id, status, registered_at")
    .eq("event_id", event.id)
    .eq("email", email)
    .maybeSingle();

  if (existingReg) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const isExpired = existingReg.status === "pending_payment" && existingReg.registered_at <= fiveMinutesAgo;

    if (isExpired) {
      await adminClient
        .from("event_registrations")
        .delete()
        .eq("id", existingReg.id);
    } else {
      return { errors: { email: "Email ini sudah terdaftar untuk event ini." } };
    }
  }

  // Check seat capacity
  if (event.max_attendees) {
    const { data: regList, error: countError } = await adminClient
      .from("event_registrations")
      .select("status, registered_at")
      .eq("event_id", event.id);

    if (!countError && regList) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const activeCount = regList.filter((reg) =>
        reg.status === "confirmed" ||
        (reg.status === "pending_payment" && reg.registered_at > fiveMinutesAgo)
      ).length;

      if (activeCount >= event.max_attendees) {
        return { errors: { general: "Pendaftaran sudah penuh. Kuota maksimal telah terpenuhi." } };
      }
    }
  }

  const initialStatus = event.price && event.price > 0 ? "pending_payment" : "confirmed";

  // Insert registration and get back the checkin token
  const { data: newReg, error: insertError } = await adminClient
    .from("event_registrations")
    .insert({
      event_id: event.id,
      name,
      email,
      whatsapp: whatsappCleaned,
      institution,
      kabupaten,
      role: role || null,
      reason: reason || null,
      status: initialStatus,
    })
    .select("id, checkin_token")
    .single();

  if (insertError || !newReg) {
    console.error("Gagal menyimpan RSVP:", insertError);
    return { errors: { general: "Terjadi kesalahan pada server. Silakan coba lagi nanti." } };
  }

  let paymentUrl = null;
  if (initialStatus === "pending_payment" && event.price) {
    const projectSlug = process.env.PAKASIR_PROJECT_SLUG || "";
    const requestUrl = new URL(request.url);
    const redirectUrl = `${requestUrl.protocol}//${requestUrl.host}/ticket/${newReg.checkin_token}`;
    paymentUrl = `https://app.pakasir.com/pay/${projectSlug}/${event.price}?order_id=${newReg.id}&redirect=${encodeURIComponent(redirectUrl)}`;
  }

  return {
    success: true,
    checkinToken: newReg.checkin_token as string,
    paymentUrl
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.event) return [{ title: "Event tidak ditemukan" }];
  const event = data.event;
  const imageUrl = event.image
    ? (event.image.startsWith("http") ? event.image : `https://madura.dev${event.image.startsWith("/") ? "" : "/"}${event.image}`)
    : undefined;
  const canonicalUrl = `https://madura.dev/events/${event.slug}`;

  return [
    { title: `${event.title} - MaduraDev` },
    { name: "description", content: event.description_small },
    { name: "keywords", content: `event madura, ${event.format}, ${event.title}, developer madura, workshop madura` },
    { property: "og:title", content: `${event.title} - MaduraDev` },
    { property: "og:description", content: event.description_small },
    { property: "og:type", content: "article" },
    { property: "og:url", content: canonicalUrl },
    ...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: event.title },
    { name: "twitter:description", content: event.description_small },
    ...(imageUrl ? [{ name: "twitter:image", content: imageUrl }] : []),
    { tagName: "link", rel: "canonical", href: canonicalUrl },
  ];
};

export default function DetailEvent() {
  const { event, isNew, registrationCount, currentUserRegistration, loggedInUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const formRef = useRef<HTMLFormElement>(null);

  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedProvinceName, setSelectedProvinceName] = useState("");
  const [regencies, setRegencies] = useState<{ id: string; name: string }[]>([]);
  const [selectedRegencyName, setSelectedRegencyName] = useState("");
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingRegencies, setIsLoadingRegencies] = useState(false);
  const [useFallbackRegions, setUseFallbackRegions] = useState(false);

  // role and university states
  const [selectedRole, setSelectedRole] = useState("");
  const [universities, setUniversities] = useState<string[]>([]);
  const [isLoadingUnis, setIsLoadingUnis] = useState(false);
  const [uniSearch, setUniSearch] = useState("");
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState("");

  const isRsvpActive = event.type === "internal" && event.rsvp_enabled;

  useEffect(() => {
    if (!isRsvpActive) return;

    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const res = await fetch("/api/regional?type=provinces");
        if (res.ok) {
          const data = await res.json();
          let list = Array.isArray(data) ? data : (data.data || []);
          if (list.length > 0) {
            const normalized = list.map((item: any) => ({
              id: String(item.id || item.code || item.province_code || ""),
              name: String(item.name || item.province || "")
            })).filter((item: any) => item.id && item.name);

            setProvinces(normalized);
            setUseFallbackRegions(false);
          } else {
            setUseFallbackRegions(true);
          }
        } else {
          setUseFallbackRegions(true);
        }
      } catch (err) {
        console.error("Gagal mengambil data provinsi:", err);
        setUseFallbackRegions(true);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, [isRsvpActive]);

  const handleProvinceSelect = async (provId: string) => {
    setSelectedProvinceId(provId);
    const provName = provinces.find(p => p.id === provId)?.name || "";
    setSelectedProvinceName(provName);
    setSelectedRegencyName("");
    setRegencies([]);

    if (!provId) return;

    setIsLoadingRegencies(true);
    try {
      const res = await fetch(`/api/regional?type=regencies&province_id=${provId}`);
      if (res.ok) {
        const data = await res.json();
        let list = Array.isArray(data) ? data : (data.data || []);
        const normalized = list.map((item: any) => ({
          id: String(item.id || item.code || item.regency_code || ""),
          name: String(item.name || item.regency || "")
        })).filter((item: any) => item.id && item.name);

        setRegencies(normalized);
      }
    } catch (err) {
      console.error("Gagal mengambil data kabupaten:", err);
    } finally {
      setIsLoadingRegencies(false);
    }
  };

  const uniTimeoutRef = useRef<any>(null);

  const fetchUniversities = async (searchQuery?: string) => {
    setIsLoadingUnis(true);
    try {
      const url = searchQuery
        ? `/api/regional?type=universities&search=${encodeURIComponent(searchQuery)}`
        : "/api/regional?type=universities";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let list: string[] = [];
        if (Array.isArray(data)) {
          list = data.map((item: any) => typeof item === "string" ? item : item.name);
        } else if (data && Array.isArray(data.data)) {
          list = data.data.map((item: any) => typeof item === "string" ? item : item.name);
        }
        list = list.filter((name) => !!name);
        setUniversities(list);
      }
    } catch (err) {
      console.error("Gagal mengambil data universitas:", err);
    } finally {
      setIsLoadingUnis(false);
    }
  };

  const fetchUniversitiesDebounced = (searchQuery: string) => {
    if (uniTimeoutRef.current) {
      clearTimeout(uniTimeoutRef.current);
    }
    uniTimeoutRef.current = setTimeout(() => {
      fetchUniversities(searchQuery);
    }, 400);
  };

  useEffect(() => {
    if (actionData?.success) {
      toast.success("Pendaftaran RSVP berhasil! Cek tiket kamu di bawah.");
      formRef.current?.reset();
      // Reset local states
      setSelectedProvinceId("");
      setSelectedProvinceName("");
      setRegencies([]);
      setSelectedRegencyName("");
      setSelectedRole("");
      setUniSearch("");
      setSelectedUni("");
    } else if (actionData?.errors?.general) {
      toast.error(actionData.errors.general);
    }
  }, [actionData]);

  const isCapacityFull = event.max_attendees ? registrationCount >= event.max_attendees : false;
  const isPastEvent = !isNew;
  const isRegistrationClosed = isPastEvent || isCapacityFull;

  const formatRegistrationDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";
    } catch {
      return dateString;
    }
  };

  const formatIsoStartDate = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return undefined;
    const timeMatch = timeStr?.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hh = timeMatch[1].padStart(2, "0");
      const mm = timeMatch[2];
      return `${dateStr}T${hh}:${mm}:00+07:00`;
    }
    return `${dateStr}T00:00:00+07:00`;
  };

  const cleanLocation = event.location ? event.location.replace(/<[^>]*>?/gm, "").trim() : "";
  const fullImageUrl = event.image
    ? (event.image.startsWith("http") ? event.image : `https://madura.dev${event.image.startsWith("/") ? "" : "/"}${event.image}`)
    : undefined;

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description_small,
    startDate: formatIsoStartDate(event.event_date, event.event_time),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: event.online
      ? {
        "@type": "VirtualLocation",
        url: `https://madura.dev/events/${event.slug}`,
      }
      : {
        "@type": "Place",
        name: cleanLocation || "Madura",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Madura",
          addressRegion: "Jawa Timur",
          addressCountry: "ID",
        },
      },
    organizer: {
      "@type": "Organization",
      name: "MaduraDev",
      url: "https://madura.dev",
    },
    ...(fullImageUrl ? { image: [fullImageUrl] } : {}),
    offers: {
      "@type": "Offer",
      price: event.price && event.price > 0 ? event.price : "0",
      priceCurrency: "IDR",
      availability: isCapacityFull
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: `https://madura.dev/events/${event.slug}`,
      validFrom: event.event_date,
    },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Schema.org Event JSON-LD for Google Search Console */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Dot Grid Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #0058be 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants}>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-primary transition-colors group font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Events</span>
          </Link>
        </motion.div>

        {/* Title & Short Description */}
        <motion.div variants={itemVariants} className="space-y-6 mb-12">
          <div className="flex flex-wrap items-center gap-3">
            {isNew ? (
              <span className="px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                Upcoming Event
              </span>
            ) : (
              <span className="px-3.5 py-1.5 bg-muted border border-border/50 text-muted-foreground text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                Selesai
              </span>
            )}
            <span className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm bg-secondary/15 border border-secondary/20 text-secondary-foreground">
              {event.online ? "Online" : "Offline"}
            </span>
            <span className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm bg-accent/15 border border-accent/20 text-foreground capitalize">
              {event.format}
            </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black text-foreground font-display leading-[1.05] tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
            {event.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl">
            {event.description_small}
          </p>
        </motion.div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mt-8">

          {/* Left Column: Image & Description */}
          <div className="lg:col-span-8 space-y-8">

            {/* Hero Image Section */}
            <motion.div
              variants={itemVariants}
              className="relative rounded-3xl overflow-hidden border border-border/50 bg-muted/30 aspect-[16/9] editorial-shadow group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity duration-500" />
              {event.image ? (
                <img
                  src={
                    event.image.startsWith("http")
                      ? event.image
                      : `/${event.image}`
                  }
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30">
                  <Calendar className="w-24 h-24 text-primary/30" />
                </div>
              )}
            </motion.div>

            {/* Description Section */}
            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md p-8 md:p-12 editorial-shadow"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 font-display">
                Tentang Event
              </h2>
              <MarkdownRenderer content={event.description} />
            </motion.div>
          </div>

          {/* Right Column: Sticky Sidebar containing Details & RSVP */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">

            {/* Consolidated Event Details Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-border/50 bg-card/65 backdrop-blur-md p-6 editorial-shadow space-y-6"
            >
              <h3 className="font-bold text-lg text-foreground border-b border-border/40 pb-3 font-display">
                Informasi Pelaksanaan
              </h3>

              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/10">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Tanggal</p>
                    <p className="font-semibold text-foreground">{event.tanggal}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/10">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Waktu</p>
                    <p className="font-semibold text-foreground">{event.waktu}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/10">
                    {event.online ? (
                      <Globe className="w-5 h-5" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Lokasi</p>
                    <div
                      className="font-semibold text-foreground text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: event.location }}
                    />
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/10">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Format</p>
                    <p className="font-semibold text-foreground capitalize">{event.format}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RSVP Section (Internal RSVP) / CTA Section (External Link) */}
            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-border/50 bg-card/65 backdrop-blur-md p-6 md:p-8 editorial-shadow space-y-6"
            >
              {isRsvpActive ? (
                <div className="space-y-6">
                  {/* RSVP Header */}
                  <div className="border-b border-border/40 pb-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground font-display">
                        Registrasi RSVP
                      </h3>
                      <p className="text-muted-foreground text-xs mt-1">
                        {isPastEvent
                          ? "Pendaftaran sudah ditutup."
                          : isCapacityFull
                            ? "Kuota pendaftaran sudah penuh."
                            : "Isi form untuk mendaftar."}
                      </p>
                    </div>
                    <div>
                      {isPastEvent ? (
                        <span className="inline-flex px-2 py-0.5 bg-muted text-muted-foreground text-[9px] font-bold rounded-full uppercase tracking-wider">
                          Selesai
                        </span>
                      ) : isCapacityFull ? (
                        <span className="inline-flex px-2 py-0.5 bg-destructive/10 text-destructive text-[9px] font-bold rounded-full uppercase tracking-wider">
                          Penuh
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full uppercase tracking-wider">
                          Buka
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Capacity Status */}
                  {!isPastEvent && (
                    <div>
                      <div className="flex justify-between text-xs mb-2 font-medium">
                        <span className="text-muted-foreground">Kapasitas</span>
                        <span className="text-foreground font-bold">
                          {event.max_attendees
                            ? `${registrationCount} / ${event.max_attendees} Terisi`
                            : `${registrationCount} Terdaftar`}
                        </span>
                      </div>
                      {event.max_attendees && (
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${isCapacityFull ? "bg-destructive" : "bg-primary"
                              }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (registrationCount / event.max_attendees) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Already Registered View */}
                  {currentUserRegistration ? (
                    currentUserRegistration.status === "pending_payment" ? (
                      currentUserRegistration.isExpired ? (
                        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center gap-3 text-destructive">
                            <AlertCircle className="w-8 h-8 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-bold text-foreground">
                                Pembayaran Kadaluwarsa
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Waktu pembayaran 5 menit telah habis. Silakan refresh halaman untuk mendaftar kembali.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center gap-3 text-amber-500">
                            <AlertCircle className="w-8 h-8 flex-shrink-0 animate-pulse" />
                            <div>
                              <h4 className="text-sm font-bold text-foreground">
                                Menunggu Pembayaran
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Selesaikan pembayaran Anda sebelum batas waktu 5 menit berakhir.
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-amber-500/10 pt-3 space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Nama</span>
                              <span className="text-foreground font-medium">{currentUserRegistration.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email</span>
                              <span className="text-foreground font-medium">{currentUserRegistration.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Harga Tiket</span>
                              <span className="text-foreground font-medium">Rp {event.price?.toLocaleString("id-ID")}</span>
                            </div>
                          </div>

                          {currentUserRegistration.paymentUrl && (
                            <a
                              href={currentUserRegistration.paymentUrl}
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors text-center"
                            >
                              💳 Bayar Sekarang via Pakasir
                            </a>
                          )}
                          {(currentUserRegistration as any).checkin_token && (
                            <Link
                              to={`/ticket/${(currentUserRegistration as any).checkin_token}`}
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium transition-colors"
                            >
                              🎟️ Detail Tiket Saya
                            </Link>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-500">
                          <CheckCircle className="w-8 h-8 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold text-foreground">
                              Terdaftar!
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              RSVP Anda telah dikonfirmasi.
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-emerald-500/10 pt-3 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nama</span>
                            <span className="text-foreground font-medium">{currentUserRegistration.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="text-foreground font-medium">{currentUserRegistration.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Kabupaten</span>
                            <span className="text-foreground font-medium">{currentUserRegistration.kabupaten}</span>
                          </div>
                          <div className="flex justify-between flex-wrap gap-2 pt-1 border-t border-emerald-500/5 text-[10px] text-muted-foreground">
                            <span>Terdaftar: {formatRegistrationDate(currentUserRegistration.registered_at)}</span>
                          </div>
                        </div>
                        {/* Ticket link */}
                        {(currentUserRegistration as any).checkin_token && (
                          <Link
                            to={`/ticket/${(currentUserRegistration as any).checkin_token}`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                          >
                            🎟️ Lihat Tiket & QR Code Saya
                          </Link>
                        )}
                      </div>
                    )
                  ) : actionData?.success && actionData.checkinToken ? (
                    actionData.paymentUrl ? (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 text-center space-y-4">
                        <div className="flex flex-col items-center gap-2 text-amber-500">
                          <AlertCircle className="w-10 h-10 animate-pulse" />
                          <h4 className="text-base font-bold text-foreground">Pendaftaran Disimpan</h4>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            Selesaikan pembayaran dalam **5 menit** untuk mengaktifkan tiket Anda.
                          </p>
                        </div>
                        <a
                          href={actionData.paymentUrl}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors shadow-lg shadow-amber-500/25 block text-center"
                        >
                          💳 Bayar Sekarang via Pakasir
                        </a>
                        <Link
                          to={`/ticket/${actionData.checkinToken}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium transition-colors"
                        >
                          🎟️ Lihat Detail Tiket
                        </Link>
                      </div>
                    ) : (
                      /* Just registered — show ticket link */
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                        <div className="flex flex-col items-center gap-2 text-emerald-500">
                          <CheckCircle className="w-10 h-10" />
                          <h4 className="text-base font-bold text-foreground">Pendaftaran Berhasil!</h4>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            Simpan link tiket kamu. Tunjukkan QR Code saat check-in di lokasi event.
                          </p>
                        </div>
                        <Link
                          to={`/ticket/${actionData.checkinToken}`}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors"
                        >
                          🎟️ Lihat Tiket & QR Code Saya
                        </Link>
                      </div>
                    )
                  ) : isRegistrationClosed ? (
                    <div className="bg-muted/30 border rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-10 h-10 text-muted-foreground" />
                      <h4 className="text-sm font-bold text-foreground">
                        Pendaftaran Ditutup
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {isPastEvent
                          ? "Event ini sudah selesai."
                          : "Maaf, kuota pendaftaran sudah penuh."}
                      </p>
                    </div>
                  ) : (
                    /* Registration Form */
                    <Form ref={formRef} method="post" className="space-y-4">
                      {actionData?.errors?.general && (
                        <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-2.5 text-xs">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{actionData.errors.general}</span>
                        </div>
                      )}

                      {/* Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs">Nama Lengkap *</Label>
                        <Input
                          id="name"
                          name="name"
                          required
                          disabled={isSubmitting}
                          defaultValue={loggedInUser?.name || ""}
                          placeholder="Budi Santoso"
                          className={actionData?.errors?.name ? "border-destructive focus-visible:ring-destructive text-sm" : "text-sm"}
                        />
                        {actionData?.errors?.name && (
                          <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            {actionData.errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          disabled={isSubmitting}
                          defaultValue={loggedInUser?.email || ""}
                          placeholder="budi@gmail.com"
                          className={actionData?.errors?.email ? "border-destructive focus-visible:ring-destructive text-sm" : "text-sm"}
                        />
                        {actionData?.errors?.email && (
                          <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            {actionData.errors.email}
                          </p>
                        )}
                      </div>

                      {/* WhatsApp */}
                      <div className="space-y-1.5">
                        <Label htmlFor="whatsapp" className="text-xs">Nomor WhatsApp *</Label>
                        <Input
                          id="whatsapp"
                          name="whatsapp"
                          type="tel"
                          required
                          disabled={isSubmitting}
                          placeholder="08123456789"
                          className={actionData?.errors?.whatsapp ? "border-destructive focus-visible:ring-destructive text-sm" : "text-sm"}
                        />
                        {actionData?.errors?.whatsapp && (
                          <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            {actionData.errors.whatsapp}
                          </p>
                        )}
                      </div>

                      {/* Role Dropdown */}
                      <div className="space-y-1.5">
                        <Label htmlFor="role" className="text-xs">Pekerjaan / Role (Opsional)</Label>
                        <Select
                          id="role"
                          name="role"
                          disabled={isSubmitting}
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className={actionData?.errors?.role ? "border-destructive focus-visible:ring-destructive text-sm" : "text-sm"}
                        >
                          <SelectItem value="">-- Pilih Pekerjaan / Role --</SelectItem>
                          <SelectItem value="Mahasiswa">Mahasiswa</SelectItem>
                          <SelectItem value="Pelajar">Pelajar</SelectItem>
                          <SelectItem value="Karyawan / Profesional">Karyawan / Profesional</SelectItem>
                          <SelectItem value="Umum / Lainnya">Umum / Lainnya</SelectItem>
                        </Select>
                        {actionData?.errors?.role && (
                          <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            {actionData.errors.role}
                          </p>
                        )}
                      </div>

                      {/* Institution (Conditional: Autocomplete for Student/Mahasiswa, normal Input for others) */}
                      {selectedRole === "Mahasiswa" || selectedRole === "Pelajar" ? (
                        <div className="space-y-1.5 relative">
                          <Label htmlFor="institution" className="text-xs">Instansi / Sekolah *</Label>
                          <Input
                            id="uni-search"
                            type="text"
                            required
                            disabled={isSubmitting}
                            value={uniSearch}
                            onChange={(e) => {
                              const val = e.target.value;
                              setUniSearch(val);
                              setSelectedUni("");
                              setIsUniDropdownOpen(true);
                              fetchUniversitiesDebounced(val);
                            }}
                            onFocus={() => {
                              fetchUniversities(uniSearch);
                              setIsUniDropdownOpen(true);
                            }}
                            onBlur={() => {
                              setTimeout(() => setIsUniDropdownOpen(false), 200);
                            }}
                            placeholder={selectedRole === "Mahasiswa" ? "Ketik nama universitas Anda..." : "Ketik nama sekolah Anda..."}
                            className={actionData?.errors?.institution ? "border-destructive focus-visible:ring-destructive text-sm" : "text-sm"}
                          />
                          <input
                            type="hidden"
                            name="institution"
                            value={selectedUni || uniSearch}
                          />

                          {isUniDropdownOpen && (uniSearch.length > 0 || universities.length > 0) && (
                            <div className="absolute z-50 w-full bg-popover text-popover-foreground border border-border/85 rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto text-xs py-1">
                              {isLoadingUnis ? (
                                <div className="px-3 py-2 text-muted-foreground flex items-center gap-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memuat data kampus...
                                </div>
                              ) : (
                                (() => {
                                  const filtered = universities.filter((name) =>
                                    name.toLowerCase().includes(uniSearch.toLowerCase())
                                  ).slice(0, 15);

                                  if (filtered.length === 0) {
                                    return (
                                      <div
                                        className="px-3 py-2 cursor-pointer hover:bg-accent text-muted-foreground font-medium"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          setSelectedUni(uniSearch);
                                          setIsUniDropdownOpen(false);
                                        }}
                                      >
                                        Gunakan pencarian Anda: "{uniSearch}" (Kustom)
                                      </div>
                                    );
                                  }

                                  return filtered.map((uni, idx) => (
                                    <div
                                      key={idx}
                                      className="px-3 py-2 cursor-pointer hover:bg-accent font-medium transition-colors"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setUniSearch(uni);
                                        setSelectedUni(uni);
                                        setIsUniDropdownOpen(false);
                                      }}
                                    >
                                      {uni}
                                    </div>
                                  ));
                                })()
                              )}
                            </div>
                          )}

                          {actionData?.errors?.institution && (
                            <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {actionData.errors.institution}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Label htmlFor="institution" className="text-xs">Instansi / Sekolah *</Label>
                          <Input
                            id="institution"
                            name="institution"
                            required
                            disabled={isSubmitting}
                            value={uniSearch}
                            onChange={(e) => setUniSearch(e.target.value)}
                            placeholder="Contoh: PT Kereta Api Indonesia, BUMN, Umum"
                            className={actionData?.errors?.institution ? "border-destructive focus-visible:ring-destructive text-sm" : "text-sm"}
                          />
                          {actionData?.errors?.institution && (
                            <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {actionData.errors.institution}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Regional Dropdowns (Dynamic Provinces -> Regencies) */}
                      {useFallbackRegions ? (
                        <div className="space-y-1.5">
                          <Label htmlFor="kabupaten" className="text-xs">Kabupaten *</Label>
                          <Select
                            id="kabupaten"
                            name="kabupaten"
                            required
                            disabled={isSubmitting}
                            defaultValue=""
                            className={actionData?.errors?.kabupaten ? "border-destructive focus-visible:ring-destructive text-sm" : "text-sm"}
                          >
                            <SelectItem value="">-- Pilih Kabupaten --</SelectItem>
                            <SelectItem value="Bangkalan">Bangkalan</SelectItem>
                            <SelectItem value="Sampang">Sampang</SelectItem>
                            <SelectItem value="Pamekasan">Pamekasan</SelectItem>
                            <SelectItem value="Sumenep">Sumenep</SelectItem>
                            <SelectItem value="Lainnya">Lainnya</SelectItem>
                          </Select>
                          {actionData?.errors?.kabupaten && (
                            <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {actionData.errors.kabupaten}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Provinsi */}
                          <div className="space-y-1.5">
                            <Label htmlFor="provinsi" className="text-xs">Provinsi *</Label>
                            <Select
                              id="provinsi"
                              required
                              disabled={isSubmitting || isLoadingProvinces}
                              value={selectedProvinceId}
                              onChange={(e) => handleProvinceSelect(e.target.value)}
                              className="text-sm"
                            >
                              <SelectItem value="">
                                {isLoadingProvinces ? "Memuat Provinsi..." : "-- Pilih Provinsi --"}
                              </SelectItem>
                              {provinces.map((prov) => (
                                <SelectItem key={prov.id} value={prov.id}>
                                  {prov.name}
                                </SelectItem>
                              ))}
                            </Select>
                          </div>

                          {/* Kabupaten */}
                          <div className="space-y-1.5">
                            <Label htmlFor="kabupaten-select" className="text-xs">Kabupaten / Kota *</Label>
                            <Select
                              id="kabupaten-select"
                              required
                              disabled={isSubmitting || !selectedProvinceId || isLoadingRegencies}
                              value={selectedRegencyName}
                              onChange={(e) => setSelectedRegencyName(e.target.value)}
                              className={actionData?.errors?.kabupaten ? "border-destructive focus-visible:ring-destructive text-sm" : "text-sm"}
                            >
                              <SelectItem value="">
                                {isLoadingRegencies
                                  ? "Memuat Kabupaten/Kota..."
                                  : !selectedProvinceId
                                    ? "Pilih Provinsi terlebih dahulu"
                                    : "-- Pilih Kabupaten/Kota --"}
                              </SelectItem>
                              {regencies.map((reg) => (
                                <SelectItem key={reg.id} value={reg.name}>
                                  {reg.name}
                                </SelectItem>
                              ))}
                            </Select>
                            <input
                              type="hidden"
                              name="kabupaten"
                              value={selectedRegencyName ? `${selectedRegencyName}, ${selectedProvinceName}` : ""}
                            />
                            {actionData?.errors?.kabupaten && (
                              <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" />
                                {actionData.errors.kabupaten}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Reason */}
                      <div className="space-y-1.5">
                        <Label htmlFor="reason" className="text-xs">Alasan Ikut (Opsional)</Label>
                        <Textarea
                          id="reason"
                          name="reason"
                          disabled={isSubmitting}
                          placeholder="Tuliskan motivasi Anda..."
                          rows={2}
                          className={actionData?.errors?.reason ? "border-destructive focus-visible:ring-destructive text-xs" : "text-xs"}
                        />
                        {actionData?.errors?.reason && (
                          <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            {actionData.errors.reason}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-primary text-primary-foreground hover:bg-primary/95 w-full py-5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 duration-150 text-sm"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Mengirim Pendaftaran...
                            </>
                          ) : (
                            "Kirim Registrasi RSVP"
                          )}
                        </Button>
                      </div>
                    </Form>
                  )}
                </div>
              ) : (
                /* External CTA Section */
                isNew && event.url && event.url !== "#" ? (
                  <div className="space-y-4 text-center py-2">
                    <h4 className="font-bold text-lg text-foreground font-display">
                      Siap bergabung?
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Tempat terbatas, segera amankan kursi Anda melalui platform pendaftaran eksternal.
                    </p>
                    <div className="pt-2">
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button
                          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full py-5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 duration-150 text-sm"
                        >
                          Daftar Sekarang
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    Event ini tidak memerlukan pendaftaran online atau pendaftaran sudah ditutup.
                  </div>
                )
              )}
            </motion.div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
