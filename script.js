/* =========================================================
   Conversor de PDF → PNG ou DOC (100% no navegador)
   ========================================================= */

const pdfjsLib = window.pdfjsLib;
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// ---------- Elementos ----------
const fileInput    = document.getElementById("fileInput");
const dropzone     = document.getElementById("dropzone");
const convertBtn   = document.getElementById("convertBtn");
const statusBox    = document.getElementById("status");
const statusText   = document.getElementById("statusText");
const percentText  = document.getElementById("percentText");
const progressBar  = document.getElementById("progressBar");
const fileInfo     = document.getElementById("fileInfo");
const fileName     = document.getElementById("fileName");
const fileMeta     = document.getElementById("fileMeta");
const results      = document.getElementById("results");
const resultsTitle = document.getElementById("resultsTitle");
const grid         = document.getElementById("grid");
const downloadAll  = document.getElementById("downloadAll");
const formatNote   = document.getElementById("formatNote");
const formatInputs = document.querySelectorAll('input[name="format"]');

// ---------- Estado ----------
let selectedFile = null;
let isBusy = false;
let lastDocBlobUrl = null;

/* =========================================================
   HELPERS
   ========================================================= */

function getFormat() {
  const checked = document.querySelector('input[name="format"]:checked');
  return checked ? checked.value : "png";
}

function showStatus() {
  statusBox.hidden = false;
}

function setProgress(percent, text) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  progressBar.style.width = p + "%";
  percentText.textContent = p + "%";
  if (text) statusText.textContent = text;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function baseName() {
  return selectedFile ? selectedFile.name.replace(/\.pdf$/i, "") : "documento";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* =========================================================
   SELEÇÃO DE FORMATO
   ========================================================= */

function updateFormatUI() {
  const format = getFormat();

  convertBtn.textContent =
    format === "png" ? "Converter para PNG" : "Converter para Word (.doc)";

  formatNote.hidden = format !== "doc";
}

formatInputs.forEach((input) =>
  input.addEventListener("change", updateFormatUI)
);

/* =========================================================
   SELEÇÃO / DRAG & DROP
   ========================================================= */

function handleFile(file) {
  if (!file) return;

  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  if (!isPdf) {
    showStatus();
    setProgress(0, "❌ Por favor, selecione um arquivo PDF.");
    convertBtn.disabled = true;
    fileInfo.hidden = true;
    selectedFile = null;
    return;
  }

  selectedFile = file;
  fileName.textContent = file.name;
  fileMeta.textContent = formatBytes(file.size) + " • PDF";
  fileInfo.hidden = false;
  convertBtn.disabled = false;

  clearResults();
  showStatus();
  setProgress(0, "✅ Arquivo carregado. Escolha o formato e clique em converter.");
}

function clearResults() {
  grid.innerHTML = "";
  results.hidden = true;
  if (lastDocBlobUrl) {
    URL.revokeObjectURL(lastDocBlobUrl);
    lastDocBlobUrl = null;
  }
}

fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
dropzone.addEventListener("click", () => fileInput.click());

["dragenter", "dragover"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add("dragover");
  })
);

["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove("dragover");
  })
);

dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  handleFile(file);
});

window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => e.preventDefault());

/* =========================================================
   CONVERSÃO
   ========================================================= */

convertBtn.addEventListener("click", convert);

async function convert() {
  if (!selectedFile || isBusy) return;

  const format = getFormat();

  isBusy = true;
  convertBtn.disabled = true;
  clearResults();

  showStatus();
  setProgress(0, "Lendo o arquivo...");

  try {
    const buffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const total = pdf.numPages;

    if (format === "png") {
      await convertToPng(pdf, total);
    } else {
      await convertToDoc(pdf, total);
    }
  } catch (err) {
    console.error(err);
    setProgress(0, "❌ Erro ao converter: " + (err.message || err));
  } finally {
    isBusy = false;
    convertBtn.disabled = false;
  }
}

/* ---------------------------------------------------------
   CONVERSÃO → PNG
   --------------------------------------------------------- */

