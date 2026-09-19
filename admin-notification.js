"use strict";

/* =========================================================
   JASON INVEST
   ADMIN — NOTIFICATIONS
========================================================= */

const API = {
    me: "/api/admin/me",
    notifications: "/api/admin/notifications",
    send: "/api/admin/notifications",
    logout: "/api/auth/logout"
};

let notifications = [];


/* =========================================================
   DOM
========================================================= */

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");

const mobileMenu =
    document.getElementById("mobileMenu");

const notificationForm =
    document.getElementById("notificationForm");

const notificationTitle =
    document.getElementById("notificationTitle");

const notificationMessage =
    document.getElementById("notificationMessage");

const sendNotificationButton =
    document.getElementById("sendNotificationButton");

const notificationsContainer =
    document.getElementById("notificationsContainer");

const refreshButton =
    document.getElementById("refreshButton");

const backButton =
    document.getElementById("backButton");

const logoutButton =
    document.getElementById("logoutButton");

const message =
    document.getElementById("message");


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text, type = "info") {

    if (!message) {
        return;
    }

    message.textContent = text;

    message.className =
        "message show " + type;

    clearTimeout(showMessage.timer);

    showMessage.timer = setTimeout(() => {

        message.className = "message";

    }, 5000);
}


/* =========================================================
   ESCAPE HTML
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
   DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "Date inconnue";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================================
   API
========================================================= */

async function apiRequest(url, options = {}) {

    const response = await fetch(url, {

        credentials: "include",

        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },

        ...options

    });


    let data = null;

    try {

        data = await response.json();

    } catch (error) {

        data = null;

    }


    if (!response.ok) {

        const errorMessage =
            data?.message ||
            data?.error ||
            `Erreur HTTP ${response.status}`;

        const error =
            new Error(errorMessage);

        error.status =
            response.status;

        throw error;
    }


    return data;
}


/* =========================================================
   EXTRAIRE LES NOTIFICATIONS
========================================================= */

function extractNotifications(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.notifications)) {
        return data.notifications;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    return [];
}


/* =========================================================
   VÉRIFICATION ADMIN
========================================================= */

async function checkAdmin() {

    try {

        const data =
            await apiRequest(API.me);

        const user =
            data?.user ||
            data?.admin ||
            data?.data ||
            data;

        const role =
            String(user?.role || "")
                .toLowerCase();

        if (
            role &&
            role !== "admin" &&
            role !== "administrator"
        ) {

            window.location.replace(
                "index.html"
            );

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Erreur authentification :",
            error
        );

        if (
            error.status === 401 ||
            error.status === 403
        ) {

            window.location.replace(
                "index.html"
            );

            return false;
        }

        showMessage(
            "Impossible de vérifier la session administrateur.",
            "error"
        );

        return true;
    }
}


/* =========================================================
   RENDRE LES NOTIFICATIONS
========================================================= */

function renderNotifications() {

    if (!notificationsContainer) {
        return;
    }


    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {

        notificationsContainer.innerHTML = `
            <div class="empty">
                Aucune notification envoyée.
            </div>
        `;

        return;
    }


    notificationsContainer.innerHTML =
        notifications.map(notification => {

            const title =
                notification?.title ||
                notification?.subject ||
                "Sans titre";

            const text =
                notification?.message ||
                notification?.content ||
                notification?.body ||
                "";

            const date =
                notification?.created_at ||
                notification?.createdAt ||
                notification?.date ||
                notification?.sent_at ||
                null;


            return `
                <article class="notification-item">

                    <h3>
                        🔔 ${escapeHTML(title)}
                    </h3>

                    <p>
                        ${escapeHTML(text)}
                    </p>

                    <div class="notification-meta">
                        📅 ${escapeHTML(formatDate(date))}
                    </div>

                </article>
            `;

        }).join("");
}


/* =========================================================
   CHARGER LES NOTIFICATIONS
========================================================= */

