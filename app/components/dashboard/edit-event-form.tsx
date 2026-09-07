import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ControlledSelect, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Event, EventFormat } from "@/lib/supabase/types";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { DeleteEventButton } from "@/components/dashboard/delete-event-button";


interface EditEventFormProps {
  event: Event;
}

function convertToISODate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return dateStr;
    return "";
  }
  return date.toISOString().split("T")[0];
}

function convertToISOTime(timeStr: string): string {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{2}:\d{2})/);
  if (match) {
    return match[1];
  }
  return "";
}

export function EditEventForm({ event }: EditEventFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: event.title,
    slug: event.slug,
    image_url: event.image_url,
    format: event.format,
    description_small: event.description_small,
    description: event.description || "",
    location: event.location || "",
    event_date: convertToISODate(event.event_date),
    event_time: convertToISOTime(event.event_time),
    url: event.url || "",
    is_online: event.is_online,
    is_new: event.is_new,
    is_published: event.is_published,
    type: (event.type || "internal") as "internal" | "partner",
    rsvp_enabled: event.rsvp_enabled || false,
    max_attendees: event.max_attendees !== null && event.max_attendees !== undefined ? String(event.max_attendees) : "",
    price: event.price !== null && event.price !== undefined ? String(event.price) : "",
    is_paid: (event.price && event.price > 0) || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sesi Anda berakhir, silakan login kembali.");
      setLoading(false);
      return;
    }

    if (event.author_id && event.author_id !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        toast.error("Anda hanya dapat mengedit event karya Anda sendiri.");
        setLoading(false);
        return;
      }
    }

    const { is_paid, ...restFormData } = formData;
    const payload = {
      ...restFormData,
      max_attendees: formData.rsvp_enabled && formData.max_attendees !== "" ? Number(formData.max_attendees) : null,
      price: formData.rsvp_enabled && formData.is_paid && formData.price !== "" ? Number(formData.price) : 0,
    };

    const { error } = await supabase.from("events").update(payload).eq("id", event.id);

    if (error) {
      toast.error("Gagal mengupdate event: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Event berhasil diupdate");
    navigate("/dashboard/events");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/events"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground">Update informasi event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informasi Event</CardTitle><CardDescription>Detail dasar tentang event</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="title">Judul Event *</Label><Input id="title" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} required /></div>
              <div className="space-y-2"><Label htmlFor="slug">Slug *</Label><Input id="slug" value={formData.slug} onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))} required /></div>
            </div>
            <ImageUpload value={formData.image_url} onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="format">Format *</Label>
                <ControlledSelect value={formData.format} onValueChange={(value: string) => setFormData((prev) => ({ ...prev, format: value as EventFormat }))}>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="bootcamp">Bootcamp</SelectItem>
                  <SelectItem value="bincang-bincang">Bincang-bincang</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                </ControlledSelect>
              </div>
              <div className="space-y-2"><Label htmlFor="url">URL Event (Opsional)</Label><Input id="url" value={formData.url} onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://example.com/register" /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Event *</Label>
                <ControlledSelect
                  value={formData.type}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, type: value as "internal" | "partner" }))
                  }
                >
                  <SelectItem value="internal">Internal MaduraDev</SelectItem>
                  <SelectItem value="partner">Partner Event</SelectItem>
                </ControlledSelect>
              </div>
            </div>
            <div className="space-y-2"><Label htmlFor="description_small">Deskripsi Singkat *</Label><Textarea id="description_small" value={formData.description_small} onChange={(e) => setFormData((prev) => ({ ...prev, description_small: e.target.value }))} rows={2} required /></div>
            <div className="space-y-2"><Label htmlFor="description">Deskripsi Lengkap (Markdown) (Opsional)</Label><Textarea id="description" placeholder="Mendukung format Markdown" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} rows={6} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Waktu & Lokasi</CardTitle><CardDescription>Kapan dan dimana event diadakan</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="event_date">Tanggal *</Label><Input id="event_date" type="date" value={formData.event_date} onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))} required /></div>
              <div className="space-y-2"><Label htmlFor="event_time">Waktu *</Label><Input id="event_time" type="time" value={formData.event_time} onChange={(e) => setFormData((prev) => ({ ...prev, event_time: e.target.value }))} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="location">Lokasi (Markdown) (Opsional)</Label><Textarea id="location" placeholder="Mendukung format Markdown" value={formData.location} onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))} rows={2} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pengaturan</CardTitle><CardDescription>Status dan visibilitas event</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><Label>Event Online</Label><p className="text-sm text-muted-foreground">Apakah event ini diadakan secara online?</p></div><Switch checked={formData.is_online} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_online: checked }))} /></div>
            <div className="flex items-center justify-between"><div><Label>Event Baru</Label><p className="text-sm text-muted-foreground">Tampilkan badge &quot;New&quot; pada event</p></div><Switch checked={formData.is_new} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_new: checked }))} /></div>
            <div className="flex items-center justify-between"><div><Label>Publish</Label><p className="text-sm text-muted-foreground">Tampilkan event di website publik</p></div><Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))} /></div>
            {formData.type === "internal" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aktifkan RSVP</Label>
                    <p className="text-sm text-muted-foreground">
                      Buka pendaftaran RSVP di detail event
                    </p>
                  </div>
                  <Switch
                    checked={formData.rsvp_enabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, rsvp_enabled: checked }))
                    }
                  />
                </div>
                 {formData.rsvp_enabled && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="max_attendees">Batas Maksimal Peserta (Opsional)</Label>
                        <Input
                          id="max_attendees"
                          type="number"
                          value={formData.max_attendees}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, max_attendees: e.target.value }))
                          }
                          placeholder="Kosongkan jika tidak terbatas"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ticket_type">Jenis Tiket</Label>
                        <ControlledSelect
                          value={formData.is_paid ? "paid" : "free"}
                          onValueChange={(value: string) =>
                            setFormData((prev) => ({ ...prev, is_paid: value === "paid" }))
                          }
                        >
                          <SelectItem value="free">Gratis</SelectItem>
                          <SelectItem value="paid">Berbayar</SelectItem>
                        </ControlledSelect>
                      </div>
                    </div>
                    {formData.is_paid && (
                      <div className="space-y-2">
                        <Label htmlFor="price">Harga Tiket (Rupiah) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, price: e.target.value }))
                          }
                          placeholder="Masukkan nominal harga (misal: 50000)"
                          required
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-between items-center">
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>{loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>) : "Update Event"}</Button>
            <Button type="button" variant="outline" asChild><Link to="/dashboard/events">Batal</Link></Button>
          </div>
          <DeleteEventButton id={event.id} title={event.title} variant="button" onSuccess={() => navigate("/dashboard/events")} />
        </div>
      </form>
    </div>
  );
}
