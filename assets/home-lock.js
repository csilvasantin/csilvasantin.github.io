(function () {
  const STORAGE_KEY = "csilvasantin-home-unlocked";
  const screen = document.getElementById("lock-screen");
  const form = document.getElementById("lock-form");
  const input = document.getElementById("lock-input");
  const error = document.getElementById("lock-error");

  if (!screen || !form || !input || !error) {
    return;
  }

  const parts = [
    "09418087",
    "246c5efc",
    "32d92ed3",
    "0f678fd0",
    "2c0a4ade",
    "7dde8f23",
    "76da1309",
    "91827a15"
  ];

  async function digest(value) {
    const data = new TextEncoder().encode(value);
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function allow() {
    localStorage.setItem(STORAGE_KEY, "1");
    screen.classList.add("hidden");
  }

  if (localStorage.getItem(STORAGE_KEY) === "1") {
    allow();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (await digest(input.value) === parts.join("")) {
      error.classList.remove("visible");
      allow();
      return;
    }

    error.classList.add("visible");
    input.select();
  });
})();
