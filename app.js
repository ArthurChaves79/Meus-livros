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
const dialog = document.getElementById('book-dialog');
const form = document.getElementById('book-form');
const dialogTitle = document.getElementById('dialog-title');
const tituloInput = document.getElementById('titulo');
const autorInput = document.getElementById('autor');
const statusSelect = document.getElementById('status');
const ratingField = document.getElementById('rating-field');
const starPicker = document.getElementById('star-picker');
const stars = starPicker.querySelectorAll('.star');
const idInput = document.getElementById('book-id');
const deleteBtn = document.getElementById('delete-btn');
const cancelBtn = document.getElementById('cancel-btn');
const addBtn = document.getElementById('add-btn');
const emptyAddBtn = document.getElementById('empty-add-btn');

let currentFilter = 'todos';

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
    statusSelect.value = book.status;
    setRating(book.nota || 0);
    deleteBtn.hidden = false;
  } else {
    dialogTitle.textContent = 'Adicionar livro';
    idInput.value = '';
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

function render() {
  const books = loadBooks();
  const visible = books
    .filter((b) => currentFilter === 'todos' || b.status === currentFilter)
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));

  bookList.innerHTML = '';
  emptyState.hidden = books.length > 0;

  if (books.length > 0 && visible.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.textContent = 'Nenhum livro nesta categoria.';
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
  const now = new Date().toISOString();

  if (id) {
    const existing = books.find((b) => b.id === id);
    existing.titulo = titulo;
    existing.autor = autorInput.value.trim();
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

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
