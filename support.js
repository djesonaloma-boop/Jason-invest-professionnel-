"use strict";

/*
=========================================================
 JASON INVEST
 SUPPORT CLIENT IA
=========================================================
*/

/*
 * Ton API chatbot existante.
 */
const CHATBOT_API =
  "https://davbot-api-xw6y.vercel.app/api/ask";


/*
 * WhatsApp du support.
 */
const WHATSAPP_NUMBER =
  "243847500590";

const WHATSAPP_URL =
  "https://wa.me/" +
  WHATSAPP_NUMBER;


/*
=========================================================
 CONTEXTE JASON INVEST
=========================================================
*/

const SYSTEM_PROMPT = `
Tu es l'assistant officiel du support client de JASON INVEST.

IMPORTANT :
Tu utilises ton intelligence pour aider uniquement les clients
de la plateforme JASON INVEST.

TA MISSION :

Aider les clients à comprendre et utiliser :

- la création de compte ;
- la connexion ;
- le profil ;
- le tableau de bord ;
- les dépôts ;
- les retraits ;
- Orange Money ;
- les investissements ;
- les plans d'investissement ;
- les abonnements VIP ;
- l'historique ;
- les notifications ;
- les problèmes techniques ;
- la navigation sur la plateforme ;
- le fonctionnement général de JASON INVEST.

REGLES :

1. Réponds toujours en français.

2. Reste centré sur JASON INVEST.

3. Si le client pose une question qui n'a aucun rapport
avec JASON INVEST, réponds :
"Je suis uniquement l'assistant du support client
JASON INVEST. Je peux vous aider concernant
l'utilisation de la plateforme."

4. Ne prétends jamais avoir accès au solde réel d'un client
si cette information ne t'est pas fournie.

5. Ne prétends jamais avoir validé un dépôt ou un retrait.

6. Ne crée jamais de fausse transaction.

7. Ne demande jamais le mot de passe du client.

8. Ne demande jamais un code secret ou un code de sécurité.

9. Ne promets jamais de gains garantis.

10. Si un problème nécessite une intervention humaine,
indique au client qu'il peut contacter le support WhatsApp.

11. Numéro officiel du support WhatsApp :
+243 847 500 590

12. Tu dois être professionnel, simple, clair et utile.

13. Tu es un assistant de support client JASON INVEST,
pas un assistant généraliste.

14. Si le client demande quelque chose que tu ne connais
pas concernant JASON INVEST, ne l'invente pas.
Indique-lui de contacter le support humain.
`;


/*
=========================================================
 ELEMENTS
=========================================================
*/

const messages =
  document.getElementById("messages");

const chatForm =
  document.getElementById("chatForm");

const chatInput =
  document.getElementById("chatInput");

const sendButton =
  document.getElementById("sendButton");

const quickButtons =
  document.querySelectorAll(
    ".quick button"
  );


/*
=========================================================
 HISTORIQUE
=========================================================
*/

let conversation = [];


/*
=========================================================
 AJOUTER MESSAGE
=========================================================
*/

function addMessage(
  text,
  sender
) {

  if (!messages) {
    return;
  }

  const element =
    document.createElement("div");

  if (sender === "user") {

    element.className =
      "message user-message";

  } else {

    element.className =
      "message bot-message";

  }

  element.textContent =
    text;

  messages.appendChild(
    element
  );

  messages.scrollTop =
    messages.scrollHeight;
}


/*
=========================================================
 INDICATEUR
=========================================================
*/

function showTyping() {

  if (!messages) {
    return;
  }

  const element =
    document.createElement("div");

  element.id =
    "typingMessage";

  element.className =
    "message bot-message typing";

  element.textContent =
    "L'assistant réfléchit...";

  messages.appendChild(
    element
  );

  messages.scrollTop =
    messages.scrollHeight;
}


function removeTyping() {

  const element =
    document.getElementById(
      "typingMessage"
    );

  if (element) {
    element.remove();
  }
}


/*
=========================================================
 EXTRAIRE LA REPONSE
=========================================================
*/

