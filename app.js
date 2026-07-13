const STORAGE_KEY = 'meusLivros.books';

const STATUS_LABEL = {
  'quero ler': 'Quero ler',
  lendo: 'Lendo',
  lido: 'Lido',
};

const STATUS_CLASS = {
  'quero ler': 'quero-ler',
  lendo: 'lendo',
  lido: 'lido',
};

const bookList = document.getElementById('book-list');
const emptyState = document.getElementById('empty-state');
const tabs = document.querySelectorAll('.tab');
const searchInput = document.getElementById('search-input');
const locationFiltersEl = document.getElementById('location-filters');
const dialog = document.getElementById('book-dialog');
const form = document.getElementById('book-form');
const dialogTitle = document.getElementById('dialog-title');
const tituloInput = document.getElementById('titulo');
const autorInput = document.getElementById('autor');
const localizacaoInput = document.getElementById('localizacao');
const statusSelect = document.getElementById('status');
const ratingField = document.getElementById('rating-field');
const starPicker = document.getElementById('star-picker');
const stars = starPicker.querySelectorAll('.star');
const idInput = document.getElementById('book-id');
const deleteBtn = document.getElementById('delete-btn');
const cancelBtn = document.getElementById('cancel-btn');
const addBtn = document.getElementById('add-btn');
const emptyAddBtn = document.getElementById('empty-add-btn');

const scanBtn = document.getElementById('scan-btn');
const scanDialog = document.getElementById('scan-dialog');
const scanVideo = document.getElementById('scan-video');
const scanCancelBtn = document.getElementById('scan-cancel-btn');
const scanHint = document.getElementById('scan-hint');
const isbnInput = document.getElementById('isbn-input');
const isbnLookupBtn = document.getElementById('isbn-lookup-btn');

let currentFilter = 'todos';
let currentSearch = '';
let currentLocation = null;

function loadBooks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function setRating(value) {
  starPicker.dataset.value = String(value);
  stars.forEach((star) => {
    star.classList.toggle('filled', Number(star.dataset.value) <= value);
  });
}

function openDialog(book) {
  form.reset();
  setRating(0);

  if (book) {
    dialogTitle.textContent = 'Editar livro';
    idInput.value = book.id;
    tituloInput.value = book.titulo;
    autorInput.value = book.autor || '';
    localizacaoInput.value = book.localizacao || '';
    statusSelect.value = book.status;
    setRating(book.nota || 0);
    deleteBtn.hidden = false;
  } else {
    dialogTitle.textContent = 'Adicionar livro';
    idInput.value = '';
    localizacaoInput.value = '';
    statusSelect.value = 'quero ler';
    deleteBtn.hidden = true;
  }

  ratingField.hidden = statusSelect.value !== 'lido';
  dialog.showModal();
  tituloInput.focus();
}

function closeDialog() {
  dialog.close();
}

const SPINE_COUNT = 6;
function spineFor(titulo) {
  let hash = 0;
  for (let i = 0; i < titulo.length; i++) {
    hash = (hash * 31 + titulo.charCodeAt(i)) >>> 0;
  }
  return `var(--spine-${(hash % SPINE_COUNT) + 1})`;
}

function renderLocationFilters(allBooks) {
  const counts = new Map();
  for (const book of allBooks) {
    if (!book.localizacao) continue;
    counts.set(book.localizacao, (counts.get(book.localizacao) || 0) + 1);
  }

  const locations = [...counts.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  locationFiltersEl.innerHTML = '';
  locationFiltersEl.hidden = locations.length === 0;

  for (const loc of locations) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'location-chip' + (currentLocation === loc ? ' active' : '');
    chip.textContent = `📍 ${loc} (${counts.get(loc)})`;
    chip.addEventListener('click', () => {
      currentLocation = currentLocation === loc ? null : loc;
      render();
    });
    locationFiltersEl.appendChild(chip);
  }
}

function render() {
  const books = loadBooks();
  renderLocationFilters(books);

  const search = currentSearch.trim().toLowerCase();
  const visible = books
    .filter((b) => currentFilter === 'todos' || b.status === currentFilter)
    .filter((b) => !currentLocation || b.localizacao === currentLocation)
    .filter((b) => {
      if (!search) return true;
      return (
        b.titulo.toLowerCase().includes(search) ||
        (b.autor || '').toLowerCase().includes(search) ||
        (b.localizacao || '').toLowerCase().includes(search)
      );
    })
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));

  bookList.innerHTML = '';
  emptyState.hidden = books.length > 0;

  if (books.length > 0 && visible.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.textContent = 'Nenhum livro encontrado.';
    bookList.appendChild(li);
    return;
  }

  for (const book of visible) {
    const li = document.createElement('li');
    li.className = 'book-card';
    li.dataset.id = book.id;
    li.style.setProperty('--spine', spineFor(book.titulo));

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = book.titulo;

    const author = document.createElement('div');
    author.className = 'author';
    author.textContent = book.autor || 'Autor desconhecido';

    const meta = document.createElement('div');
    meta.className = 'meta';

    const badge = document.createElement('span');
    badge.className = `badge ${STATUS_CLASS[book.status]}`;
    badge.textContent = STATUS_LABEL[book.status];
    meta.appendChild(badge);

    if (book.status === 'lido' && book.nota) {
      const starsEl = document.createElement('span');
      starsEl.className = 'stars-readonly';
      starsEl.textContent = '★'.repeat(book.nota) + '☆'.repeat(5 - book.nota);
      meta.appendChild(starsEl);
    }

    li.append(title, author, meta);

    if (book.localizacao) {
      const loc = document.createElement('div');
      loc.className = 'location-tag';
      loc.textContent = `📍 ${book.localizacao}`;
      li.appendChild(loc);
    }

    li.addEventListener('click', () => openDialog(book));
    bookList.appendChild(li);
  }
}

