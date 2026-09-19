"use strict";

/*
=========================================================
 JASON INVEST
 PROFIL.JS
=========================================================

GET  /api/user/me
PUT  /api/user/profile
POST /api/auth/logout

Le code de parrainage est généré par le BACKEND.
Ce fichier l'affiche uniquement.
=========================================================
*/


/* =====================================================
   API
===================================================== */

const API = {

  me: "/api/user/me",

  updateProfile: "/api/user/profile",

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

const profileForm =
  document.getElementById("profileForm");

const saveButton =
  document.getElementById("saveButton");

const profileMessage =
  document.getElementById("profileMessage");

const sidebarUserName =
  document.getElementById("sidebarUserName");

const sidebarUserEmail =
  document.getElementById("sidebarUserEmail");

const topAvatar =
  document.getElementById("topAvatar");

const bigAvatar =
  document.getElementById("bigAvatar");

const profileName =
  document.getElementById("profileName");

const profileEmail =
  document.getElementById("profileEmail");

const profileStatus =
  document.getElementById("profileStatus");

const profileBalance =
  document.getElementById("profileBalance");

const profilePoints =
  document.getElementById("profilePoints");

const profileVip =
  document.getElementById("profileVip");

const profileNameInput =
  document.getElementById("profileNameInput");

const profileEmailInput =
  document.getElementById("profileEmailInput");

const profilePhoneInput =
  document.getElementById("profilePhoneInput");

const logoutButton =
  document.getElementById("logoutButton");

const notificationButton =
  document.getElementById("notificationButton");


/* =====================================================
   PARRAINAGE
===================================================== */

const referralCode =
  document.getElementById("referralCode");

const copyReferralButton =
  document.getElementById("copyReferralButton");


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(message, type) {

  if (!profileMessage) {
    return;
  }

  profileMessage.textContent =
    message;

  profileMessage.className =
    "message show " + type;

}


function clearMessage() {

  if (!profileMessage) {
    return;
  }

  profileMessage.textContent =
    "";

  profileMessage.className =
    "message";

}


/* =====================================================
   AVATAR
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
   FORMATAGE FC
===================================================== */

function formatFC(value) {

  const number =
    Number(value || 0);

  return number.toLocaleString("fr-FR")
    + " FC";

}


/* =====================================================
   CODE DE PARRAINAGE
===================================================== */

function renderReferral(user) {

  if (!referralCode) {
    return;
  }


  const code =
    user.referralCode ||
    user.referral_code ||
    "";


  if (code) {

    referralCode.textContent =
      code;

    referralCode.dataset.code =
      code;

  } else {

    referralCode.textContent =
      "Non disponible";

    referralCode.dataset.code =
      "";

  }

}


/* =====================================================
   COPIER LE CODE
===================================================== */

async function copyReferralCode() {

  if (!referralCode) {
    return;
  }


  const code =
    referralCode.dataset.code ||
    referralCode.textContent.trim();


  if (
    !code ||
    code === "Non disponible" ||
    code === "Chargement..."
  ) {

    showMessage(
      "Votre code de parrainage n'est pas disponible.",
      "error"
    );

    return;

  }


  try {

    await navigator.clipboard.writeText(code);


    if (copyReferralButton) {

      copyReferralButton.disabled =
        true;

      copyReferralButton.innerHTML =
        '<i class="fa-solid fa-check"></i> Copié';


      setTimeout(() => {

        copyReferralButton.disabled =
          false;

        copyReferralButton.innerHTML =
          '<i class="fa-regular fa-copy"></i> Copier';

      }, 1800);

    }


    showMessage(
      "Code de parrainage copié.",
      "success"
    );


  } catch (error) {

    console.error(
      "Erreur de copie :",
      error
    );


    showMessage(
      "Impossible de copier le code.",
      "error"
    );

  }

}


if (copyReferralButton) {

  copyReferralButton.addEventListener(
    "click",
    copyReferralCode
  );

}


/* =====================================================
   AFFICHER LE PROFIL
===================================================== */

function renderProfile(user) {

  if (!user) {
    return;
  }


  const name =
    user.name || "Utilisateur";

  const email =
    user.email || "—";

  const phone =
    user.phone || "";


  /* ===================================================
     INFORMATIONS
  =================================================== */

  if (profileName) {

    profileName.textContent =
      name;

  }


  if (profileEmail) {

    profileEmail.textContent =
      email;

  }


  if (sidebarUserName) {

    sidebarUserName.textContent =
      name;

  }


  if (sidebarUserEmail) {

    sidebarUserEmail.textContent =
      email;

  }


  /* ===================================================
     AVATARS
  =================================================== */

  const initial =
    getInitial(name);


  if (topAvatar) {

    topAvatar.textContent =
      initial;

  }


  if (bigAvatar) {

    bigAvatar.innerHTML =
      "";

    bigAvatar.textContent =
      initial;

  }


  if (profileNameInput) {

    profileNameInput.value =
      name;

  }


  if (profileEmailInput) {

    profileEmailInput.value =
      email;

  }


  if (profilePhoneInput) {

    profilePhoneInput.value =
      phone;

  }


  /* ===================================================
     STATISTIQUES
  =================================================== */

  if (profileBalance) {

    profileBalance.textContent =
      formatFC(user.balance);

  }


  if (profilePoints) {

    profilePoints.textContent =
      Number(user.points || 0)
        .toLocaleString("fr-FR");

  }


  if (profileVip) {

    profileVip.textContent =
      user.vipLevel || "Aucun";

  }


  /* ===================================================
     STATUT
  =================================================== */

  if (profileStatus) {

    const status =
      user.status || "active";


    if (status === "active") {

      profileStatus.innerHTML =
        '<i class="fa-solid fa-circle-check"></i> Compte actif';

    } else {

      profileStatus.innerHTML =
        '<i class="fa-solid fa-circle-info"></i> ' +
        status;

    }

  }


  /* ===================================================
     PARRAINAGE
  =================================================== */

  renderReferral(user);

}


/* =====================================================
   CHARGER LE PROFIL
===================================================== */

async function loadProfile() {

  try {

    if (referralCode) {

      referralCode.textContent =
        "Chargement...";

      referralCode.dataset.code =
        "";

    }


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


    /* =================================================
       SESSION ABSENTE
    ================================================= */

    if (response.status === 401) {

      window.location.href =
        "index.html";

      return;

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
        "Impossible de récupérer votre profil."
      );

    }


    renderProfile(
      data.user
    );


  } catch (error) {

    console.error(
      "Erreur profil :",
      error
    );


    if (referralCode) {

      referralCode.textContent =
        "Non disponible";

      referralCode.dataset.code =
        "";

    }


    showMessage(
      error.message ||
      "Erreur lors du chargement du profil.",
      "error"
    );

  }

}


