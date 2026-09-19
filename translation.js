"use strict";

/*
=========================================================
 JASON INVEST
 translation.js
 DEPOT / RETRAIT
=========================================================
*/

const API = {
  me: "/api/user/me",
  deposit: "/api/transactions/deposit",
  withdraw: "/api/transactions/withdraw",
  logout: "/api/auth/logout"
};


/* ======================================================
   CONFIGURATION DES PAIEMENTS
====================================================== */

const PAYMENT_METHODS = {
  "Orange Money": {
    available: true,
    number: "+243 847 500 590",
    accountName: "Glody Bwekandila"
  },

  "Airtel Money": {
    available: false,
    number: "",
    accountName: ""
  },

  "M-Pesa": {
    available: false,
    number: "",
    accountName: ""
  }
};


/* ======================================================
   ELEMENTS HTML
====================================================== */

const sidebar =
  document.getElementById("sidebar");

const menuButton =
  document.getElementById("menuButton");

const userName =
  document.getElementById("userName");

const userEmail =
  document.getElementById("userEmail");

const balance =
  document.getElementById("balance");

const depositTab =
  document.getElementById("depositTab");

const withdrawTab =
  document.getElementById("withdrawTab");

const operationTitle =
  document.getElementById("operationTitle");

const operationDescription =
  document.getElementById("operationDescription");

const operationForm =
  document.getElementById("operationForm");

const message =
  document.getElementById("message");

const phone =
  document.getElementById("phone");

const amount =
  document.getElementById("amount");

const reference =
  document.getElementById("reference");

const referenceGroup =
  document.getElementById("referenceGroup");

const submitButton =
  document.getElementById("submitButton");

const copyButton =
  document.getElementById("copyButton");

const logoutButton =
  document.getElementById("logoutButton");

const methods =
  document.querySelectorAll(".method");

const history =
  document.getElementById("history");


/* ======================================================
   ETAT
====================================================== */

let operationType = "deposit";

let selectedMethod = "Orange Money";


/* ======================================================
   AFFICHER UN MESSAGE
====================================================== */

function showMessage(
  text,
  type = "error"
) {

  if (!message) {
    return;
  }

  message.textContent =
    text;

  message.className =
    "message show " + type;
}


function hideMessage() {

  if (!message) {
    return;
  }

  message.textContent =
    "";

  message.className =
    "message";
}


/* ======================================================
   FORMATAGE FC
====================================================== */

function formatFC(value) {

  const number =
    Number(value || 0);

  return new Intl.NumberFormat(
    "fr-FR"
  ).format(number);
}


/* ======================================================
   CHARGER LE MONTANT DEPUIS INVESTISSEMENT
====================================================== */

function loadInvestmentAmount() {

  if (!amount) {
    return;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  const value =
    params.get("amount");

  if (!value) {
    return;
  }

  const numericValue =
    Number(value);

  if (
    !Number.isFinite(numericValue) ||
    numericValue <= 0
  ) {
    return;
  }

  amount.value =
    numericValue;

  showMessage(
    "Montant sélectionné automatiquement : " +
      formatFC(numericValue) +
      " FC.",
    "success"
  );
}


/* ======================================================
   SELECTIONNER ORANGE MONEY
====================================================== */

function selectOrangeMoney() {

  selectedMethod =
    "Orange Money";

  methods.forEach(
    function (method) {

      method.classList.remove(
        "selected"
      );

      if (
        method.dataset.method ===
        "Orange Money"
      ) {

        method.classList.add(
          "selected"
        );

      }

    }
  );


  if (submitButton) {

    submitButton.disabled =
      false;

  }
}


/* ======================================================
   CLIQUER SUR UN MOYEN DE PAIEMENT
====================================================== */

methods.forEach(
  function (method) {

    method.addEventListener(
      "click",
      function () {

        const methodName =
          method.dataset.method || "";

        const available =
          method.dataset.available ===
          "true";


        methods.forEach(
          function (item) {

            item.classList.remove(
              "selected"
            );

          }
        );


        method.classList.add(
          "selected"
        );


        selectedMethod =
          methodName;


        if (!available) {

          if (submitButton) {

            submitButton.disabled =
              true;

          }

          showMessage(
            methodName +
              " n'est pas encore disponible.",
            "error"
          );

          return;
        }


        if (submitButton) {

          submitButton.disabled =
            false;

        }


        showMessage(
          methodName +
            " sélectionné.",
          "success"
        );

      }
    );

  }
);


/* ======================================================
   COPIER NUMERO ORANGE MONEY
====================================================== */

if (copyButton) {

  copyButton.addEventListener(
    "click",
    async function () {

      const number =
        PAYMENT_METHODS[
          "Orange Money"
        ].number;


      try {

        if (
          navigator.clipboard &&
          navigator.clipboard.writeText
        ) {

          await navigator.clipboard.writeText(
            number
          );

        } else {

          const temporary =
            document.createElement(
              "textarea"
            );

          temporary.value =
            number;

          document.body.appendChild(
            temporary
          );

          temporary.select();

          document.execCommand(
            "copy"
          );

          temporary.remove();

        }


        copyButton.textContent =
          "✓ Numéro copié";


        setTimeout(
          function () {

            copyButton.textContent =
              "Copier le numéro";

          },
          2000
        );


      } catch (error) {

        alert(
          "Numéro Orange Money : " +
          number
        );

      }

    }
  );

}


/* ======================================================
   CHARGER LE COMPTE
====================================================== */

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


    if (
      response.status ===
      401
    ) {

      window.location.href =
        "index.html";

      return;

    }


    if (!response.ok) {

      console.error(
        "Erreur API utilisateur :",
        response.status
      );

      return;

    }


    const data =
      await response.json();


    const user =
      data.user;


    if (!user) {
      return;
    }


    if (userName) {

      userName.textContent =
        user.name ||
        "Utilisateur";

    }


    if (userEmail) {

      userEmail.textContent =
        user.email ||
        "";

    }


    if (balance) {

      balance.textContent =
        formatFC(
          user.balance_fc ??
          user.balance ??
          0
        );

    }


  } catch (error) {

    console.error(
      "Erreur chargement utilisateur :",
      error
    );

  }

}


