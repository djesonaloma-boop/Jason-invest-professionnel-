"use strict";

/* ==========================================
   API
========================================== */

const API_USER = "/api/user/me";
const API_LOGOUT = "/api/auth/logout";


/* ==========================================
   ELEMENTS
========================================== */

const sidebar =
  document.getElementById("sidebar");

const menuToggle =
  document.getElementById("menuToggle");

const notificationButton =
  document.getElementById("notificationButton");

const logoutButton =
  document.getElementById("logoutButton");

const pointsValue =
  document.getElementById("pointsValue");

const pointsEquivalent =
  document.getElementById("pointsEquivalent");

const levelName =
  document.getElementById("levelName");

const progressBar =
  document.getElementById("progressBar");

const progressText =
  document.getElementById("progressText");


/* ==========================================
   MENU MOBILE
========================================== */

if (menuToggle) {

  menuToggle.addEventListener(
    "click",
    function() {

      sidebar.classList.toggle("open");

    }
  );

}


/* ==========================================
   NAVIGATION
========================================== */

const navButtons =
  document.querySelectorAll(".nav button[data-page]");


navButtons.forEach(function(button) {

  button.addEventListener(
    "click",
    function() {

      const page =
        button.getAttribute("data-page");


      if (page === "dashboard") {
        window.location.href = "dash.html";
        return;
      }

      if (page === "investissements") {
        window.location.href = "investissement.html";
        return;
      }

      if (page === "activites") {
        window.location.href = "activites.html";
        return;
      }

      if (page === "fidelite") {
        window.location.href = "fidelite.html";
        return;
      }

      if (page === "parrainage") {
        window.location.href = "parrainage.html";
        return;
      }

      if (page === "historique") {
        window.location.href = "historique.html";
        return;
      }

      if (page === "support") {
        window.location.href = "support.html";
        return;
      }

      if (page === "notifications") {
        window.location.href = "notification.html";
        return;
      }

      if (page === "profile") {
        window.location.href = "profil.html";
        return;
      }

    }
  );

});


/* ==========================================
   NOTIFICATIONS
========================================== */

if (notificationButton) {

  notificationButton.addEventListener(
    "click",
    function() {

      window.location.href =
        "notification.html";

    }
  );

}


/* ==========================================
   FORMAT NOMBRE
========================================== */

function formatNumber(value) {

  return new Intl.NumberFormat(
    "fr-FR"
  ).format(Number(value || 0));

}


/* ==========================================
   CALCUL DU NIVEAU
========================================== */

function calculateLevel(points) {

  points = Number(points || 0);

  if (points >= 1000) {

    return {
      name: "Diamant",
      min: 1000,
      max: 2000
    };

  }

  if (points >= 500) {

    return {
      name: "Or",
      min: 500,
      max: 1000
    };

  }

  if (points >= 200) {

    return {
      name: "Argent",
      min: 200,
      max: 500
    };

  }

  return {
    name: "Bronze",
    min: 0,
    max: 200
  };

}


/* ==========================================
   AFFICHER LES POINTS
========================================== */

function displayPoints(points) {

  points = Number(points || 0);


  /* POINTS */

  pointsValue.textContent =
    formatNumber(points);


  /* ÉQUIVALENT */

  const equivalent =
    points * 10;


  pointsEquivalent.textContent =
    "Équivalent : " +
    formatNumber(equivalent) +
    " FC";


  /* NIVEAU */

  const level =
    calculateLevel(points);


  levelName.textContent =
    level.name;


  /* PROGRESSION */

  let progress = 0;

  if (level.max > level.min) {

    progress =
      ((points - level.min) /
      (level.max - level.min)) * 100;

  }


  progress =
    Math.max(
      0,
      Math.min(100, progress)
    );


  progressBar.style.width =
    progress + "%";


  /* TEXTE */

  if (level.name === "Diamant") {

    progressText.textContent =
      formatNumber(points) +
      " points — niveau Diamant atteint.";

  } else {

    const remaining =
      level.max - points;

    progressText.textContent =
      formatNumber(remaining) +
      " points pour atteindre le niveau suivant.";

  }

}


/* ==========================================
   CHARGER UTILISATEUR
========================================== */

async function loadUser() {

  try {

    const response =
      await fetch(
        API_USER,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept":
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

      throw new Error(
        "Impossible de récupérer le compte."
      );

    }


    const result =
      await response.json();


    const user =
      result.user ||
      result.data ||
      result;


    if (!user) {
      throw new Error(
        "Utilisateur introuvable."
      );
    }


    /* NOM */

    const name =
      user.name ||
      user.full_name ||
      user.username ||
      "Utilisateur";


    document.getElementById(
      "sidebarUserName"
    ).textContent = name;


    /* EMAIL */

    document.getElementById(
      "sidebarUserEmail"
    ).textContent =
      user.email || "—";


    /* AVATAR */

    const avatar =
      document.getElementById(
        "userAvatar"
      );


    const photo =
      user.avatar ||
      user.avatar_url ||
      user.photo_url ||
      user.profile_photo;


    if (photo) {

      avatar.innerHTML =
        '<img src="' +
        photo +
        '" alt="Photo">';

    } else {

      const initials =
        getInitials(name);

      avatar.textContent =
        initials;

    }


    /* POINTS */

    const points =
      user.points ??
      user.fidelity_points ??
      0;


    displayPoints(points);


  } catch (error) {

    console.error(
      "Erreur fidélité :",
      error
    );


    pointsValue.textContent =
      "0";


    pointsEquivalent.textContent =
      "Impossible de charger les points";


    levelName.textContent =
      "—";


    progressText.textContent =
      "Impossible de charger les données";

  }

}


/* ==========================================
   INITIALS
========================================== */

function getInitials(name) {

  if (!name) {
    return "U";
  }


  const parts =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (parts.length === 1) {

    return parts[0]
      .substring(0, 2)
      .toUpperCase();

  }


  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();

}


/* ==========================================
   DÉCONNEXION
========================================== */

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async function() {

      logoutButton.disabled = true;

      logoutButton.textContent =
        "Déconnexion...";


      try {

        await fetch(
          API_LOGOUT,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json"
            }
          }
        );

      } catch (error) {

        console.error(error);

      }


      window.location.href =
        "index.html";

    }
  );

}


/* ==========================================
   START
========================================== */

loadUser();