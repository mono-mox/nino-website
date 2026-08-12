const statusEl = document.getElementById('status');
const formArea = document.getElementById('formArea');
let currentContent = null;
let contentSha = null;
const quills = {}; // id -> Quill instance
let cardCount = 0;

function setStatus(text) { statusEl.textContent = text; }

function getCreds() {
  return {
    owner: document.getElementById('ghOwner').value.trim() || localStorage.getItem('gh_owner') || '',
    repo: document.getElementById('ghRepo').value.trim() || localStorage.getItem('gh_repo') || '',
    token: document.getElementById('ghToken').value.trim() || localStorage.getItem('gh_token') || ''
  };
}

document.getElementById('saveTokenBtn').addEventListener('click', () => {
  const { owner, repo, token } = getCreds();
  localStorage.setItem('gh_owner', owner);
  localStorage.setItem('gh_repo', repo);
  localStorage.setItem('gh_token', token);
  setStatus('Zugangsdaten gespeichert.');
  loadContentFromGithub();
});

function prefillCreds() {
  document.getElementById('ghOwner').value = localStorage.getItem('gh_owner') || '';
  document.getElementById('ghRepo').value = localStorage.getItem('gh_repo') || '';
  document.getElementById('ghToken').value = localStorage.getItem('gh_token') || '';
}

async function githubGetFile(path) {
  const { owner, repo, token } = getCreds();
  const headers = token ? { Authorization: 'Bearer ' + token } : {};
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
  if (!res.ok) throw new Error('Konnte ' + path + ' nicht laden (Status ' + res.status + ')');
  return res.json();
}

async function githubPutFile(path, contentBase64, sha, message) {
  const { owner, repo, token } = getCreds();
  const body = { message, content: contentBase64 };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Fehler beim Speichern von ' + path + ': ' + err);
  }
  return res.json();
}

function b64EncodeUnicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

async function loadContentFromGithub() {
  setStatus('Lade Inhalte…');
  try {
    const file = await githubGetFile('content.json');
    contentSha = file.sha;
    currentContent = JSON.parse(decodeURIComponent(escape(atob(file.content))));
    renderForm(currentContent);
    setStatus('Inhalte geladen.');
  } catch (e) {
    console.error(e);
    setStatus('Fehler beim Laden: ' + e.message);
  }
}

function makeQuill(containerId, initialHtml) {
  const q = new Quill('#' + containerId, {
    theme: 'snow',
    modules: { toolbar: [['bold','italic','underline'],[{list:'ordered'},{list:'bullet'}],['link'],['clean']] }
  });
  q.root.innerHTML = initialHtml || '';
  quills[containerId] = q;
  return q;
}

function fieldBlock(labelText, inputHtml) {
  return `<div class="field"><label>${labelText}</label>${inputHtml}</div>`;
}

function renderForm(content) {
  cardCount = 0;
  let html = '';

  // HOME
  html += `<div class="section-title">Startseite</div>`;
  html += fieldBlock('Name', `<input type="text" id="f-name" value="${escapeAttr(content.home.name)}">`);
  html += fieldBlock('Untertitel', `<input type="text" id="f-tagline" value="${escapeAttr(content.home.tagline)}">`);
  html += fieldBlock('Foto (Banner)', `
    <img class="img-preview" id="photo-preview" src="${content.home.photo}">
    <input type="file" id="f-photo-upload" accept="image/*">
    <input type="hidden" id="f-photo-path" value="${escapeAttr(content.home.photo)}">
  `);

  content.home.cards.forEach((card, i) => {
    const qid = 'q-card-' + i;
    html += `<div class="card-block">
      <div class="field"><label>Icon (Emoji)</label><input type="text" id="f-card-icon-${i}" value="${escapeAttr(card.icon)}" style="width:80px;"></div>
      <div class="field"><label>Titel</label><input type="text" id="f-card-title-${i}" value="${escapeAttr(card.title)}"></div>
      <div class="field"><label>Text</label><div class="editor" id="${qid}"></div></div>
    </div>`;
  });

  // KONTAKT
  html += `<div class="section-title">Kontakt</div>`;
  html += fieldBlock('Kontaktangaben', `<div class="editor" id="q-kontakt"></div>`);
  html += fieldBlock('Lebenslauf-Text', `<div class="editor" id="q-cv"></div>`);
  html += fieldBlock('Lebenslauf-Datei', `
    <input type="file" id="f-cv-upload" accept="application/pdf">
    <input type="hidden" id="f-cv-path" value="${escapeAttr(content.kontakt.cvLink)}">
    <p style="font-size:12px; color:var(--ink-muted); margin:6px 0 0;" id="cv-current-label">${content.kontakt.cvLink ? 'Aktuell: ' + escapeAttr(content.kontakt.cvLink) : 'Aktuell: kein Lebenslauf hinterlegt'}</p>
    <button class="btn secondary" id="deleteCvBtn" type="button" style="margin-top:8px;" ${content.kontakt.cvLink ? '' : 'disabled'}>Lebenslauf entfernen</button>
  `);

  // REFERENZEN
  html += `<div class="section-title">Referenzen</div>`;
  html += `<div id="ref-list"></div>`;
  html += `<button class="btn secondary" id="addRefBtn" type="button">+ Referenz hinzufügen</button>`;

  // BEISPIELE
  html += `<div class="section-title">Programmier-Beispiele</div>`;
  html += `<div id="bsp-list"></div>`;
  html += `<button class="btn secondary" id="addBspBtn" type="button">+ Beispiel hinzufügen</button>`;

  formArea.innerHTML = html;

  content.home.cards.forEach((card, i) => makeQuill('q-card-' + i, card.html));
  makeQuill('q-kontakt', content.kontakt.html);
  makeQuill('q-cv', content.kontakt.cvHtml);

  renderRepeatable('ref-list', content.referenzen.items, 'ref');
  renderRepeatable('bsp-list', content.beispiele.items, 'bsp', true);

  document.getElementById('addRefBtn').addEventListener('click', () => addRepeatableItem('ref-list', 'ref'));
  document.getElementById('addBspBtn').addEventListener('click', () => addRepeatableItem('bsp-list', 'bsp', true));

  document.getElementById('f-photo-upload').addEventListener('change', e => previewImage(e, 'photo-preview'));

  document.getElementById('deleteCvBtn').addEventListener('click', () => {
    document.getElementById('f-cv-path').value = '';
    document.getElementById('f-cv-upload').value = '';
    document.getElementById('cv-current-label').textContent = 'Kein Lebenslauf (wird beim Speichern entfernt)';
    document.getElementById('deleteCvBtn').disabled = true;
  });

  document.getElementById('f-cv-upload').addEventListener('change', e => {
    if (e.target.files[0]) {
      document.getElementById('cv-current-label').textContent = 'Neue Datei ausgewählt: ' + e.target.files[0].name;
      document.getElementById('deleteCvBtn').disabled = false;
    }
  });
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;');
}

