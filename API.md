# Como consumir a Agents API

Guia rápido pro time do app integrar com o backend de agentes de IA do Poupaí.

## URL base

```
https://poupai-api-712ad669b901.herokuapp.com
```

## Autenticação

Toda chamada abaixo precisa do header a seguir, com a API key que o time do backend fornece (ela não é gerada pelo próprio app):

```
Authorization: Bearer <SUA_API_KEY>
```

Sem esse header, ou com uma chave inválida, a rota responde `401`.

---

## 1. Gerar insight financeiro

`POST /api/v1/agent/insight`

Envia o contexto financeiro do usuário e recebe de volta um texto de insight/educação financeira gerado por IA.

**Corpo da requisição:**
```json
{ "context": "Resumo dos gastos do usuário no mês..." }
```
- `context`: texto, obrigatório, máximo 4000 caracteres.

**Resposta (200):**
```json
{ "insight": "Você gastou 20% a mais em Alimentação este mês..." }
```

**Exemplo (curl):**
```bash
curl -X POST https://poupai-api-712ad669b901.herokuapp.com/api/v1/agent/insight \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"context": "..."}'
```

---

## 2. Limpar sessão do assistente

`DELETE /api/v1/agent/session`

Apaga o histórico de conversa do usuário com o assistente do WhatsApp — use quando o usuário quiser "recomeçar do zero" a conversa com a IA. **Não afeta** transações, saldo ou limites — só o histórico de chat.

**Corpo da requisição:**
```json
{ "phone": "+5519999999999" }
```
- `phone`: telefone completo com DDI, mesmo formato salvo no cadastro. Obrigatório.

**Resposta (200):**
```json
{ "message": "Sessão limpa com sucesso." }
```

---

## 3. Excluir conta (dados do assistente de IA)

`DELETE /api/v1/agent/account`

⚠️ **Importante:** este endpoint só apaga os dados do **assistente de WhatsApp** (histórico de conversa e sessão), que ficam num banco separado (PostgreSQL) do resto do app. Ele **não** apaga o Firestore nem o usuário no Firebase Auth — isso continua sendo responsabilidade do app.

No fluxo de "excluir conta", chame **os dois**: a exclusão que o app já faz hoje (Firestore + Firebase Auth) **e** este endpoint. A ordem entre os dois não importa.

**Corpo da requisição:**
```json
{ "phone": "+5519999999999" }
```

**Resposta (200):**
```json
{ "message": "Conta excluída com sucesso." }
```

---

## Erros comuns

| Status | Significado | O que fazer |
|---|---|---|
| `400` | Campo faltando ou inválido no corpo | Confira o JSON enviado |
| `401` | API key ausente ou inválida | Confira o header `Authorization` |
| `404` | *(só em `/session` e `/account`)* Não existe sessão pra esse telefone | Normal se o usuário nunca falou com o assistente pelo WhatsApp — pode tratar como sucesso silencioso |
| `429` | *(só em `/insight`)* Limite de requisições da IA atingido | Tentar de novo em instantes |
| `500` | Erro interno do servidor | Reportar pro time do backend |

Toda resposta de erro vem no formato:
```json
{ "error": "mensagem legível em português" }
```

---

## Exemplo completo em Dart (Flutter)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> clearAssistantSession(String phone) async {
  final response = await http.delete(
    Uri.parse('https://poupai-api-712ad669b901.herokuapp.com/api/v1/agent/session'),
    headers: {
      'Authorization': 'Bearer SUA_API_KEY',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({'phone': phone}),
  );

  if (response.statusCode == 200) {
    // sessão limpa com sucesso
  } else {
    final error = jsonDecode(response.body)['error'];
    // trate o erro (mostrar mensagem, logar, etc.)
  }
}
```
