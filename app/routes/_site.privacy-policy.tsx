import { motion } from "motion/react";
import { Link } from "react-router";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileCheck,
  Server,
  Share2,
  UserCheck,
  Cookie,
  RefreshCw,
  Mail,
  Send,
  ArrowLeft,
  ChevronRight,
  Info,
  Sparkles,
} from "lucide-react";
import { appleSprings } from "@/lib/springs";

export const meta = () => [
  { title: "Kebijakan Privasi - MaduraDev" },
  {
    name: "description",
    content:
      "Kebijakan Privasi MaduraDev: Perlindungan data pribadi, pemrosesan client-side twibbon, dan keamanan ekosistem developer Madura.",
  },
  {
    name: "keywords",
    content:
      "kebijakan privasi maduradev, privacy policy madura dev, data developer madura, keamanan data madura",
  },
  { property: "og:title", content: "Kebijakan Privasi - MaduraDev" },
  {
    property: "og:description",
    content:
      "Komitmen MaduraDev dalam melindungi privasi, keamanan informasi, dan integritas data seluruh anggota komunitas developer Madura.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://madura.dev/privacy-policy" },
  { property: "og:image", content: "https://madura.dev/image.jpg" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Kebijakan Privasi - MaduraDev" },
  {
    name: "twitter:description",
    content:
      "Pelajari bagaimana MaduraDev melindungi data Anda saat menggunakan platform, mendaftar kegiatan, dan bergabung di komunitas.",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://madura.dev/privacy-policy",
  },
];

const SECTIONS = [
  { id: "pendahuluan", label: "1. Pendahuluan & Ruang Lingkup", icon: Info },
  { id: "data-dikumpulkan", label: "2. Data yang Kami Kumpulkan", icon: Eye },
  { id: "penggunaan-data", label: "3. Tujuan Penggunaan Data", icon: FileCheck },
  { id: "twibbon-media", label: "4. Twibbon & Generator Media", icon: Sparkles },
  { id: "keamanan-data", label: "5. Keamanan & Penyimpanan Data", icon: Lock },
  { id: "pihak-ketiga", label: "6. Layanan Pihak Ketiga", icon: Share2 },
  { id: "hak-pengguna", label: "7. Hak & Kendali Pengguna", icon: UserCheck },
  { id: "cookies-storage", label: "8. Cookies & Local Storage", icon: Cookie },
  { id: "perubahan-kebijakan", label: "9. Pembaruan Kebijakan", icon: RefreshCw },
  { id: "kontak", label: "10. Kontak & Narahubung", icon: Mail },
];

export default function PrivacyPolicyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Kebijakan Privasi MaduraDev",
    description:
      "Kebijakan Privasi resmi komunitas MaduraDev mengenai pengumpulan dan pemrosesan data pengguna.",
    url: "https://madura.dev/privacy-policy",
    publisher: {
      "@type": "Organization",
      name: "MaduraDev",
      url: "https://madura.dev",
      logo: "https://madura.dev/image.jpg",
    },
  };

  return (
    <div className="pt-20 pb-24 bg-background min-h-screen selection:bg-primary/20">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative py-14 md:py-20 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={appleSprings.default}
            className="space-y-4"
          >
            {/* Status pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <ShieldCheck size={14} />
              <span>Transparansi & Keamanan Data</span>
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="text-muted-foreground font-normal">
                Pembaruan: Maret 2025
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-display tracking-tight leading-[1.1]">
              Kebijakan <span className="text-primary italic">Privasi</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              MaduraDev (<span className="font-semibold text-foreground">madura.dev</span>) menghormati
              dan berkomitmen menjaga privasi Anda. Halaman ini menjelaskan bagaimana data Anda
              dikumpulkan, diproses, dan dilindungi saat berinteraksi dengan komunitas dan platform kami.
            </p>

            {/* Apple-style Translucent Highlights Card */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-card/60 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Sparkles size={16} />
                  <span>Twibbon 100% Client-Side</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Foto profil yang Anda masukkan di generator twibbon diproses lokal di browser. Foto tidak pernah diunggah atau disimpan di server kami.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card/60 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Lock size={16} />
                  <span>Data Aman & Terisolasi</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Data pendaftaran acara dilindungi enkripsi SSL/TLS modern dan pembatasan hak akses berbasis Supabase Row Level Security (RLS).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card/60 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <UserCheck size={16} />
                  <span>Kendali Penuh di Tangan Anda</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anda berhak meminta pembaruan atau penghapusan data pendaftaran kegiatan kapan saja dengan menghubungi narahubung resmi kami.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container mx-auto px-4 md:px-6 max-w-5xl mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Jump Navigation (Desktop Sticky) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-2">
            <div className="p-5 rounded-2xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md">
              <p className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                Daftar Isi Kebijakan
              </p>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group"
                    >
                      <Icon
                        size={14}
                        className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                      />
                      <span className="truncate">{sec.label}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-border/50">
                <a
                  href="mailto:info.maduradev@gmail.com"
                  className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                >
                  <Mail size={14} />
                  <span>info.maduradev@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Detailed Legal Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Pendahuluan */}
            <article
              id="pendahuluan"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Info size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  1. Pendahuluan & Ruang Lingkup
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Selamat datang di <strong className="text-foreground">MaduraDev</strong>. Kami adalah
                  komunitas nirlaba yang berfokus pada kolaborasi, edukasi, dan percepatan ekosistem
                  teknologi di empat kabupaten Pulau Madura: Bangkalan, Sampang, Pamekasan, dan Sumenep.
                </p>
                <p>
                  Kebijakan Privasi ini berlaku untuk seluruh layanan digital yang disediakan di bawah domain{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">
                    madura.dev
                  </code>
                  , termasuk pendaftaran kegiatan meetup/workshop, direktori komunitas daerah, penerbitan
                  tiket elektronik, artikel/media edukatif, serta generator twibbon interaktif.
                </p>
              </div>
            </article>

            {/* 2. Data yang Dikumpulkan */}
            <article
              id="data-dikumpulkan"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Eye size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  2. Data yang Kami Kumpulkan
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>Kami hanya mengumpulkan informasi yang esensial untuk kelancaran kegiatan komunitas:</p>
                <ul className="space-y-2 list-disc list-inside pl-2">
                  <li>
                    <strong className="text-foreground">Registrasi Peserta Event:</strong> Nama lengkap,
                    alamat email, nomor telepon/WhatsApp, asal instansi atau asal kabupaten (Bangkalan,
                    Sampang, Pamekasan, Sumenep, atau luar Madura). Informasi ini dibutuhkan untuk penerbitan
                    tiket dan verifikasi kehadiran.
                  </li>
                  <li>
                    <strong className="text-foreground">Akun Administrator Komunitas:</strong> Bagi pengurus
                    resmi cabang daerah, kami menyimpan email, nama tampilan, peran, dan kredensial terenkripsi
                    untuk manajemen konten dan event.
                  </li>
                  <li>
                    <strong className="text-foreground">Data Log Teknis Terbatas:</strong> Alamat IP secara
                    terenkripsi/anonim, jenis browser, dan preferensi antarmuka (seperti pilihan mode gelap/terang)
                    untuk kenyamanan navigasi.
                  </li>
                </ul>
              </div>
            </article>

            {/* 3. Penggunaan Data */}
            <article
              id="penggunaan-data"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileCheck size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  3. Tujuan Penggunaan Data
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>Data Anda hanya dimanfaatkan untuk tujuan-tujuan berikut:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                    <p className="font-bold text-foreground text-xs mb-1">Tiket & Presensi QR</p>
                    <p className="text-xs text-muted-foreground">
                      Menerbitkan token tiket unik dan memfasilitasi pemindaian check-in saat acara berlangsung.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                    <p className="font-bold text-foreground text-xs mb-1">Pengingat Kegiatan</p>
                    <p className="text-xs text-muted-foreground">
                      Mengirimkan detail jadwal, perubahan lokasi, atau sertifikat partisipasi kegiatan.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                    <p className="font-bold text-foreground text-xs mb-1">Pengembangan Ekosistem</p>
                    <p className="text-xs text-muted-foreground">
                      Mengetahui persebaran minat topik pemrograman di Pulau Madura secara statistik agregat tanpa melacak individu.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                    <p className="font-bold text-foreground text-xs mb-1">Keamanan Platform</p>
                    <p className="text-xs text-muted-foreground">
                      Mencegah pendaftaran ganda bot, penyalahgunaan formulir, dan serangan siber.
                    </p>
                  </div>
                </div>
                <p className="pt-2 text-xs italic text-muted-foreground">
                  * MaduraDev <strong className="text-foreground">TIDAK PERNAH</strong> dan{" "}
                  <strong className="text-foreground">TIDAK AKAN PERNAH</strong> menjual, menyewakan, atau
                  memperdagangkan data pribadi Anda kepada pihak komersial mana pun untuk keperluan iklan/spam.
                </p>
              </div>
            </article>

            {/* 4. Twibbon & Generator Media */}
            <article
              id="twibbon-media"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Sparkles size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  4. Twibbon & Generator Media Interaktif
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Fitur generator Twibbon MaduraDev (
                  <Link to="/twibbon" className="text-primary hover:underline font-medium">
                    /twibbon
                  </Link>
                  ) mengusung prinsip <strong className="text-foreground">Privacy-by-Design</strong>:
                </p>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                    <ShieldCheck size={16} className="text-primary" />
                    <span>Pemrosesan Berjalan Murni di Perangkat Pengguna (In-Browser HTML5 Canvas)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Saat Anda mengunggah foto selfie atau foto profil untuk digabungkan dengan bingkai kampanye, foto tersebut
                    sepenuhnya dirender secara lokal menggunakan HTML Canvas dan API browser Anda. Foto Anda{" "}
                    <strong className="text-foreground">tidak dikirimkan lewat jaringan internet dan tidak disimpan di database server kami</strong>.
                  </p>
                </div>
              </div>
            </article>

            {/* 5. Keamanan & Penyimpanan */}
            <article
              id="keamanan-data"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Lock size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  5. Keamanan & Penyimpanan Data
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Kami mengambil langkah-langkah teknis dan organisasional yang berstandar industri modern untuk
                  melindungi data Anda:
                </p>
                <ul className="space-y-2 list-disc list-inside pl-2">
                  <li>
                    <strong className="text-foreground">Enkripsi Data:</strong> Seluruh pertukaran data antara
                    browser Anda dan server dienkripsi menggunakan protokol TLS 1.3 / HTTPS.
                  </li>
                  <li>
                    <strong className="text-foreground">Row Level Security (RLS):</strong> Data base kami
                    menggunakan Supabase PostgreSQL dengan kebijakan RLS ketat. Hanya admin terverifikasi
                    dengan hak akses regional yang dapat mengelola data peserta kegiatan terkait.
                  </li>
                  <li>
                    <strong className="text-foreground">Retensi Data:</strong> Data peserta acara disimpan
                    hanya selama relevan untuk keperluan pelaporan kegiatan komunitas dan pengiriman sertifikat,
                    setelah itu dapat diarsipkan atau dihapus atas permintaan.
                  </li>
                </ul>
              </div>
            </article>

            {/* 6. Pihak Ketiga */}
            <article
              id="pihak-ketiga"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Share2 size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  6. Layanan & Integrasi Pihak Ketiga
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>Untuk menunjang infrastruktur kami, kami bermitra dengan penyedia layanan tepercaya:</p>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                    <p className="font-semibold text-foreground text-xs">Supabase Inc.</p>
                    <p className="text-xs text-muted-foreground">
                      Penyedia infrastruktur database PostgreSQL dan layanan otentikasi admin berbasis cloud yang patuh standar SOC2 dan GDPR.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                    <p className="font-semibold text-foreground text-xs">Pakasir Payment Gateway</p>
                    <p className="text-xs text-muted-foreground">
                      Untuk acara komunitas yang memerlukan kontribusi berbayar, transaksi diproses secara aman oleh gateway pembayaran resmi. MaduraDev tidak pernah menyimpan data kartu kredit atau PIN perbankan pengguna.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* 7. Hak Pengguna */}
            <article
              id="hak-pengguna"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <UserCheck size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  7. Hak & Kendali Pengguna
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>Sesuai prinsip pelindungan data pribadi (UU PDP Indonesia No. 27 Tahun 2022), Anda memiliki hak untuk:</p>
                <ul className="space-y-1.5 list-disc list-inside pl-2">
                  <li>Mengetahui data pribadi apa saja yang kami simpan tentang Anda.</li>
                  <li>Meminta koreksi atau perbaikan data jika terdapat ketidaksesuaian nama atau kontak.</li>
                  <li>Meminta penghapusan data Anda dari daftar pendaftaran acara komunitas kami.</li>
                  <li>Menolak atau menarik kembali persetujuan penerimaan informasi email broadcast kegiatan.</li>
                </ul>
              </div>
            </article>

            {/* 8. Cookies & Local Storage */}
            <article
              id="cookies-storage"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Cookie size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  8. Cookies & Penyimpanan Lokal (Local Storage)
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Platform MaduraDev menggunakan <strong className="text-foreground">Local Storage browser</strong> secara
                  minimal hanya untuk keperluan fungsionalitas, seperti mengingat preferensi tema Anda (Dark Mode / Light Mode)
                  dan token sesi bagi pengurus yang login ke dashboard. Kami tidak menggunakan cookie pelacak pihak ketiga (third-party tracking cookies)
                  untuk keperluan periklanan eksternal.
                </p>
              </div>
            </article>

            {/* 9. Pembaruan Kebijakan */}
            <article
              id="perubahan-kebijakan"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <RefreshCw size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  9. Pembaruan Kebijakan Privasi
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu seiring penambahan fitur platform atau penyesuaian regulasi hukum yang berlaku.
                  Perubahan penting akan diumumkan di situs ini atau melalui kanal Telegram resmi MaduraDev. Anda dianjurkan untuk memeriksa halaman ini secara berkala.
                </p>
              </div>
            </article>

            {/* 10. Kontak & Narahubung */}
            <article
              id="kontak"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  10. Hubungi Kami
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
                <p>
                  Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, ingin memperbarui data pendaftaran, atau mengajukan permohonan penghapusan informasi, silakan hubungi tim kami:
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:info.maduradev@gmail.com"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/20"
                  >
                    <Mail size={14} />
                    <span>info.maduradev@gmail.com</span>
                  </a>
                  <a
                    href="https://t.me/maduradev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-bold text-xs hover:bg-muted active:scale-95 transition-all"
                  >
                    <Send size={14} />
                    <span>Telegram @maduradev</span>
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
