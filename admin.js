/* =========================================================
   JASON INVEST
   ADMIN.JS
   Tableau de bord administrateur
   Navigation vers les fichiers admin-*.html
========================================================= */

"use strict";


/* =========================================================
   API
========================================================= */

const API = {

    ME: "/api/admin/me",
    STATS: "/api/admin/stats",
    USERS: "/api/admin/users",

    DEPOSITS: "/api/admin/deposits",
    WITHDRAWALS: "/api/admin/withdrawals",

    INVESTMENTS: "/api/admin/investments",
    VIP: "/api/admin/vip",

    TRANSACTIONS: "/api/admin/transactions",
    NOTIFICATIONS: "/api/admin/notifications",

    LOGOUT: "/api/auth/logout"

};


/* =========================================================
   PAGES ADMIN
========================================================= */

const ADMIN_PAGES = {

    dashboard: "admin.html",

    clients: "admin-client.html",

    deposits: "admin-depot.html",

    withdrawals: "admin-retrait.html",

    investments: "admin-investissement.html",

    vip: "admin-vip.html",

    transactions: "admin-transaction.html",

    notifications: "admin-notifications.html",

    assistant: "admin-assistant.html"

};


/* =========================================================
   DOM
========================================================= */

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");

const refreshButton =
    document.getElementById("refreshButton");

const logoutButton =
    document.getElementById("logoutButton");

const globalMessage =
    document.getElementById("globalMessage");

const welcomeName =
    document.getElementById("welcomeName");


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message, type = "info") {

    if (!globalMessage) {
        return;
    }

    globalMessage.textContent = message;

    globalMessage.className =
        "global-message " + type;

    globalMessage.style.display = "block";

    setTimeout(function () {

        globalMessage.style.display = "none";

    }, 4000);
}


/* =========================================================
   PROTECTION HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   FORMAT NOMBRE
========================================================= */

function formatNumber(value) {

    const number =
        Number(value || 0);

    return new Intl.NumberFormat(
        "fr-FR"
    ).format(number);
}


/* =========================================================
   FORMAT FC
========================================================= */

function formatFC(value) {

    return formatNumber(value) + " FC";

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
        return escapeHTML(value);
    }

    return date.toLocaleString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   REQUÊTE API
========================================================= */

async function apiRequest(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})
                },

                ...options
            }
        );

    let data = null;

    try {

        data =
            await response.json();

    } catch (error) {

        data = null;

    }

    if (!response.ok) {

        const message =
            data?.message ||
            data?.error ||
            `Erreur HTTP ${response.status}`;

        throw new Error(message);
    }

    return data;

}


/* =========================================================
   EXTRAIRE UNE LISTE
========================================================= */

function extractData(
    data,
    keys = []
) {

    if (Array.isArray(data)) {
        return data;
    }

    if (!data) {
        return [];
    }

    for (const key of keys) {

        if (
            Array.isArray(
                data[key]
            )
        ) {

            return data[key];

        }

    }

    if (
        Array.isArray(
            data.data
        )
    ) {

        return data.data;

    }

    return [];

}


/* =========================================================
   NAVIGATION DIRECTE
========================================================= */

function setupAdminNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-btn[data-section]"
        );

    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    /*
                     * Empêche l'ancien système
                     * openSection() de s'exécuter.
                     */

                    event.stopImmediatePropagation();

                    const section =
                        button.getAttribute(
                            "data-section"
                        );

                    const page =
                        ADMIN_PAGES[section];

                    console.log(
                        "JASON INVEST :",
                        section,
                        "→",
                        page
                    );

                    if (!page) {

                        console.error(
                            "Page inconnue :",
                            section
                        );

                        return;
                    }

                    closeMobileMenu();

                    window.location.assign(
                        page
                    );

                },
                true
            );

        }
    );

}


/* =========================================================
   MENU MOBILE
========================================================= */