/* ======================================================
   CHANGER VERS DEPOT
====================================================== */

function activateDeposit() {

  operationType =
    "deposit";


  if (depositTab) {

    depositTab.classList.add(
      "active"
    );

  }


  if (withdrawTab) {

    withdrawTab.classList.remove(
      "active"
    );

  }


  if (operationTitle) {

    operationTitle.textContent =
      "Effectuer un dépôt";

  }


  if (operationDescription) {

    operationDescription.textContent =
      "Ajoutez des fonds à votre compte JASON INVEST. Votre demande sera vérifiée avant validation.";

  }


  if (referenceGroup) {

    referenceGroup.style.display =
      "block";

  }


  if (reference) {

    reference.required =
      true;

  }


  if (submitButton) {

    submitButton.textContent =
      "Envoyer la demande de dépôt";

  }


  selectOrangeMoney();

}


/* ======================================================
   CHANGER VERS RETRAIT
====================================================== */

function activateWithdraw() {

  operationType =
    "withdraw";


  if (withdrawTab) {

    withdrawTab.classList.add(
      "active"
    );

  }


  if (depositTab) {

    depositTab.classList.remove(
      "active"
    );

  }


  if (operationTitle) {

    operationTitle.textContent =
      "Demander un retrait";

  }


  if (operationDescription) {

    operationDescription.textContent =
      "Demandez le retrait d'une partie de votre solde disponible.";

  }


  if (referenceGroup) {

    referenceGroup.style.display =
      "none";

  }


  if (reference) {

    reference.required =
      false;

    reference.value =
      "";

  }


  if (submitButton) {

    submitButton.textContent =
      "Envoyer la demande de retrait";

    submitButton.disabled =
      false;

  }

}


/* ======================================================
   BOUTON DEPOT
====================================================== */

if (depositTab) {

  depositTab.addEventListener(
    "click",
    function () {

      hideMessage();

      activateDeposit();

    }
  );

}


/* ======================================================
   BOUTON RETRAIT
====================================================== */

if (withdrawTab) {

  withdrawTab.addEventListener(
    "click",
    function () {

      hideMessage();

      activateWithdraw();

    }
  );

}


/* ======================================================
   VALIDATION DU FORMULAIRE
====================================================== */

