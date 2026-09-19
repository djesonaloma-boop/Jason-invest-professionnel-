"use strict";

/* =========================================================
   JASON INVEST — ADMIN DÉPÔTS
========================================================= */

const API = {
  me: "/api/admin/me",
  deposits: "/api/admin/deposits",
  logout: "/api/auth/logout"
};

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const mobileMenu = document.getElementById("mobileMenu");

const depositsContainer =
  document.getElementById("depositsContainer");

const searchInput =
  document.getElementById("searchInput");

const refreshButton =
  document.getElementById("refreshButton");

const logoutButton =
  document.getElementById("logoutButton");

const message =
  document.getElementById("message");

let deposits = [];


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = "message show " + type;

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
        ? {"Content-Type": "application/json"}
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

    error.status = response.status;

    throw error;
  }

  return data;
}


/* =========================================================
   ADMIN
========================================================= */

async function checkAdmin() {

  try {

    const data = await apiJSON(API.me);

    const user =
      data.user ||
      data.admin ||
      data.data ||
      data;

    if (user.role && user.role !== "admin") {
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
      "Impossible de vérifier votre accès administrateur."
    );

    return false;
  }
}


/* =========================================================
   FORMAT
========================================================= */

function formatFC(value) {

  return Number(value || 0)
    .toLocaleString("fr-FR") + " FC";
}


function formatDate(value) {

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("fr-FR");
}


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   DONNÉES
========================================================= */

function extractDeposits(data) {

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.deposits)) {
    return data.deposits;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}


/* =========================================================
   STATUT
========================================================= */

function statusClass(status) {

  const value =
    String(status || "pending").toLowerCase();

  if (
    value === "approved" ||
    value === "completed" ||
    value === "confirmed" ||
    value === "success"
  ) {
    return "approved";
  }

  if (
    value === "rejected" ||
    value === "failed" ||
    value === "cancelled"
  ) {
    return "rejected";
  }

  return "pending";
}


function statusText(status) {

  const value =
    String(status || "pending").toLowerCase();

  if (
    value === "approved" ||
    value === "completed" ||
    value === "confirmed" ||
    value === "success"
  ) {
    return "Approuvé";
  }

  if (
    value === "rejected" ||
    value === "failed" ||
    value === "cancelled"
  ) {
    return "Rejeté";
  }

  return "En attente";
}


/* =========================================================
   AFFICHAGE
========================================================= */

function renderDeposits(list) {

  if (!list.length) {

    depositsContainer.innerHTML = `
      <tr>
        <td colspan="8" class="empty">
          Aucun dépôt trouvé.
        </td>
      </tr>
    `;

    return;
  }

  depositsContainer.innerHTML =
    list.map(deposit => {

      const status =
        statusClass(deposit.status);

      const canAction =
        status === "pending";

      return `
        <tr>

          <td>
            ${escapeHTML(
              deposit.user_name ||
              deposit.name ||
              deposit.user?.name ||
              "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              deposit.phone ||
              deposit.user_phone ||
              deposit.user?.phone ||
              "—"
            )}
          </td>

          <td>
            ${formatFC(
              deposit.amount
            )}
          </td>

          <td>
            ${escapeHTML(
              deposit.payment_method ||
              deposit.paymentMethod ||
              "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              deposit.reference ||
              "—"
            )}
          </td>

          <td>
            ${formatDate(
              deposit.created_at ||
              deposit.createdAt
            )}
          </td>

          <td>
            <span class="badge ${status}">
              ${statusText(deposit.status)}
            </span>
          </td>

          <td>

            ${
              canAction
              ? `
                <button
                  class="action approve"
                  data-action="approve"
                  data-id="${escapeHTML(deposit.id)}"
                >
                  Approuver
                </button>

                <button
                  class="action reject"
                  data-action="reject"
                  data-id="${escapeHTML(deposit.id)}"
                >
                  Rejeter
                </button>
              `
              : "—"
            }

          </td>

        </tr>
      `;

    }).join("");
}


/* =========================================================
   CHARGEMENT
========================================================= */

async function loadDeposits() {

  depositsContainer.innerHTML = `
    <tr>
      <td colspan="8" class="empty">
        Chargement des dépôts...
      </td>
    </tr>
  `;

  try {

    const data =
      await apiJSON(API.deposits);

    deposits =
      extractDeposits(data);

    renderDeposits(deposits);

  } catch (error) {

    if (
      error.status === 401 ||
      error.status === 403
    ) {
      window.location.href = "index.html";
      return;
    }

    depositsContainer.innerHTML = `
      <tr>
        <td colspan="8" class="empty">
          Impossible de charger les dépôts.
        </td>
      </tr>
    `;

    showMessage(error.message);
  }
}


/* =========================================================
   APPROUVER / REJETER
========================================================= */

async function updateDeposit(id, action) {

  if (!id) return;

  const confirmed = confirm(
    action === "approve"
      ? "Confirmer l'approbation de ce dépôt ?"
      : "Confirmer le rejet de ce dépôt ?"
  );

  if (!confirmed) return;

  try {

    await apiJSON(
      `/api/admin/deposits/${encodeURIComponent(id)}/${action}`,
      {
        method: "POST"
      }
    );

    showMessage(
      action === "approve"
        ? "Dépôt approuvé."
        : "Dépôt rejeté.",
      "success"
    );

    await loadDeposits();

  } catch (error) {

    if (
      error.status === 401 ||
      error.status === 403
    ) {
      window.location.href = "index.html";
      return;
    }

    showMessage(
      error.message ||
      "Opération impossible."
    );
  }
}


/* =========================================================
   RECHERCHE
========================================================= */

function searchDeposits() {

  const query =
    searchInput.value.trim().toLowerCase();

  if (!query) {
    renderDeposits(deposits);
    return;
  }

  const filtered =
    deposits.filter(deposit => {

      const text = [
        deposit.id,
        deposit.name,
        deposit.user_name,
        deposit.phone,
        deposit.user_phone,
        deposit.email,
        deposit.reference,
        deposit.payment_method,
        deposit.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });

  renderDeposits(filtered);
}


/* =========================================================
   ACTIONS TABLE
========================================================= */

depositsContainer.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest("[data-action]");

    if (!button) return;

    updateDeposit(
      button.dataset.id,
      button.dataset.action
    );
  }
);


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
      await apiJSON(API.logout, {
        method: "POST"
      });
    } catch (_) {}

    window.location.href = "index.html";
  }
);


/* =========================================================
   EVENTS
========================================================= */

searchInput.addEventListener(
  "input",
  searchDeposits
);

refreshButton.addEventListener(
  "click",
  loadDeposits
);


/* =========================================================
   START
========================================================= */

(async function () {

  const authorized =
    await checkAdmin();

  if (!authorized) return;

  await loadDeposits();

})();