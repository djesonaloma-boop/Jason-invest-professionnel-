"use strict";

/* =========================================================
   JASON INVEST — ADMIN RETRAITS
========================================================= */

const API = {
  me: "/api/admin/me",
  withdrawals: "/api/admin/withdrawals",
  logout: "/api/auth/logout"
};

const sidebar =
  document.getElementById("sidebar");

const overlay =
  document.getElementById("overlay");

const mobileMenu =
  document.getElementById("mobileMenu");

const withdrawalsContainer =
  document.getElementById("withdrawalsContainer");

const searchInput =
  document.getElementById("searchInput");

const refreshButton =
  document.getElementById("refreshButton");

const logoutButton =
  document.getElementById("logoutButton");

const message =
  document.getElementById("message");

let withdrawals = [];


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
   FORMAT DATE
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

  return date.toLocaleString(
    "fr-FR"
  );
}


/* =========================================================
   PROTECTION HTML
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

function extractWithdrawals(data) {

  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data.withdrawals
    )
  ) {
    return data.withdrawals;
  }

  if (
    Array.isArray(data.retraits)
  ) {
    return data.retraits;
  }

  if (
    Array.isArray(data.data)
  ) {
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
      status || "pending"
    ).toLowerCase();

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


function getStatusText(status) {

  const value =
    String(
      status || "pending"
    ).toLowerCase();

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

function renderWithdrawals(list) {

  if (!list.length) {

    withdrawalsContainer.innerHTML = `
      <tr>
        <td colspan="8" class="empty">
          Aucun retrait trouvé.
        </td>
      </tr>
    `;

    return;
  }

  withdrawalsContainer.innerHTML =
    list.map(item => {

      const status =
        getStatusClass(item.status);

      const canAction =
        status === "pending";

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
            ${formatFC(
              item.amount
            )}
          </td>

          <td>
            ${escapeHTML(
              item.payment_method ||
              item.paymentMethod ||
              "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              item.destination ||
              item.account ||
              item.withdraw_phone ||
              item.phone_destination ||
              "—"
            )}
          </td>

          <td>
            ${formatDate(
              item.created_at ||
              item.createdAt
            )}
          </td>

          <td>
            <span class="badge ${status}">
              ${getStatusText(
                item.status
              )}
            </span>
          </td>

          <td>

            ${
              canAction
              ? `
                <button
                  type="button"
                  class="action approve"
                  data-action="approve"
                  data-id="${escapeHTML(item.id)}"
                >
                  Approuver
                </button>

                <button
                  type="button"
                  class="action reject"
                  data-action="reject"
                  data-id="${escapeHTML(item.id)}"
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
   CHARGER LES RETRAITS
========================================================= */

async function loadWithdrawals() {

  withdrawalsContainer.innerHTML = `
    <tr>
      <td colspan="8" class="empty">
        Chargement des retraits...
      </td>
    </tr>
  `;

  try {

    const data =
      await apiJSON(
        API.withdrawals
      );

    withdrawals =
      extractWithdrawals(data);

    renderWithdrawals(
      withdrawals
    );

  } catch (error) {

    if (
      error.status === 401 ||
      error.status === 403
    ) {
      window.location.href =
        "index.html";

      return;
    }

    withdrawalsContainer.innerHTML = `
      <tr>
        <td colspan="8" class="empty">
          Impossible de charger les retraits.
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
   APPROUVER / REJETER
========================================================= */

async function updateWithdrawal(
  id,
  action
) {

  if (!id) {
    return;
  }

  const question =
    action === "approve"
      ? "Confirmer l'approbation de ce retrait ?"
      : "Confirmer le rejet de ce retrait ?";

  if (!confirm(question)) {
    return;
  }

  try {

    await apiJSON(
      `/api/admin/withdrawals/${encodeURIComponent(id)}/${action}`,
      {
        method: "POST"
      }
    );

    showMessage(
      action === "approve"
        ? "Retrait approuvé."
        : "Retrait rejeté.",
      "success"
    );

    await loadWithdrawals();

  } catch (error) {

    if (
      error.status === 401 ||
      error.status === 403
    ) {
      window.location.href =
        "index.html";

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

function searchWithdrawals() {

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  if (!query) {

    renderWithdrawals(
      withdrawals
    );

    return;
  }

  const filtered =
    withdrawals.filter(item => {

      const text = [
        item.id,
        item.name,
        item.user_name,
        item.phone,
        item.user_phone,
        item.email,
        item.payment_method,
        item.destination,
        item.account,
        item.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });

  renderWithdrawals(filtered);
}


/* =========================================================
   ACTIONS
========================================================= */

withdrawalsContainer.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-action]"
      );

    if (!button) {
      return;
    }

    updateWithdrawal(
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
  searchWithdrawals
);

refreshButton.addEventListener(
  "click",
  loadWithdrawals
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

  await loadWithdrawals();

})();