import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Scale,
  HeartHandshake,
  UserCheck,
  Ticket,
  Sparkles,
  Code2,
  AlertTriangle,
  Ban,
  RefreshCw,
  Mail,
  Send,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { appleSprings } from "@/lib/springs";

export const meta = () => [
  { title: "Syarat dan Ketentuan Layanan - MaduraDev" },
  {
    name: "description",
    content:
      "Syarat dan Ketentuan Layanan MaduraDev: Pedoman partisipasi komunitas, kode etik pengembang, aturan tiket kegiatan, dan penggunaan platform.",
  },
  {
    name: "keywords",
    content:
      "syarat dan ketentuan maduradev, terms of service madura dev, kode etik developer madura, aturan komunitas programmer",
  },
  { property: "og:title", content: "Syarat dan Ketentuan Layanan - MaduraDev" },
  {
    property: "og:description",
    content:
      "Pedoman interaksi, aturan kehadiran kegiatan, dan hak kekayaan intelektual dalam ekosistem terbuka MaduraDev.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://madura.dev/terms-of-service" },
  { property: "og:image", content: "https://madura.dev/image.jpg" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Syarat dan Ketentuan Layanan - MaduraDev" },
  {
    name: "twitter:description",
    content:
      "Panduan resmi penggunaan ekosistem MaduraDev untuk komunitas developer Bangkalan, Sampang, Pamekasan, dan Sumenep.",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://madura.dev/terms-of-service",
  },
];

const SECTIONS = [
  { id: "penerimaan", label: "1. Penerimaan Ketentuan", icon: Scale },
  { id: "kode-etik", label: "2. Kode Etik Komunitas (Code of Conduct)", icon: HeartHandshake },
  { id: "akun-pengurus", label: "3. Akun Pengurus & Komunitas", icon: UserCheck },
  { id: "tiket-acara", label: "4. Kegiatan & Ketentuan Tiket", icon: Ticket },
  { id: "twibbon-generator", label: "5. Pemanfaatan Generator Media & Twibbon", icon: Sparkles },
  { id: "hak-cipta", label: "6. Hak Cipta & Lisensi Open Source", icon: Code2 },
  { id: "disclaimer", label: "7. Penafian & Batasan Tanggung Jawab", icon: AlertTriangle },
  { id: "pemutusan-akses", label: "8. Pelanggaran & Pemutusan Akses", icon: Ban },
  { id: "perubahan-syarat", label: "9. Perubahan Ketentuan", icon: RefreshCw },
  { id: "kontak", label: "10. Kontak & Pengaduan", icon: Mail },
];

export default function TermsOfServicePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Syarat dan Ketentuan Layanan MaduraDev",
    description:
      "Syarat dan Ketentuan resmi penggunaan situs web dan partisipasi dalam komunitas MaduraDev.",
    url: "https://madura.dev/terms-of-service",
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
              <Scale size={14} />
              <span>Pedoman & Ketentuan Komunitas</span>
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="text-muted-foreground font-normal">
                Berlaku sejak: Maret 2025
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-display tracking-tight leading-[1.1]">
              Syarat & <span className="text-primary italic">Ketentuan Layanan</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
              Selamat datang di MaduraDev. Dokumen ini mengatur hak, kewajiban, dan etika interaksi saat Anda mengakses platform{" "}
              <span className="font-semibold text-foreground">madura.dev</span>, mendaftar event developer, atau berpartisipasi dalam jejaring komunitas di empat kabupaten Madura.
            </p>

            {/* Apple-style Translucent Highlights Card */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-card/60 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <HeartHandshake size={16} />
                  <span>Komunitas Inklusif</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Menjunjung tinggi sikap saling menghargai, ramah terhadap pemula (newbie-friendly), dan bebas diskriminasi SARA.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card/60 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Ticket size={16} />
                  <span>Integritas Acara & Presensi</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tiket kegiatan meetup/workshop ditujukan untuk peserta yang berkomitmen hadir dan saling bertukar ilmu secara positif.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card/60 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Code2 size={16} />
                  <span>Etika & Open Source</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mendukung kontribusi terbuka dengan tetap menghormati atribusi lisensi dan hak kekayaan intelektual masing-masing kreator.
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
                Daftar Isi Ketentuan
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
            {/* 1. Penerimaan */}
            <article
              id="penerimaan"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Scale size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  1. Penerimaan Ketentuan
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Dengan mengakses, membaca, mendaftarkan diri pada kegiatan, atau menggunakan fitur-fitur di situs{" "}
                  <strong className="text-foreground">madura.dev</strong>, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan Layanan ini serta{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline font-semibold">
                    Kebijakan Privasi
                  </Link>{" "}
                  kami.
                </p>
                <p>
                  Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda dipersilakan untuk tidak melanjutkan penggunaan situs dan layanan MaduraDev.
                </p>
              </div>
            </article>

            {/* 2. Kode Etik */}
            <article
              id="kode-etik"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <HeartHandshake size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  2. Kode Etik Komunitas (Code of Conduct)
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  MaduraDev berdedikasi menciptakan ruang berkumpul yang aman, ramah, dan bebas dari intimidasi bagi semua orang, tanpa memandang latar belakang keahlian pemrograman, suku, agama, gender, atau afiliasi komunitas:
                </p>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                    <p className="font-bold text-foreground text-xs mb-1">Perilaku yang Diharapkan:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      <li>Menggunakan bahasa yang sopan, ramah, dan konstruktif.</li>
                      <li>Menghargai perbedaan sudut pandang dan tingkat keahlian teknis (newbie-friendly).</li>
                      <li>Berfokus pada kolaborasi, pemecahan masalah bersama, dan inovasi positif.</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive dark:text-red-400">
                    <p className="font-bold text-xs mb-1">Perilaku yang Dilarang Keras:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      <li>Ujaran kebencian, diskriminasi SARA, pelecehan verbal maupun non-verbal.</li>
                      <li>Penyebaran spam, skema piramida/penipuan, atau konten pornografi di forum/event.</li>
                      <li>Tindakan peretasan (hacking), DDoS, atau eksploitasi kerentanan keamanan tanpa izin.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>

            {/* 3. Akun Pengurus */}
            <article
              id="akun-pengurus"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <UserCheck size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  3. Akun Pengurus & Komunitas Daerah
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Akses ke dashboard administrasi (
                  <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">
                    /dashboard
                  </code>
                  ) diberikan secara khusus kepada koordinator dan pengurus komunitas terverifikasi di Bangkalan, Sampang, Pamekasan, dan Sumenep:
                </p>
                <ul className="space-y-1.5 list-disc list-inside pl-2">
                  <li>
                    Pengurus wajib menjaga kerahasiaan kata sandi dan kredensial login mereka masing-masing.
                  </li>
                  <li>
                    Pengurus bertanggung jawab penuh atas seluruh data acara, materi presentasi, atau artikel media yang diterbitkan melalui akun mereka.
                  </li>
                  <li>
                    Dilarang membagikan atau memindahtangankan akses kredensial dashboard kepada pihak luar tanpa persetujuan Super Admin MaduraDev.
                  </li>
                </ul>
              </div>
            </article>

            {/* 4. Tiket & Acara */}
            <article
              id="tiket-acara"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Ticket size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  4. Kegiatan & Ketentuan Tiket (Event & Check-in)
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  MaduraDev menyelenggarakan kegiatan daring (webinar) maupun luring (meetup, workshop) dengan ketentuan berikut:
                </p>
                <ul className="space-y-2 list-disc list-inside pl-2">
                  <li>
                    <strong className="text-foreground">Keaslian Tiket:</strong> Peserta akan memperoleh tiket elektronik unik dengan kode token/QR resmi setelah menyelesaikan pendaftaran di platform.
                  </li>
                  <li>
                    <strong className="text-foreground">Verifikasi Check-in:</strong> Di lokasi acara, panitia akan melakukan pemindaian token/QR presensi. Setiap tiket hanya dapat divalidasi satu kali.
                  </li>
                  <li>
                    <strong className="text-foreground">Acara Gratis vs Berbayar:</strong> Mayoritas kegiatan komunitas diadakan gratis. Apabila terdapat acara berbayar (misal untuk cover konsumsi, merchandise, atau sertifikat khusus), pengembalian dana (refund) mengikuti syarat khusus yang tercantum di deskripsi event terkait.
                  </li>
                  <li>
                    <strong className="text-foreground">Pembatalan & Perubahan Jadwal:</strong> Penyelenggara berhak mengubah lokasi, waktu, atau format acara apabila terjadi keadaan darurat (force majeure), dengan pemberitahuan melalui email atau grup komunikasi peserta.
                  </li>
                </ul>
              </div>
            </article>

            {/* 5. Twibbon & Generator */}
            <article
              id="twibbon-generator"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Sparkles size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  5. Pemanfaatan Generator Media & Twibbon
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Pengguna bebas menggunakan alat bantu Twibbon MaduraDev untuk mendukung kampanye kegiatan teknologi dan branding komunitas. Namun, pengguna dilarang:
                </p>
                <ul className="space-y-1.5 list-disc list-inside pl-2">
                  <li>Menggunakan frame atau logo MaduraDev untuk kampanye politik praktis, produk terlarang, judi online, atau konten pornografi.</li>
                  <li>Mengubah atau menghilangkan identitas nama/logo mitra komunitas secara menyesatkan tanpa izin.</li>
                </ul>
              </div>
            </article>

            {/* 6. Hak Cipta & Lisensi */}
            <article
              id="hak-cipta"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Code2 size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  6. Hak Cipta & Lisensi Open Source
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Sebagai komunitas yang mengusung budaya keterbukaan, MaduraDev menghormati karya intelektual:
                </p>
                <ul className="space-y-2 list-disc list-inside pl-2">
                  <li>
                    <strong className="text-foreground">Repositori & Kode Sumber:</strong> Kode sumber platform dan tutorial yang dipublikasikan di GitHub MaduraDev dilisensikan di bawah lisensi terbuka (seperti MIT atau Apache 2.0). Anda berhak mempelajari, mendistribusikan, dan memodifikasi sesuai ketentuan lisensi masing-masing repositori.
                  </li>
                  <li>
                    <strong className="text-foreground">Materi Presentasi Pembicara:</strong> Hak cipta atas slide materi, rekaman video, atau kode demo tetap menjadi milik pemateri masing-masing. MaduraDev memiliki hak non-eksklusif untuk mendokumentasikan dan membagikannya demi tujuan edukasi nirlaba.
                  </li>
                </ul>
              </div>
            </article>

            {/* 7. Disclaimer */}
            <article
              id="disclaimer"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  7. Penafian & Batasan Tanggung Jawab (Disclaimer)
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Platform <strong className="text-foreground">madura.dev</strong> disediakan atas dasar{" "}
                  <em>"sebagaimana adanya" (as is)</em> dan <em>"sebagaimana tersedia" (as available)</em>:
                </p>
                <ul className="space-y-1.5 list-disc list-inside pl-2">
                  <li>
                    Kami berupaya semaksimal mungkin menjaga keandalan situs, namun tidak menjamin bahwa situs akan bebas dari gangguan, kesalahan teknis, atau serangan pihak ketiga tanpa henti.
                  </li>
                  <li>
                    MaduraDev tidak bertanggung jawab atas kerugian moril maupun materiil yang timbul dari interaksi pribadi antar anggota di luar pengawasan resmi pengurus komunitas.
                  </li>
                </ul>
              </div>
            </article>

            {/* 8. Pemutusan Akses */}
            <article
              id="pemutusan-akses"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Ban size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  8. Pelanggaran & Pemutusan Akses
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Pengurus MaduraDev berhak secara sepihak membatalkan pendaftaran tiket, menonaktifkan akun pengurus, atau mengeluarkan individu dari forum/kegiatan komunitas apabila yang bersangkutan terbukti melanggar Kode Etik Komunitas atau ketentuan hukum yang berlaku di wilayah Republik Indonesia.
                </p>
              </div>
            </article>

            {/* 9. Perubahan Ketentuan */}
            <article
              id="perubahan-syarat"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <RefreshCw size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  9. Perubahan Syarat & Ketentuan
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
                <p>
                  Kami dapat merevisi ketentuan ini sewaktu-waktu. Setiap revisi akan mulai berlaku sejak tanggal pembaharuan yang tertera di bagian atas halaman ini. Dengan terus menggunakan platform setelah perubahan dipublikasikan, Anda dianggap menyetujui ketentuan yang diperbarui.
                </p>
              </div>
            </article>

            {/* 10. Kontak & Pengaduan */}
            <article
              id="kontak"
              className="scroll-mt-28 p-6 md:p-8 rounded-3xl bg-card/70 dark:bg-card/40 border border-border/70 backdrop-blur-md space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail size={18} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground font-display tracking-tight">
                  10. Hubungi Kami & Pengaduan Pelanggaran
                </h2>
              </div>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
                <p>
                  Apabila Anda menyaksikan atau mengalami pelanggaran Kode Etik dalam acara MaduraDev, atau memiliki pertanyaan hukum terkait ketentuan ini, mohon hubungi tim kami:
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
