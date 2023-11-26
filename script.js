const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
var loggedIn = false;
var userHash = "";
const API_ENDPOINT = "https://us-central1-lightseeker-chatbot.cloudfunctions.net/VinGenie"
const BOT_IMG = "https://hostingviet.vn/data/tinymce/2021/2021.03/hosting-mien-phi-1.png";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
const BOT_NAME = "BOT";
const PERSON_NAME = "VinNole";
// TODO: get user's city by location at the beginning

msgerForm.addEventListener("submit", event => {
  event.preventDefault();

  const msgText = msgerInput.value;
  if (!msgText) return;

  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
  msgerInput.value = "";

  botResponse(msgText);
});

function appendMessage(name, img, side, message) {
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
    const data =  await sendMessage(msgText);
    console.log(data);
    const message = data.name;

    appendMessage(BOT_NAME, BOT_IMG, "left", message);
  } catch (error) {
    console.error(error);
  }
}

async function sendMessage(inputString) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body : JSON.stringify( { userHash: userHash,topic : "finance",question: inputString}),
}) 


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

/*
  <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${message}</div>
      </div>
    </div>
*/