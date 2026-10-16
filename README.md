# Balsas Experience API

API REST que disponibiliza informações sobre atrações turísticas de Balsas-MA. Desenvolvida na disciplina de Programação para Web (UNIBALSAS), em duas etapas: a API em Node.js com Express e a integração com banco de dados PostgreSQL usando Prisma ORM.

**API publicada:** https://balsas-experience-api-yywx.onrender.com
**Exemplo:** https://balsas-experience-api-yywx.onrender.com/atracoes

> A API usa o plano gratuito do Render, que hiberna sem uso. A primeira requisição pode levar alguns segundos.

## Equipe

- Maicon de Sousa Pontes
- Gustavo Barros Martins
- Hugo Alexandre Carvalho Coelho Coutinho
- Jeferson Machado dos Santos 

Professor: Marcos David Souza Ramos

## Tecnologias utilizadas

- **Node.js** – executa JavaScript no servidor
- **Express 5** – rotas e requisições HTTP
- **Prisma ORM 7** (com `@prisma/adapter-pg`) – modelagem, migrações e acesso ao banco
- **PostgreSQL** (hospedado na Neon) – banco de dados relacional
- **dotenv** – leitura das variáveis de ambiente
- **Render** – hospedagem da API

## Pré-requisitos

- Node.js 20 ou superior
- Git
- Um banco PostgreSQL (local ou online, como a Neon)

## Instalação e configuração

```bash
git clone https://github.com/Maicon-Sousa/balsas-experience-api.git
cd balsas-experience-api
npm install
```

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST/NOME_DO_BANCO?sslmode=require"
```

> Use os dados do seu banco. Nunca envie o `.env` com a senha real para o GitHub (ele já está no `.gitignore`).

## Migrações, seed e execução

```bash
npx prisma generate        # gera o Prisma Client
npx prisma migrate deploy  # cria as tabelas
npm run seed               # popula o banco (8 atrações, 3 categorias, 15 tags, 3 avaliações)
npm start                  # inicia o servidor
```

O servidor sobe em `http://localhost:3000`. Para desenvolvimento, use `npm run dev` (reinicia ao salvar).

## Modelo de dados

- **Categoria**: id, nome (único). Uma categoria tem várias atrações.
- **Tag**: id, nome (único). Relação muitos-para-muitos com Atracao.
- **Atracao**: id, nome, descricao, cidade, estado, distanciaCentroKm (opcional), criadaEm, categoriaId.
- **Avaliacao**: id, visitante, nota, comentario (opcional), criadaEm, atracaoId. É apagada junto com a atração (`onDelete: Cascade`).

As tags são uma tabela separada porque uma atração tem várias tags e a mesma tag serve a várias atrações.

## Endpoints

| Método | Caminho | Descrição | Status |
|---|---|---|---|
| GET | `/atracoes` | Lista as atrações (filtros `?categoria=` e `?tag=`) | 200 |
| GET | `/atracoes/:id` | Busca uma atração por id | 200 / 404 |
| POST | `/atracoes` | Cria uma atração | 201 / 400 |
| PUT | `/atracoes/:id` | Atualiza uma atração | 200 / 400 / 404 |
| DELETE | `/atracoes/:id` | Remove uma atração | 204 / 404 |

Campos obrigatórios no POST e no PUT: `nome`, `categoria` e `descricao`.

### Exemplo: listar com filtro

```http
GET /atracoes?tag=cachoeira
```

### Exemplo: criar uma atração

Requisição:

```http
POST /atracoes
Content-Type: application/json

{
  "nome": "Cachoeira de Teste",
  "categoria": "Natureza e Aventura",
  "descricao": "Atração criada para testar a API publicada.",
  "distanciaCentroKm": 30,
  "tags": ["natureza", "cachoeira", "teste"]
}
```

Resposta (`201 Created`):

```json
{
  "id": 9,
  "nome": "Cachoeira de Teste",
  "categoria": "Natureza e Aventura",
  "descricao": "Atração criada para testar a API publicada.",
  "localizacao": { "cidade": "Balsas", "estado": "MA" },
  "distanciaCentroKm": 30,
  "tags": ["natureza", "cachoeira", "teste"]
}
```

### Exemplo: atração inexistente

```http
GET /atracoes/9999
```

Resposta (`404 Not Found`):

```json
{ "erro": "Atração não encontrada" }
```

### Exemplo: remover

```http
DELETE /atracoes/9
```

Resposta: `204 No Content` (sem corpo).

## Estrutura do projeto

```
prisma/            schema, migrações e seed
src/
  controllers/     lógica de cada rota
  data/            dados iniciais em JSON
  public/          página de demonstração
  routes/          definição das rotas
  app.js           configuração do Express
  prisma.js        instância do Prisma Client
prisma7.config.ts  configuração do Prisma
```