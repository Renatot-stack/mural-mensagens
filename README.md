# Mural de Mensagens

Site simples de mensagens com:

- frontend estático no GitHub Pages;
- Google Apps Script como backend;
- Google Sheets como banco de dados;
- identificador no formato `Renato:`;
- atualização automática a cada 10 segundos.

## Estrutura

```text
mural-mensagens/
├── index.html
├── style.css
├── script.js
└── apps-script/
    └── Code.gs
```

## 1. Criar a planilha

Crie uma Google Sheet e copie o ID da URL:

```text
https://docs.google.com/spreadsheets/d/ESTE_E_O_ID/edit
```

O Apps Script cria automaticamente a aba `Mensagens` com:

```text
Data/Hora | Nome | Mensagem
```

## 2. Criar o Apps Script

Abra o Google Apps Script e crie um projeto.

Cole `apps-script/Code.gs`.

Troque:

```javascript
const SPREADSHEET_ID = "COLE_AQUI_O_ID_DA_PLANILHA";
```

pelo ID da sua planilha.

Em Configurações do projeto, deixe o fuso horário correto.

## 3. Publicar como Web App

No Apps Script:

1. Implantar → Nova implantação.
2. Tipo: Aplicativo da Web.
3. Executar como: você.
4. Quem tem acesso: qualquer pessoa.
5. Implantar.
6. Autorize o projeto quando solicitado.
7. Copie a URL terminada em `/exec`.

O Google documenta `doGet`/`doPost` e a publicação como Web App na documentação oficial.

## 4. Configurar o frontend

Abra `script.js` e substitua:

```javascript
const API_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";
```

pela URL `/exec`.

## 5. Publicar no GitHub Pages

Crie um repositório, por exemplo:

```bash
git init
git add .
git commit -m "Cria mural de mensagens"
git branch -M main
git remote add origin git@github.com:Renatot-stack/mural-mensagens.git
git push -u origin main
```

Depois, no GitHub:

Settings → Pages → Deploy from a branch → `main` → `/root`.

O site ficará disponível pelo GitHub Pages.

## Observação de segurança

Esta versão é um MVP: qualquer pessoa que tenha acesso ao site pode enviar mensagens e escolher qualquer nome. Não há login, autenticação ou moderação.

Para um grupo real, o próximo passo seria adicionar autenticação, uma lista de nomes autorizados e proteção contra spam.
