(function () {
  var STORAGE_KEY = "csilvasantin-home-unlocked";
  var ALLOWED_EMAIL = "csilvasantin@gmail.com";
  var CLIENT_ID = "103006471521-lh3a7b6hfcmfn7peg0gi5a0b46al5ai5.apps.googleusercontent.com";

  var screen = document.getElementById("lock-screen");
  var error = document.getElementById("lock-error");
  var form = document.getElementById("lock-form");

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

  // Si ya tiene sesion valida, pasar directo
  if (localStorage.getItem(STORAGE_KEY) === "1") {
    allow();
    return;
  }

  // --- Fallback contraseña ---
  var parts = [
    "09418087", "246c5efc", "32d92ed3", "0f678fd0",
    "2c0a4ade", "7dde8f23", "76da1309", "91827a15"
  ];

  function digest(value) {
    var data = new TextEncoder().encode(value);
    return crypto.subtle.digest("SHA-256", data).then(function (buffer) {
      return Array.from(new Uint8Array(buffer))
        .map(function (b) { return b.toString(16).padStart(2, "0"); })
        .join("");
    });
  }

  if (form) {
    var input = document.getElementById("lock-input");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!input) return;
      digest(input.value).then(function (hash) {
        if (hash === parts.join("")) {
          if (error) error.classList.remove("visible");
          allow();
        } else {
          deny("El acceso no es correcto.");
          input.select();
        }
      });
    });
  }

  // --- Google SSO ---
  window.handleGoogleSignIn = function (response) {
    try {
      var base64 = response.credential.split(".")[1];
      base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
      var payload = JSON.parse(atob(base64));

      if (payload.email === ALLOWED_EMAIL && payload.email_verified) {
        if (error) error.classList.remove("visible");
        allow();
      } else {
        deny("Solo " + ALLOWED_EMAIL + " puede acceder.");
      }
    } catch (e) {
      deny("Error al verificar la cuenta de Google.");
    }
  };

  // Intentar renderizar el boton de Google cada 300ms hasta lograrlo
  var attempts = 0;
  var maxAttempts = 50; // 15 segundos max

  function tryRenderGoogleButton() {
    attempts++;
    if (attempts > maxAttempts) return;

    if (typeof google === "undefined" || !google.accounts || !google.accounts.id) {
      setTimeout(tryRenderGoogleButton, 300);
      return;
    }

    var btnContainer = document.getElementById("google-signin-btn");
    if (!btnContainer) return;

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

  tryRenderGoogleButton();
})();
