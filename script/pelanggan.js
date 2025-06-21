let pesertaData = [];
let currentPage = 1;
const perPage = 20;

function tampilkanPenjualan() {
  document.getElementById("halamanForm").classList.add("d-none");
  document.getElementById("halamanPeserta").classList.remove("d-none");
  document.getElementById("halamanDashboard").classList.add("d-none");

  if (pesertaData.length === 0) {
    fetch("https://opensheet.elk.sh/12DEvhJzjYNELbGgXFrpvfS490HbG63mQ17amXGC-dGs/Form+Responses+1")
      .then(res => res.json())
      .then(data => {
        pesertaData = data;
        renderPage();
      });
  } else {
    renderPage();
  }
}

function renderPage() {
  const tbody = document.querySelector("#tabelPeserta tbody");
  tbody.innerHTML = "";
;
  const searchNama = document.getElementById("searchNama").value.toLowerCase();
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const jenisLayananFilter = document.getElementById("filterJenisLayanan").value;

  const { start: bulanAwal, end: bulanAkhir } = getCurrentMonthRange();

  const filtered = pesertaData.filter((row) => {
    const nama = row["Nama Lengkap"]?.toLowerCase() || "";
    const timestamp = row["Timestamp"];
    const layanan = row["Jenis Layanan"];

    const tanggalRow = parseTanggalGoogleForm(timestamp);
    const namaValid = nama.includes(searchNama);
    const layananValid = jenisLayananFilter === "" || layanan === jenisLayananFilter;

    let tanggalValid = true;
    if (startDate || endDate) {
      if (startDate) tanggalValid = tanggalRow >= startDate;
      if (endDate) tanggalValid = tanggalValid && tanggalRow <= endDate;
    } else {
      // Default: filter bulan sekarang
      tanggalValid = tanggalRow >= bulanAwal && tanggalRow <= bulanAkhir;
    }

    return namaValid && tanggalValid && layananValid;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (currentPage - 1) * perPage;
  const pageData = filtered.slice(start, start + perPage);

  pageData.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${start + i + 1}</td>
      <td>${row["Timestamp"] || "-"}</td>
      <td>${row["Nama Lengkap"] || "-"}</td>
      <td>${row["Nomor Handphone"] || "-"}</td>
      <td>${row["Jenis Layanan"] || "-"}</td>
      <td>${row["Harga"] || "-"}</td>
      <td>${row["Jumlah"] || "-"}</td>
      <td>${row["Total Bayar"] || "-"}</td>
      <td>${row["Semua Layanan"] || "-"}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("pageInfo").innerText = `Halaman ${currentPage} dari ${totalPages}`;
  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage === totalPages;
}

// Event listener filter dan pagination
["startDate", "endDate", "filterJenisLayanan"].forEach(id => {
  document.getElementById(id).addEventListener("change", () => {
    currentPage = 1;
    renderPage();
  });
});


document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});
document.getElementById("nextBtn").addEventListener("click", () => {
  const totalPages = Math.ceil(pesertaData.length / perPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
});
document.getElementById("searchNama").addEventListener("input", () => {
  currentPage = 1;
  renderPage();
});

document.getElementById("clearFilterBtn").addEventListener("click", () => {
  document.getElementById("searchNama").value = "";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("filterJenisLayanan").value = "";

  currentPage = 1;
  renderPage();
});

function parseTanggalGoogleForm(timestamp) {
  if (!timestamp) return null;
        console.log(timestamp)
  const parts = timestamp.split(" ")[0].split("/"); // ambil bagian tanggal dari "13/06/2025 10:30:00"
  let hari = parts[0].padStart(2, '0');
  let bulan = parts[1].padStart(2, '0');
  let tahun = parts[2];

  return `${tahun}-${bulan}-${hari}`; // Output: "2025-06-13"
}

function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-31`
  };
}

