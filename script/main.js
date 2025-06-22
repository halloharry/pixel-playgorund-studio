window.onload = function () {
  tampilkanDashboard(); // Dashboard jadi tampilan awal
};


function tampilkanForm() {
  document.getElementById("halamanForm").classList.remove("d-none");
  document.getElementById("halamanPeserta").classList.add("d-none");
  document.getElementById("halamanDashboard").classList.add("d-none");
}

function logout() {
  localStorage.removeItem("loggedIn");
  location.reload();
}

function sembunyikanSemuaHalaman() {
    const halaman = [
        "halamanForm",
        "halamanPeserta",
        "halamanDashboard"
    ];

    halaman.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("d-none");
    });
}

function tampilkanDashboard() {
    sembunyikanSemuaHalaman();
    document.getElementById("halamanDashboard").classList.remove("d-none");

    ambilDataPeserta().then(data => {
        penjualanData = data;               // ✅ SIMPAN DATA KE GLOBAL
        renderDashboard(penjualanData);     // Render awal
    });
}