import { Guest } from "@/types/guest.types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function generateWABlastText(metadata: any, guest: Guest, invitationLink: string): string {
  const bride = metadata.bride_name || "Nanda";
  const groom = metadata.groom_name || "Arfan";
  const date = metadata.wedding_date ? format(new Date(metadata.wedding_date), "EEEE, d MMMM yyyy", { locale: id }) : "Senin, 12 Januari 2026";
  const venue = metadata.venue_name || "Hotel Mulia Senayan";
  const address = metadata.venue_address || "Jl. Asia Afrika, Senayan, Jakarta Pusat";
  const akadTime = metadata.akad_time || "08:00 WIB";
  const resepsiTime = metadata.resepsi_time || "11:00 WIB";

  return `Kepada Yth.
Bapak/Ibu/Saudara/i ${guest.name}

Dengan memohon Rahmat dan Ridho Allah SWT, kami mengundang kehadiran Bapak/Ibu/Saudara/i pada acara pernikahan kami:

👰🤵 ${bride} & ${groom}

📅 ${date}
🕐 Akad Nikah: ${akadTime}
🕐 Resepsi: ${resepsiTime}
📍 ${venue}
${address}

Konfirmasi kehadiran Anda melalui link undangan digital di bawah ini:
🔗 ${invitationLink}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Atas perhatiannya, kami ucapkan terima kasih.

Hormat kami,
${bride} & ${groom}`;
}
