# Plano de Refatoração — NewBank Backend

> Este documento descreve exatamente o que deve ser alterado, arquivo por arquivo.
> Não crie arquivos novos. Não altere arquivos não listados aqui.
> Siga a ordem das tarefas.

---

## Contexto

O backend está funcional. As refatorações abaixo corrigem três problemas
identificados após revisão com base em entrevistas com stakeholders:

1. **Reason genérico na decisão** — o campo `reason` de `Decision` é hardcoded
   e não explica ao usuário os fatores reais da decisão (requisito legal/compliance).

2. **Limite de crédito fixo** — `creditLimit` é sempre R$5.000 ou R$2.000,
   independente da renda do usuário. Deve ser dinâmico, baseado em `monthlyIncome`.

3. **Fraude de renda circular não detectada** — usuários movimentam entradas e
   saídas de valores similares para inflar score artificialmente. Não há penalidade
   para esse padrão.

---

## Tarefa 1 — `src/utils/financial.js`

### 1.1 — Alterar assinatura de `buildDecision`

**Localizar:**
```js
function buildDecision(score) {
```

**Substituir por:**
```js
function buildDecision(score, scoreReason, monthlyIncome) {
```

---

### 1.2 — Alterar o bloco `approved` dentro de `buildDecision`

**Localizar:**
```js
  if (score >= 600) {
    return {
      status: "approved",
      creditLimit: 5000,
      reason: "Aprovado por score alto e boa consistencia financeira recente.",
    };
  }
```

**Substituir por:**
```js
  if (score >= 600) {
    return {
      status: "approved",
      creditLimit: monthlyIncome * 2,
      reason: `Aprovado. ${scoreReason}`,
    };
  }
```

---

### 1.3 — Alterar o bloco `approved_with_risk` dentro de `buildDecision`

**Localizar:**
```js
  if (score >= 400) {
    return {
      status: "approved_with_risk",
      creditLimit: 2000,
      reason: "Aprovado com risco por score intermediario. Limite moderado aplicado.",
    };
  }
```

**Substituir por:**
```js
  if (score >= 400) {
    return {
      status: "approved_with_risk",
      creditLimit: monthlyIncome * 0.5,
      reason: `Aprovado com limite reduzido. ${scoreReason}`,
    };
  }
```

---

### 1.4 — Alterar o bloco `denied` dentro de `buildDecision`

**Localizar:**
```js
  return {
    status: "denied",
    creditLimit: 0,
    reason: "Solicitacao negada por score baixo e risco financeiro elevado.",
  };
```

**Substituir por:**
```js
  return {
    status: "denied",
    creditLimit: 0,
    reason: `Solicitacao negada. ${scoreReason}`,
  };
```

---

### 1.5 — Adicionar detecção de renda circular em `calculateScore`

Adicionar este bloco **imediatamente após** o bloco que trata `ratio > 1`:

**Localizar:**
```js
  if (ratio > 1) {
    score -= 200;
    reasons.push("Despesas acima de 100% da renda reduziram -200 pontos");
  }
```

**Inserir após (não substituir — adicionar logo abaixo):**
```js
  if (ratio >= 0.85 && ratio <= 1.05 && monthlyIncome > 2000) {
    score -= 100;
    reasons.push("Padrao de movimentacao suspeito reduziu -100 pontos");
  }
```

---

## Tarefa 2 — `src/controllers/decisions.controller.js`

### 2.1 — Buscar `financialData` associado ao score antes de criar a decisão

O controller precisa buscar os dados financeiros do usuário para passar
`monthlyIncome` ao `buildDecision`. O score já foi criado a partir de um
`financialData` específico — mas o score não armazena a renda diretamente,
então deve-se buscar o `financialData` mais recente do usuário.

**Localizar** (dentro de `createDecision`, após a validação do score):
```js
    const decisionData = buildDecision(score.score);
```

**Substituir por:**
```js
    const financialData = await prisma.financialData.findFirst({
      where: { userId },
      orderBy: { referenceMonth: "desc" },
    });

    const monthlyIncome = financialData ? Number(financialData.monthlyIncome) : 0;

    const decisionData = buildDecision(score.score, score.reason, monthlyIncome);
```

---

### 2.2 — Garantir que `creditLimit` nunca seja negativo ou NaN

**Localizar** (dentro de `prisma.decision.create`, no campo `creditLimit`):
```js
        creditLimit: decisionData.creditLimit.toFixed(2),
```

**Substituir por:**
```js
        creditLimit: Math.max(0, decisionData.creditLimit).toFixed(2),
```

---

## Tarefa 3 — `prisma/schema.prisma`

### 3.1 — Adicionar campo `device_id` no model `User`

Este campo é opcional. Serve para capturar o identificador do dispositivo
do usuário no momento do cadastro — necessário para detecção futura de
múltiplos cadastros no mesmo dispositivo (anti-fraude).

**Localizar** (dentro de `model User`, após o campo `cpf`):
```prisma
  cpf           String          @unique
```

**Inserir após:**
```prisma
  deviceId      String?         @map("device_id")
```

---

### 3.2 — Rodar migration após alterar o schema

Após salvar o `schema.prisma`, executar:

```bash
npx prisma migrate dev --name add_device_id_to_users
```

---

## Checklist de validação após as alterações

- [ ] `buildDecision` recebe 3 parâmetros: `score`, `scoreReason`, `monthlyIncome`
- [ ] `reason` de `Decision` contém o texto real do score (não é mais genérico)
- [ ] `creditLimit` de `approved` é `monthlyIncome * 2`
- [ ] `creditLimit` de `approved_with_risk` é `monthlyIncome * 0.5`
- [ ] `calculateScore` penaliza -100 pts quando `ratio` está entre 0.85–1.05 e `monthlyIncome > 2000`
- [ ] `decisions.controller.js` busca `financialData` antes de chamar `buildDecision`
- [ ] Campo `deviceId` existe no model `User` e migration foi aplicada
- [ ] Nenhum outro arquivo foi alterado

---

## O que NÃO fazer nesta refatoração

- Não alterar `scores.controller.js` — está correto como está
- Não alterar `financialData.controller.js` — está correto como está
- Não criar novas rotas ou endpoints
- Não alterar o schema além do campo `deviceId`
- Não mudar as faixas de score (600/400) — apenas o `creditLimit` e `reason` mudam
