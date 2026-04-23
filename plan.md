# Backend Plan — Open Finance Hackathon

## Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Banco de dados:** Supabase (PostgreSQL)
- **Arquitetura:** MVP — simples, funcional, sem over-engineering

---

## Estrutura de pastas

```
backend/
├── prisma/
│   └── schema.prisma        # Modelos das tabelas
├── src/
│   ├── routes/
│   │   ├── users.js
│   │   ├── financialData.js
│   │   ├── history.js
│   │   ├── scores.js
│   │   └── decisions.js
│   ├── controllers/
│   │   ├── users.controller.js
│   │   ├── financialData.controller.js
│   │   ├── history.controller.js
│   │   ├── scores.controller.js
│   │   └── decisions.controller.js
│   ├── lib/
│   │   └── prisma.js            # Instância do Prisma Client
│   └── app.js                   # Express setup + rotas
├── .env
├── package.json
└── server.js                    # Entry point
```

---

## Tabelas (Prisma Schema)

### `users`
| Campo | Tipo | Descrição |
|---|---|---|
| id | String (uuid) | PK |
| name | String | Nome do usuário |
| email | String | Email único |
| cpf | String | CPF único |
| created_at | DateTime | Criação |

### `financial_data`
| Campo | Tipo | Descrição |
|---|---|---|
| id | String (uuid) | PK |
| user_id | String | FK → users |
| source | String | Ex: "open_finance", "uber", "ifood" |
| type | String | "income" ou "expense" |
| amount | Float | Valor da transação |
| date | DateTime | Data da transação |
| created_at | DateTime | Criação |

### `analysis`
| Campo | Tipo | Descrição |
|---|---|---|
| id | String (uuid) | PK |
| user_id | String | FK → users |
| avg_monthly_income | Float | Média de entradas/mês |
| income_frequency | String | "daily", "weekly", "irregular" |
| avg_expenses | Float | Média de saídas/mês |
| analyzed_at | DateTime | Data da análise |

### `scores`
| Campo | Tipo | Descrição |
|---|---|---|
| id | String (uuid) | PK |
| user_id | String | FK → users |
| score | Int | 0–1000 |
| reason | String | Explicação do score (compliance) |
| created_at | DateTime | Criação |

### `decisions`
| Campo | Tipo | Descrição |
|---|---|---|
| id | String (uuid) | PK |
| user_id | String | FK → users |
| score_id | String | FK → scores |
| status | String | "approved", "denied", "pending" |
| credit_limit | Float | Valor aprovado (se houver) |
| reason | String | Motivo legível para o usuário |
| created_at | DateTime | Criação |

---

## Endpoints

### `POST /users`
Cria um novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "cpf": "12345678900"
}
```

---

### `POST /financial-data`
Salva dados financeiros de um usuário (vindos do Open Finance ou outros).

**Body:**
```json
{
  "user_id": "uuid",
  "source": "open_finance",
  "type": "income",
  "amount": 300.00,
  "date": "2026-04-20T10:00:00Z"
}
```

---

### `GET /history/:user_id`
Retorna todo o histórico financeiro do usuário.

---

### `GET /scores/:user_id`
Retorna o score mais recente do usuário.

### `POST /scores`
Calcula e salva um novo score com base nos dados financeiros.

**Body:**
```json
{
  "user_id": "uuid"
}
```

---

### `GET /decisions/:user_id`
Retorna a decisão de crédito mais recente.

### `POST /decisions`
Gera uma decisão de crédito com base no score.

**Body:**
```json
{
  "user_id": "uuid"
}
```

---

## Regras de Negócio

### Entradas (dados do formulário — preenchidos pelo front-end)

| Campo | Tipo | Descrição |
|---|---|---|
| `monthly_income` | Float | Valor total recebido no mês |
| `income_frequency` | String | `"daily"`, `"weekly"`, `"monthly"`, `"irregular"` |
| `monthly_expenses` | Float | Valor total gasto no mês |

> Esses dados chegam via `POST /financial-data` e são salvos em `financial_data`.  
> O cálculo do score é disparado logo depois via `POST /scores`.

---

## Lógica de Score (MVP)

**Score base: 500 pontos** — ajustado pelas regras abaixo. Resultado final clampado entre 0 e 1000.

### Fatores positivos

| Critério | Condição | Pontos |
|---|---|---|
| Renda Alta | `monthly_income` alto | + até 300 pts |
| Renda Frequente | `income_frequency` = `"daily"` ou `"weekly"` | + até 200 pts |
| Gastos Controlados | `monthly_expenses` < 50% da `monthly_income` | + até 200 pts |

### Fatores negativos

| Critério | Condição | Pontos |
|---|---|---|
| Gastos Altos | `monthly_expenses` > 100% da `monthly_income` | - até 200 pts |
| Renda Instável | `income_frequency` = `"irregular"` | - até 150 pts |

### Referência de cálculo (implementação sugerida)

```js
// Renda Alta → escala proporcional, ex:
// R$3000+ = +300, R$2000 = +200, R$1000 = +100, abaixo = +0

// Renda Frequente
if (frequency === 'daily')   score += 200
if (frequency === 'weekly')  score += 130
if (frequency === 'monthly') score += 60
if (frequency === 'irregular') score -= 150

// Gastos Controlados / Altos
const ratio = monthly_expenses / monthly_income
if (ratio < 0.50) score += 200
if (ratio > 1.00) score -= 200

// Clamp final
score = Math.max(0, Math.min(1000, score))
```

---

### Faixas de decisão

| Score | Status | Decisão |
|---|---|---|
| >= 600 | `"approved"` | Aprovado — score alto, limite maior |
| 400 – 599 | `"approved_with_risk"` | Aprovado com risco — limite moderado |
| < 400 | `"denied"` | Reprovado — sem liberação de limite |

> **Obs:** o campo `reason` em `scores` e `decisions` deve sempre explicar o resultado em linguagem simples para o usuário (requisito legal — decisões automatizadas precisam ser explicáveis).

---

## Setup inicial

```bash
npm init -y
npm install express prisma @prisma/client dotenv cors
npx prisma init
```

`.env`:
```
DATABASE_URL="postgresql://..."  # pegar no Supabase
PORT=3000
```

```bash
npx prisma migrate dev --name init
```

---

## Ordem de implementação

1. [ ] Setup do projeto (express + prisma + .env)
2. [ ] Conectar Supabase e rodar primeira migrate
3. [ ] CRUD de `/users`
4. [ ] CRUD de `/financial-data`
5. [ ] GET `/history/:user_id`
6. [ ] Lógica de score → `POST /scores`
7. [ ] GET `/scores/:user_id`
8. [ ] Lógica de decisão → `POST /decisions`
9. [ ] GET `/decisions/:user_id`
10. [ ] Testar tudo com Insomnia/Postman
11. [ ] Deploy (Render / Railway)

---

## Notas importantes

- **Sem autenticação no MVP** — não tem tempo, foca no core
- **Sem over-engineering** — controller chama prisma direto, sem camada de service por enquanto
- **Score explicável** — campo `reason` é obrigatório em scores e decisions (compliance)
- **Dados mínimos** — não guardar nada além do necessário (LGPD/Open Finance)
