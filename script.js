const pdfjsLib = window.pdfjsLib;
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const fileInput   = document.getElementById("fileInput");
const dropzone    = document.getElementById("dropzone");
const convertBtn  = document.getElementById("convertBtn");
const statusBox   = document.getElementById("status");
const statusText  = document.getElementById("statusText");
const percentText = document.getElementById("percentText");
const progressBar = document.getElementById("progressBar");
const fileInfo    = document.getElementById("fileInfo");
const fileName    = document.getElementById("fileName");
const fileMeta    = document.getElementById("fileMeta");
const results     = document.getElementById("results");
const grid        = document.getElementById("grid");
const downloadAll = document.getElementById("downloadAll");

let selectedFile = null;
let isBusy = false;

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

  grid.innerHTML = "";
  results.hidden = true;

  showStatus();
  setProgress(0, '✅ Arquivo carregado. Clique em "Converter para PNG".');
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

convertBtn.addEventListener("click", convert);

async function convert() {
  if (!selectedFile || isBusy) return;

  isBusy = true;
  convertBtn.disabled = true;
  grid.innerHTML = "";
  results.hidden = true;

  showStatus();
  setProgress(0, "Lendo o arquivo...");

  try {
    const buffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const total = pdf.numPages;

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
      addResultCard(i, dataUrl);

      canvas.width = 0;
      canvas.height = 0;

      setProgress((i / total) * 100, `Convertendo página ${i} de ${total}...`);
    }

    results.hidden = false;
    setProgress(100, `🎉 Concluído! ${total} página(s) convertida(s).`);
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    console.error(err);
    setProgress(0, "❌ Erro ao converter: " + (err.message || err));
  } finally {
    isBusy = false;
    convertBtn.disabled = false;
  }
}

function addResultCard(index, dataUrl) {
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

downloadAll.addEventListener("click", () => {
  const links = grid.querySelectorAll("a[download]");
  links.forEach((link, i) => {
    setTimeout(() => link.click(), i * 400);
  });
});