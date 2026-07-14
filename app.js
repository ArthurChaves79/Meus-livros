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
const emprestadoInput = document.getElementById('emprestado');
const bookIsbnInput = document.getElementById('book-isbn');
const locationSuggestEl = document.getElementById('location-suggest');
const locationSuggestText = document.getElementById('location-suggest-text');
const locationSuggestBtn = document.getElementById('location-suggest-btn');
const coverInput = document.getElementById('cover-input');
const coverPreviewWrap = document.getElementById('cover-preview-wrap');
const coverPreview = document.getElementById('cover-preview');
const coverRemoveBtn = document.getElementById('cover-remove-btn');
const duplicateWarningEl = document.getElementById('duplicate-warning');
const duplicateWarningText = document.getElementById('duplicate-warning-text');
const generoInput = document.getElementById('genero');
const edicaoInput = document.getElementById('edicao');
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

const backupBtn = document.getElementById('backup-btn');
const backupDialog = document.getElementById('backup-dialog');
const backupCloseBtn = document.getElementById('backup-close-btn');
const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');

const loanToggleBtn = document.getElementById('loan-toggle-btn');

const statsBtn = document.getElementById('stats-btn');
const statsDialog = document.getElementById('stats-dialog');
const statsCloseBtn = document.getElementById('stats-close-btn');
const statsGrid = document.getElementById('stats-grid');

const sortSelect = document.getElementById('sort-select');

const backupReminderEl = document.getElementById('backup-reminder');
const backupReminderExportBtn = document.getElementById('backup-reminder-export-btn');
const backupReminderDismissBtn = document.getElementById('backup-reminder-dismiss-btn');

let currentFilter = 'todos';
let currentSearch = '';
let currentLocation = null;
let currentOnlyLoaned = false;
let currentSort = 'titulo';

