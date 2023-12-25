const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
var loggedIn = false;
var userHash = "";
var topic = "";
var counter = 0;
const API_ENDPOINT = "https://us-central1-lightseeker-chatbot.cloudfunctions.net/VinGenie"
const BOT_NAME = "BOT";
const PERSON_NAME = "VinNole";
// TODO: get user's city by location at the beginning

msgerForm.addEventListener("submit", event => {
  event.preventDefault();

  const msgText = msgerInput.value;
  if (!msgText) return;

  appendMessage("right", msgText);
  msgerInput.value = "";

  botResponse(msgText);
});

function appendMessage(side, message) {
  if(loggedIn==false) {
    userHash = generateHash();
    localStorage.setItem("userHash",userHash);
    loggedIn = true;
  }
  else {
    userHash = localStorage.getItem("userHash");
  }

  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-bubble">
        <div class="msg-text">${message}</div>
      </div>
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}
function checkIfLoggedIn() {
  console.log("Storage: " +localStorage.getItem("userHash"));
  if (localStorage.getItem("userHash")==null) {
    return false;
  } else {
    return true;
  }
}


async function botResponse(msgText) {
  try {
    const data =  await sendMessage(msgText, topic);
    console.log(data);
    const message = data.name;

    appendMessage("left", message);
  } catch (error) {
    console.error(error);
  }
}

async function sendMessage(inputString, topic) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body : JSON.stringify( { userHash: userHash,topic : topic,question: inputString}),
}) 
  console.log(topic);

  return await response.json();
}

function generateHash() {
  const crypto = window.crypto || window.msCrypto;
  const randomData = crypto.getRandomValues(new Uint32Array(32));
  const hash = Array.from(randomData, byte => byte.toString(16).padStart(2, '0')).join('');
  return hash;
}

// Utils
function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}

function openChat() {
  document.getElementById("chatbox").style.display = "flex";
}

function closeChat() {
  document.getElementById("chatbox").style.display = "none";
}
var chosen_intent_id;
var intents = document.getElementsByClassName("intent-item");

function closeIntentList(chosen_intent) {
  chosen_intent_id = chosen_intent.parentNode.id;

  if (counter == 0) {
    document.getElementById("welcome-msg").style.display = "none";
    appendMessage("left", "Hello there! How may I assist you today? 😄");
    counter += 1;
  }
  for(var i=0, len=intents.length; i<len; i++)
  {
      if (intents[i].id != chosen_intent_id) {
        intents[i].style.display = "none";
      }
  }

  document.getElementsByClassName("nav-bar")[0].style.display = "block";
  topic = chosen_intent_id
} 

function openIntentList() {
  for(var i=0, len=intents.length; i<len; i++) {
        intents[i].style.display = "block";
  }
}

function text(url) {
  return fetch(url).then(res => res.text());
}

var response = "";

text('https://www.cloudflare.com/cdn-cgi/trace').then(data => {
  let ipRegex = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/
  let ip = data.match(ipRegex)[0];
  console.log(ip);
  response = ip;
});

// jQuery.get