async function convertToPng(pdf, total) {
  resultsTitle.textContent = "Páginas convertidas (PNG)";
  downloadAll.hidden = false;

  for (let i = 1; i <= total; i++) {
    setProgress(((i - 1) / total) * 100, `Convertendo página ${i} de ${total}...`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL("image/png");
    addPngResultCard(i, dataUrl);

    canvas.width = 0;
    canvas.height = 0;

    setProgress((i / total) * 100, `Convertendo página ${i} de ${total}...`);
  }

  results.hidden = false;
  setProgress(100, `🎉 Concluído! ${total} página(s) em PNG.`);
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function addPngResultCard(index, dataUrl) {
  const card = document.createElement("div");
  card.className = "result-card";

  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = `Página ${index}`;
  img.loading = "lazy";

  const label = document.createElement("span");
  label.className = "result-name";
  label.textContent = `Página ${index}`;

  const link = document.createElement("a");
  link.className = "btn btn-small";
  link.href = dataUrl;
  link.download = `${baseName()}-pagina-${index}.png`;
  link.textContent = "Baixar PNG";

  card.append(img, label, link);
  grid.appendChild(card);
}

/* ---------------------------------------------------------
   CONVERSÃO → DOC (Word)
   --------------------------------------------------------- */

async function convertToDoc(pdf, total) {
  resultsTitle.textContent = "Documento Word gerado";
  downloadAll.hidden = true;

  const pagesText = [];

  for (let i = 1; i <= total; i++) {
    setProgress(((i - 1) / total) * 100, `Extraindo texto da página ${i} de ${total}...`);

    const page = await pdf.getPage(i);
    const text = await extractPageText(page);
    pagesText.push(text);

    setProgress((i / total) * 100, `Extraindo texto da página ${i} de ${total}...`);
  }

  const html = buildDocHtml(pagesText);
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });

  if (lastDocBlobUrl) URL.revokeObjectURL(lastDocBlobUrl);
  lastDocBlobUrl = URL.createObjectURL(blob);

  const filename = `${baseName()}.doc`;

  triggerDownload(lastDocBlobUrl, filename);

  const card = document.createElement("div");
  card.className = "doc-card";

  const icon = document.createElement("div");
  icon.className = "doc-icon";
  icon.textContent = "📝";

  const h3 = document.createElement("h3");
  h3.textContent = "Documento Word pronto!";

  const p = document.createElement("p");
  p.innerHTML =
    `Arquivo <strong>${escapeHtml(filename)}</strong> gerado com ` +
    `${pagesText.length} página(s). ` +
    `Se o download não começou automaticamente, clique no botão abaixo.`;

  const link = document.createElement("a");
  link.className = "btn btn-small";
  link.href = lastDocBlobUrl;
  link.download = filename;
  link.textContent = "Baixar .doc novamente";

  card.append(icon, h3, p, link);
  grid.appendChild(card);

  results.hidden = false;
  setProgress(100, `🎉 Concluído! Documento Word gerado (${pagesText.length} página(s)).`);
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function extractPageText(page) {
  const textContent = await page.getTextContent();
  const lines = new Map();

  textContent.items.forEach((item) => {
    if (!item.str) return;
    const y = Math.round(item.transform[5]);
    if (!lines.has(y)) lines.set(y, []);
    lines.get(y).push(item.str);
  });

  const sortedY = [...lines.keys()].sort((a, b) => b - a);
  return sortedY
    .map((y) => lines.get(y).join(" ").replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

function buildDocHtml(pagesText) {
  let body = "";
  pagesText.forEach((pageText, i) => {
    body += `<h2>Página ${i + 1}</h2>`;
    if (!pageText.trim()) {
      body += `<p><em>(Nenhum texto extraído desta página — pode conter apenas imagens.)</em></p>`;
    } else {
      pageText
        .split("\n")
        .forEach((line) => {
          body += `<p>${escapeHtml(line)}</p>`;
        });
    }
  });

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(baseName())}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; }
    h1 { color: #d61f6f; text-align: center; }
    h2 { color: #ff4d94; border-bottom: 2px solid #ff4d94;
         padding-bottom: 4px; margin-top: 28px; }
    p  { margin: 6px 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(baseName())}</h1>
  ${body}
</body>
</html>`;
}

function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* =========================================================
   BAIXAR TODAS (só para PNG)
   ========================================================= */

downloadAll.addEventListener("click", () => {
  const links = grid.querySelectorAll("a[download]");
  links.forEach((link, i) => {
    setTimeout(() => link.click(), i * 400);
  });
});

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

updateFormatUI();