# Meus Livros

Aplicativo web (PWA) para cadastrar e organizar sua coleção de livros pessoal — instale na tela inicial do celular e use offline, sem precisar de conta ou servidor.

## Funcionalidades

- Cadastrar livros ou artigos científicos, com título, autor, localização na estante e status (quero ler / lendo / lido)
- Cadastro por escaneamento de código de barras (ISBN) via câmera, ou digitando o ISBN manualmente — busca título/autor automaticamente e traz a capa do livro
- Upload manual de capa (foto) quando a busca automática não encontra
- Gêneros/categorias/áreas em formato de etiquetas (pode adicionar mais de uma por livro, com sugestão automática das já usadas), edição, editora, cidade e ano de publicação — e, para artigos, revista, volume, número, páginas e DOI
- Filtros de gênero na lista, com contagem de quantos livros tem cada um, para localizar rápido por assunto
- Formato do livro: físico (na estante), Kindle (comprado), Kindle Unlimited (assinatura) ou Logos Bible Software — com filtro por formato, link opcional para abrir o livro digital e nota correspondente na referência ABNT (ex: "E-book (Kindle)")
- Geração de referência bibliográfica no padrão ABNT com botão para copiar, útil para bibliografia de TCC/monografia/artigo
- Sugestão automática de localização na estante ao cadastrar um livro de um autor já cadastrado
- Aviso de possível duplicado ao cadastrar um livro/artigo já existente
- Controle de empréstimos (marcar para quem um livro foi emprestado)
- Coleções/séries: agrupe livros por coleção com número do volume, marque volumes que ainda faltam e veja o progresso de cada coleção (ex: "2 de 3") na tela de Coleções
- Valor pago por livro (opcional) — estatísticas mostram o valor total e o valor médio da biblioteca
- Estatísticas de leitura (total, lidos no ano, autor mais presente, nota média)
- Filtrar e buscar por status, localização, autor, gênero, revista, DOI ou pessoa que pegou emprestado
- Ordenar por título, autor ou mais recentes
- Avaliar livros lidos com 1 a 5 estrelas
- Editar e remover registros
- Exportar/importar backup dos dados (.json), com lembrete automático quando o backup está desatualizado
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
