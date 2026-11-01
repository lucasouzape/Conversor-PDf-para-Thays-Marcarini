# Conversor PDf para Thays Marcarini
Conversor de pdf para word e vice versa para Thays ( minha namorada) usar no trabalho devido a limitacoes do ambiente


# 💖 Thata eu te amo — Conversor de PDF

Um conversor de PDF **100% client-side** que transforma cada página de um arquivo PDF em uma imagem PNG — sem backend, sem servidor, sem upload para lugar nenhum. Roda direto no navegador e pode ser hospedado gratuitamente no **GitHub Pages**.

![Status](https://img.shields.io/badge/status-pronto-ff4d94)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-d61f6f)
![Sem backend](https://img.shields.io/badge/backend-nenhum-ff4d94)

---

## 💌 Por que foi feito?

Este projeto nasceu de um gesto simples: **um presente**. O título *"Thata eu te amo"* não é enfeite — é a razão do projeto existir.

A ideia era criar algo **útil e pessoal** ao mesmo tempo:

- **Útil** porque converte PDFs em imagens de forma prática, sem depender de sites cheios de anúncios, limites de upload ou planos pagos.
- **Pessoal** porque foi feito com carinho para a Thata, com um cabeçalho rosa, um design suave e uma mensagem que não deixa dúvidas. 💗

Além disso, o projeto também serve como um **exemplo didático** de como fazer conversão de arquivos no navegador usando apenas HTML, CSS e JavaScript — sem frameworks, sem build, sem dependências pesadas.

---

## ✨ O que ele faz

- 📄 Aceita arquivos **PDF** via **clique** ou **arrastar e soltar** (drag & drop).
- 🔄 Converte **cada página** do PDF em uma **imagem PNG** de alta qualidade (escala 2×).
- 📊 Mostra **barra de progresso** e **status em tempo real** durante a conversão.
- 🖼️ Exibe **pré-visualização** de cada página convertida.
- 💾 Permite **baixar página por página** ou **todas de uma vez**.
- 📱 Layout **responsivo** (funciona bem em celular, tablet e desktop).
- 🔒 **Nenhum arquivo sai do seu computador** — toda a conversão acontece no navegador.

---

## 🧠 Como funciona (por dentro)

A conversão é feita inteiramente no navegador usando a biblioteca **[pdf.js](https://mozilla.github.io/pdf.js/)** (mantida pela Mozilla), carregada via CDN. Nenhum dado é enviado para servidores.

### Fluxo da conversão

```
Usuário escolhe o PDF
        │
        ▼
FileReader lê o arquivo como ArrayBuffer
        │
        ▼
pdf.js carrega o documento em memória
        │
        ▼
Para cada página:
   ├─ cria um <canvas> no tamanho da página (escala 2×)
   ├─ renderiza a página do PDF no canvas
   ├─ converte o canvas em dataURL (PNG)
   └─ adiciona um card com pré-visualização + botão de download
        │
        ▼
Mostra os resultados na tela
```

### Etapas em detalhe

1. **Seleção do arquivo** — O usuário clica na dropzone ou arrasta o PDF. O arquivo é validado (precisa ser `application/pdf` ou terminar em `.pdf`) e sua metadata (nome + tamanho) é exibida na tela.

2. **Leitura** — `selectedFile.arrayBuffer()` carrega o PDF como binário na memória. Nada é enviado para fora.

3. **Parsing** — `pdfjsLib.getDocument({ data: buffer }).promise` devolve um objeto com todas as páginas do PDF.

4. **Renderização página por página**:
   - `page.getViewport({ scale: 2 })` define a resolução (2× = qualidade de impressão).
   - Um `<canvas>` do tamanho da página é criado **dinamicamente**.
   - O fundo é preenchido com branco (evita PNGs transparentes feios).
   - `page.render({ canvasContext, viewport })` desenha a página no canvas.
   - `canvas.toDataURL("image/png")` gera a imagem final.
   - O canvas é zerado (`width = 0; height = 0`) para liberar memória.

5. **Download** — Cada página vira um `<a download>` com o `dataURL` como `href`. O botão **"Baixar todas"** dispara os cliques em sequência (com pequeno delay entre eles para não travar o navegador).

---

## 🚀 Como usar

### Online (GitHub Pages)

Acesse o endereço do projeto publicado no GitHub Pages — não precisa instalar nada.

### Rodando localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/SEU-REPO.git
   ```
2. Abra o arquivo `index.html` no navegador. **Pronto.**

> ⚠️ Se preferir rodar com servidor local (recomendado), use:
> ```bash
> python3 -m http.server 8000
> ```
> e acesse `http://localhost:8000`.

### Publicando no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie os 3 arquivos (`index.html`, `styles.css`, `script.js`) na raiz.
3. Vá em **Settings → Pages**.
4. Em **Source**, escolha **Deploy from a branch** → branch **`main`** → pasta **`/ (root)`**.
5. Salve e aguarde ~1 minuto.
6. Seu site estará em `https://SEU-USUARIO.github.io/SEU-REPO/`.

---

## 📁 Arquivos do projeto

O projeto é composto por **3 arquivos** que devem ficar na raiz do repositório. O conteúdo completo de cada um está abaixo.

### 📄 `index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thata eu te amo — Conversor de PDF</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

  <header class="hero">
    <h1>Thata eu te amo</h1>
    <p>Conversor de PDF para imagens PNG</p>
  </header>

  <main class="container">

    <section class="card">
      <label for="fileInput" class="dropzone" id="dropzone">
        <input type="file" id="fileInput" accept="application/pdf,.pdf" hidden />
        <span class="dropzone-icon">📄</span>
        <span class="dropzone-text">Clique ou arraste um PDF aqui</span>
        <span class="dropzone-hint">Apenas arquivos .pdf</span>
      </label>

      <div class="status" id="status" hidden>
        <div class="status-row">
          <span id="statusText">Pronto</span>
          <span id="percentText">0%</span>
        </div>
        <div class="progress">
          <div class="progress-bar" id="progressBar"></div>
        </div>
      </div>

      <div class="file-info" id="fileInfo" hidden>
        <strong id="fileName"></strong>
        <span id="fileMeta"></span>
      </div>

      <button id="convertBtn" class="btn" disabled>Converter para PNG</button>
    </section>

    <section class="results" id="results" hidden>
      <div class="results-head">
        <h2>Páginas convertidas</h2>
        <button id="downloadAll" class="btn btn-ghost btn-small">Baixar todas</button>
      </div>
      <div class="grid" id="grid"></div>
    </section>

  </main>

  <footer>Feito com ❤️ para Thata</footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script src="script.js"></script>
</body>
</html>
```

### 🎨 `styles.css`

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --pink: #ff4d94;
  --pink-dark: #d61f6f;
  --pink-soft: #ffd9e8;
  --pink-bg: #fff5f9;
  --text: #3a2c33;
  --muted: #8a7a82;
  --white: #ffffff;
  --radius: 18px;
  --shadow: 0 10px 30px rgba(214, 31, 111, 0.12);
}

body {
  font-family: "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
  background: var(--pink-bg);
  color: var(--text);
  line-height: 1.5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  overflow: hidden;
  text-align: center;
  color: var(--white);
  padding: 64px 20px 56px;
  background: linear-gradient(135deg, #ff9ac6 0%, var(--pink) 45%, var(--pink-dark) 100%);
  border-radius: 0 0 40px 40px;
  box-shadow: 0 12px 40px rgba(214, 31, 111, 0.3);
}

.hero::before {
  content: "";
  position: absolute;
  top: -140px;
  right: -100px;
  width: 380px;
  height: 380px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  pointer-events: none;
}

.hero > * {
  position: relative;
  z-index: 1;
}

.hero h1 {
  font-size: clamp(2.3rem, 8vw, 4.5rem);
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1.05;
  text-shadow: 0 6px 22px rgba(0, 0, 0, 0.18);
}

.hero p {
  margin-top: 14px;
  font-size: clamp(0.95rem, 2.5vw, 1.15rem);
  opacity: 0.95;
}

.container {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 40px 20px 60px;
  flex: 1;
}

.card {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 52px 20px;
  border: 2px dashed var(--pink-soft);
  border-radius: var(--radius);
  background: #fffafc;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.25s, background 0.25s, transform 0.2s;
}

.dropzone:hover,
.dropzone.dragover {
  border-color: var(--pink);
  background: #fff0f6;
  transform: translateY(-2px);
}

.dropzone-icon {
  font-size: 3rem;
  line-height: 1;
}

.dropzone-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--pink-dark);
}

.dropzone-hint {
  font-size: 0.85rem;
  color: var(--muted);
}

.status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--muted);
}

#percentText {
  font-weight: 700;
  color: var(--pink-dark);
}

.progress {
  height: 12px;
  background: var(--pink-soft);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: 0%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff9ac6, var(--pink));
  transition: width 0.25s ease;
}

.file-info {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
  padding: 12px 16px;
  background: #fff0f6;
  border-left: 4px solid var(--pink);
  border-radius: 10px;
  font-size: 0.92rem;
}

.file-info strong {
  color: var(--pink-dark);
  word-break: break-all;
}

.file-info span {
  color: var(--muted);
}

.btn {
  align-self: flex-start;
  border: none;
  border-radius: 999px;
  padding: 14px 34px;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  color: var(--white);
  background: linear-gradient(135deg, var(--pink), var(--pink-dark));
  box-shadow: 0 8px 20px rgba(255, 77, 148, 0.35);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(255, 77, 148, 0.45);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-small {
  padding: 9px 20px;
  font-size: 0.85rem;
}

.btn-ghost {
  background: transparent;
  color: var(--pink-dark);
  border: 2px solid var(--pink);
  box-shadow: none;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--pink);
  color: var(--white);
  box-shadow: 0 8px 20px rgba(255, 77, 148, 0.35);
}

.results {
  margin-top: 40px;
}

.results-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.results-head h2 {
  font-size: 1.35rem;
  color: var(--pink-dark);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 16px;
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--white);
  border: 1px solid #ffe1ee;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(214, 31, 111, 0.08);
}

.result-card img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  background: var(--white);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
}

.result-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--muted);
}

footer {
  text-align: center;
  padding: 28px 20px;
  font-size: 0.9rem;
  color: var(--muted);
}

@media (max-width: 560px) {
  .hero {
    padding: 46px 16px 40px;
    border-radius: 0 0 28px 28px;
  }

  .container {
    padding: 28px 14px 44px;
  }

  .card {
    padding: 18px;
  }

  .dropzone {
    padding: 38px 14px;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
```

### ⚙️ `script.js`

```javascript
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
```

---

## 🛠️ Tecnologias usadas

| Tecnologia | Para quê |
|------------|----------|
| **HTML5** | Estrutura semântica da página |
| **CSS3** | Tema rosa, layout responsivo, animações e progresso |
| **JavaScript (vanilla)** | Toda a lógica de conversão, sem frameworks |
| **[pdf.js](https://mozilla.github.io/pdf.js/)** | Parsing e renderização do PDF (via CDN) |

Sem **Node.js**, sem **npm**, sem **build step**. O projeto é literalmente abrir e rodar.

---

## 🎨 Design

- Tema **rosa** com gradiente no cabeçalho (`#ff9ac6 → #ff4d94 → #d61f6f`).
- Título grande com `clamp()` para escalar entre mobile e desktop.
- Cartões com sombra suave e bordas arredondadas.
- Dropzone com feedback visual ao arrastar arquivo.
- Barra de progresso animada com `transition`.
- Totalmente responsivo — funciona bem a partir de ~320px de largura.

---

## 🧩 Limitações conhecidas

- **Arquivos muito grandes** (acima de ~100 MB ou centenas de páginas) podem consumir bastante memória do navegador.
- A conversão é para **PNG** — não gera texto editável (não é OCR).
- Se quiser converter para **JPG** ou **PDF a partir de imagens**, é necessário adaptar o código.

---

## ❤️ Uma nota pessoal

Esse projeto é pequeno em código, mas grande em intenção.

> **Thata, eu te amo.**

Se você chegou até aqui e não é a Thata — fica à vontade para usar, modificar, aprender com o código e fazer sua própria versão. Só não esquece de colocar um cabeçalho bonito. 💗

---

## 📄 Licença

MIT — use, copie, modifique e compartilhe livremente. Só mantenha o crédito.