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
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/newbank"
PORT=3000
```

3. Rode migration e gere cliente Prisma:

```bash
npm run prisma:migrate
npm run prisma:generate
```

As migrations existentes incluem a adicao opcional de `device_id` em `users`.

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

## Regras de score e decisao de credito

- Regras de score:
  - `monthlyIncome >= 1780`: `+500`
  - `monthlyIncome >= 1621`: `+300`
  - `monthlyExpenses <= 1000`: `+300`
  - `monthlyExpenses / monthlyIncome >= 0.9`: `+150`
- O score final e limitado entre `0` e `1000`.

## Regras de decisao de credito

- A decisao usa o `score` mais recente (ou `score_id` informado) e o `financialData` mais recente do usuario.
- O campo `reason` da decisao reutiliza a explicacao real do score calculado.
- Faixas de status:
  - `score >= 800`: `approved`
  - `score >= 500` e `< 800`: `approved_with_risk`
  - `score < 500`: `denied`
- Limite de credito:
  - `approved`: `monthlyIncome * 2`
  - `approved_with_risk`: `monthlyIncome * 0.5`
  - `denied`: `0`
- O limite final nunca fica negativo.
