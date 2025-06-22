let chartOmset = null;
let chartLayanan = null;
let penjualanData = [];

// Format angka jadi Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(angka);
}

// Parse tanggal Indonesia ke format Date JS
function parseTanggalIndonesia(str) {
  if (!str) return new Date(NaN);
  const [tanggal, waktu] = str.split(" ");
  const [dd, mm, yyyy] = tanggal.split("/").map(Number);
  return new Date(`${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}T${waktu || "00:00:00"}`);
}


// Ambil data dari spreadsheet (via opensheet)
async function ambilDataPeserta() {
    const url = "https://opensheet.elk.sh/12DEvhJzjYNELbGgXFrpvfS490HbG63mQ17amXGC-dGs/Form+Responses+1";
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

window.onload = ambilDataPeserta;

function renderDashboard(data, startDate = null, endDate = null) {
  const bulanNama = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const bulanIni = new Date().getMonth();
  const tahunIni = new Date().getFullYear();

  document.getElementById("bulanOmset").textContent = `${bulanNama[bulanIni]} ${tahunIni}`;
  document.getElementById("bulanTerlaris").textContent = `${bulanNama[bulanIni]} ${tahunIni}`;

  const omsetPerTanggal = {};
  const layananCount = {};
  let totalOmset = 0;

  const filterStart = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const filterEnd = endDate ? new Date(`${endDate}T23:59:59`) : null;

  data.forEach(row => {
    const timestamp = parseTanggalIndonesia(row["Timestamp"]);
    if (!(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
      console.warn("Invalid timestamp:", row["Timestamp"]);
      return;
    }

    const jenis = row["Jenis Layanan"];
    const total = parseInt((row["Total Bayar"] || "0").replace(/[^\d]/g, ""));
    const tgl = timestamp.toISOString().split("T")[0];

    const isDefault = !filterStart && !filterEnd &&
                      timestamp.getMonth() === bulanIni &&
                      timestamp.getFullYear() === tahunIni;

    const isFiltered = (filterStart || filterEnd) &&
                      (!filterStart || timestamp >= filterStart) &&
                      (!filterEnd || timestamp <= filterEnd);

    if (isDefault || isFiltered) {
      omsetPerTanggal[tgl] = (omsetPerTanggal[tgl] || 0) + total;
      layananCount[jenis] = (layananCount[jenis] || 0) + 1;
      totalOmset += total;
    }
  });

  // Buat tanggal list
  let tanggalList = [];
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      tanggalList.push(new Date(d).toISOString().split("T")[0]);
    }
  } else {
    const hariIni = new Date();
    for (let i = 9; i >= 0; i--) {
      const tgl = new Date(hariIni);
      tgl.setDate(hariIni.getDate() - i);
      tanggalList.push(tgl.toISOString().split("T")[0]);
    }
  }

  const nilaiOmset = tanggalList.map(tgl => omsetPerTanggal[tgl] || 0);
  document.getElementById("totalOmset").textContent = formatRupiah(totalOmset);

  let produkTerlaris = "-";
  let maxJumlah = 0;
  for (const layanan in layananCount) {
    if (layananCount[layanan] > maxJumlah) {
      maxJumlah = layananCount[layanan];
      produkTerlaris = layanan;
    }
  }
  document.getElementById("produkTerlaris").textContent = produkTerlaris;

  if (chartOmset) chartOmset.destroy();
  if (chartLayanan) chartLayanan.destroy();

  chartOmset = new Chart(document.getElementById("chartOmsetHarian"), {
    type: "line",
    data: {
      labels: tanggalList,
      datasets: [{
        label: "Omset Harian (Rp)",
        data: nilaiOmset,
        fill: false,
        tension: 0.4,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.3)",
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      aspectRatio: 2.2,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Total Omset per Hari (Bulan Ini)"
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function (value) {
              return "Rp " + value.toLocaleString("id-ID");
            }
          }
        }
      }
    }
  });

  const layananList = Object.keys(layananCount);
  const jumlahLayanan = layananList.map(l => layananCount[l]);

  chartLayanan = new Chart(document.getElementById("chartProdukTerlaris"), {
    type: "pie",
    data: {
      labels: layananList,
      datasets: [{
        data: jumlahLayanan,
        backgroundColor: layananList.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Jenis Layanan Terlaris (Bulan Ini)"
        }
      }
    }
  });

    kirimNotifikasiWhatsapp(data);

}

document.getElementById("filterStartDate").addEventListener("change", applyFilter);
document.getElementById("filterEndDate").addEventListener("change", applyFilter);
document.getElementById("btnClearFilter").addEventListener("click", () => {
  document.getElementById("filterStartDate").value = "";
  document.getElementById("filterEndDate").value = "";
  renderDashboard(penjualanData); // kembali ke default
});

function applyFilter() {
  const start = document.getElementById("filterStartDate").value;
  const end = document.getElementById("filterEndDate").value;
  renderDashboard(penjualanData, start, end);
}

