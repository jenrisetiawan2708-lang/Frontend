/**
 * exportPDF - Utility untuk export/cetak tagihan sebagai PDF
 * Menggunakan browser print API dengan layout yang rapi
 */

export interface TagihanData {
  id?: number;
  bulan_label?: string;
  jatuh_tempo?: string;
  status_tagihan?: string;
  total_format?: string;
  kamar?: { nomor?: string };
  penghuni?: { nama?: string };
  tagihan_sewa?: number | string;
  tagihan_listrik?: number | string;
  tagihan_air?: number | string;
  tagihan_lainnya?: number | string;
}

export function cetakTagihan(tagihan: TagihanData, namaPenghuni?: string) {
  const nama = tagihan.penghuni?.nama || namaPenghuni || "-";
  const kamar = tagihan.kamar?.nomor || "-";
  const bulan = tagihan.bulan_label || "-";
  const jatuhTempo = tagihan.jatuh_tempo || "-";
  const status = tagihan.status_tagihan || "-";
  const total = tagihan.total_format || "Rp 0";
  const tanggalCetak = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "long", year: "numeric"
  }).format(new Date());

  const rincian = [
    { label: "Sewa Kamar", nilai: tagihan.tagihan_sewa },
    { label: "Listrik", nilai: tagihan.tagihan_listrik },
    { label: "Air", nilai: tagihan.tagihan_air },
    { label: "Lainnya", nilai: tagihan.tagihan_lainnya },
  ].filter((r) => r.nilai && Number(r.nilai) > 0);

  const formatRp = (v: number | string | undefined) => {
    if (!v) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(Number(v));
  };

  const statusColor = status === "Lunas" ? "#16a34a" : status === "Belum Dibayar" ? "#dc2626" : "#ea580c";

  const rows = rincian.length > 0
    ? rincian.map(r => "<tr><td>" + r.label + "</td><td style='text-align:right'>" + formatRp(r.nilai) + "</td></tr>").join("")
    : "<tr><td>Tagihan Kost</td><td style='text-align:right'>" + total + "</td></tr>";

  const html = "<!DOCTYPE html><html lang='id'><head><meta charset='UTF-8'/><title>Tagihan HOMIA - " + bulan + "</title>"
    + "<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#111;padding:40px;max-width:600px;margin:0 auto}"
    + ".header{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #2563eb}"
    + ".brand{font-size:28px;font-weight:900;color:#2563eb;letter-spacing:1px}.brand-sub{font-size:12px;color:#64748b;margin-top:2px}"
    + ".il p{font-size:12px;color:#64748b}.il strong{font-size:14px;color:#111}"
    + ".section{margin-bottom:24px}.st{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:10px}"
    + ".ig{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ii label{font-size:11px;color:#64748b;display:block;margin-bottom:2px}.ii span{font-size:14px;font-weight:700;color:#111}"
    + ".sb{display:inline-block;padding:4px 14px;border-radius:999px;font-size:12px;font-weight:700;background:" + statusColor + "18;color:" + statusColor + "}"
    + "table{width:100%;border-collapse:collapse}thead th{background:#2563eb;color:white;padding:10px 14px;text-align:left;font-size:12px;font-weight:700}"
    + "tbody td{padding:10px 14px;font-size:13px;border-bottom:1px solid #f1f5f9}"
    + ".tr td{font-weight:800;font-size:15px;background:#eff6ff;border-top:2px solid #2563eb}"
    + ".footer{margin-top:36px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-end}"
    + ".fl p{font-size:11px;color:#94a3b8}.fr{text-align:right;font-size:11px;color:#94a3b8}"
    + "@media print{body{padding:20px}@page{margin:1cm;size:A4}}</style></head><body>"
    + "<div class='header'><div><div class='brand'>HOMIA</div><div class='brand-sub'>Sistem Manajemen Kost</div></div>"
    + "<div class='il'><p>Tagihan Bulan</p><strong>" + bulan + "</strong></div></div>"
    + "<div class='section'><div class='st'>Informasi Penghuni</div><div class='ig'>"
    + "<div class='ii'><label>Nama</label><span>" + nama + "</span></div>"
    + "<div class='ii'><label>Nomor Kamar</label><span>" + kamar + "</span></div>"
    + "<div class='ii'><label>Jatuh Tempo</label><span>" + jatuhTempo + "</span></div>"
    + "<div class='ii'><label>Status</label><span class='sb'>" + status + "</span></div>"
    + "</div></div>"
    + "<div class='section'><div class='st'>Rincian Tagihan</div>"
    + "<table><thead><tr><th>Komponen</th><th style='text-align:right'>Jumlah</th></tr></thead>"
    + "<tbody>" + rows
    + "<tr class='tr'><td>TOTAL</td><td style='text-align:right'>" + total + "</td></tr>"
    + "</tbody></table></div>"
    + "<div class='footer'><div class='fl'><p>Dicetak: " + tanggalCetak + "</p><p>Dokumen otomatis sistem HOMIA.</p></div>"
    + "<div class='fr'><p>HOMIA - admin@homia.id</p></div></div>"
    + "</body></html>";

  const w = window.open("", "_blank", "width=700,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}