function extractAnswer(data) {

  if (!data) {
    return "";
  }


  /*
   * Si l'API renvoie directement du texte.
   */

  if (
    typeof data ===
    "string"
  ) {

    return data.trim();

  }


  /*
   * Formats JSON courants.
   */

  if (
    typeof data.answer ===
    "string"
  ) {

    return data.answer.trim();

  }


  if (
    typeof data.response ===
    "string"
  ) {

    return data.response.trim();

  }


  if (
    typeof data.reply ===
    "string"
  ) {

    return data.reply.trim();

  }


  if (
    typeof data.message ===
    "string"
  ) {

    return data.message.trim();

  }


  /*
   * data.answer
   */

  if (
    data.data &&
    typeof data.data.answer ===
    "string"
  ) {

    return data.data.answer.trim();

  }


  /*
   * data.response
   */

  if (
    data.data &&
    typeof data.data.response ===
    "string"
  ) {

    return data.data.response.trim();

  }


  /*
   * Format type OpenAI.
   */

  if (
    Array.isArray(data.choices) &&
    data.choices.length > 0
  ) {

    const choice =
      data.choices[0];


    if (
      choice.message &&
      typeof choice.message.content ===
      "string"
    ) {

      return choice.message.content.trim();

    }


    if (
      typeof choice.text ===
      "string"
    ) {

      return choice.text.trim();

    }

  }


  return "";
}


/*
=========================================================
 APPEL DE L'API
=========================================================
*/

async function askAI(
  userMessage
) {

  /*
   * On conserve seulement
   * les derniers messages.
   */

  const recentHistory =
    conversation.slice(-10);


  /*
   * Payload envoyé à ton API.
   */

  const payload = {

    message:
      userMessage,

    system:
      SYSTEM_PROMPT,

    context:
      "Support client JASON INVEST",

    history:
      recentHistory

  };


  const response =
    await fetch(
      CHATBOT_API,
      {
        method: "POST",

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


  /*
   * Erreur HTTP.
   */

  if (!response.ok) {

    throw new Error(
      "Erreur API : HTTP " +
      response.status
    );

  }


  /*
   * Lire la réponse.
   */

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";


  let data;


  if (
    contentType.includes(
      "application/json"
    )
  ) {

    data =
      await response.json();

  } else {

    data =
      await response.text();

  }


  const answer =
    extractAnswer(data);


  if (!answer) {

    console.log(
      "Réponse API reçue :",
      data
    );

    throw new Error(
      "L'API n'a pas retourné de réponse lisible."
    );

  }


  return answer;
}


/*
=========================================================
 ENVOYER MESSAGE
=========================================================
*/

async function sendMessage(
  text
) {

  const cleanText =
    String(text || "")
      .trim();


  if (!cleanText) {
    return;
  }


  /*
   * Message du client.
   */

  addMessage(
    cleanText,
    "user"
  );


  /*
   * Historique.
   */

  conversation.push({
    role: "user",
    content: cleanText
  });


  /*
   * Désactiver l'interface
   * pendant la réponse.
   */

  if (sendButton) {
    sendButton.disabled =
      true;
  }

  if (chatInput) {
    chatInput.disabled =
      true;
  }


  showTyping();


  try {

    const answer =
      await askAI(
        cleanText
      );


    removeTyping();


    /*
     * Réponse de l'IA.
     */

    addMessage(
      answer,
      "bot"
    );


    conversation.push({
      role: "assistant",
      content: answer
    });


  } catch (error) {

    console.error(
      "Erreur chatbot :",
      error
    );


    removeTyping();


    addMessage(
      "Je rencontre actuellement un problème pour répondre à votre question.\n\n" +
      "Vous pouvez contacter directement le support WhatsApp au +243 847 500 590.",
      "bot"
    );

  } finally {

    if (sendButton) {
      sendButton.disabled =
        false;
    }

    if (chatInput) {

      chatInput.disabled =
        false;

      chatInput.focus();

    }

  }
}


/*
=========================================================
 FORMULAIRE
=========================================================
*/

if (chatForm) {

  chatForm.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();


      if (!chatInput) {
        return;
      }


      const text =
        chatInput.value.trim();


      if (!text) {
        return;
      }


      chatInput.value =
        "";


      sendMessage(
        text
      );

    }
  );

}


/*
=========================================================
 QUESTIONS RAPIDES
=========================================================
*/

quickButtons.forEach(
  function(button) {

    button.addEventListener(
      "click",
      function() {

        const question =
          button.dataset.question ||
          button.textContent.trim();


        sendMessage(
          question
        );

      }
    );

  }
);


/*
=========================================================
 MESSAGE INITIAL
=========================================================
*/

document.addEventListener(
  "DOMContentLoaded",
  function() {

    addMessage(
      "Bonjour 👋\n\nJe suis l'assistant IA du support client JASON INVEST.\n\nJe peux vous aider concernant votre compte, les dépôts, les retraits, les investissements, les abonnements VIP et l'utilisation de la plateforme.\n\nComment puis-je vous aider ?",
      "bot"
    );

  }
);