async function ambilDataBooking() {
  const url = "https://opensheet.elk.sh/1dgpwWNts_gLqlfA94dTH407UlYVTmHlOBOpoDHRpHqQ/Form+Responses+1";
  const res = await fetch(url);
  return await res.json();
}

function parseTanggalJam(tanggal, jam) {
  if (!tanggal || !jam) return new Date(NaN);

  tanggal = tanggal.replace(/['"]/g, "").trim();
  jam = jam.replace(/['"]/g, "").trim();

  let yyyy, mm, dd;

  if (tanggal.includes("-")) {
    [yyyy, mm, dd] = tanggal.split("-");
  } else if (tanggal.includes("/")) {
    [dd, mm, yyyy] = tanggal.split("/");
  } else {
    console.warn("Format tanggal tidak dikenali:", tanggal);
    return new Date(NaN);
  }

  const [hh, min] = jam.split(":");

  return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00+07:00`);
}

function tampilkanBookingAktif() {
  ambilDataBooking().then(data => {
    const listEl = document.getElementById("bookingList");
    listEl.innerHTML = "";

    const nowJakarta = new Date();

    const aktifBookings = data.filter(row => {
      const rawTanggal = (row["Tanggal Booking"] || '').replace(/['"]/g, "").trim();
      const rawJam = (row["Jam Selesai"] || '').replace(/['"]/g, "").trim();
      const endTime = parseTanggalJam(rawTanggal, rawJam);

      const isValid = endTime.getTime() + 30 * 60000 > nowJakarta.getTime();

      return isValid;
    });

    const sorted = aktifBookings.sort((a, b) => {
      const aTime = parseTanggalJam(a["Tanggal Booking"], a["Jam Mulai"]);
      const bTime = parseTanggalJam(b["Tanggal Booking"], b["Jam Mulai"]);
      return aTime - bTime;
    });

    if (sorted.length === 0) {
      listEl.innerHTML = `<div class="text-center text-muted">Tidak ada booking aktif saat ini.</div>`;
      return;
    }

    sorted.forEach(row => {
      const startTime = parseTanggalJam(row["Tanggal Booking"], row["Jam Mulai"]);
      const endTime = parseTanggalJam(row["Tanggal Booking"], row["Jam Selesai"]);
      const timeRange = `${formatTanggalIndonesia(startTime)} - ${endTime.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: "Asia/Jakarta" })} WIB`;

      const status = row["Status Pembayaran"] === "Lunas"
        ? `<span class='badge bg-success'>LUNAS</span>`
        : `<span class='badge bg-warning text-dark'>DP: Rp ${row["Nominal DP"]}</span>`;

      const item = document.createElement("div");
      item.className = "border p-3 rounded mb-3 shadow-sm bg-light";
      item.innerHTML = `
        <div class="fw-bold mb-1">${row["Nama Lengkap"]} - ${row["Jenis Layanan"]}</div>
        <div class="mb-1">📅 ${row["Tanggal Booking"]} ⏰ ${timeRange}</div>
        <div class="mb-1">${status}</div>
        <div class="fst-italic">📞 ${row["Nomor Handphone"] || "-"}</div>
        <div>${row["Catatan Tambahan"] || ""}</div>
      `;

      listEl.appendChild(item);
    });
  });
}

window.addEventListener("DOMContentLoaded", tampilkanBookingAktif);

function sembunyikanSemuaHalaman() {
  const halaman = [
    "halamanForm",
    "halamanPeserta",
    "halamanDashboard",
    "halamanBooking"
  ];
  halaman.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("d-none");
  });
}

function tampilkanBooking() {
  sembunyikanSemuaHalaman();
  document.getElementById("bookingCalendar").classList.remove("d-none");
  document.getElementById("halamanForm").classList.remove("d-none");
  document.getElementById("halamanPeserta").classList.add("d-none");
  document.getElementById("halamanDashboard").classList.add("d-none");
  tampilkanBookingAktif();
}

function formatTanggalIndonesia(date) {
  return date.toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta"
  }) + " WIB";
}

function toggleNominalDp() {
  const status = document.getElementById("bookingStatus").value;
  const dpContainer = document.getElementById("nominalDpContainer");
  if (status === "DP") {
    dpContainer.classList.remove("d-none");
  } else {
    dpContainer.classList.add("d-none");
    document.getElementById("bookingNominalDp").value = "";
  }
}

document.getElementById("bookingForm")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);

  fetch("https://docs.google.com/forms/d/e/1FAIpQLSfGNt07BLxsSXn7TvK83nDiU12ux6HRXuSIhrZFSCv_PzIlTw/formResponse", {
    method: "POST",
    mode: "no-cors",
    body: data
  }).then(() => {
    form.reset();
    document.getElementById("bookingSukses").classList.remove("d-none");
  }).catch(() => {
    alert("❌ Gagal mengirim. Coba lagi!");
  });
});
