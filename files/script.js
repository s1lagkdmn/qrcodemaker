const input = document.getElementById('url-input');
const makeBtn = document.getElementById('make-btn');
const errorMsg = document.getElementById('error-msg');
const result = document.getElementById('result');
const resultUrl = document.getElementById('result-url');
const qrContainer = document.getElementById('qrcode');
const downloadBtn = document.getElementById('download-btn');

const darkColorInput = document.getElementById('dark-color');
const lightColorInput = document.getElementById('light-color');
const darkHex = document.getElementById('dark-hex');
const lightHex = document.getElementById('light-hex');

const logoFileInput = document.getElementById('logo-file');
const logoName = document.getElementById('logo-name');
const logoClearBtn = document.getElementById('logo-clear');

let logoImage = null;
let lastUrl = null;

function normalizeUrl(value){
  const trimmed = value.trim();
  if(!trimmed) return null;
  if(/^https?:\/\//i.test(trimmed)) return trimmed;
  return 'https://' + trimmed;
}

darkColorInput.addEventListener('input', () => {
  darkHex.textContent = darkColorInput.value.toUpperCase();
  if(lastUrl) generate();
});
lightColorInput.addEventListener('input', () => {
  lightHex.textContent = lightColorInput.value.toUpperCase();
  if(lastUrl) generate();
});

logoFileInput.addEventListener('change', () => {
  const file = logoFileInput.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      logoImage = img;
      logoName.textContent = file.name;
      logoClearBtn.classList.add('show');
      if(lastUrl) generate();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

logoClearBtn.addEventListener('click', () => {
  logoImage = null;
  logoFileInput.value = '';
  logoName.textContent = '';
  logoClearBtn.classList.remove('show');
  if(lastUrl) generate();
});

function drawLogo(canvas){
  if(!logoImage) return;
  const ctx = canvas.getContext('2d');
  const logoSize = canvas.width * 0.22;
  const x = (canvas.width - logoSize) / 2;
  const y = (canvas.height - logoSize) / 2;
  const pad = logoSize * 0.14;

  ctx.fillStyle = lightColorInput.value;
  ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2);
  ctx.drawImage(logoImage, x, y, logoSize, logoSize);
}

function generate(){
  const raw = input.value;
  const url = normalizeUrl(raw);

  if(!url){
    errorMsg.classList.add('show');
    result.classList.remove('show');
    return;
  }
  errorMsg.classList.remove('show');
  lastUrl = url;

  qrContainer.innerHTML = '';
  new QRCode(qrContainer, {
    text: url,
    width: 240,
    height: 240,
    colorDark: darkColorInput.value,
    colorLight: lightColorInput.value,
    correctLevel: logoImage ? QRCode.CorrectLevel.H : QRCode.CorrectLevel.M
  });

  const canvas = qrContainer.querySelector('canvas');
  if(canvas) drawLogo(canvas);

  resultUrl.textContent = url;
  result.classList.add('show');
}

makeBtn.addEventListener('click', generate);
input.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') generate();
});

downloadBtn.addEventListener('click', () => {
  const canvas = qrContainer.querySelector('canvas');
  if(!canvas) return;
  const link = document.createElement('a');
  link.download = 'qr-kod.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
