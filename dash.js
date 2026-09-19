"use strict";

/*
=========================================================
 JASON INVEST
 DASH.JS
 Tableau de bord + calculatrice d'investissement
=========================================================

IMPORTANT :
- Aucun faux solde n'est créé.
- Les données du compte viennent du backend.
- Les investissements réels doivent être validés
  par le serveur.
- Les rendements affichés sont des estimations
  illustratives et ne constituent pas une garantie.
=========================================================
*/


/* =====================================================
   CONFIGURATION API
===================================================== */

const API = {
  me: "/api/user/me",
  logout: "/api/auth/logout",
  createInvestment: "/api/investments/create"
};


/* =====================================================
   PARAMÈTRES INVESTISSEMENT
===================================================== */

const MIN_INVESTMENT = 20000;
const MAX_INVESTMENT = 5000000;

/*
  Taux illustratif utilisé uniquement par
  la calculatrice du tableau de bord.

  Ce taux ne doit PAS être considéré comme
  un rendement garanti.
*/

const ESTIMATED_DAILY_RATE = 0.08;


/* =====================================================
   ELEMENTS DU DASHBOARD
===================================================== */

const sidebar =
  document.getElementById("sidebar");

const overlay =
  document.getElementById("overlay");

const menuToggle =
  document.getElementById("menuToggle");

const welcomeName =
  document.getElementById("welcomeName");

const sidebarUserName =
  document.getElementById("sidebarUserName");

const sidebarUserEmail =
  document.getElementById("sidebarUserEmail");

const userAvatar =
  document.getElementById("userAvatar");

const balance =
  document.getElementById("balance");

const investment =
  document.getElementById("investment");

const points =
  document.getElementById("points");

const vipLevel =
  document.getElementById("vipLevel");

const vipCardLevel =
  document.getElementById("vipCardLevel");

const accountName =
  document.getElementById("accountName");

const accountEmail =
  document.getElementById("accountEmail");

const accountPhone =
  document.getElementById("accountPhone");

const accountStatus =
  document.getElementById("accountStatus");

const logoutButton =
  document.getElementById("logoutButton");

const vipButton =
  document.getElementById("vipButton");

const notificationButton =
  document.getElementById("notificationButton");

const historyButton =
  document.getElementById("historyButton");


/* =====================================================
   ELEMENTS CALCULATRICE
===================================================== */

/*
  Ces éléments sont optionnels.

  Si tu ajoutes la calculatrice dans dash.html,
  le JS fonctionnera automatiquement.

  IDs attendus :

  investmentAmount
  investmentDaily
  investmentMonthly
  investmentTotal
  calculateInvestmentButton
  investCalculatorButton
  investmentCalculatorMessage
*/

const investmentAmount =
  document.getElementById("investmentAmount");

const investmentDaily =
  document.getElementById("investmentDaily");

const investmentMonthly =
  document.getElementById("investmentMonthly");

const investmentTotal =
  document.getElementById("investmentTotal");

const calculateInvestmentButton =
  document.getElementById(
    "calculateInvestmentButton"
  );

const investCalculatorButton =
  document.getElementById(
    "investCalculatorButton"
  );

const investmentCalculatorMessage =
  document.getElementById(
    "investmentCalculatorMessage"
  );


/* =====================================================
   FORMATAGE FC
===================================================== */

function formatFC(value) {

  const number = Number(value || 0);

  return (
    number.toLocaleString("fr-FR") +
    " FC"
  );

}


/* =====================================================
   FORMATAGE NOMBRE
===================================================== */

function formatNumber(value) {

  const number =
    Number(value || 0);

  return number.toLocaleString("fr-FR");

}


/* =====================================================
   INITIAL AVATAR
===================================================== */

function createInitial(name) {

  if (!name) {
    return "U";
  }

  return name
    .trim()
    .charAt(0)
    .toUpperCase();

}


/* =====================================================
   AFFICHER MESSAGE CALCULATRICE
===================================================== */