statusSelect.addEventListener('change', () => {
  ratingField.hidden = statusSelect.value !== 'lido';
});

stars.forEach((star) => {
  star.addEventListener('click', () => setRating(Number(star.dataset.value)));
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    currentFilter = tab.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', () => {
  currentSearch = searchInput.value;
  render();
});

addBtn.addEventListener('click', () => openDialog(null));
emptyAddBtn.addEventListener('click', () => openDialog(null));
cancelBtn.addEventListener('click', closeDialog);

deleteBtn.addEventListener('click', () => {
  const id = idInput.value;
  if (!id) return;
  const books = loadBooks().filter((b) => b.id !== id);
  saveBooks(books);
  closeDialog();
  render();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const titulo = tituloInput.value.trim();
  if (!titulo) return;

  const books = loadBooks();
  const id = idInput.value;
  const status = statusSelect.value;
  const nota = status === 'lido' ? Number(starPicker.dataset.value) || null : null;
  const localizacao = localizacaoInput.value.trim() || null;
  const now = new Date().toISOString();

  if (id) {
    const existing = books.find((b) => b.id === id);
    existing.titulo = titulo;
    existing.autor = autorInput.value.trim();
    existing.localizacao = localizacao;
    if (existing.status !== 'lido' && status === 'lido') {
      existing.lidoEm = now;
    }
    if (status !== 'lido') {
      existing.lidoEm = null;
    }
    existing.status = status;
    existing.nota = nota;
  } else {
    books.push({
      id: crypto.randomUUID(),
      titulo,
      autor: autorInput.value.trim(),
      localizacao,
      status,
      nota,
      criadoEm: now,
      lidoEm: status === 'lido' ? now : null,
    });
  }

  saveBooks(books);
  closeDialog();
  render();
});

// --- Leitor de código de barras (ISBN) ---

let scanStream = null;
let scanRAF = null;

async function openScanner() {
  if (!('BarcodeDetector' in window)) {
    alert(
      'Seu navegador não suporta leitura de código de barras pela câmera (comum no Safari). ' +
      'Digite o ISBN do livro no campo "Ou digite o ISBN" e toque em Buscar.'
    );
    return;
  }

  try {
    scanStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
  } catch {
    alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    return;
  }

  scanVideo.srcObject = scanStream;
  scanHint.textContent = 'Aponte a câmera para o código de barras (ISBN) na contracapa do livro.';
  scanDialog.showModal();

  const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a'] });

  const tick = async () => {
    if (!scanStream) return;
    try {
      const codes = await detector.detect(scanVideo);
      if (codes.length > 0) {
        const isbn = codes[0].rawValue;
        stopScanner();
        await lookupIsbn(isbn);
        return;
      }
    } catch {
      // ignore per-frame detection errors and keep trying
    }
    scanRAF = requestAnimationFrame(tick);
  };
  scanRAF = requestAnimationFrame(tick);
}

function stopScanner() {
  if (scanRAF) cancelAnimationFrame(scanRAF);
  scanRAF = null;
  if (scanStream) {
    scanStream.getTracks().forEach((track) => track.stop());
    scanStream = null;
  }
  scanVideo.srcObject = null;
  if (scanDialog.open) scanDialog.close();
}

async function lookupIsbn(isbn) {
  tituloInput.value = 'Buscando informações do livro...';
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );
    const data = await res.json();
    const info = data[`ISBN:${isbn}`];
    if (info) {
      tituloInput.value = info.title || '';
      autorInput.value = (info.authors || []).map((a) => a.name).join(', ');
    } else {
      tituloInput.value = '';
      alert('Não encontramos esse livro automaticamente. Preencha os dados manualmente.');
    }
  } catch {
    tituloInput.value = '';
    alert('Não foi possível buscar os dados do livro. Verifique sua conexão e preencha manualmente.');
  }
  tituloInput.focus();
}

scanBtn.addEventListener('click', openScanner);
scanCancelBtn.addEventListener('click', stopScanner);
scanDialog.addEventListener('cancel', stopScanner);

isbnLookupBtn.addEventListener('click', () => {
  const isbn = isbnInput.value.replace(/[^0-9Xx]/g, '');
  if (!isbn) {
    alert('Digite o ISBN do livro (os números embaixo do código de barras).');
    return;
  }
  lookupIsbn(isbn);
});

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