// undefined = nada mudou nesta edição; null = capa removida; string = nova capa (data URL)
let pendingCoverDataUrl;

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
  locationSuggestEl.hidden = true;
  duplicateWarningEl.hidden = true;
  pendingCoverDataUrl = undefined;
  coverPreviewWrap.hidden = true;
  coverPreview.src = '';

  if (book) {
    dialogTitle.textContent = 'Editar livro';
    idInput.value = book.id;
    bookIsbnInput.value = book.isbn || '';
    tituloInput.value = book.titulo;
    autorInput.value = book.autor || '';
    generoInput.value = book.genero || '';
    edicaoInput.value = book.edicao || '';
    localizacaoInput.value = book.localizacao || '';
    emprestadoInput.value = book.emprestadoPara || '';
    statusSelect.value = book.status;
    setRating(book.nota || 0);
    deleteBtn.hidden = false;
    if (book.capaCustom) {
      coverPreview.src = book.capaCustom;
      coverPreviewWrap.hidden = false;
    }
  } else {
    dialogTitle.textContent = 'Adicionar livro';
    idInput.value = '';
    bookIsbnInput.value = '';
    localizacaoInput.value = '';
    emprestadoInput.value = '';
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

function coverUrlFor(book) {
  if (book.capaCustom) return book.capaCustom;
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=false`;
  return null;
}

function readAndCompressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo não é uma imagem válida'));
      img.onload = () => {
        const maxDim = 320;
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

coverInput.addEventListener('change', async () => {
  const file = coverInput.files[0];
  if (!file) return;
  try {
    pendingCoverDataUrl = await readAndCompressImage(file);
    coverPreview.src = pendingCoverDataUrl;
    coverPreviewWrap.hidden = false;
  } catch {
    alert('Não foi possível usar essa imagem. Tente outra foto.');
  } finally {
    coverInput.value = '';
  }
});

coverRemoveBtn.addEventListener('click', () => {
  pendingCoverDataUrl = null;
  coverPreview.src = '';
  coverPreviewWrap.hidden = true;
});

function suggestLocationForAuthor(autor) {
  locationSuggestEl.hidden = true;
  if (idInput.value) return; // só sugere para livro novo, não ao editar
  if (!autor) return;
  if (localizacaoInput.value.trim()) return; // já preenchido, não atrapalha

  const books = loadBooks();
  const match = books.find(
    (b) => b.localizacao && b.autor && b.autor.trim().toLowerCase() === autor.trim().toLowerCase()
  );
  if (!match) return;

  locationSuggestText.textContent = `💡 "${match.titulo}", do mesmo autor, está em "${match.localizacao}".`;
  locationSuggestEl.dataset.location = match.localizacao;
  locationSuggestEl.hidden = false;
}

locationSuggestBtn.addEventListener('click', () => {
  localizacaoInput.value = locationSuggestEl.dataset.location || '';
  locationSuggestEl.hidden = true;
});

function checkDuplicate() {
  duplicateWarningEl.hidden = true;
  if (idInput.value) return; // não avisa ao editar o próprio livro

  const titulo = tituloInput.value.trim();
  const autor = autorInput.value.trim();
  const isbn = bookIsbnInput.value.trim();
  if (!titulo && !isbn) return;

  const books = loadBooks();
  const match = books.find((b) => {
    if (isbn && b.isbn && b.isbn === isbn) return true;
    if (!titulo) return false;
    const mesmoTitulo = b.titulo.trim().toLowerCase() === titulo.toLowerCase();
    const mesmoAutor = !autor || !b.autor || b.autor.trim().toLowerCase() === autor.toLowerCase();
    return mesmoTitulo && mesmoAutor;
  });
  if (!match) return;

  duplicateWarningText.textContent = `⚠️ Você já tem "${match.titulo}" cadastrado (${STATUS_LABEL[match.status]}). Salvar mesmo assim vai criar um segundo registro.`;
  duplicateWarningEl.hidden = false;
}

tituloInput.addEventListener('input', checkDuplicate);
autorInput.addEventListener('input', checkDuplicate);

autorInput.addEventListener('input', () => {
  suggestLocationForAuthor(autorInput.value);
});

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

  const loanedCount = allBooks.filter((b) => b.emprestadoPara).length;
  loanToggleBtn.hidden = loanedCount === 0 && !currentOnlyLoaned;
  loanToggleBtn.textContent = `📤 Emprestados (${loanedCount})`;
  loanToggleBtn.classList.toggle('active', currentOnlyLoaned);
}

function render() {
  const books = loadBooks();
  renderLocationFilters(books);
  updateBackupReminder(books);

  const search = currentSearch.trim().toLowerCase();
  const visible = books
    .filter((b) => currentFilter === 'todos' || b.status === currentFilter)
    .filter((b) => !currentLocation || b.localizacao === currentLocation)
    .filter((b) => !currentOnlyLoaned || b.emprestadoPara)
    .filter((b) => {
      if (!search) return true;
      return (
        b.titulo.toLowerCase().includes(search) ||
        (b.autor || '').toLowerCase().includes(search) ||
        (b.localizacao || '').toLowerCase().includes(search) ||
        (b.emprestadoPara || '').toLowerCase().includes(search) ||
        (b.genero || '').toLowerCase().includes(search) ||
        (b.edicao || '').toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (currentSort === 'recentes') return new Date(b.criadoEm) - new Date(a.criadoEm);
      if (currentSort === 'autor') {
        return (
          (a.autor || '').localeCompare(b.autor || '', 'pt-BR') ||
          a.titulo.localeCompare(b.titulo, 'pt-BR')
        );
      }
      return a.titulo.localeCompare(b.titulo, 'pt-BR');
    });

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

    const cover = document.createElement('div');
    cover.className = 'book-cover';
    const coverUrl = coverUrlFor(book);
    if (coverUrl) {
      const img = document.createElement('img');
      img.src = coverUrl;
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        img.remove();
        const fallback = document.createElement('span');
        fallback.className = 'cover-fallback';
        fallback.textContent = '📖';
        cover.appendChild(fallback);
      });
      cover.appendChild(img);
    } else {
      const fallback = document.createElement('span');
      fallback.className = 'cover-fallback';
      fallback.textContent = '📖';
      cover.appendChild(fallback);
    }

    const info = document.createElement('div');
    info.className = 'book-info';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = book.titulo;

    const author = document.createElement('div');
    author.className = 'author';
    author.textContent = book.edicao
      ? `${book.autor || 'Autor desconhecido'} · ${book.edicao}`
      : book.autor || 'Autor desconhecido';

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

    info.append(title, author, meta);

    if (book.genero) {
      const genre = document.createElement('div');
      genre.className = 'genre-tag';
      genre.textContent = `🏷️ ${book.genero}`;
      info.appendChild(genre);
    }

    if (book.localizacao) {
      const loc = document.createElement('div');
      loc.className = 'location-tag';
      loc.textContent = `📍 ${book.localizacao}`;
      info.appendChild(loc);
    }

    if (book.emprestadoPara) {
      const loan = document.createElement('div');
      loan.className = 'loan-tag';
      loan.textContent = `📤 Emprestado para ${book.emprestadoPara}`;
      info.appendChild(loan);
    }

    li.append(cover, info);
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

loanToggleBtn.addEventListener('click', () => {
  currentOnlyLoaned = !currentOnlyLoaned;
  render();
});

sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
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
  const emprestadoPara = emprestadoInput.value.trim() || null;
  const isbn = bookIsbnInput.value.trim() || null;
  const genero = generoInput.value.trim() || null;
  const edicao = edicaoInput.value.trim() || null;
  const now = new Date().toISOString();

  if (id) {
    const existing = books.find((b) => b.id === id);
    existing.titulo = titulo;
    existing.autor = autorInput.value.trim();
    existing.localizacao = localizacao;
    existing.genero = genero;
    existing.edicao = edicao;
    existing.isbn = existing.isbn || isbn;
    if (pendingCoverDataUrl !== undefined) {
      existing.capaCustom = pendingCoverDataUrl;
    }
    if (existing.status !== 'lido' && status === 'lido') {
      existing.lidoEm = now;
    }
    if (status !== 'lido') {
      existing.lidoEm = null;
    }
    existing.status = status;
    existing.nota = nota;
    if (emprestadoPara && !existing.emprestadoPara) {
      existing.emprestadoEm = now;
    }
    if (!emprestadoPara) {
      existing.emprestadoEm = null;
    }
    existing.emprestadoPara = emprestadoPara;
  } else {
    books.push({
      id: crypto.randomUUID(),
      titulo,
      autor: autorInput.value.trim(),
      localizacao,
      genero,
      edicao,
      isbn,
      capaCustom: pendingCoverDataUrl || null,
      status,
      nota,
      emprestadoPara,
      emprestadoEm: emprestadoPara ? now : null,
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
      bookIsbnInput.value = isbn;
      if (!generoInput.value.trim() && info.subjects) {
        generoInput.value = info.subjects.slice(0, 3).map((s) => s.name).join(', ');
      }
      if (!edicaoInput.value.trim() && info.edition_name) {
        edicaoInput.value = info.edition_name;
      }
      suggestLocationForAuthor(autorInput.value);
      checkDuplicate();
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

// --- Backup (exportar / importar) ---

const LAST_BACKUP_KEY = 'meusLivros.lastBackupAt';
const BACKUP_SNOOZE_KEY = 'meusLivros.backupSnoozedUntil';
const BACKUP_REMINDER_DAYS = 14;
const BACKUP_SNOOZE_DAYS = 7;

function markBackedUpNow() {
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
  localStorage.removeItem(BACKUP_SNOOZE_KEY);
}

function updateBackupReminder(books) {
  if (books.length === 0) {
    backupReminderEl.hidden = true;
    return;
  }

  const snoozedUntil = localStorage.getItem(BACKUP_SNOOZE_KEY);
  if (snoozedUntil && new Date(snoozedUntil) > new Date()) {
    backupReminderEl.hidden = true;
    return;
  }

  const lastBackupAt = localStorage.getItem(LAST_BACKUP_KEY);
  const shouldRemind = lastBackupAt
    ? (Date.now() - new Date(lastBackupAt).getTime()) / (1000 * 60 * 60 * 24) >= BACKUP_REMINDER_DAYS
    : books.length >= 3;

  backupReminderEl.hidden = !shouldRemind;
}

function exportBackup() {
  const books = loadBooks();
  const blob = new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meus-livros-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  markBackedUpNow();
}

backupBtn.addEventListener('click', () => backupDialog.showModal());
backupCloseBtn.addEventListener('click', () => backupDialog.close());
backupDialog.addEventListener('click', (event) => {
  if (event.target === backupDialog) backupDialog.close();
});

exportBtn.addEventListener('click', () => {
  exportBackup();
  render();
});

importInput.addEventListener('change', async () => {
  const file = importInput.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    if (!Array.isArray(imported)) throw new Error('formato inválido');

    const current = loadBooks();
    const currentIds = new Set(current.map((b) => b.id));
    let added = 0;

    for (const book of imported) {
      if (book && typeof book.id === 'string' && typeof book.titulo === 'string' && !currentIds.has(book.id)) {
        current.push(book);
        currentIds.add(book.id);
        added++;
      }
    }

    saveBooks(current);
    markBackedUpNow();
    render();
    backupDialog.close();
    alert(added > 0
      ? `Backup importado: ${added} livro(s) adicionados.`
      : 'Nenhum livro novo encontrado nesse backup (já estavam todos cadastrados).');
  } catch {
    alert('Não foi possível importar esse arquivo. Verifique se é um backup válido do Meus Livros.');
  } finally {
    importInput.value = '';
  }
});

backupReminderExportBtn.addEventListener('click', () => {
  exportBackup();
  render();
});

backupReminderDismissBtn.addEventListener('click', () => {
  const snoozeUntil = new Date(Date.now() + BACKUP_SNOOZE_DAYS * 24 * 60 * 60 * 1000);
  localStorage.setItem(BACKUP_SNOOZE_KEY, snoozeUntil.toISOString());
  backupReminderEl.hidden = true;
});

// --- Estatísticas ---

function computeStats(books) {
  const total = books.length;
  const lidos = books.filter((b) => b.status === 'lido');
  const thisYear = new Date().getFullYear();
  const lidosEsteAno = lidos.filter((b) => b.lidoEm && new Date(b.lidoEm).getFullYear() === thisYear).length;
  const emprestados = books.filter((b) => b.emprestadoPara).length;

  const authorCounts = new Map();
  for (const b of books) {
    const autor = (b.autor || '').trim();
    if (!autor) continue;
    authorCounts.set(autor, (authorCounts.get(autor) || 0) + 1);
  }
  let autorTop = '—';
  let autorTopCount = 0;
  for (const [autor, count] of authorCounts) {
    if (count > autorTopCount) {
      autorTop = autor;
      autorTopCount = count;
    }
  }

  const notas = lidos.map((b) => b.nota).filter((n) => typeof n === 'number' && n > 0);
  const notaMedia = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : '—';

  return {
    total,
    lidosTotal: lidos.length,
    lidosEsteAno,
    emprestados,
    autorTop,
    autorTopCount,
    notaMedia,
  };
}

function statItem(value, label, wide) {
  const div = document.createElement('div');
  div.className = 'stat-item' + (wide ? ' stat-wide' : '');
  const v = document.createElement('div');
  v.className = 'stat-value';
  v.textContent = value;
  const l = document.createElement('div');
  l.className = 'stat-label';
  l.textContent = label;
  div.append(v, l);
  return div;
}

function renderStats() {
  const stats = computeStats(loadBooks());
  statsGrid.innerHTML = '';
  statsGrid.append(
    statItem(stats.total, 'Livros na estante'),
    statItem(stats.lidosTotal, 'Lidos no total'),
    statItem(stats.lidosEsteAno, `Lidos em ${new Date().getFullYear()}`),
    statItem(stats.emprestados, 'Emprestados agora'),
    statItem(stats.notaMedia, 'Nota média'),
    statItem(
      stats.autorTopCount > 0 ? `${stats.autorTop} (${stats.autorTopCount})` : '—',
      'Autor mais presente',
      true
    )
  );
}

statsBtn.addEventListener('click', () => {
  renderStats();
  statsDialog.showModal();
});
statsCloseBtn.addEventListener('click', () => statsDialog.close());
statsDialog.addEventListener('click', (event) => {
  if (event.target === statsDialog) statsDialog.close();
});

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