function showCalculatorMessage(
  message,
  type = "error"
) {

  if (!investmentCalculatorMessage) {
    return;
  }

  investmentCalculatorMessage.textContent =
    message;

  investmentCalculatorMessage.className =
    "calculator-message " + type;

}


/* =====================================================
   CACHER MESSAGE
===================================================== */

function hideCalculatorMessage() {

  if (!investmentCalculatorMessage) {
    return;
  }

  investmentCalculatorMessage.textContent =
    "";

  investmentCalculatorMessage.className =
    "calculator-message";

}


/* =====================================================
   CALCULER INVESTISSEMENT
===================================================== */

function calculateInvestment() {

  if (!investmentAmount) {
    return null;
  }

  const amount =
    Number(investmentAmount.value);


  /* MONTANT VIDE */

  if (!amount) {

    showCalculatorMessage(
      "Veuillez saisir un montant.",
      "error"
    );

    return null;

  }


  /* MINIMUM */

  if (amount < MIN_INVESTMENT) {

    showCalculatorMessage(
      "Le montant minimum est de 20 000 FC.",
      "error"
    );

    return null;

  }


  /* MAXIMUM */

  if (amount > MAX_INVESTMENT) {

    showCalculatorMessage(
      "Le montant maximum est de 5 000 000 FC.",
      "error"
    );

    return null;

  }


  /*
    CALCUL ILLUSTRATIF

    Exemple :
    100 000 FC × 8 % = 8 000 FC/jour

    8 000 × 30 = 240 000 FC

    Total = 340 000 FC

    Ces chiffres sont uniquement
    illustratifs.
  */

  const dailyGain =
    Math.round(
      amount *
      ESTIMATED_DAILY_RATE
    );


  const monthlyGain =
    dailyGain * 30;


  const total =
    amount + monthlyGain;


  /* AFFICHAGE */

  if (investmentDaily) {

    investmentDaily.textContent =
      formatFC(dailyGain);

  }


  if (investmentMonthly) {

    investmentMonthly.textContent =
      formatFC(monthlyGain);

  }


  if (investmentTotal) {

    investmentTotal.textContent =
      formatFC(total);

  }


  showCalculatorMessage(
    "Calcul effectué à titre illustratif. Le rendement réel n'est pas garanti.",
    "info"
  );


  return {
    amount,
    dailyGain,
    monthlyGain,
    total
  };

}


/* =====================================================
   INVESTIR DEPUIS LA CALCULATRICE
===================================================== */

async function createInvestmentFromCalculator() {

  const calculation =
    calculateInvestment();


  if (!calculation) {
    return;
  }


  const confirmed =
    window.confirm(
      "Confirmer une demande d'investissement de " +
      formatFC(calculation.amount) +
      " ?"
    );


  if (!confirmed) {
    return;
  }


  if (investCalculatorButton) {

    investCalculatorButton.disabled =
      true;

    investCalculatorButton.textContent =
      "Traitement...";

  }


  try {

    const response =
      await fetch(
        API.createInvestment,
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

            plan: "personnalise",

            amount:
              calculation.amount

          })

        }
      );


    const data =
      await response
        .json()
        .catch(() => null);


    /* SESSION EXPIRÉE */

    if (response.status === 401) {

      window.location.href =
        "index.html";

      return;

    }


    /* ERREUR SERVEUR */

    if (
      !response.ok ||
      !data ||
      !data.success
    ) {

      throw new Error(
        data &&
        data.message
          ? data.message
          : "La demande d'investissement n'a pas pu être enregistrée."
      );

    }


    showCalculatorMessage(
      "Votre demande d'investissement a été enregistrée et doit être validée par le serveur.",
      "success"
    );


    /*
      On recharge les données du compte.

      Le solde n'est donc jamais modifié
      directement par le navigateur.
    */

    await loadUser();


  } catch (error) {

    console.error(
      "Erreur investissement :",
      error
    );


    showCalculatorMessage(
      error.message ||
      "Une erreur est survenue.",
      "error"
    );


  } finally {

    if (investCalculatorButton) {

      investCalculatorButton.disabled =
        false;

      investCalculatorButton.innerHTML =
        '<i class="fa-solid fa-chart-line"></i> Investir';

    }

  }

}


