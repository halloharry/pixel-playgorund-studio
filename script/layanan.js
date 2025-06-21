document.addEventListener("DOMContentLoaded", () => {
  const spreadsheetId = "1tZSUz8iqME8i1xA17EeIYWAeUCpzJ-juBxOOxdP1xzc"; // GANTI
  const url = `https://opensheet.elk.sh/${spreadsheetId}/Form+Responses+1`;
  let dataLayanan = [];

  const container = document.getElementById("layananContainer");
  const totalInput = document.getElementById("totalBayar");

  // Ambil data layanan
  fetch(url)
    .then(res => res.json())
    .then(data => {
      dataLayanan = data;
      tambahLayanan(); // tambahkan satu default
    });

  // Fungsi tambah layanan
  window.tambahLayanan = () => {
    const index = container.children.length;

    const row = document.createElement("div");
    row.className = "row g-2 align-items-end mb-2";
    row.innerHTML = `
      <div class="col-md-5">
        <label class="form-label">Jenis Layanan</label>
        <select class="form-select layananSelect" data-index="${index}">
          <option value="">-- Pilih Layanan --</option>
          ${dataLayanan.map(item => `
            <option value="${item["Jenis Layanan"]}" data-harga="${item["Harga"]}">${item["Jenis Layanan"]}</option>
          `).join("")}
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Harga</label>
        <input type="text" class="form-control hargaInput" readonly>
      </div>
      <div class="col-md-2">
        <label class="form-label">Jumlah</label>
        <input type="number" class="form-control jumlahInput" min="1" value="1">
      </div>
      <div class="col-md-2">
        <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.row').remove(); hitungTotal()">🗑</button>
      </div>
    `;

    container.appendChild(row);
    pasangEventListeners(row);
    hitungTotal();
  };

  function pasangEventListeners(row) {
    const select = row.querySelector(".layananSelect");
    const hargaInput = row.querySelector(".hargaInput");
    const jumlahInput = row.querySelector(".jumlahInput");

    select.addEventListener("change", () => {
      const harga = parseInt(select.options[select.selectedIndex].getAttribute("data-harga")) || 0;
      hargaInput.value = harga.toLocaleString("id-ID");
      hitungTotal();
    });

    jumlahInput.addEventListener("input", () => {
      if (jumlahInput.value.length > 3) {
        jumlahInput.value = jumlahInput.value.slice(0, 3);
      }
      hitungTotal();
    });
  }

  function hitungTotal() {
   const semuaRow = document.querySelectorAll("#layananContainer .row");

     let total = 0;
     let layananTambahanList = [];

     semuaRow.forEach((row, index) => {
       const harga = parseInt(row.querySelector(".hargaInput").value.replace(/\D/g, '')) || 0;
       const jumlah = parseInt(row.querySelector(".jumlahInput").value) || 0;
       total += harga * jumlah;

       if (index > 0) {
         const jenis = row.querySelector(".layananSelect").value;
         layananTambahanList.push(`${jenis} (Rp${harga.toLocaleString("id-ID")} x ${jumlah})`);
       }
     });

     document.getElementById("totalBayar").value = total.toLocaleString("id-ID");
     const layananBersih = layananTambahanList.filter(item => item && item.trim() !== "");
     document.getElementById("semuaLayanan").value = layananBersih.join(", ");
     updateHiddenInputs()
   }

    function updateHiddenInputs() {
      const semuaRow = document.querySelectorAll("#layananContainer .row");
      if (semuaRow.length === 0) return;

      const rowPertama = semuaRow[0];

      const select = rowPertama.querySelector(".layananSelect");
      const hargaInput = rowPertama.querySelector(".hargaInput");
      const jumlahInput = rowPertama.querySelector(".jumlahInput");

      const hiddenJenis = document.querySelector(".hiddenJenisLayanan");
      const hiddenHarga = document.querySelector(".hiddenHarga");
      const hiddenJumlah = document.querySelector(".hiddenJumlah");

      const jenis = (select?.value || "").trim();
      const harga = (hargaInput?.value.replace(/\D/g, '') || "").trim();
      const jumlah = (jumlahInput?.value || "").trim();

      hiddenJenis.value = jenis;
      hiddenHarga.value = harga;
      hiddenJumlah.value = jumlah;
    }


});