function openMobileMenu() {

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

    if (mobileMenu) {

        mobileMenu.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


function closeMobileMenu() {

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

    if (mobileMenu) {

        mobileMenu.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


function setupMobileMenu() {

    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                if (
                    sidebar &&
                    sidebar.classList.contains(
                        "open"
                    )
                ) {

                    closeMobileMenu();

                } else {

                    openMobileMenu();

                }

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            function () {

                closeMobileMenu();

            }
        );

    }

}


/* =========================================================
   VÉRIFIER ADMIN
========================================================= */

async function checkAdmin() {

    try {

        const result =
            await apiRequest(
                API.ME
            );

        const user =
            result?.user ||
            result?.admin ||
            result?.data ||
            result;

        if (
            user &&
            user.role &&
            user.role !== "admin"
        ) {

            window.location.replace(
                "index.html"
            );

            return false;

        }

        if (welcomeName) {

            welcomeName.textContent =
                user?.name ||
                user?.nom ||
                user?.email ||
                "Administrateur";

        }

        return true;

    } catch (error) {

        console.warn(
            "Vérification admin :",
            error
        );

        /*
         * La navigation reste disponible
         * même si le backend n'est pas encore
         * configuré.
         */

        return true;

    }

}


/* =========================================================
   STATISTIQUES
========================================================= */

async function loadStats() {

    const totalClients =
        document.getElementById(
            "totalClients"
        );

    const totalDeposits =
        document.getElementById(
            "totalDeposits"
        );

    const totalWithdrawals =
        document.getElementById(
            "totalWithdrawals"
        );

    const totalInvestments =
        document.getElementById(
            "totalInvestments"
        );

    if (
        !totalClients &&
        !totalDeposits &&
        !totalWithdrawals &&
        !totalInvestments
    ) {

        return;

    }

    try {

        const result =
            await apiRequest(
                API.STATS
            );

        const stats =
            result?.stats ||
            result?.data ||
            result ||
            {};


        if (totalClients) {

            totalClients.textContent =
                formatNumber(
                    stats.totalClients ??
                    stats.clients ??
                    0
                );

        }


        if (totalDeposits) {

            totalDeposits.textContent =
                formatFC(
                    stats.totalDeposits ??
                    stats.deposits ??
                    0
                );

        }


        if (totalWithdrawals) {

            totalWithdrawals.textContent =
                formatFC(
                    stats.totalWithdrawals ??
                    stats.withdrawals ??
                    0
                );

        }


        if (totalInvestments) {

            totalInvestments.textContent =
                formatFC(
                    stats.totalInvestments ??
                    stats.investments ??
                    0
                );

        }

    } catch (error) {

        console.error(
            "Erreur statistiques :",
            error
        );

    }

}


/* =========================================================
   CLIENTS
========================================================= */

async function loadClients() {

    const container =
        document.getElementById(
            "clientsContainer"
        );

    if (!container) {
        return;
    }

    try {

        container.innerHTML =
            `<div class="loading">
                Chargement des clients...
             </div>`;

        const result =
            await apiRequest(
                API.USERS
            );

        const clients =
            extractData(
                result,
                [
                    "users",
                    "clients",
                    "data"
                ]
            );

        if (!clients.length) {

            container.innerHTML =
                `<div class="empty">
                    Aucun client trouvé.
                 </div>`;

            return;
        }

        let html = `
            <div class="table-wrapper">
                <table>

                    <thead>

                        <tr>
                            <th>Nom</th>
                            <th>Téléphone</th>
                            <th>Email</th>
                            <th>Solde</th>
                            <th>VIP</th>
                            <th>Points</th>
                            <th>Statut</th>
                            <th>Inscription</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        clients.forEach(
            function (client) {

                html += `
                    <tr>

                        <td>
                            ${escapeHTML(
                                client.name ||
                                client.nom ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                client.phone ||
                                client.telephone ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                client.email ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatFC(
                                client.balance_fc ??
                                client.balance ??
                                0
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                client.vip_level ||
                                client.vip ||
                                "Aucun"
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                client.points ||
                                0
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                client.status ||
                                "active"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                client.created_at
                            )}
                        </td>

                    </tr>
                `;

            }
        );

        html += `
                    </tbody>

                </table>
            </div>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            error
        );

        container.innerHTML =
            `<div class="error">
                Impossible de charger les clients.
             </div>`;

    }

}


/* =========================================================
   DÉPÔTS
========================================================= */

async function loadDeposits() {

    const container =
        document.getElementById(
            "depositsContainer"
        );

    if (!container) {
        return;
    }

    try {

        container.innerHTML =
            `<div class="loading">
                Chargement des dépôts...
             </div>`;

        const result =
            await apiRequest(
                API.DEPOSITS
            );

        const deposits =
            extractData(
                result,
                [
                    "deposits",
                    "data"
                ]
            );

        if (!deposits.length) {

            container.innerHTML =
                `<div class="empty">
                    Aucun dépôt.
                 </div>`;

            return;
        }

        let html = `
            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Client</th>
                            <th>Montant</th>
                            <th>Méthode</th>
                            <th>Référence</th>
                            <th>Date</th>
                            <th>Statut</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        deposits.forEach(
            function (deposit) {

                html += `
                    <tr>

                        <td>
                            ${escapeHTML(
                                deposit.user_name ||
                                deposit.name ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatFC(
                                deposit.amount
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                deposit.payment_method ||
                                deposit.method ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                deposit.reference ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                deposit.created_at
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                deposit.status ||
                                "pending"
                            )}
                        </td>

                    </tr>
                `;

            }
        );

        html += `
                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            error
        );

        container.innerHTML =
            `<div class="error">
                Impossible de charger les dépôts.
             </div>`;

    }

}


/* =========================================================
   RETRAITS
========================================================= */

async function loadWithdrawals() {

    const container =
        document.getElementById(
            "withdrawalsContainer"
        );

    if (!container) {
        return;
    }

    try {

        container.innerHTML =
            `<div class="loading">
                Chargement des retraits...
             </div>`;

        const result =
            await apiRequest(
                API.WITHDRAWALS
            );

        const withdrawals =
            extractData(
                result,
                [
                    "withdrawals",
                    "data"
                ]
            );

        if (!withdrawals.length) {

            container.innerHTML =
                `<div class="empty">
                    Aucun retrait.
                 </div>`;

            return;
        }

        let html = `
            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Client</th>
                            <th>Montant</th>
                            <th>Méthode</th>
                            <th>Compte</th>
                            <th>Date</th>
                            <th>Statut</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        withdrawals.forEach(
            function (withdrawal) {

                html += `
                    <tr>

                        <td>
                            ${escapeHTML(
                                withdrawal.user_name ||
                                withdrawal.name ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatFC(
                                withdrawal.amount
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                withdrawal.payment_method ||
                                withdrawal.method ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                withdrawal.account ||
                                withdrawal.phone ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                withdrawal.created_at
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                withdrawal.status ||
                                "pending"
                            )}
                        </td>

                    </tr>
                `;

            }
        );

        html += `
                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            error
        );

        container.innerHTML =
            `<div class="error">
                Impossible de charger les retraits.
             </div>`;

    }

}


/* =========================================================
   INVESTISSEMENTS
========================================================= */

async function loadInvestments() {

    const container =
        document.getElementById(
            "investmentsContainer"
        );

    if (!container) {
        return;
    }

    try {

        container.innerHTML =
            `<div class="loading">
                Chargement des investissements...
             </div>`;

        const result =
            await apiRequest(
                API.INVESTMENTS
            );

        const investments =
            extractData(
                result,
                [
                    "investments",
                    "data"
                ]
            );

        if (!investments.length) {

            container.innerHTML =
                `<div class="empty">
                    Aucun investissement.
                 </div>`;

            return;
        }

        let html = `
            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Client</th>
                            <th>Plan</th>
                            <th>Capital</th>
                            <th>Gain indiqué</th>
                            <th>Durée</th>
                            <th>Début</th>
                            <th>Fin</th>
                            <th>Statut</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        investments.forEach(
            function (investment) {

                html += `
                    <tr>

                        <td>
                            ${escapeHTML(
                                investment.user_name ||
                                investment.name ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                investment.plan_name ||
                                investment.plan ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatFC(
                                investment.amount ??
                                investment.capital ??
                                0
                            )}
                        </td>

                        <td>
                            ${formatFC(
                                investment.profit ??
                                investment.gain ??
                                0
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                investment.duration ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                investment.start_date
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                investment.end_date
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                investment.status ||
                                "—"
                            )}
                        </td>

                    </tr>
                `;

            }
        );

        html += `
                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            error
        );

        container.innerHTML =
            `<div class="error">
                Impossible de charger les investissements.
             </div>`;

    }

}


/* =========================================================
   VIP
========================================================= */

async function loadVIP() {

    const container =
        document.getElementById(
            "vipContainer"
        );

    if (!container) {
        return;
    }

    try {

        container.innerHTML =
            `<div class="loading">
                Chargement des VIP...
             </div>`;

        const result =
            await apiRequest(
                API.VIP
            );

        const vip =
            extractData(
                result,
                [
                    "vip",
                    "members",
                    "data"
                ]
            );

        if (!vip.length) {

            container.innerHTML =
                `<div class="empty">
                    Aucun abonnement VIP.
                 </div>`;

            return;
        }

        let html = `
            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Client</th>
                            <th>Email</th>
                            <th>Niveau VIP</th>
                            <th>Prix</th>
                            <th>Début</th>
                            <th>Expiration</th>
                            <th>Statut</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        vip.forEach(
            function (item) {

                html += `
                    <tr>

                        <td>
                            ${escapeHTML(
                                item.user_name ||
                                item.name ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                item.email ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                item.vip_level ||
                                item.level ||
                                "Aucun"
                            )}
                        </td>

                        <td>
                            ${formatFC(
                                item.price ||
                                0
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                item.start_date
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                item.expiration_date ||
                                item.end_date
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                item.status ||
                                "—"
                            )}
                        </td>

                    </tr>
                `;

            }
        );

        html += `
                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            error
        );

        container.innerHTML =
            `<div class="error">
                Impossible de charger les VIP.
             </div>`;

    }

}


/* =========================================================
   TRANSACTIONS
========================================================= */

async function loadTransactions() {

    const container =
        document.getElementById(
            "transactionsContainer"
        );

    if (!container) {
        return;
    }

    try {

        container.innerHTML =
            `<div class="loading">
                Chargement des transactions...
             </div>`;

        const result =
            await apiRequest(
                API.TRANSACTIONS
            );

        const transactions =
            extractData(
                result,
                [
                    "transactions",
                    "history",
                    "data"
                ]
            );

        if (!transactions.length) {

            container.innerHTML =
                `<div class="empty">
                    Aucune transaction.
                 </div>`;

            return;
        }

        let html = `
            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>Client</th>
                            <th>Type</th>
                            <th>Montant</th>
                            <th>Méthode</th>
                            <th>Référence</th>
                            <th>Statut</th>
                            <th>Date</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        transactions.forEach(
            function (transaction) {

                const type =
                    transaction.type ||
                    transaction.transaction_type ||
                    "—";

                let typeLabel =
                    type;

                if (
                    type === "deposit"
                ) {
                    typeLabel =
                        "Dépôt";
                }

                if (
                    type === "withdraw"
                ) {
                    typeLabel =
                        "Retrait";
                }

                if (
                    type === "invest"
                ) {
                    typeLabel =
                        "Investissement";
                }

                if (
                    type === "vip"
                ) {
                    typeLabel =
                        "Abonnement VIP";
                }

                html += `
                    <tr>

                        <td>
                            ${escapeHTML(
                                transaction.user_name ||
                                transaction.name ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                typeLabel
                            )}
                        </td>

                        <td>
                            ${formatFC(
                                transaction.amount ||
                                0
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                transaction.payment_method ||
                                transaction.method ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                transaction.reference ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                transaction.status ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatDate(
                                transaction.created_at
                            )}
                        </td>

                    </tr>
                `;

            }
        );

        html += `
                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            error
        );

        container.innerHTML =
            `<div class="error">
                Impossible de charger les transactions.
             </div>`;

    }

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    const container =
        document.getElementById(
            "notificationsContainer"
        );

    if (!container) {
        return;
    }

    try {

        container.innerHTML =
            `<div class="loading">
                Chargement des notifications...
             </div>`;

        const result =
            await apiRequest(
                API.NOTIFICATIONS
            );

        const notifications =
            extractData(
                result,
                [
                    "notifications",
                    "data"
                ]
            );

        if (!notifications.length) {

            container.innerHTML =
                `<div class="empty">
                    Aucune notification.
                 </div>`;

            return;
        }

        let html = "";

        notifications.forEach(
            function (notification) {

                html += `
                    <div class="notification-card">

                        <h3>
                            ${escapeHTML(
                                notification.title ||
                                "Notification"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                notification.message ||
                                ""
                            )}
                        </p>

                        <small>
                            ${formatDate(
                                notification.created_at
                            )}
                        </small>

                    </div>
                `;

            }
        );

        container.innerHTML =
            html;

    } catch (error) {

        console.error(
            error
        );

        container.innerHTML =
            `<div class="error">
                Impossible de charger les notifications.
             </div>`;

    }

}


/* =========================================================
   ENVOYER NOTIFICATION
========================================================= */

async function sendNotification() {

    const title =
        document.getElementById(
            "notificationTitle"
        );

    const message =
        document.getElementById(
            "notificationMessage"
        );

    if (
        !title ||
        !message
    ) {

        return;

    }

    const titleValue =
        title.value.trim();

    const messageValue =
        message.value.trim();

    if (
        !titleValue ||
        !messageValue
    ) {

        showMessage(
            "Veuillez remplir tous les champs.",
            "error"
        );

        return;

    }

    try {

        await apiRequest(
            API.NOTIFICATIONS,
            {

                method: "POST",

                body: JSON.stringify({

                    title:
                        titleValue,

                    message:
                        messageValue

                })

            }
        );

        title.value = "";

        message.value = "";

        showMessage(
            "Notification envoyée.",
            "success"
        );

        loadNotifications();

    } catch (error) {

        console.error(
            error
        );

        showMessage(
            error.message ||
            "Erreur lors de l'envoi.",
            "error"
        );

    }

}


/* =========================================================
   FORMULAIRE NOTIFICATION
========================================================= */

function setupNotificationForm() {

    const button =
        document.getElementById(
            "sendNotificationButton"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            sendNotification();

        }
    );

}