/* =====================================================
   AFFICHER UTILISATEUR
===================================================== */

function renderUser(user) {

  if (!user) {
    return;
  }


  const name =
    user.name ||
    "Utilisateur";

  const email =
    user.email ||
    "—";

  const phone =
    user.phone ||
    "—";


  /* NOM */

  if (welcomeName) {

    welcomeName.textContent =
      name;

  }


  if (sidebarUserName) {

    sidebarUserName.textContent =
      name;

  }


  if (accountName) {

    accountName.textContent =
      name;

  }


  /* EMAIL */

  if (sidebarUserEmail) {

    sidebarUserEmail.textContent =
      email;

  }


  if (accountEmail) {

    accountEmail.textContent =
      email;

  }


  /* TELEPHONE */

  if (accountPhone) {

    accountPhone.textContent =
      phone;

  }


  /* AVATAR */

  if (userAvatar) {

    userAvatar.textContent =
      createInitial(name);

  }


  /* SOLDE */

  if (balance) {

    balance.textContent =
      formatFC(user.balance);

  }


  /* INVESTISSEMENT */

  if (investment) {

    investment.textContent =
      formatFC(user.investment);

  }


  /* POINTS */

  if (points) {

    points.textContent =
      formatNumber(user.points);

  }


  /* VIP */

  const vip =
    user.vipLevel ||
    "Aucun";


  if (vipLevel) {

    vipLevel.textContent =
      vip;

  }


  if (vipCardLevel) {

    vipCardLevel.textContent =
      vip;

  }


  /* STATUT */

  const status =
    user.status ||
    "active";


  if (accountStatus) {

    if (status === "active") {

      accountStatus.textContent =
        "Actif";

    } else {

      accountStatus.textContent =
        status;

    }

  }

}


/* =====================================================
   CHARGER LE COMPTE
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


    /* UTILISATEUR NON CONNECTÉ */

    if (response.status === 401) {

      window.location.href =
        "index.html";

      return;

    }


    const data =
      await response
        .json()
        .catch(() => null);


    if (!response.ok || !data) {

      throw new Error(
        "Impossible de charger le compte."
      );

    }


    if (
      !data.success ||
      !data.user
    ) {

      throw new Error(
        "Session utilisateur invalide."
      );

    }


    renderUser(
      data.user
    );


  } catch (error) {

    console.error(
      "Erreur chargement compte :",
      error
    );

  }

}


/* =====================================================
   DECONNEXION
===================================================== */

async function logout() {

  if (logoutButton) {

    logoutButton.disabled =
      true;

    logoutButton.textContent =
      "Déconnexion...";

  }


  try {

    const response =
      await fetch(
        API.logout,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );


    if (!response.ok) {

      console.warn(
        "Déconnexion serveur non confirmée."
      );

    }


  } catch (error) {

    console.error(
      "Erreur déconnexion :",
      error
    );


  } finally {

    window.location.href =
      "index.html";

  }

}


/* =====================================================
   MENU MOBILE
===================================================== */

function openSidebar() {

  if (sidebar) {

    sidebar.classList.add(
      "open"
    );

  }


  if (overlay) {

    overlay.classList.add(
      "show"
    );

  }

}


function closeSidebar() {

  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }


  if (overlay) {

    overlay.classList.remove(
      "show"
    );

  }

}


/* =====================================================
   MENU MOBILE EVENTS
===================================================== */

if (menuToggle) {

  menuToggle.addEventListener(
    "click",
    openSidebar
  );

}