function previewImage(e, previewId) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { document.getElementById(previewId).src = reader.result; };
  reader.readAsDataURL(file);
}

let repeatCounters = {};
function renderRepeatable(containerId, items, prefix, withLink) {
  repeatCounters[prefix] = 0;
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  items.forEach(item => addRepeatableItem(containerId, prefix, withLink, item));
}

function addRepeatableItem(containerId, prefix, withLink, item) {
  const idx = repeatCounters[prefix]++;
  const qid = `q-${prefix}-${idx}`;
  const el = document.getElementById(containerId);
  const block = document.createElement('div');
  block.className = 'card-block';
  block.dataset.idx = idx;
  block.innerHTML = `
    <div class="field"><label>Titel</label><input type="text" class="${prefix}-title" value="${escapeAttr(item ? item.title : '')}"></div>
    <div class="field"><label>Text</label><div class="editor" id="${qid}"></div></div>
    ${withLink ? `<div class="field"><label>Link</label><input type="text" class="${prefix}-link" value="${escapeAttr(item ? item.link : '')}"></div>` : ''}
    <button class="btn secondary" type="button" onclick="this.parentElement.remove()">Entfernen</button>
  `;
  el.appendChild(block);
  makeQuill(qid, item ? item.html : '');
}

function collectRepeatable(containerId, prefix, withLink) {
  const items = [];
  document.querySelectorAll(`#${containerId} .card-block`).forEach(block => {
    const title = block.querySelector(`.${prefix}-title`).value;
    const qEl = block.querySelector('.editor');
    const q = quills[qEl.id];
    const item = { title, html: q.root.innerHTML };
    if (withLink) item.link = block.querySelector(`.${prefix}-link`).value;
    items.push(item);
  });
  return items;
}

async function uploadImageIfNeeded(fileInputId, currentPath, folder) {
  const input = document.getElementById(fileInputId);
  const file = input.files[0];
  if (!file) return currentPath;
  const arrayBuffer = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`;
  await githubPutFile(path, base64, null, 'Bild hochgeladen über CMS');
  return path;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

document.getElementById('saveBtn').addEventListener('click', async () => {
  if (!currentContent) return;
  setStatus('Speichere…');
  try {
    const photoPath = await uploadImageIfNeeded('f-photo-upload', document.getElementById('f-photo-path').value, 'assets');
    const cvPath = await uploadImageIfNeeded('f-cv-upload', document.getElementById('f-cv-path').value, 'assets');

    const newContent = {
      home: {
        photo: photoPath,
        name: document.getElementById('f-name').value,
        tagline: document.getElementById('f-tagline').value,
        cards: currentContent.home.cards.map((card, i) => ({
          icon: document.getElementById(`f-card-icon-${i}`).value,
          title: document.getElementById(`f-card-title-${i}`).value,
          html: quills['q-card-' + i].root.innerHTML
        }))
      },
      kontakt: {
        html: quills['q-kontakt'].root.innerHTML,
        cvHtml: quills['q-cv'].root.innerHTML,
        cvLink: cvPath
      },
      referenzen: { items: collectRepeatable('ref-list', 'ref', false) },
      beispiele: { items: collectRepeatable('bsp-list', 'bsp', true) }
    };

    const jsonStr = JSON.stringify(newContent, null, 2);
    const result = await githubPutFile('content.json', b64EncodeUnicode(jsonStr), contentSha, 'Inhalte über CMS aktualisiert');
    contentSha = result.content.sha;
    currentContent = newContent;
    setStatus('Gespeichert – die Website aktualisiert sich in ca. 1 Minute.');
  } catch (e) {
    console.error(e);
    setStatus('Fehler: ' + e.message);
  }
});

prefillCreds();
if (getCreds().owner && getCreds().repo) {
  loadContentFromGithub();
} else {
  setStatus('Bitte zuerst Zugangsdaten oben eintragen.');
}