/* =====================================================
   MODIFIER LE PROFIL
===================================================== */

if (profileForm) {

  profileForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();

      clearMessage();


      const name =
        profileNameInput.value.trim();

      const phone =
        profilePhoneInput.value.trim();


      /* =================================================
         VALIDATION
      ================================================= */

      if (name.length < 2) {

        showMessage(
          "Veuillez entrer un nom valide.",
          "error"
        );

        return;

      }


      if (phone.length < 6) {

        showMessage(
          "Veuillez entrer un numéro de téléphone valide.",
          "error"
        );

        return;

      }


      saveButton.disabled =
        true;

      saveButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Enregistrement...';


      try {

        const response =
          await fetch(
            API.updateProfile,
            {

              method: "PUT",

              credentials: "include",

              headers: {

                "Content-Type":
                  "application/json",

                "Accept":
                  "application/json"

              },

              body: JSON.stringify({

                name: name,

                phone: phone

              })

            }
          );


        const data =
          await response.json()
            .catch(() => ({}));


        /* SESSION EXPIRÉE */

        if (response.status === 401) {

          window.location.href =
            "index.html";

          return;

        }


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Impossible de modifier le profil."
          );

        }


        showMessage(
          data.message ||
          "Profil mis à jour avec succès.",
          "success"
        );


        /* =================================================
           ACTUALISER LES DONNÉES
        ================================================= */

        if (data.user) {

          renderProfile(
            data.user
          );

        } else {

          await loadProfile();

        }


      } catch (error) {

        console.error(
          "Erreur modification profil :",
          error
        );


        showMessage(
          error.message ||
          "Une erreur est survenue.",
          "error"
        );


      } finally {

        saveButton.disabled =
          false;

        saveButton.innerHTML =
          '<i class="fa-solid fa-floppy-disk"></i> Enregistrer les modifications';

      }

    }
  );

}


/* =====================================================
   MENU MOBILE
===================================================== */

function openSidebar() {

  if (sidebar) {

    sidebar.classList.add("open");

  }


  if (overlay) {

    overlay.classList.add("show");

  }

}


function closeSidebar() {

  if (sidebar) {

    sidebar.classList.remove("open");

  }


  if (overlay) {

    overlay.classList.remove("show");

  }

}


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

if (notificationButton) {

  notificationButton.addEventListener(
    "click",
    function() {

      alert(
        "La page Notifications sera créée ensuite."
      );

    }
  );

}


/* =====================================================
   DECONNEXION
===================================================== */

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async function() {

      logoutButton.disabled =
        true;

      logoutButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Déconnexion...';


      try {

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

}


/* =====================================================
   INITIALISATION
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadProfile();

  }
);