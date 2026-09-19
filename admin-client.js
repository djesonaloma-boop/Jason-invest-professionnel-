"use strict";

/* =========================================================
   JASON INVEST — ADMIN CLIENTS
========================================================= */

const API = {
  me: "/api/admin/me",
  clients: "/api/admin/users",
  logout: "/api/auth/logout"
};

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const mobileMenu = document.getElementById("mobileMenu");

const clientsContainer =
  document.getElementById("clientsContainer");

const clientSearch =
  document.getElementById("clientSearch");

const refreshButton =
  document.getElementById("refreshButton");

const logoutButton =
  document.getElementById("logoutButton");

const message =
  document.getElementById("message");

let clients = [];


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text, type = "error") {
  if (!message) return;

  message.textContent = text;
  message.className = "message show " + type;

  setTimeout(() => {
    message.className = "message";
  }, 4000);
}


/* =========================================================
   API JSON
========================================================= */

async function apiJSON(url, options = {}) {

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Accept": "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {})
    }
  });

  let data = {};

  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }

  if (!response.ok) {

    const error = new Error(
      data.message ||
      data.error ||
      `Erreur HTTP ${response.status}`
    );

    error.status = response.status;

    throw error;
  }

  return data;
}


/* =========================================================
   VERIFICATION ADMIN
========================================================= */

async function checkAdmin() {

  try {

    const data = await apiJSON(API.me);

    const user =
      data.user ||
      data.admin ||
      data.data ||
      data;

    const role = user.role;

    if (role && role !== "admin") {
      window.location.href = "index.html";
      return false;
    }

    return true;

  } catch (error) {

    if (
      error.status === 401 ||
      error.status === 403
    ) {
      window.location.href = "index.html";
      return false;
    }

    showMessage(
      "Impossible de vérifier la session administrateur.",
      "error"
    );

    return false;
  }
}


/* =========================================================
   FORMAT FC
========================================================= */

function formatFC(value) {

  const number = Number(value || 0);

  return number.toLocaleString("fr-FR") + " FC";
}


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}


/* =========================================================
   HTML SAFE
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   EXTRACTION CLIENTS
========================================================= */

function extractClients(data) {

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.users)) {
    return data.users;
  }

  if (Array.isArray(data.clients)) {
    return data.clients;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}


/* =========================================================
   AFFICHAGE
========================================================= */

function renderClients(list) {

  if (!clientsContainer) return;

  if (!list.length) {

    clientsContainer.innerHTML = `
      <tr>
        <td colspan="8" class="empty">
          Aucun client trouvé.
        </td>
      </tr>
    `;

    return;
  }

  clientsContainer.innerHTML = list.map(client => {

    const status =
      String(client.status || "active").toLowerCase();

    const active =
      status === "active" ||
      status === "actif";

    return `
      <tr>

        <td>
          ${escapeHTML(
            client.name ||
            client.full_name ||
            "Sans nom"
          )}
        </td>

        <td>
          ${escapeHTML(
            client.phone ||
            "—"
          )}
        </td>

        <td>
          ${escapeHTML(
            client.email ||
            "—"
          )}
        </td>

        <td>
          ${formatFC(
            client.balance_fc ??
            client.balance ??
            0
          )}
        </td>

        <td>
          ${escapeHTML(
            client.vip_level ||
            client.vip ||
            "Aucun"
          )}
        </td>

        <td>
          ${Number(
            client.points || 0
          ).toLocaleString("fr-FR")}
        </td>

        <td>
          <span class="status ${
            active ? "active" : "blocked"
          }">
            ${escapeHTML(
              active ? "Actif" : "Bloqué"
            )}
          </span>
        </td>

        <td>
          ${formatDate(
            client.created_at ||
            client.createdAt
          )}
        </td>

      </tr>
    `;

  }).join("");
}


/* =========================================================
   CHARGER CLIENTS
========================================================= */

async function loadClients() {

  clientsContainer.innerHTML = `
    <tr>
      <td colspan="8" class="empty">
        Chargement des clients...
      </td>
    </tr>
  `;

  try {

    const data = await apiJSON(API.clients);

    clients = extractClients(data);

    renderClients(clients);

  } catch (error) {

    if (
      error.status === 401 ||
      error.status === 403
    ) {
      window.location.href = "index.html";
      return;
    }

    clientsContainer.innerHTML = `
      <tr>
        <td colspan="8" class="empty">
          Impossible de charger les clients.
        </td>
      </tr>
    `;

    showMessage(
      error.message ||
      "Erreur lors du chargement des clients.",
      "error"
    );
  }
}


/* =========================================================
   RECHERCHE
========================================================= */

function searchClients() {

  const query =
    clientSearch.value
      .trim()
      .toLowerCase();

  if (!query) {
    renderClients(clients);
    return;
  }

  const filtered = clients.filter(client => {

    const text = [
      client.name,
      client.full_name,
      client.phone,
      client.email,
      client.vip_level,
      client.vip
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(query);
  });

  renderClients(filtered);
}


/* =========================================================
   MOBILE MENU
========================================================= */

function openMobileMenu() {

  sidebar.classList.add("open");
  overlay.classList.add("open");
}

function closeMobileMenu() {

  sidebar.classList.remove("open");
  overlay.classList.remove("open");
}

if (mobileMenu) {
  mobileMenu.addEventListener(
    "click",
    openMobileMenu
  );
}

if (overlay) {
  overlay.addEventListener(
    "click",
    closeMobileMenu
  );
}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

  try {

    await apiJSON(API.logout, {
      method: "POST"
    });

  } catch (_) {
    // Même si l'API échoue,
    // on retourne à la connexion.
  }

  window.location.href = "index.html";
}


/* =========================================================
   EVENTS
========================================================= */

if (clientSearch) {

  clientSearch.addEventListener(
    "input",
    searchClients
  );
}

if (refreshButton) {

  refreshButton.addEventListener(
    "click",
    loadClients
  );
}

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    event => {
      event.preventDefault();
      logout();
    }
  );
}


/* =========================================================
   START
========================================================= */

async function startClientAdmin() {

  const authorized =
    await checkAdmin();

  if (!authorized) return;

  await loadClients();
}

startClientAdmin();