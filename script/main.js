function tampilkanForm() {
  document.getElementById("halamanForm").classList.remove("d-none");
  document.getElementById("halamanPeserta").classList.add("d-none");
  document.getElementById("halamanUndian").classList.add("d-none");
}

function tampilkanUndian() {
  const passwordInput = document.getElementById("inputPasswordSuperadmin");
  const errorMsg = document.getElementById("passwordError");
  passwordInput.value = "";
  errorMsg.classList.add("d-none");

  const modal = new bootstrap.Modal(document.getElementById('modalSuperadmin'));
  modal.show();
}

function logout() {
  localStorage.removeItem("loggedIn");
  location.reload();
}
function tampilkanDashboard() {
  document.getElementById("halamanDashboard").classList.remove("d-none");
  document.getElementById("halamanForm").classList.add("d-none");
  document.getElementById("halamanPeserta").classList.add("d-none");
  document.getElementById("halamanUndian").classList.add("d-none");
}
