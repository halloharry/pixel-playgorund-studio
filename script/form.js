
document.getElementById("penjualanForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

 if (!validasiLayanan()) {
    alert("Pastikan semua jenis layanan, harga, dan jumlah telah diisi dengan benar.");
    return;
  }

  const form = e.target;
  const data = new FormData(form);

  fetch("https://docs.google.com/forms/d/e/1FAIpQLSf3bSYn7oIY2IHPzwkIqMX8GUjFT4seQl6L0KIF7flrp0qNqA/formResponse", {
    method: "POST",
    mode: "no-cors",
    body: data
  }).then(() => {
    form.classList.add("d-none");
    document.getElementById("pesanBerhasil").classList.remove("d-none");

    const layananText = data.get("entry.10482276") || "-";
    const hargaText = data.get("entry.1500269990") || "";
    const jumlahText = data.get("entry.1126059801") || "";
    const nama = data.get("entry.1506002396");
    const jenisLayanan = data.get("entry.1099535243");
    const noHp = data.get("entry.1099356212");
    const totalPembayaran = data.get("entry.1893531017");

    // Hitung total diskon (optional, bisa ditaruh di hidden input juga kalau mau)
    const hargaList = hargaText.split(",").map(h => parseInt(h));
    const jumlahList = jumlahText.split(",").map(j => parseInt(j));
    const totalBruto = hargaList.reduce((acc, h, i) => acc + (h * jumlahList[i]), 0);
    const totalBayar = parseInt(totalPembayaran.replace(/\D/g, ''));
    const totalDiskon = totalBruto - totalBayar;

if (noHp) {
  const nomorWa = noHp.replace(/^0/, '62');

  const pesan = `🧾 Pixel Playground Studio
=======================
👤 Nama: ${nama}
📸 ${layananText}
🎁 Diskon: Rp ${totalDiskon.toLocaleString("id-ID")}
💰 Total Bayar: Rp ${totalBayar.toLocaleString("id-ID")}
=======================
📍 Terima kasih, datang kembali ya Kak!`;

  const waLink = `https://wa.me/${nomorWa}?text=${encodeURIComponent(pesan)}`;
  document.getElementById("whatsappLink").href = waLink;
  document.getElementById("whatsappLink").classList.remove("d-none");
} else {
  document.getElementById("whatsappLink").classList.add("d-none");
}


  }).catch(() => {
    alert("Gagal mengirim. Coba lagi!");
  });
});
function validasiLayanan() {
  const semuaRow = document.querySelectorAll("#layananContainer .row");
  let valid = true;
  let total = 0;
  let semuaLayananText = [];
  let jenisList = [];
  let hargaList = [];
  let jumlahList = [];

  for (const row of semuaRow) {
    const select = row.querySelector(".layananSelect");
    const harga = parseInt(row.querySelector(".hargaInput").value.replace(/\D/g, '')) || 0;
    const jumlah = parseInt(row.querySelector(".jumlahInput").value);
    const diskon = parseInt(row.querySelector(".diskonInput")?.value || "0");

    if (!select.value || !harga || !jumlah || jumlah <= 0 || isNaN(diskon)) {
      valid = false;
      break;
    }

    const hargaSetelahDiskon = harga - diskon;
    const subtotal = hargaSetelahDiskon * jumlah;
    total += subtotal;

    semuaLayananText.push(`${select.value} (${jumlah}x @${harga - diskon})`);
    jenisList.push(select.value);
    hargaList.push(harga);
    jumlahList.push(jumlah);
  }

  if (valid) {
    const totalBruto = hargaList.reduce((acc, h, i) => acc + (h * jumlahList[i]), 0);
    const totalDiskon = totalBruto - total;

    document.getElementById("totalBayar").value = `Rp ${total.toLocaleString('id-ID')}`;

    const diskonDisplay = document.getElementById("totalDiskon");
    if (diskonDisplay) {
      diskonDisplay.innerText = `Diskon Total: Rp ${totalDiskon.toLocaleString('id-ID')}`;
    }

    document.getElementById("semuaLayanan").value = semuaLayananText.join(", ");
    document.querySelector(".hiddenJenisLayanan").value = jenisList.join(", ");
    document.querySelector(".hiddenHarga").value = hargaList.join(", ");
    document.querySelector(".hiddenJumlah").value = jumlahList.join(", ");
  }

  return valid;
}


function isiFormBaru() {
    // Sembunyikan pesan berhasil
    document.getElementById("pesanBerhasil").classList.add("d-none");

    // Tampilkan kembali form penjualan (INI BAGIAN PENTING YANG KURANG)
    document.getElementById("penjualanForm").classList.remove("d-none");

    // Tampilkan kembali halaman form & sembunyikan halaman lain
    document.getElementById("halamanForm").classList.remove("d-none");
    document.getElementById("halamanPeserta").classList.add("d-none");
    document.getElementById("halamanDashboard").classList.add("d-none");
    document.getElementById("bookingCalendar").classList.add("d-none");

    // Reset form
    document.getElementById("penjualanForm").reset();

    // Kosongkan layanan & total
    document.getElementById("layananContainer").innerHTML = "";
    document.getElementById("totalBayar").value = "Rp 0";
    document.getElementById("semuaLayanan").value = "";

    // Scroll ke atas form
    document.getElementById("halamanForm").scrollIntoView({ behavior: "smooth" });
}
