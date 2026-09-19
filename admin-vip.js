"use strict";

/* =========================================================
   JASON INVEST — ADMIN VIP
========================================================= */

const API = {
  me: "/api/admin/me",
  vip: "/api/admin/vip",
  logout: "/api/auth/logout"
};

const sidebar =
  document.getElementById("sidebar");

const overlay =
  document.getElementById("overlay");

const mobileMenu =
  document.getElementById("mobileMenu");

const vipContainer =
  document.getElementById("vipContainer");

const searchInput =
  document.getElementById("searchInput");

const refreshButton =
  document.getElementById("refreshButton");

const logoutButton =
  document.getElementById("logoutButton");

const message =
  document.getElementById("message");

let vipClients = [];


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text, type = "error") {

  message.textContent = text;

  message.className =
    "message show " + type;

  setTimeout(() => {
    message.className = "message";
  }, 4000);
}


/* =========================================================
   API
========================================================= */

async function apiJSON(url, options = {}) {

  const response = await fetch(url, {
    credentials: "include",
    ...options,

    headers: {
      "Accept": "application/json",

      ...(options.body
        ? {
            "Content-Type":
              "application/json"
          }
        : {}),

      ...(options.headers || {})
    }
  });

  let data = {};

  try {
    data = await response.json();
  } catch (_) {}

  if (!response.ok) {

    const error = new Error(
      data.message ||
      data.error ||
      `Erreur HTTP ${response.status}`
    );

    error.status =
      response.status;

    throw error;
  }

  return data;
}


/* =========================================================
   VÉRIFICATION ADMIN
========================================================= */

async function checkAdmin() {

  try {

    const data =
      await apiJSON(API.me);

    const user =
      data.user ||
      data.admin ||
      data.data ||
      data;

    if (
      user.role &&
      user.role !== "admin"
    ) {
      window.location.href =
        "index.html";

      return false;
    }

    return true;

  } catch (error) {

    if (
      error.status === 401 ||
      error.status === 403
    ) {
      window.location.href =
        "index.html";

      return false;
    }

    showMessage(
      "Impossible de vérifier la session administrateur."
    );

    return false;
  }
}


/* =========================================================
   FORMAT FC
========================================================= */

function formatFC(value) {

  return Number(value || 0)
    .toLocaleString("fr-FR") +
    " FC";
}


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "fr-FR"
  );
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
   EXTRACTION
========================================================= */

function extractVIP(data) {

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.vip)) {
    return data.vip;
  }

  if (Array.isArray(data.members)) {
    return data.members;
  }

  if (Array.isArray(data.subscriptions)) {
    return data.subscriptions;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}


/* =========================================================
   STATUT
========================================================= */

function getStatusClass(status) {

  const value =
    String(
      status || "active"
    ).toLowerCase();

  if (
    value === "expired" ||
    value === "expire"
  ) {
    return "expired";
  }

  if (
    value === "cancelled" ||
    value === "canceled" ||
    value === "rejected"
  ) {
    return "cancelled";
  }

  if (
    value === "pending" ||
    value === "en_attente"
  ) {
    return "pending";
  }

  return "active";
}


function getStatusText(status) {

  const value =
    String(
      status || "active"
    ).toLowerCase();

  if (
    value === "expired" ||
    value === "expire"
  ) {
    return "Expiré";
  }

  if (
    value === "cancelled" ||
    value === "canceled" ||
    value === "rejected"
  ) {
    return "Annulé";
  }

  if (
    value === "pending" ||
    value === "en_attente"
  ) {
    return "En attente";
  }

  return "Actif";
}


/* =========================================================
   AFFICHAGE
========================================================= */

function renderVIP(list) {

  if (!list.length) {

    vipContainer.innerHTML = `
      <tr>
        <td colspan="9" class="empty">
          Aucun abonnement VIP trouvé.
        </td>
      </tr>
    `;

    return;
  }

  vipContainer.innerHTML =
    list.map(item => {

      const status =
        getStatusClass(
          item.status
        );

      return `
        <tr>

          <td>
            ${escapeHTML(
              item.user_name ||
              item.name ||
              item.user?.name ||
              "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              item.phone ||
              item.user_phone ||
              item.user?.phone ||
              "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              item.email ||
              item.user_email ||
              item.user?.email ||
              "—"
            )}
          </td>

          <td>
            <span class="vip-badge">
              👑
              ${escapeHTML(
                item.vip_level ||
                item.level ||
                item.plan ||
                "VIP"
              )}
            </span>
          </td>

          <td>
            ${escapeHTML(
              item.subscription_name ||
              item.plan_name ||
              item.plan ||
              "—"
            )}
          </td>

          <td>
            ${formatFC(
              item.price ??
              item.amount ??
              item.subscription_price
            )}
          </td>

          <td>
            ${formatDate(
              item.start_date ||
              item.started_at ||
              item.created_at
            )}
          </td>

          <td>
            ${formatDate(
              item.expiration_date ||
              item.expires_at ||
              item.end_date
            )}
          </td>

          <td>
            <span class="vip-badge ${status}">
              ${getStatusText(
                item.status
              )}
            </span>
          </td>

        </tr>
      `;

    }).join("");
}


/* =========================================================
   CHARGER VIP
========================================================= */

async function loadVIP() {

  vipContainer.innerHTML = `
    <tr>
      <td colspan="9" class="empty">
        Chargement des abonnements VIP...
      </td>
    </tr>
  `;

  try {

    const data =
      await apiJSON(API.vip);

    vipClients =
      extractVIP(data);

    renderVIP(vipClients);

  } catch (error) {

    if (
      error.status === 401 ||
      error.status === 403
    ) {
      window.location.href =
        "index.html";

      return;
    }

    vipContainer.innerHTML = `
      <tr>
        <td colspan="9" class="empty">
          Impossible de charger les abonnements VIP.
        </td>
      </tr>
    `;

    showMessage(
      error.message ||
      "Erreur lors du chargement."
    );
  }
}


/* =========================================================
   RECHERCHE
========================================================= */

function searchVIP() {

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  if (!query) {

    renderVIP(vipClients);

    return;
  }

  const filtered =
    vipClients.filter(item => {

      const text = [
        item.id,
        item.name,
        item.user_name,
        item.phone,
        item.email,
        item.vip_level,
        item.level,
        item.plan,
        item.subscription_name,
        item.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });

  renderVIP(filtered);
}


/* =========================================================
   MENU MOBILE
========================================================= */

mobileMenu.addEventListener(
  "click",
  () => {

    sidebar.classList.add("open");
    overlay.classList.add("open");

  }
);

overlay.addEventListener(
  "click",
  () => {

    sidebar.classList.remove("open");
    overlay.classList.remove("open");

  }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
  "click",
  async event => {

    event.preventDefault();

    try {

      await apiJSON(
        API.logout,
        {
          method: "POST"
        }
      );

    } catch (_) {}

    window.location.href =
      "index.html";
  }
);


/* =========================================================
   EVENTS
========================================================= */

searchInput.addEventListener(
  "input",
  searchVIP
);

refreshButton.addEventListener(
  "click",
  loadVIP
);


/* =========================================================
   START
========================================================= */

(async function () {

  const authorized =
    await checkAdmin();

  if (!authorized) {
    return;
  }

  await loadVIP();

})();