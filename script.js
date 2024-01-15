const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
var loggedIn = false;
var endChat = false;
var userHash = "";
var topic = "";
var counter = 0;
var input_disabled = true;
const API_ENDPOINT = "https://us-central1-vingenie.cloudfunctions.net/Vingenie2"
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
    const message = data.response;
    document.getElementById("msgLoader").remove();
    appendMessage("left", message);
  } catch (error) {
    console.error(error);
  }
}

async function sendMessage(inputString, topic) {
  // Add loader here
  const loader = `
    <div class="msg left-msg" id="msgLoader">
      <span class="loader"></span>
    </div>
  `;
  msgerChat.insertAdjacentHTML("beforeend", loader);
  msgerChat.scrollTop += 500;
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

async function refreshChat() {
  endChat = true;
  console.log(userHash)
  input_send_btn = document.getElementsByClassName("msger-send-btn")[0];
  input = document.getElementsByClassName("msger-input")[0];
  loader = document.getElementsByClassName("loading")[0];
  loader.style.display = "block";
  input.placeholder = "";
  const refresh = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body : JSON.stringify( { userHash: userHash, question:"", endChat: endChat}),
}) 
  console.log("Refreshed")
  input_send_btn.style.cursor = "not-allowed";
  input.style.cursor = "not-allowed";
  loader.style.display = "none";
  input_send_btn.disabled = false;
  input.disabled = true;
  input_disabled = true;
  input.placeholder = "Please choose an intent first!";
  const messages = document.querySelectorAll('.left-msg, .right-msg');
  messages.forEach(message => {
    message.style.display = 'none'; // hide all old messages
  });
  document.getElementById("welcome-msg").style.display = "block";
  document.getElementsByClassName("nav-bar")[0].style.display = "none";
  // document.getElementsByClassName("nav-header")[0].style.display = "block";
  counter = 0;
  showAllIntents();
}

  // return await refresh.json();

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

var opening = true
// Opens the full list of intents
function openIntentList() {
  showAllIntents();
}

// Shows all intents and hides any open subintent menus
function showAllIntents() {
  const intents = document.querySelectorAll('.intent-list .intent-item');
  intents.forEach(intent => {
    intent.style.display = 'block'; // Show all intent items
    intent.querySelectorAll('.subintent-menu').forEach(subMenu => {
      subMenu.classList.remove('show');
      subMenu.classList.add('hide');
      const arrow = intent.querySelector('.icon-arrow');
      if (arrow) {
        arrow.classList.remove('open');
        arrow.classList.add('close');
      }
    });
  });
}

// Handles the main intent buttons with dropdown functionality
const intentButtons = document.querySelectorAll('.intent-list .intent-button[data-toggle="dropdown"]');
intentButtons.forEach(button => {
  button.addEventListener('click', function(event) {
    event.preventDefault();
    toggleDropdownMenu(this);
  });
});

// Toggles the dropdown menu for a given intent button
function toggleDropdownMenu(button) {
  const menu = button.nextElementSibling;
  const arrow = button.querySelector('.icon-arrow');
  const isMenuOpen = menu.classList.contains('show');

  if (isMenuOpen) {
    menu.classList.remove('show');
    menu.classList.add('hide');
    arrow.classList.remove('open');
    arrow.classList.add('close');
  } else {
    closeAllDropdowns(); 
    menu.classList.add('show');
    menu.classList.remove('hide');
    arrow.classList.add('open');
    arrow.classList.remove('close');
  }
}

// Closes all dropdown menus
function closeAllDropdowns() {
  const allDropdowns = document.querySelectorAll('.intent-list .intent-item .subintent-menu');
  allDropdowns.forEach(function(dropdownMenu) {
    dropdownMenu.classList.remove('show');
    dropdownMenu.classList.add('hide');
    const arrow = dropdownMenu.previousElementSibling.querySelector('.icon-arrow');
    if (arrow) {
      arrow.classList.remove('open');
      arrow.classList.add('close');
    }
  });
}

// Handles clicking on an intent without a dropdown
function handleIntentClick(intentButton) {
  showOnlyParentIntent(intentButton.closest('.intent-item'));
  updateQuestionText(intentButton.textContent.trim());
  chosen_intent_id = intentButton.id;
  topic = chosen_intent_id;
}

function handleSubintentClick(subintentButton) {
  const parentIntent = subintentButton.closest('.intent-item');
  closeAllDropdowns();
  showOnlyParentIntent(parentIntent);
  updateQuestionText(subintentButton.textContent.trim());
  chosen_intent_id = subintentButton.id;
  topic = chosen_intent_id;
}

function showOnlyParentIntent(parentIntent) {
  const intents = document.querySelectorAll('.intent-list .intent-item');
  intents.forEach(intent => {
    intent.style.display = 'none';
  });

  if (parentIntent) {
    parentIntent.style.display = 'block';
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
// Updates the question text based on the selected intent or subintent
function updateQuestionText(intentName) {
  if (counter == 0) {
    document.getElementById("welcome-msg").style.display = "none";
    document.getElementsByClassName("nav-bar")[0].style.display = "block";
    // document.getElementsByClassName("nav-header")[0].style.display = "block";
    counter += 1;
    input_send_btn = document.getElementsByClassName("msger-send-btn")[0];
    input = document.getElementsByClassName("msger-input")[0];

    input_send_btn.style.cursor = "default";
    input.style.cursor = "default";
    input_send_btn.disabled = false;
    input.disabled = false;
    
    input_disabled = false;
    input.placeholder = "Ask me anything..."
  }
  const questionTextElement = document.querySelector('#default-text');
  const messageBubble = document.getElementById('message-bubble');
  if (questionTextElement) {
    questionTextElement.textContent = `What do you want to ask about ${intentName}?`;
    messageBubble.style.display = 'block';
  }
}

function clickMessage() {
  input_send_btn = document.getElementsByClassName("msger-send-btn")[0];
  if (input_disabled) {
    input_send_btn.disabled = true;
  }
}

