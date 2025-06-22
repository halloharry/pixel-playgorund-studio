// whatsapp-notifier.js

/**
 * Fitur: Kirim notifikasi omset harian via WhatsApp
 * Cara kerja:
 * - Hitung omset hari ini
 * - Jika omset ada, generate pesan dan link WhatsApp
 * - Tampilkan tombol "Kirim Notifikasi WA" jika omset > 0
 */

function getHariIniTanggalString() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

function kirimNotifikasiWhatsapp(pesertaData, nomorTujuanList = ["628970377680", "6289603998876"]) {
  const hariIni = getHariIniTanggalString();
  let totalOmsetHariIni = 0;

  pesertaData.forEach(row => {
    const tanggal = row["Timestamp"];
    const tanggalJS = parseTanggalIndonesia(tanggal);
    const tanggalStr = tanggalJS.toISOString().split("T")[0];

    if (tanggalStr === hariIni) {
      const total = parseInt((row["Total Bayar"] || "0").replace(/[^\d]/g, ""));
      totalOmsetHariIni += total;
    }
  });

  if (totalOmsetHariIni > 0) {
    const pesan = `Laporan Omset Pixel Playground Studio per ${hariIni}:\nTotal omset hari ini adalah *Rp ${totalOmsetHariIni.toLocaleString("id-ID")}*.`;

    const container = document.getElementById("waNotificationContainer");
    if (container) {
      container.innerHTML = "";

      nomorTujuanList.forEach(nomor => {
        const waLink = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
        const tombol = document.createElement("a");
        tombol.href = waLink;
        tombol.className = "btn btn-success m-2";
        tombol.target = "_blank";
        if (nomor == '628970377680') {
            tombol.textContent = `📲 Kirim WA ke General Manager`;
        } else {
            tombol.textContent = `📲 Kirim WA ke Manager`;
        }
        container.appendChild(tombol);
      });
    }
  }
}


// Panggil fungsi ini setelah pesertaData berhasil diambil di dashboard.js
// Contoh:
// kirimNotifikasiWhatsapp(pesertaData);
