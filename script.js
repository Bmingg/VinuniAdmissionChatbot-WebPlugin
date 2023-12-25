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
    counter += 1;
  }
  const questionTextElement = document.querySelector('.msg-bubble .msg-text');
  const messageBubble = document.getElementById('message-bubble');
  if (questionTextElement) {
    questionTextElement.textContent = `What do you want to ask about ${intentName}?`;
    messageBubble.style.display = 'block';
  }
}

