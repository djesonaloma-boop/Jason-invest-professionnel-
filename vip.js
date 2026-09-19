"use strict";

/*
=========================================================
 JASON INVEST
 VIP.JS
=========================================================

Ce fichier :

1. Charge le compte connecté.
2. Affiche le niveau VIP actuel.
3. Affiche le nom et l'avatar.
4. Permet de demander un abonnement VIP.
5. L'achat est envoyé au backend.

IMPORTANT :
Le navigateur ne crédite jamais directement un compte.

API prévue :

GET  /api/user/me
POST /api/vip/purchase
POST /api/auth/logout
=========================================================
*/


/* =====================================================
   API
===================================================== */

const API = {

  me: "/api/user/me",

  purchaseVip: "/api/vip/purchase",

  logout: "/api/auth/logout"

};


/* =====================================================
   ELEMENTS
===================================================== */

const sidebar =
  document.getElementById("sidebar");

const overlay =
  document.getElementById("overlay");

const menuToggle =
  document.getElementById("menuToggle");

const logoutButton =
  document.getElementById("logoutButton");

const notificationButton =
  document.getElementById("notificationButton");

const topAvatar =
  document.getElementById("topAvatar");

const sidebarUserName =
  document.getElementById("sidebarUserName");

const sidebarUserEmail =
  document.getElementById("sidebarUserEmail");

const currentVip =
  document.getElementById("currentVip");

const currentVipInfo =
  document.getElementById("currentVipInfo");

const currentVipBadge =
  document.getElementById("currentVipBadge");

const vipMessage =
  document.getElementById("vipMessage");

const buyButtons =
  document.querySelectorAll(".buy-button");


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(message, type) {

  vipMessage.textContent =
    message;

  vipMessage.className =
    "message show " + type;

}


function clearMessage() {

  vipMessage.textContent = "";

  vipMessage.className =
    "message";

}


/* =====================================================
   INITIAL
===================================================== */

function getInitial(name) {

  if (!name) {
    return "U";
  }

  return name
    .trim()
    .charAt(0)
    .toUpperCase();

}


/* =====================================================
   CHARGER UTILISATEUR
===================================================== */

async function loadUser() {

  try {

    const response =
      await fetch(
        API.me,
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

      return null;

    }


    const data =
      await response.json()
        .catch(() => null);


    if (
      !response.ok ||
      !data ||
      !data.success ||
      !data.user
    ) {

      throw new Error(
        "Impossible de récupérer votre compte."
      );

    }


    return data.user;


  } catch (error) {

    console.error(
      "Erreur utilisateur :",
      error
    );


    showMessage(
      error.message ||
      "Erreur de connexion au serveur.",
      "error"
    );


    return null;

  }

}


/* =====================================================
   AFFICHAGE UTILISATEUR
===================================================== */

function renderUser(user) {

  if (!user) {
    return;
  }


  const name =
    user.name || "Utilisateur";

  const email =
    user.email || "—";

  const vip =
    user.vipLevel || "Aucun";


  sidebarUserName.textContent =
    name;

  sidebarUserEmail.textContent =
    email;


  topAvatar.textContent =
    getInitial(name);


  currentVip.textContent =
    vip;


  if (vip === "Aucun") {

    currentVipInfo.textContent =
      "Aucun abonnement VIP actif.";

    currentVipBadge.textContent =
      "STANDARD";

  } else {

    currentVipInfo.textContent =
      "Votre compte possède actuellement le niveau "
      + vip
      + ".";

    currentVipBadge.textContent =
      "VIP " + vip.toUpperCase();

  }


  /*
    On désactive les boutons correspondant
    au niveau déjà actif.
  */

  buyButtons.forEach(button => {

    const plan =
      button.dataset.vip;


    if (plan === vip) {

      button.disabled =
        true;

      button.textContent =
        "Niveau actuel";

    }

  });

}


/* =====================================================
   ACHAT VIP
===================================================== */

