async function loadContent() {
  const res = await fetch('content.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('content.json konnte nicht geladen werden');
  return res.json();
}

function renderHome(content) {
  const c = content.home;
  document.querySelector('[data-field="photo"]').src = c.photo;
  document.querySelector('[data-field="name"]').textContent = c.name;
  document.querySelector('[data-field="tagline"]').textContent = c.tagline;

  const cardsEl = document.querySelector('[data-field="cards"]');
  cardsEl.innerHTML = '';
  c.cards.forEach(card => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <span class="card-icon" aria-hidden="true">${card.icon}</span>
      <h2>${card.title}</h2>
      <div class="card-text">${card.html}</div>
    `;
    cardsEl.appendChild(el);
  });
}

function renderKontakt(content) {
  const c = content.kontakt;
  document.querySelector('[data-field="kontakt-html"]').innerHTML = c.html;
  const cvSection = document.querySelector('[data-field="cv-section"]');
  if (c.cvLink) {
    document.querySelector('[data-field="cv-html"]').innerHTML = c.cvHtml;
    document.querySelector('[data-field="cv-link"]').href = c.cvLink;
    if (cvSection) cvSection.style.display = '';
  } else {
    if (cvSection) cvSection.style.display = 'none';
  }
}

function renderList(content, key) {
  const items = content[key].items;
  const wrap = document.querySelector('[data-field="list"]');
  wrap.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('article');
    el.className = 'card';
    const linkHtml = item.link ? `<p><a href="${item.link}">Mehr dazu</a></p>` : '';
    el.innerHTML = `<h2>${item.title}</h2><div class="card-text">${item.html}</div>${linkHtml}`;
    wrap.appendChild(el);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  try {
    const content = await loadContent();
    if (page === 'home') renderHome(content);
    if (page === 'kontakt') renderKontakt(content);
    if (page === 'referenzen') renderList(content, 'referenzen');
    if (page === 'beispiele') renderList(content, 'beispiele');
  } catch (e) {
    console.error(e);
  }
});
