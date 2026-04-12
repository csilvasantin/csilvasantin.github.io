(function () {
  var STORAGE_KEY = "csilvasantin-home-unlocked";
  var ALLOWED_EMAILS = ["csilvasantin@gmail.com", "csilva@admira.com"];
  var CLIENT_ID = "103006471521-lh3a7b6hfcmfn7peg0gi5a0b46al5ai5.apps.googleusercontent.com";

  var screen = document.getElementById("lock-screen");
  var error = document.getElementById("lock-error");

  if (!screen) return;

  function allow() {
    localStorage.setItem(STORAGE_KEY, "1");
    screen.classList.add("hidden");
  }

  function deny(msg) {
    if (error) {
      error.textContent = msg || "Acceso denegado.";
      error.classList.add("visible");
    }
  }

  if (localStorage.getItem(STORAGE_KEY) === "1") {
    allow();
    return;
  }

  // --- Google SSO ---
  window.handleGoogleSignIn = function (response) {
    try {
      var base64 = response.credential.split(".")[1];
      base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
      var payload = JSON.parse(atob(base64));

      if (ALLOWED_EMAILS.indexOf(payload.email) !== -1 && payload.email_verified) {
        if (error) error.classList.remove("visible");
        allow();
      } else {
        deny("Solo cuentas autorizadas pueden acceder.");
      }
    } catch (e) {
      deny("Error al verificar la cuenta de Google.");
    }
  };

  function renderGoogleButton() {
    var btnContainer = document.getElementById("google-signin-btn");
    if (!btnContainer) return;
    if (typeof google === "undefined" || !google.accounts || !google.accounts.id) return;

    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: window.handleGoogleSignIn,
      auto_select: false
    });

    // Boton custom sin nombre ni foto
    btnContainer.innerHTML = '';
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "google-custom-btn";
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77-.01-.54z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.99 14.97.75 12 .75 7.7.75 3.99 3.22 2.18 6.67l3.66 2.84c.87-2.6 3.3-4.13 6.16-4.13z"/></svg> Acceder';
    btn.addEventListener("click", function () {
      google.accounts.id.prompt();
    });
    btnContainer.appendChild(btn);
  }

  window.onGoogleLibraryLoad = renderGoogleButton;
  renderGoogleButton();
})();