if (overlay) {

  overlay.addEventListener(
    "click",
    closeSidebar
  );

}


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


        if (page === "dashboard") {

          window.location.href =
            "dash.html";

          return;

        }


        if (
          page ===
          "investissements"
        ) {

          window.location.href =
            "investissement.html";

          return;

        }


        if (page === "activites") {

          alert(
            "La page Mes activités sera créée ensuite."
          );

          return;

        }


        if (page === "fidelite") {

          alert(
            "La page Fidélité sera créée ensuite."
          );

          return;

        }


        if (page === "parrainage") {

          window.location.href =
            "profil.html";

          return;

        }


        if (page === "historique") {

          alert(
            "La page Historique sera créée ensuite."
          );

          return;

        }


        if (page === "support") {

          alert(
            "La page Support sera créée ensuite."
          );

          return;

        }


        if (page === "notifications") {

          alert(
            "Aucune nouvelle notification."
          );

          return;

        }


        closeSidebar();

      }

    );

  });


/* =====================================================
   ACTIONS RAPIDES
===================================================== */

document
  .querySelectorAll(".quick-action")
  .forEach(button => {

    button.addEventListener(
      "click",
      function() {

        const action =
          this.dataset.action;


        if (
          action ===
          "deposit"
        ) {

          window.location.href =
            "translation.html";

          return;

        }


        if (
          action ===
          "withdraw"
        ) {

          window.location.href =
            "translation.html";

          return;

        }


        if (
          action ===
          "vip"
        ) {

          window.location.href =
            "vip.html";

          return;

        }


        if (
          action ===
          "profile"
        ) {

          window.location.href =
            "profil.html";

          return;

        }

      }

    );

  });


/* =====================================================
   BOUTON VIP
===================================================== */

if (vipButton) {

  vipButton.addEventListener(
    "click",
    function() {

      window.location.href =
        "vip.html";

    }
  );

}


/* =====================================================
   HISTORIQUE
===================================================== */

if (historyButton) {

  historyButton.addEventListener(
    "click",
    function() {

      alert(
        "La page Historique sera créée ensuite."
      );

    }
  );

}


/* =====================================================
   NOTIFICATIONS
===================================================== */

if (notificationButton) {

  notificationButton.addEventListener(
    "click",
    function() {

      alert(
        "Aucune nouvelle notification."
      );

    }
  );

}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    logout
  );

}


/* =====================================================
   CALCULATRICE
===================================================== */

if (calculateInvestmentButton) {

  calculateInvestmentButton.addEventListener(
    "click",
    calculateInvestment
  );

}


if (investCalculatorButton) {

  investCalculatorButton.addEventListener(
    "click",
    createInvestmentFromCalculator
  );

}


/* =====================================================
   CALCUL AUTOMATIQUE EN CHANGEANT LE MONTANT
===================================================== */

if (investmentAmount) {

  investmentAmount.addEventListener(
    "input",
    function() {

      /*
        On efface seulement l'ancien message.
      */

      hideCalculatorMessage();


      const amount =
        Number(this.value);


      if (!amount) {

        if (investmentDaily) {
          investmentDaily.textContent =
            "0 FC";
        }

        if (investmentMonthly) {
          investmentMonthly.textContent =
            "0 FC";
        }

        if (investmentTotal) {
          investmentTotal.textContent =
            "0 FC";
        }

        return;

      }


      /*
        Calcul automatique uniquement
        lorsque le montant est dans
        la plage autorisée.
      */

      if (
        amount >= MIN_INVESTMENT &&
        amount <= MAX_INVESTMENT
      ) {

        const daily =
          Math.round(
            amount *
            ESTIMATED_DAILY_RATE
          );

        const monthly =
          daily * 30;

        const total =
          amount + monthly;


        if (investmentDaily) {

          investmentDaily.textContent =
            formatFC(daily);

        }


        if (investmentMonthly) {

          investmentMonthly.textContent =
            formatFC(monthly);

        }


        if (investmentTotal) {

          investmentTotal.textContent =
            formatFC(total);

        }

      }

    }
  );

}


/* =====================================================
   INITIALISATION
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadUser();

  }
);