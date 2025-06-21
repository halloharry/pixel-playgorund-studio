document.addEventListener("DOMContentLoaded", () => {
  const jenisSelect = document.getElementById("jenisLayanan");
  const hargaInput = document.getElementById("hargaLayanan");
  const jumlahInput = document.getElementById("jumlahLayanan");
  const totalInput = document.getElementById("totalBayar");

  // Ganti dengan ID spreadsheet dan nama sheet yang sesuai
  const spreadsheetId = "1tZSUz8iqME8i1xA17EeIYWAeUCpzJ-juBxOOxdP1xzc"; // GANTI dengan ID spreadsheet kamu
  const sheetName = "Jenis Layanan";
  const url = `https://opensheet.elk.sh/${spreadsheetId}/Form+Responses+1`;

  // Ambil data dari Google Sheet
  fetch(url)
    .then(res => res.json())
    .then(data => {
      data.forEach(row => {
        const option = document.createElement("option");
        option.value = row["Jenis Layanan"];
        option.setAttribute("data-harga", row["Harga"]);
        option.textContent = row["Jenis Layanan"];
        jenisSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Gagal ambil data dari spreadsheet:", err);
    });

  // Saat jenis layanan dipilih
  jenisSelect.addEventListener("change", () => {
    const selected = jenisSelect.options[jenisSelect.selectedIndex];
    const harga = parseInt(selected.getAttribute("data-harga")) || 0;
    hargaInput.value = harga.toLocaleString("id-ID");
    hitungTotal();
  });

  // Saat jumlah diketik
  jumlahInput.addEventListener("input", () => {
    // Batasi hanya maksimal 3 digit
    if (jumlahInput.value.length > 3) {
      jumlahInput.value = jumlahInput.value.slice(0, 3);
    }
    hitungTotal();
  });

  // Fungsi hitung total
  function hitungTotal() {
    const harga = parseInt(hargaInput.value.replace(/\D/g, '')) || 0;
    const jumlah = parseInt(jumlahInput.value) || 0;
    const total = harga * jumlah;
    totalInput.value = total.toLocaleString("id-ID");
  }
});
