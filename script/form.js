
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

    const nama = data.get("entry.1506002396");
    const jenisLayanan = data.get("entry.1099535243");
    const noHp = data.get("entry.1099356212");
    const totalPembayaran = data.get("entry.1893531017");

    if (noHp) {
      const nomorWa = noHp.replace(/^0/, '62');
      const pesan = `Halo Terimakasih ${nama}, Berikut adalah total pembayaran Rp. ${totalPembayaran},00.
Telah berkunjung ke Pixel Playground Studio, semoga hasil foto ${jenisLayanan} suka. Datang kembali lagi ya Kak!`;
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

  for (const row of semuaRow) {
    const select = row.querySelector(".layananSelect");
    const harga = row.querySelector(".hargaInput").value.replace(/\D/g, '');
    const jumlah = parseInt(row.querySelector(".jumlahInput").value);

    if (!select.value || !harga || !jumlah || jumlah <= 0) {
      valid = false;
      break;
    }
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
