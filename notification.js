"use strict";

const API_NOTIFICATIONS = "/api/notifications";
const API_USER = "/api/user/me";
const API_READ_ALL = "/api/notifications/read-all";
const API_LOGOUT = "/api/auth/logout";

const notificationContainer =
  document.getElementById("notifications");

const userName =
  document.getElementById("userName");

const userEmail =
  document.getElementById("userEmail");


// ======================================================
// MENU
// ======================================================

const menuButton =
  document.getElementById("menuButton");

const sidebar =
  document.getElementById("sidebar");

const overlay =
  document.getElementById("overlay");


menuButton.addEventListener("click", function () {

  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");

});


overlay.addEventListener("click", function () {

  sidebar.classList.remove("open");
  overlay.classList.remove("show");

});


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

    console.error(
      "Erreur utilisateur :",
      error
    );

  }

}


// ======================================================
// ICÔNE
// ======================================================

function getIcon(notification) {

  const type =
    String(
      notification.type ||
      notification.category ||
      ""
    ).toLowerCase();


  if (type.includes("deposit")) {
    return "💰";
  }

  if (type.includes("withdraw")) {
    return "💸";
  }

  if (type.includes("investment")) {
    return "📈";
  }

  if (type.includes("vip")) {
    return "👑";
  }

  if (type.includes("security")) {
    return "🔐";
  }

  if (type.includes("success")) {
    return "✅";
  }

  if (type.includes("warning")) {
    return "⚠️";
  }

  return "🔔";

}


// ======================================================
// AFFICHAGE
// ======================================================

function displayNotifications(notifications) {

  notificationContainer.innerHTML = "";


  if (
    !Array.isArray(notifications) ||
    notifications.length === 0
  ) {

    notificationContainer.innerHTML = `
      <div class="empty">

        <div style="font-size:42px;margin-bottom:10px;">
          🔔
        </div>

        <strong>
          Aucune notification
        </strong>

        <p style="margin-top:8px;">
          Vous n'avez aucune nouvelle notification.
        </p>

      </div>
    `;

    return;

  }


  notifications.forEach(function (notification) {

    const item =
      document.createElement("div");


    const read =
      notification.read === true ||
      notification.is_read === true ||
      notification.read_at;


    item.className =
      "notification" +
      (read ? "" : " unread");


    const title =
      notification.title ||
      "JASON INVEST";


    const message =
      notification.message ||
      notification.content ||
      notification.text ||
      "Vous avez une nouvelle notification.";


    const date =
      notification.created_at ||
      notification.createdAt ||
      notification.date;


    item.innerHTML = `

      <div class="notification-icon">
        ${getIcon(notification)}
      </div>

      <div class="notification-content">

        <h3>
          ${title}
        </h3>

        <p>
          ${message}
        </p>

        <small>
          ${formatDate(date)}
        </small>

      </div>

      ${
        read
          ? ""
          : `<div class="unread-dot"></div>`
      }

    `;


    notificationContainer.appendChild(item);

  });

}


// ======================================================
// CHARGER NOTIFICATIONS
// ======================================================

async function loadNotifications() {

  notificationContainer.innerHTML = `
    <div class="loading">
      Chargement des notifications...
    </div>
  `;


  try {

    const response = await fetch(
      API_NOTIFICATIONS,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      }
    );


    if (response.status === 401) {

      window.location.href =
        "index.html";

      return;

    }


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Impossible de charger les notifications."
      );

    }


    const notifications =
      data.notifications ||
      data.data ||
      [];


    displayNotifications(
      notifications
    );


  } catch (error) {

    console.error(error);


    notificationContainer.innerHTML = `
      <div class="empty">

        <div style="font-size:42px;margin-bottom:10px;">
          ⚠️
        </div>

        <strong>
          Impossible de charger les notifications
        </strong>

        <p style="margin-top:8px;">
          Réessayez dans quelques instants.
        </p>

      </div>
    `;

  }

}


// ======================================================
// TOUT MARQUER COMME LU
// ======================================================

document
  .getElementById("readAllButton")
  .addEventListener("click", async function () {

    try {

      const response =
        await fetch(
          API_READ_ALL,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json"
            }
          }
        );


      if (response.status === 401) {

        window.location.href =
          "index.html";

        return;

      }


      if (!response.ok) {

        const data =
          await response.json()
            .catch(() => ({}));

        throw new Error(
          data.message ||
          "Erreur"
        );

      }


      await loadNotifications();


    } catch (error) {

      console.error(
        "Erreur lecture :",
        error
      );

    }

  });


// ======================================================
// DÉCONNEXION
// ======================================================

document
  .getElementById("logoutButton")
  .addEventListener("click", async function (event) {

    event.preventDefault();


    try {

      await fetch(
        API_LOGOUT,
        {
          method: "POST",
          credentials: "include"
        }
      );

    } catch (error) {

      console.error(error);

    }


    window.location.href =
      "index.html";

  });


// ======================================================
// INITIALISATION
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    await loadUser();

    await loadNotifications();

  }
);