if (localStorage.getItem("loggedIn") !== "true") {
  document.addEventListener("DOMContentLoaded", function () {
    document.body.innerHTML = `
      <div class="container mt-5">
        <div class="card p-4 shadow-lg mx-auto" style="max-width: 400px;">
          <h2 class="mb-4 text-center text-danger">Login Panitia</h2>
          <form id="loginForm">
            <div class="mb-3">
              <label>Username</label>
              <input type="text" class="form-control" id="username" required />
            </div>
            <div class="mb-3">
              <label>Password</label>
              <input type="password" class="form-control" id="password" required />
            </div>
            <button class="btn btn-danger w-100">Login</button>
          </form>
          <div id="loginError" class="text-danger text-center mt-3 d-none">Username atau password salah!</div>
        </div>
      </div>
    `;

    document.getElementById("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const user = document.getElementById("username").value;
      const pass = document.getElementById("password").value;
      if (user === "admin" && pass === "P@ssw0rd") {
        localStorage.setItem("loggedIn", "true");
        location.reload();
      } else {
        document.getElementById("loginError").classList.remove("d-none");
      }
    });
  });
}
