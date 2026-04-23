# NewBank Backend

Backend MVP para analise de credito com base em formulario mensal.

## Requisitos

- Node.js 20+
- PostgreSQL

## Setup

1. Instale dependencias:

```bash
npm install
```

2. Configure variaveis em `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/newbank"
PORT=3000
```

3. Rode migration e gere cliente Prisma:

```bash
npm run prisma:migrate -- --name init
npm run prisma:generate
```

4. Inicie a API:

```bash
npm run dev
```

## Swagger

- UI: `GET /docs`
- JSON: `GET /openapi.json`

## Endpoints principais

- `POST /users`
- `POST /financial-data`
- `GET /history/:user_id`
- `POST /scores`
- `GET /scores/:user_id`
- `POST /decisions`
- `GET /decisions/:user_id`
