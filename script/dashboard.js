let chartOmset = null;
let chartLayanan = null;

// Format angka jadi Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(angka);
}

// Parse tanggal Indonesia ke format Date JS
function parseTanggalIndonesia(tanggalStr) {
    // Contoh input: "21/05/2025 13:44:17"
    if (!tanggalStr) return new Date("invalid");

    const [tgl, bln, thnJam] = tanggalStr.split('/');
    if (!thnJam || !tgl || !bln) return new Date("invalid");

    const [thn, jam] = thnJam.split(' ');
    return new Date(`${thn}-${bln}-${tgl}T${jam || '00:00:00'}`);
}

// Ambil data dari spreadsheet (via opensheet)
async function ambilDataPeserta() {
    const url = "https://opensheet.elk.sh/12DEvhJzjYNELbGgXFrpvfS490HbG63mQ17amXGC-dGs/Form+Responses+1";
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

// Render dashboard
function renderDashboard(data) {
    const bulanIni = new Date().getMonth();
    const tahunIni = new Date().getFullYear();

    const omsetPerTanggal = {};
    const layananCount = {};
    let totalOmset = 0;

    data.forEach(row => {
        const timestamp = parseTanggalIndonesia(row["Timestamp"]);
        if (isNaN(timestamp)) return; // skip kalau gagal parse tanggal

        const jenis = row["Jenis Layanan"];
        const total = parseInt((row["Total Bayar"] || "0").replace(/[^\d]/g, ""));

        if (
            timestamp.getMonth() === bulanIni &&
            timestamp.getFullYear() === tahunIni
        ) {
            const tgl = timestamp.toISOString().split("T")[0];
            omsetPerTanggal[tgl] = (omsetPerTanggal[tgl] || 0) + total;
            layananCount[jenis] = (layananCount[jenis] || 0) + 1;
            totalOmset += total;
        }
    });

    // Tampilkan total omset
    document.getElementById("totalOmset").textContent = formatRupiah(totalOmset);

    // Produk terlaris
    let produkTerlaris = "-";
    let maxJumlah = 0;
    for (const layanan in layananCount) {
        if (layananCount[layanan] > maxJumlah) {
            maxJumlah = layananCount[layanan];
            produkTerlaris = layanan;
        }
    }
    document.getElementById("produkTerlaris").textContent = produkTerlaris;

    // Destroy chart lama kalau ada
    if (chartOmset) chartOmset.destroy();
    if (chartLayanan) chartLayanan.destroy();

    // Bar Chart: Omset Harian
    const tanggalList = Object.keys(omsetPerTanggal).sort();
    const nilaiOmset = tanggalList.map(tgl => omsetPerTanggal[tgl]);

    chartOmset = new Chart(document.getElementById("chartOmsetHarian"), {
      type: "bar",
      data: {
        labels: tanggalList,
        datasets: [{
          label: "Omset Harian (Rp)",
          data: nilaiOmset,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          maxBarThickness: 60
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 2.5,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Total Omset per Hari (Bulan Ini)"
          }
        }
      }
    });


    // Pie Chart: Produk Terlaris
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
}
