# NewBank Backend

Backend MVP para analise de credito com base em formulario mensal.

## Requisitos

- Node.js 20+
- PostgreSQL
- Docker (opcional, para deploy)

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
JWT_SECRET="troque-por-um-segredo-forte"
JWT_EXPIRES_IN="1d"
ENCRYPTION_KEY="troque-por-uma-chave-forte"
CPF_HASH_SECRET="opcional-se-parar-separar-do-encryption-key"
IP_RISK_WINDOW_HOURS=24
IP_RISK_MEDIUM_THRESHOLD=3
IP_RISK_HIGH_THRESHOLD=5
LOGIN_FAIL_THRESHOLD_PER_HOUR=10
TRUST_PROXY=false
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

## Docker + Portainer Stack + Traefik

Foram adicionados os arquivos `Dockerfile`, `.dockerignore` e `docker-compose.yml` para deploy com Portainer (Docker local/standalone) usando Traefik.

### Como funciona

- O `docker-compose.yml` sobe apenas a API (`api`).
- O banco e externo e deve ser informado via `DATABASE_URL`/`DIRECT_URL` no Portainer.
- O container executa `prisma migrate deploy` no startup e depois sobe a API.
- O roteamento e feito por labels do Traefik no proprio servico.

### Variaveis recomendadas no Portainer (Stack > Environment variables)

Obrigatorias:

- `APP_HOST` (ex: `api.seudominio.com`)
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

Com default no compose (opcionais):

- `JWT_EXPIRES_IN` (default: `1d`)
- `CPF_HASH_SECRET` (default: vazio, usa `ENCRYPTION_KEY`)
- `IP_RISK_WINDOW_HOURS` (default: `24`)
- `IP_RISK_MEDIUM_THRESHOLD` (default: `3`)
- `IP_RISK_HIGH_THRESHOLD` (default: `5`)
- `LOGIN_FAIL_THRESHOLD_PER_HOUR` (default: `10`)
- `TRAEFIK_NETWORK` (default: `proxy`)
- `TRAEFIK_ENTRYPOINT` (default: `websecure`)
- `TRAEFIK_CERTRESOLVER` (default: `letsencrypt`)

### Observacoes

- A rede externa do Traefik precisa existir no host Docker (`proxy` por padrao).
- `TRUST_PROXY` e fixado como `true` no container para funcionar corretamente atras do Traefik.
- Em Portainer, use este `docker-compose.yml` como stack file e preencha os environments.

## Swagger

- UI: `GET /docs`
- JSON: `GET /openapi.json`

## Endpoints principais

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /users`
- `POST /financial-data`
- `GET /history/:user_id`
- `POST /scores`
- `GET /scores/:user_id`
- `POST /decisions`
- `GET /decisions/:user_id`

## Seguranca e auditoria

- Senhas sao armazenadas com hash (`bcrypt`).
- CPF e protegido em repouso com criptografia e hash deterministico para unicidade.
- Todo login gera evento em `login_events` com IP e resultado.
- IPs sao associados por usuario em `user_ips` para monitoramento.
- Regra inicial de risco por IP: sinaliza `medium` com `>= 3` contas distintas no mesmo IP em 24h e `high` com `>= 5`.
- Nesta fase, risco nao bloqueia login automaticamente.

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
