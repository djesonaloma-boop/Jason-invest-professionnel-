"use strict";

/* =========================================================
   JASON INVEST — ADMIN INVESTISSEMENTS
========================================================= */

const API = {
  me: "/api/admin/me",
  investments: "/api/admin/investments",
  logout: "/api/auth/logout"
};

const sidebar =
  document.getElementById("sidebar");

const overlay =
  document.getElementById("overlay");

const mobileMenu =
  document.getElementById("mobileMenu");

const investmentsContainer =
  document.getElementById("investmentsContainer");

const searchInput =
  document.getElementById("searchInput");

const refreshButton =
  document.getElementById("refreshButton");

const logoutButton =
  document.getElementById("logoutButton");

const message =
  document.getElementById("message");

let investments = [];


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

function extractInvestments(data) {

  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data.investments
    )
  ) {
    return data.investments;
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
      status || "active"
    ).toLowerCase();

  if (
    value === "completed" ||
    value === "termine" ||
    value === "finished"
  ) {
    return "completed";
  }

  if (
    value === "pending" ||
    value === "en_attente"
  ) {
    return "pending";
  }

  if (
    value === "cancelled" ||
    value === "rejected" ||
    value === "failed"
  ) {
    return "cancelled";
  }

  return "active";
}


function getStatusText(status) {

  const value =
    String(
      status || "active"
    ).toLowerCase();

  if (
    value === "completed" ||
    value === "termine" ||
    value === "finished"
  ) {
    return "Terminé";
  }

  if (
    value === "pending" ||
    value === "en_attente"
  ) {
    return "En attente";
  }

  if (
    value === "cancelled" ||
    value === "rejected" ||
    value === "failed"
  ) {
    return "Annulé";
  }

  return "Actif";
}


/* =========================================================
   AFFICHAGE
========================================================= */

function renderInvestments(list) {

  if (!list.length) {

    investmentsContainer.innerHTML = `
      <tr>
        <td colspan="9" class="empty">
          Aucun investissement trouvé.
        </td>
      </tr>
    `;

    return;
  }

  investmentsContainer.innerHTML =
    list.map(item => {

      const status =
        getStatusClass(item.status);

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
              item.plan_name ||
              item.plan ||
              "—"
            )}
          </td>

          <td>
            ${formatFC(
              item.amount ??
              item.capital ??
              item.invested_amount
            )}
          </td>

          <td>
            ${formatFC(
              item.expected_gain ??
              item.daily_gain ??
              item.profit ??
              0
            )}
          </td>

          <td>
            ${
              item.duration_days ??
              item.duration ??
              "—"
            }
            ${
              (
                item.duration_days ||
                item.duration
              )
              ? " jours"
              : ""
            }
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
              item.end_date ||
              item.ends_at
            )}
          </td>

          <td>
            <span class="badge ${status}">
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
   CHARGER
========================================================= */

async function loadInvestments() {

  investmentsContainer.innerHTML = `
    <tr>
      <td colspan="9" class="empty">
        Chargement des investissements...
      </td>
    </tr>
  `;

  try {

    const data =
      await apiJSON(
        API.investments
      );

    investments =
      extractInvestments(data);

    renderInvestments(
      investments
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

    investmentsContainer.innerHTML = `
      <tr>
        <td colspan="9" class="empty">
          Impossible de charger les investissements.
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

function searchInvestments() {

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  if (!query) {

    renderInvestments(
      investments
    );

    return;
  }

  const filtered =
    investments.filter(item => {

      const text = [
        item.id,
        item.name,
        item.user_name,
        item.phone,
        item.email,
        item.plan,
        item.plan_name,
        item.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });

  renderInvestments(filtered);
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
  searchInvestments
);

refreshButton.addEventListener(
  "click",
  loadInvestments
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

  await loadInvestments();

})();