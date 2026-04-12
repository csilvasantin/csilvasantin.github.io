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
      auto_select: true
    });

    google.accounts.id.renderButton(btnContainer, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill",
      width: 280
    });
  }

  window.onGoogleLibraryLoad = renderGoogleButton;
  renderGoogleButton();
})();