async function loadNotifications() {

    if (!notificationsContainer) {
        return;
    }


    notificationsContainer.innerHTML = `
        <div class="loading">
            Chargement des notifications...
        </div>
    `;


    try {

        const data =
            await apiRequest(
                API.notifications
            );

        notifications =
            extractNotifications(data);

        renderNotifications();

    } catch (error) {

        console.error(
            "Erreur notifications :",
            error
        );

        notifications = [];

        notificationsContainer.innerHTML = `
            <div class="empty">
                Impossible de charger les notifications.
                <br><br>
                <small>
                    ${escapeHTML(error.message)}
                </small>
            </div>
        `;

        showMessage(
            "Erreur lors du chargement des notifications.",
            "error"
        );
    }
}


/* =========================================================
   ENVOYER UNE NOTIFICATION
========================================================= */

async function sendNotification(event) {

    event.preventDefault();


    const title =
        notificationTitle?.value.trim() || "";

    const text =
        notificationMessage?.value.trim() || "";


    if (!title) {

        showMessage(
            "Veuillez saisir un titre.",
            "error"
        );

        notificationTitle?.focus();

        return;
    }


    if (!text) {

        showMessage(
            "Veuillez saisir un message.",
            "error"
        );

        notificationMessage?.focus();

        return;
    }


    const confirmation =
        confirm(
            "Voulez-vous envoyer cette notification ?"
        );


    if (!confirmation) {
        return;
    }


    if (sendNotificationButton) {

        sendNotificationButton.disabled =
            true;

        sendNotificationButton.textContent =
            "Envoi en cours...";
    }


    try {

        await apiRequest(
            API.send,
            {
                method: "POST",

                body: JSON.stringify({
                    title: title,
                    message: text
                })
            }
        );


        showMessage(
            "Notification envoyée avec succès.",
            "success"
        );


        notificationForm.reset();


        await loadNotifications();


    } catch (error) {

        console.error(
            "Erreur envoi notification :",
            error
        );

        showMessage(
            error.message ||
            "Impossible d'envoyer la notification.",
            "error"
        );

    } finally {

        if (sendNotificationButton) {

            sendNotificationButton.disabled =
                false;

            sendNotificationButton.textContent =
                "📤 Envoyer la notification";
        }
    }
}


/* =========================================================
   FORMULAIRE
========================================================= */

if (notificationForm) {

    notificationForm.addEventListener(
        "submit",
        sendNotification
    );

}


/* =========================================================
   NAVIGATION SIDEBAR
========================================================= */

document
    .querySelectorAll(".nav-btn[data-page]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                event.stopImmediatePropagation();

                const page =
                    this.dataset.page;

                if (!page) {
                    return;
                }

                closeMobileMenu();

                window.location.assign(page);

            },
            true
        );

    });


/* =========================================================
   RETOUR ADMIN
========================================================= */

if (backButton) {

    backButton.addEventListener(
        "click",
        () => {

            window.location.assign(
                "admin.html"
            );

        }
    );

}


/* =========================================================
   ACTUALISER
========================================================= */

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        async () => {

            refreshButton.disabled =
                true;

            try {

                await loadNotifications();

            } finally {

                refreshButton.disabled =
                    false;
            }

        }
    );

}


/* =========================================================
   MENU MOBILE
========================================================= */

function openMobileMenu() {

    sidebar?.classList.add("open");

    overlay?.classList.add("show");
}


function closeMobileMenu() {

    sidebar?.classList.remove("open");

    overlay?.classList.remove("show");
}


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        openMobileMenu
    );

}


if (overlay) {

    overlay.addEventListener(
        "click",
        closeMobileMenu
    );

}


/* =========================================================
   DÉCONNEXION
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmation =
                confirm(
                    "Voulez-vous vous déconnecter ?"
                );

            if (!confirmation) {
                return;
            }


            try {

                await apiRequest(
                    API.logout,
                    {
                        method: "POST",
                        body: JSON.stringify({})
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
    );

}


/* =========================================================
   DÉMARRAGE
========================================================= */

async function startNotificationsPage() {

    const isAdmin =
        await checkAdmin();

    if (!isAdmin) {
        return;
    }

    await loadNotifications();
}


/* =========================================================
   START
========================================================= */

startNotificationsPage();