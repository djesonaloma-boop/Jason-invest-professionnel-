"use strict";

/*
=========================================================
JASON INVEST
PAGE INVESTISSEMENT
=========================================================

Fonctionnement :

1. L'utilisateur clique sur "Investir"
2. Le montant choisi est récupéré
3. Redirection vers translation.html
4. Le montant est envoyé dans l'URL
5. translation.js pourra remplir automatiquement
   le champ du dépôt

Exemple :

500 000 FC
      ↓
Investir
      ↓
translation.html?amount=500000
      ↓
Montant = 500 000 FC
=========================================================
*/


/* =====================================================
   API
===================================================== */

const API = {
    me: "/api/user/me",
    investments: "/api/investments",
    logout: "/api/auth/logout"
};


/* =====================================================
   ELEMENTS
===================================================== */

const balanceElement =
    document.getElementById("balance");

const sideName =
    document.getElementById("sideName");

const sideEmail =
    document.getElementById("sideEmail");

const avatar =
    document.getElementById("avatar");

const messageElement =
    document.getElementById("investmentMessage");

const historyElement =
    document.getElementById("investmentHistory");

const logoutButton =
    document.getElementById("logoutButton");

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");


/*
IMPORTANT :

Le HTML utilise :

class="invest-btn"

et non :

class="plan-button"
*/

const planButtons =
    document.querySelectorAll(".invest-btn");


/* =====================================================
   FORMAT FC
===================================================== */

function formatFC(value) {

    const number = Number(value || 0);

    return new Intl.NumberFormat("fr-FR")
        .format(number) + " FC";
}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
    text,
    type = "success"
) {

    if (!messageElement) return;

    messageElement.textContent = text;

    messageElement.className =
        "message show " + type;
}


/* =====================================================
   CACHER MESSAGE
===================================================== */

function hideMessage() {

    if (!messageElement) return;

    messageElement.className =
        "message";

    messageElement.textContent = "";
}


/* =====================================================
   CHARGER UTILISATEUR
===================================================== */

async function loadUser() {

    try {

        const response = await fetch(
            API.me,
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


        if (!response.ok ||
            !data.success) {

            throw new Error(
                data.message ||
                "Impossible de récupérer votre compte."
            );
        }


        const user =
            data.user || data;


        const name =
            user.name ||
            user.fullName ||
            "Utilisateur";


        const email =
            user.email ||
            "";


        const balance =
            user.balance_fc ??
            user.balance ??
            0;


        if (sideName) {

            sideName.textContent =
                name;
        }


        if (sideEmail) {

            sideEmail.textContent =
                email;
        }


        if (avatar) {

            avatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();
        }


        if (balanceElement) {

            balanceElement.textContent =
                formatFC(balance);
        }


    } catch (error) {

        console.error(
            "Erreur chargement utilisateur :",
            error
        );

        showMessage(
            "Impossible de charger les informations du compte.",
            "error"
        );
    }
}


/* =====================================================
   ALLER VERS LE DEPOT
===================================================== */

function goToDeposit(amount) {

    hideMessage();


    const numericAmount =
        Number(amount);


    /* Vérification */

    if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
    ) {

        showMessage(
            "Montant d'investissement invalide.",
            "error"
        );

        return;
    }


    /* Minimum */

    if (numericAmount < 20000) {

        showMessage(
            "Le montant minimum est de 20 000 FC.",
            "error"
        );

        return;
    }


    /* Maximum */

    if (numericAmount > 5000000) {

        showMessage(
            "Le montant maximum est de 5 000 000 FC.",
            "error"
        );

        return;
    }


    /*
    Redirection vers la page dépôt.

    Le montant est placé dans l'URL.
    */

    const url =
        "translation.html?amount=" +
        encodeURIComponent(
            numericAmount
        );


    console.log(
        "Redirection dépôt :",
        url
    );


    window.location.href =
        url;
}


/* =====================================================
   BOUTONS DES PLANS
===================================================== */

planButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                /*
                Récupère :

                data-amount="500000"
                */

                const amount =
                    this.getAttribute(
                        "data-amount"
                    );


                console.log(
                    "Plan sélectionné :",
                    amount
                );


                if (!amount) {

                    showMessage(
                        "Le montant de ce plan est introuvable.",
                        "error"
                    );

                    return;
                }


                /*
                ON NE CRÉE PAS ENCORE
                L'INVESTISSEMENT.

                On envoie le client
                vers le dépôt.
                */

                goToDeposit(
                    amount
                );

            }
        );

    }
);


/* =====================================================
   INVESTISSEMENT PERSONNALISÉ
===================================================== */

const customAmount =
    document.getElementById(
        "customAmount"
    );


const customInvestButton =
    document.getElementById(
        "customInvestButton"
    );


if (customInvestButton) {

    customInvestButton.addEventListener(
        "click",
        function() {

            if (!customAmount) {

                showMessage(
                    "Champ de montant introuvable.",
                    "error"
                );

                return;
            }


            const value =
                customAmount.value.trim();


            if (!value) {

                showMessage(
                    "Veuillez entrer un montant.",
                    "error"
                );

                customAmount.focus();

                return;
            }


            const amount =
                Number(value);


            if (
                !Number.isFinite(amount)
            ) {

                showMessage(
                    "Veuillez entrer un montant valide.",
                    "error"
                );

                customAmount.focus();

                return;
            }


            goToDeposit(
                amount
            );

        }
    );
}


/* =====================================================
   HISTORIQUE
===================================================== */

async function loadInvestments() {

    if (!historyElement) return;


    try {

        const response =
            await fetch(
                API.investments,
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

            return;
        }


        const data =
            await response.json();


        const investments =
            data.investments || [];


        if (
            !Array.isArray(
                investments
            ) ||
            investments.length === 0
        ) {

            historyElement.innerHTML = `
                <i class="fa-solid fa-folder-open"></i>
                Aucun investissement enregistré.
            `;

            return;
        }


        historyElement.innerHTML = "";


        investments.forEach(
            function(investment) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.style.padding =
                    "18px";


                item.style.borderBottom =
                    "1px solid #1a304b";


                const plan =
                    investment.plan ||
                    "Investissement";


                const amount =
                    investment.amount ||
                    investment.amount_fc ||
                    0;


                const status =
                    investment.status ||
                    "pending";


                item.innerHTML = `
                    <div style="
                        display:flex;
                        justify-content:space-between;
                        gap:15px;
                        flex-wrap:wrap;
                    ">

                        <div>

                            <strong>
                                ${escapeHTML(plan)}
                            </strong>

                            <div style="
                                color:#8295ad;
                                font-size:12px;
                                margin-top:6px;
                            ">
                                ${escapeHTML(status)}
                            </div>

                        </div>

                        <strong>
                            ${formatFC(amount)}
                        </strong>

                    </div>
                `;


                historyElement.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Erreur historique :",
            error
        );
    }
}


/* =====================================================
   PROTECTION HTML
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =====================================================
   DECONNEXION
===================================================== */

async function logout() {

    if (!logoutButton) return;


    logoutButton.disabled =
        true;


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


/* =====================================================
   MENU MOBILE
===================================================== */

if (
    menuToggle &&
    sidebar
) {

    menuToggle.addEventListener(
        "click",
        function() {

            sidebar.classList.toggle(
                "open"
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
   DEMARRAGE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "JASON INVEST chargé."
        );


        console.log(
            "Boutons Investir trouvés :",
            planButtons.length
        );


        await loadUser();

        await loadInvestments();

    }
);