# Cadastro de Clientes — Case Técnico

Aplicação **full stack** para cadastro e gerenciamento de clientes.

- **Backend:** Node.js + Express + Prisma  
- **Banco:** PostgreSQL (Docker)  
- **Frontend:** React (Vite)  
- **Extra:** Proxy **ViaCEP** para consulta de endereço por CEP

---

## Estrutura do projeto

```
cadastro-clientes/
├─ backend/
├─ frontend/
├─ docker-compose.yml
└─ README.md
```

---

## Requisitos

- **Node.js 20+**
- **Docker Desktop**
- **Git Bash** (terminal) e **VS Code** (opcional)

> Este guia usa comandos compatíveis com **Git Bash** no Windows.

---

## Como rodar

### 1) Subir o PostgreSQL com Docker

Na **raiz** do projeto:

```bash
docker compose up -d
```

Verificar se o container está rodando:

```bash
docker ps
```

Parar o banco:

```bash
docker compose down
```

> `down` mantém os dados se você estiver usando volume (padrão em muitos setups).  
> Caso seu compose remova volumes, evite usar `docker compose down -v` para não apagar o banco.

---

### 2) Backend (API)

#### 2.1) Variáveis de ambiente

No diretório `backend/`, crie o `.env` a partir do exemplo:

```bash
cd backend
cp .env.example .env
```

Exemplo de `.env` (ajuste conforme seu `docker-compose.yml`):

```env
PORT=3333
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cadastro_clientes?schema=public"
```

#### 2.2) Instalar dependências

```bash
npm i
```

#### 2.3) Prisma: migrations e client

```bash
npx prisma migrate dev
npx prisma generate
```

#### 2.4) Rodar a API

```bash
npm run dev
```

API em: **http://localhost:3333**

> Abrir `http://localhost:3333/` no browser pode mostrar **Cannot GET /** — isso é normal (API não serve página).

---

### 3) Frontend (React)

Em outro terminal:

```bash
cd frontend
npm i
npm run dev
```

Frontend em: **http://localhost:5173**

> O frontend usa proxy do Vite para `/api` apontando para `http://localhost:3333`.

---

## Rotas principais (Backend)

### Health
- `GET /health`

### Clientes
- `GET /api/clientes?page=1&limit=10` — listagem paginada
- `GET /api/clientes/:id` — detalhe
- `POST /api/clientes` — criar
- `PUT /api/clientes/:id` — atualizar
- `DELETE /api/clientes/:id` — remover

### ViaCEP (proxy)
- `GET /api/cep/:cep` — consulta CEP (ex.: `01001000`)

---

## Funcionalidades (Frontend)

- Listagem paginada de clientes
- Cadastro de cliente
- Edição e exclusão
- Consulta de CEP (ViaCEP) para preencher endereço
- Tema **dark** + botões estilizados

---

## Observações importantes

- **Não commitar segredos:** `.env` deve ficar fora do Git.  
  Use apenas `.env.example` no repositório.
- Caso troque porta do backend, ajuste o proxy do Vite em `frontend/vite.config.js`.
- Se algo não subir, confira:
  - Docker ligado (`docker ps`)
  - backend rodando (`http://localhost:3333/health`)
  - frontend rodando (`http://localhost:5173`)

---

## Scripts úteis

### Backend
```bash
npm run dev
```

### Frontend
```bash
npm run dev
```

---

## Licença

Uso educacional / case técnico.
