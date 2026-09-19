"use strict";

const API_HISTORY = "/api/transactions/history";
const API_USER = "/api/user/me";
const API_LOGOUT = "/api/auth/logout";

const historyContainer = document.getElementById("history");
const refreshButton = document.getElementById("refreshButton");

const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");


// ======================================================
// MENU MOBILE
// ======================================================

menuButton.addEventListener("click", function () {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});

overlay.addEventListener("click", function () {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});


// ======================================================
// FORMAT FC
// ======================================================

function formatFC(amount) {
  const number = Number(amount || 0);

  return number.toLocaleString("fr-FR") + " FC";
}


// ======================================================
// DATE
// ======================================================

function formatDate(dateValue) {

  if (!dateValue) {
    return "Date inconnue";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


// ======================================================
// UTILISATEUR
// ======================================================

async function loadUser() {

  try {

    const response = await fetch(API_USER, {
      method: "GET",
      credentials: "include"
    });

    if (response.status === 401) {
      window.location.href = "index.html";
      return;
    }

    const data = await response.json();

    const user = data.user || data;

    userName.textContent =
      user.name || "Utilisateur";

    userEmail.textContent =
      user.email || "";

  } catch (error) {

    console.error("Erreur utilisateur :", error);

  }
}


// ======================================================
// TYPE D'OPÉRATION
// ======================================================

function getOperationType(transaction) {

  const type =
    String(
      transaction.type ||
      transaction.operation ||
      transaction.kind ||
      ""
    ).toLowerCase();

  if (
    type.includes("deposit") ||
    type.includes("dépôt") ||
    type.includes("depot")
  ) {
    return {
      name: "Dépôt",
      icon: "⬇️",
      className: "deposit"
    };
  }

  if (
    type.includes("withdraw") ||
    type.includes("retrait")
  ) {
    return {
      name: "Retrait",
      icon: "⬆️",
      className: "withdraw"
    };
  }

  if (
    type.includes("invest")
  ) {
    return {
      name: "Investissement",
      icon: "📈",
      className: "investment"
    };
  }

  if (
    type.includes("vip")
  ) {
    return {
      name: "Abonnement VIP",
      icon: "👑",
      className: "investment"
    };
  }

  return {
    name: transaction.type || "Opération",
    icon: "💳",
    className: "investment"
  };
}


// ======================================================
// STATUT
// ======================================================

function getStatus(transaction) {

  const status =
    String(
      transaction.status ||
      transaction.state ||
      "pending"
    ).toLowerCase();

  if (
    status === "completed" ||
    status === "approved" ||
    status === "success" ||
    status === "confirmed"
  ) {
    return {
      text: "Terminé",
      className: "completed"
    };
  }

  if (
    status === "failed" ||
    status === "rejected" ||
    status === "cancelled"
  ) {
    return {
      text: "Échec",
      className: "failed"
    };
  }

  return {
    text: "En attente",
    className: "pending"
  };
}


// ======================================================
// AFFICHAGE
// ======================================================

function displayHistory(transactions) {

  historyContainer.innerHTML = "";

  if (
    !Array.isArray(transactions) ||
    transactions.length === 0
  ) {

    historyContainer.innerHTML = `
      <div class="empty">
        <div style="font-size:40px;margin-bottom:10px;">
          🧾
        </div>

        <strong>Aucune opération</strong>

        <p style="margin-top:8px;">
          Votre historique apparaîtra ici.
        </p>
      </div>
    `;

    return;
  }


  transactions.forEach(function (transaction) {

    const operation =
      getOperationType(transaction);

    const status =
      getStatus(transaction);

    const amount =
      transaction.amount ||
      transaction.amount_fc ||
      transaction.value ||
      0;

    const date =
      transaction.created_at ||
      transaction.createdAt ||
      transaction.date;


    const item =
      document.createElement("div");

    item.className = "history-item";

    item.innerHTML = `
      <div class="history-left">

        <div class="icon">
          ${operation.icon}
        </div>

        <div class="history-info">

          <strong>
            ${operation.name}
          </strong>

          <small>
            ${formatDate(date)}
          </small>

        </div>

      </div>

      <div class="history-right">

        <div class="amount ${operation.className}">
          ${formatFC(amount)}
        </div>

        <small class="${status.className}">
          ${status.text}
        </small>

      </div>
    `;

    historyContainer.appendChild(item);

  });

}


// ======================================================
// CHARGER HISTORIQUE
// ======================================================

async function loadHistory() {

  historyContainer.innerHTML = `
    <div class="loading">
      Chargement de votre historique...
    </div>
  `;

  try {

    const response = await fetch(API_HISTORY, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });


    if (response.status === 401) {

      window.location.href = "index.html";
      return;

    }


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Impossible de charger l'historique."
      );

    }


    const transactions =
      data.transactions ||
      data.history ||
      data.data ||
      [];


    displayHistory(transactions);


  } catch (error) {

    console.error(error);

    historyContainer.innerHTML = `
      <div class="empty">

        <div style="font-size:40px;margin-bottom:10px;">
          ⚠️
        </div>

        <strong>
          Impossible de charger l'historique
        </strong>

        <p style="margin-top:8px;">
          Vérifiez votre connexion puis réessayez.
        </p>

      </div>
    `;

  }

}


// ======================================================
// ACTUALISER
// ======================================================

refreshButton.addEventListener(
  "click",
  loadHistory
);


// ======================================================
// DÉCONNEXION
// ======================================================

document
  .getElementById("logoutButton")
  .addEventListener("click", async function (event) {

    event.preventDefault();

    try {

      await fetch(API_LOGOUT, {
        method: "POST",
        credentials: "include"
      });

    } catch (error) {

      console.error(error);

    }

    window.location.href = "index.html";

  });


// ======================================================
// INITIALISATION
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    await loadUser();

    await loadHistory();

  }
);