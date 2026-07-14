# Meus Livros

Aplicativo web (PWA) para cadastrar e organizar sua coleção de livros pessoal — instale na tela inicial do celular e use offline, sem precisar de conta ou servidor.

## Funcionalidades

- Cadastrar livros com título, autor, localização na estante e status (quero ler / lendo / lido)
- Cadastro por escaneamento de código de barras (ISBN) via câmera, ou digitando o ISBN manualmente — busca título/autor automaticamente e traz a capa do livro
- Sugestão automática de localização na estante ao cadastrar um livro de um autor já cadastrado
- Controle de empréstimos (marcar para quem um livro foi emprestado)
- Estatísticas de leitura (total, lidos no ano, autor mais presente, nota média)
- Filtrar e buscar por status, localização, autor ou pessoa que pegou emprestado
- Avaliar livros lidos com 1 a 5 estrelas
- Editar e remover livros
- Exportar/importar backup dos dados (.json)
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