function validateForm() {

  const phoneValue =
    phone
      ? phone.value.trim()
      : "";

  const amountValue =
    amount
      ? Number(amount.value)
      : 0;


  /* Moyen de paiement */

  if (!selectedMethod) {

    showMessage(
      "Veuillez sélectionner un moyen de paiement.",
      "error"
    );

    return false;
  }


  /* Dépôt */

  if (
    operationType ===
      "deposit" &&
    selectedMethod !==
      "Orange Money"
  ) {

    showMessage(
      "Orange Money est actuellement le seul moyen de dépôt disponible.",
      "error"
    );

    return false;
  }


  /* Téléphone */

  if (!phoneValue) {

    showMessage(
      "Veuillez entrer votre numéro de téléphone.",
      "error"
    );

    if (phone) {
      phone.focus();
    }

    return false;
  }


  if (phoneValue.length < 8) {

    showMessage(
      "Veuillez entrer un numéro de téléphone valide.",
      "error"
    );

    if (phone) {
      phone.focus();
    }

    return false;
  }


  /* Montant */

  if (
    !Number.isFinite(amountValue) ||
    amountValue <= 0
  ) {

    showMessage(
      "Veuillez entrer un montant valide.",
      "error"
    );

    if (amount) {
      amount.focus();
    }

    return false;
  }


  /* Minimum dépôt */

  if (
    operationType ===
      "deposit" &&
    amountValue < 20000
  ) {

    showMessage(
      "Le montant minimum d'un dépôt est de 20 000 FC.",
      "error"
    );

    if (amount) {
      amount.focus();
    }

    return false;
  }


  /* Référence */

  if (
    operationType ===
      "deposit"
  ) {

    const referenceValue =
      reference
        ? reference.value.trim()
        : "";


    if (!referenceValue) {

      showMessage(
        "Veuillez entrer la référence de votre transaction.",
        "error"
      );

      if (reference) {
        reference.focus();
      }

      return false;
    }

  }


  return true;
}


/* ======================================================
   ENVOYER DEPOT / RETRAIT
====================================================== */

async function sendOperation() {

  if (!validateForm()) {
    return;
  }


  const amountValue =
    Number(amount.value);

  const phoneValue =
    phone.value.trim();


  const payload = {

    amount:
      amountValue,

    paymentMethod:
      selectedMethod,

    phone:
      phoneValue

  };


  if (
    operationType ===
      "deposit"
  ) {

    payload.reference =
      reference.value.trim();

  }


  const endpoint =
    operationType ===
      "deposit"

      ? API.deposit

      : API.withdraw;


  if (submitButton) {

    submitButton.disabled =
      true;

    submitButton.textContent =
      "Envoi en cours...";

  }


  try {

    const response =
      await fetch(
        endpoint,
        {
          method: "POST",

          credentials:
            "include",

          headers: {

            "Content-Type":
              "application/json",

            "Accept":
              "application/json"

          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


    if (
      response.status ===
      401
    ) {

      window.location.href =
        "index.html";

      return;

    }


    const data =
      await response
        .json()
        .catch(
          function () {
            return {};
          }
        );


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "La demande n'a pas pu être envoyée."
      );

    }


    showMessage(
      data.message ||
        (
          operationType ===
          "deposit"

            ? "Votre demande de dépôt a été envoyée. Elle sera vérifiée par l'administration."

            : "Votre demande de retrait a été envoyée. Elle sera vérifiée par l'administration."
        ),
      "success"
    );


    /*
      On vide le formulaire
      après une demande réussie.
    */

    if (phone) {
      phone.value = "";
    }

    if (reference) {
      reference.value = "";
    }


    /*
      Le montant provenant de
      l'investissement reste affiché
      jusqu'à ce que l'utilisateur
      quitte la page.
    */


    await loadUser();


  } catch (error) {

    console.error(
      "Erreur opération :",
      error
    );


    showMessage(
      error.message ||
        "Une erreur est survenue.",
      "error"
    );


  } finally {

    if (submitButton) {

      if (
        operationType ===
        "deposit"
      ) {

        submitButton.textContent =
          "Envoyer la demande de dépôt";

        submitButton.disabled =
          false;

      } else {

        submitButton.textContent =
          "Envoyer la demande de retrait";

        submitButton.disabled =
          false;

      }

    }

  }

}


/* ======================================================
   FORMULAIRE
====================================================== */

if (operationForm) {

  operationForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      sendOperation();

    }
  );

}


/* ======================================================
   DECONNEXION
====================================================== */

async function logout() {

  try {

    await fetch(
      API.logout,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Accept":
            "application/json"
        }
      }
    );

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


if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    function (event) {

      event.preventDefault();

      logout();

    }
  );

}


/* ======================================================
   MENU MOBILE
====================================================== */

if (menuButton) {

  menuButton.addEventListener(
    "click",
    function () {

      if (sidebar) {

        sidebar.classList.toggle(
          "open"
        );

      }

    }
  );

}


/* ======================================================
   DEMARRAGE
====================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    console.log(
      "JASON INVEST - translation.js chargé"
    );


    /*
      Orange Money sélectionné
      automatiquement.
    */

    selectOrangeMoney();


    /*
      Charger le compte
    */

    await loadUser();


    /*
      Récupérer le montant
      choisi dans investissement.html
    */

    loadInvestmentAmount();

  }
);