/* =========================================================
   ACTUALISER
========================================================= */

async function refreshAll() {

    if (refreshButton) {

        refreshButton.disabled =
            true;

        refreshButton.textContent =
            "Actualisation...";

    }

    await Promise.allSettled([

        loadStats(),

        loadClients(),

        loadDeposits(),

        loadWithdrawals(),

        loadInvestments(),

        loadVIP(),

        loadTransactions(),

        loadNotifications()

    ]);

    if (refreshButton) {

        refreshButton.disabled =
            false;

        refreshButton.textContent =
            "Actualiser";

    }

}


/* =========================================================
   BOUTON ACTUALISER
========================================================= */

function setupRefresh() {

    if (!refreshButton) {
        return;
    }

    refreshButton.addEventListener(
        "click",
        function () {

            refreshAll();

        }
    );

}


/* =========================================================
   DÉCONNEXION
========================================================= */

async function logout() {

    try {

        await apiRequest(
            API.LOGOUT,
            {
                method: "POST"
            }
        );

    } catch (error) {

        console.warn(
            "Erreur déconnexion :",
            error
        );

    }

    window.location.replace(
        "index.html"
    );

}


function setupLogout() {

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            logout();

        }
    );

}


/* =========================================================
   INITIALISATION
========================================================= */

async function startAdmin() {

    /*
     * Navigation en premier.
     * Même si l'API n'est pas encore installée,
     * les boutons peuvent changer de fichier.
     */

    setupAdminNavigation();

    setupMobileMenu();

    setupRefresh();

    setupLogout();

    setupNotificationForm();


    /*
     * Vérification administrateur
     */

    const isAdmin =
        await checkAdmin();

    if (!isAdmin) {
        return;
    }


    /*
     * Chargement des données
     */

    refreshAll();

}


/* =========================================================
   DÉMARRAGE
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startAdmin
    );

} else {

    startAdmin();

}