async function purchaseVip(plan, price, button) {

  clearMessage();


  if (!plan) {

    showMessage(
      "Niveau VIP invalide.",
      "error"
    );

    return;

  }


  const confirmed =
    window.confirm(
      "Vous allez demander l'abonnement VIP "
      + plan
      + " pour "
      + Number(price).toLocaleString("fr-FR")
      + " FC.\n\n"
      + "Le serveur vérifiera votre solde avant toute activation."
    );


  if (!confirmed) {
    return;
  }


  const originalText =
    button.textContent;


  button.disabled =
    true;

  button.textContent =
    "Traitement...";


  try {

    const response =
      await fetch(
        API.purchaseVip,
        {

          method: "POST",

          credentials: "include",

          headers: {

            "Content-Type":
              "application/json",

            "Accept":
              "application/json"

          },

          body: JSON.stringify({

            vipLevel: plan

          })

        }
      );


    const data =
      await response.json()
        .catch(() => ({}));


    if (response.status === 401) {

      window.location.href =
        "index.html";

      return;

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Impossible de traiter votre demande."
      );

    }


    showMessage(
      data.message ||
      "Votre demande VIP a été traitée.",
      "success"
    );


    /*
      Si le backend renvoie l'utilisateur
      actualisé, on l'utilise immédiatement.
    */

    if (data.user) {

      renderUser(data.user);

    } else {

      const user =
        await loadUser();

      renderUser(user);

    }


  } catch (error) {

    console.error(
      "Erreur achat VIP :",
      error
    );


    showMessage(
      error.message ||
      "Une erreur est survenue.",
      "error"
    );


    button.disabled =
      false;

    button.textContent =
      originalText;

  }

}


/* =====================================================
   BOUTONS VIP
===================================================== */

buyButtons.forEach(button => {

  button.addEventListener(
    "click",
    function() {

      const plan =
        this.dataset.vip;

      const price =
        Number(this.dataset.price);


      purchaseVip(
        plan,
        price,
        this
      );

    }
  );

});


/* =====================================================
   MENU MOBILE
===================================================== */

function openSidebar() {

  sidebar.classList.add("open");

  overlay.classList.add("show");

}


function closeSidebar() {

  sidebar.classList.remove("open");

  overlay.classList.remove("show");

}


menuToggle.addEventListener(
  "click",
  openSidebar
);


overlay.addEventListener(
  "click",
  closeSidebar
);


/* =====================================================
   NAVIGATION
===================================================== */

document
  .querySelectorAll(".nav button")
  .forEach(button => {

    button.addEventListener(
      "click",
      function() {

        const page =
          this.dataset.page;


        switch (page) {

          case "dashboard":

            window.location.href =
              "dash.html";

            break;


          case "investissements":

            alert(
              "La page Investissements sera créée ensuite."
            );

            break;


          case "activites":

            alert(
              "La page Mes activités sera créée ensuite."
            );

            break;


          case "fidelite":

            alert(
              "La page Fidélité sera créée ensuite."
            );

            break;


          case "parrainage":

            alert(
              "La page Parrainage sera créée ensuite."
            );

            break;


          case "historique":

            alert(
              "La page Historique sera créée ensuite."
            );

            break;


          case "support":

            alert(
              "La page Support sera créée ensuite."
            );

            break;


          case "notifications":

            alert(
              "La page Notifications sera créée ensuite."
            );

            break;

        }


        closeSidebar();

      }

    );

  });


/* =====================================================
   NOTIFICATIONS
===================================================== */

notificationButton.addEventListener(
  "click",
  function() {

    alert(
      "La page Notifications sera créée ensuite."
    );

  }
);


/* =====================================================
   DECONNEXION
===================================================== */

logoutButton.addEventListener(
  "click",
  async function() {

    logoutButton.disabled =
      true;

    logoutButton.textContent =
      "Déconnexion...";


    try {

      await fetch(
        API.logout,
        {

          method: "POST",

          credentials: "include"

        }
      );

    } catch (error) {

      console.error(
        "Erreur déconnexion :",
        error
      );

    }


    window.location.href =
      "index.html";

  }
);


/* =====================================================
   INITIALISATION
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    const user =
      await loadUser();

    renderUser(user);

  }
);