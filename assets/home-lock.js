(function () {
  const STORAGE_KEY = "csilvasantin-home-unlocked";
  const ALLOWED_EMAIL = "csilvasantin@gmail.com";
  const CLIENT_ID = "103006471521-lh3a7b6hfcmfn7peg0gi5a0b46al5ai5.apps.googleusercontent.com";

  const screen = document.getElementById("lock-screen");
  const error = document.getElementById("lock-error");
  const form = document.getElementById("lock-form");

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

  // Si ya tiene sesión válida, pasar directo
  if (localStorage.getItem(STORAGE_KEY) === "1") {
    allow();
    return;
  }

  // Mantener fallback de contraseña
  const parts = [
    "09418087", "246c5efc", "32d92ed3", "0f678fd0",
    "2c0a4ade", "7dde8f23", "76da1309", "91827a15"
  ];

  async function digest(value) {
    const data = new TextEncoder().encode(value);
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  if (form) {
    const input = document.getElementById("lock-input");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (input && (await digest(input.value)) === parts.join("")) {
        if (error) error.classList.remove("visible");
        allow();
        return;
      }
      deny("El acceso no es correcto.");
      if (input) input.select();
    });
  }

  // Google SSO callback
  window.handleGoogleSignIn = function (response) {
    try {
      // Decodificar JWT (solo payload, validación ligera front-end)
      const payload = JSON.parse(
        atob(response.credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );

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

  // Inicializar Google Identity Services
  if (CLIENT_ID !== "PENDING_CLIENT_ID.apps.googleusercontent.com") {
    window.addEventListener("load", function () {
      if (typeof google !== "undefined" && google.accounts) {
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: window.handleGoogleSignIn,
          auto_select: true
        });
        const btnContainer = document.getElementById("google-signin-btn");
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "pill",
            width: 280
          });
        }
      }
    });
  }
})();
