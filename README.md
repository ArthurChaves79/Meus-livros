# Meus Livros

Aplicativo web (PWA) para cadastrar e organizar sua coleção de livros pessoal — instale na tela inicial do celular e use offline, sem precisar de conta ou servidor.

## Funcionalidades

- Cadastrar livros com título, autor e status (quero ler / lendo / lido)
- Filtrar a lista por status
- Avaliar livros lidos com 1 a 5 estrelas
- Editar e remover livros
- Funciona offline (Service Worker) e pode ser instalado como app no celular
- Os dados ficam salvos localmente no navegador (localStorage) — não saem do seu aparelho

## Como usar

Basta abrir `index.html` num navegador (ou hospedar os arquivos estáticos, ex. GitHub Pages). No celular, use a opção "Adicionar à tela inicial" do navegador para instalar como app.

### Rodando localmente

```
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000` no navegador.

## Estrutura

- `index.html` — estrutura da página
- `styles.css` — estilos
- `app.js` — lógica do app (cadastro, filtros, persistência)
- `sw.js` — Service Worker (cache offline)
- `manifest.webmanifest` — metadados de instalação do PWA
- `icons/` — ícones do app
