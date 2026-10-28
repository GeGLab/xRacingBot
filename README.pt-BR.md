[Read in English](README.md)

# Bora de xracing

> Vídeo novo. Galera na call.

Um bot Discord feito por fã que publica no seu servidor os novos vídeos dos canais **xracing Videos** e **xracing Quedas**, para os amigos saberem quando se reunir para assistir. Este repositório inclui o bot, seu backend HTTP e uma landing page bilíngue.

Projeto independente e gratuito, sem afiliação, patrocínio ou parceria com xracing, YouTube ou Discord.

## Recursos

- Inscreva um canal de texto do Discord nos avisos de um ou de todos os canais do YouTube configurados.
- Receba links de vídeos por notificações WebSub do YouTube, com consulta RSS a cada cinco minutos como alternativa.
- Use os feeds Atom públicos do YouTube sem precisar de uma chave da API do Google.
- Guarde inscrições, o ID do último vídeo notificado e as preferências de ping do servidor em SQLite.
- Consulte o status das inscrições e envie uma notificação de teste pelo Discord.
- Ative ou desative menções a `@everyone` por servidor; elas vêm desativadas por padrão.
- Receba webhooks assinados com verificação HMAC e renovação automática das inscrições WebSub.
- Acesse uma landing page responsiva em português brasileiro e inglês, com convite para adicionar o bot ao Discord.
- Execute backend e frontend com Docker Compose.

O bot publica links de vídeos. Os amigos entram na call e compartilham a tela por conta própria.

## Como funciona

```text
Novos vídeos no YouTube
    | Webhook WebSub / consulta RSS
    v
Casos de uso <--> Inscrições e preferências no SQLite
    |
    v
Canal de texto do Discord --> Amigos se encontram na call
```

Cada inscrição guarda o ID do último vídeo notificado para ignorar entradas repetidas. Os dois caminhos de notificação só anunciam vídeos publicados na data UTC atual; vídeos antigos são registrados como vistos, sem aviso. A consulta RSS verifica o vídeo mais recente de cada canal do YouTube acompanhado, sem reproduzir todo o histórico de publicações.

## Tecnologias e estrutura

| Componente | Tecnologias |
| --- | --- |
| Bot e backend | TypeScript, Node.js, discord.js, Express |
| Integração com YouTube | WebSub / PubSubHubbub, feeds Atom, node-cron |
| Persistência | SQLite com better-sqlite3 |
| Landing page | React 19, Vite, Tailwind CSS |
| Testes e ferramentas | Vitest, ESLint, TypeScript |
| Containers | Docker Compose, Nginx para o frontend |

```text
api/
  src/domain/         Entidades e contratos de repositórios
  src/application/    Casos de uso e contratos de serviços
  src/infra/          Adaptadores de Discord, YouTube, SQLite e HTTP
  src/main/           Configuração, composição de dependências, jobs e inicialização
  tests/              Testes de casos de uso, repositórios e adaptadores do YouTube
front/
  src/                Componentes React, traduções e configuração do site
  public/             Imagens, ícones e metadados estáticos
docker-compose.yml    Backend, frontend e volume persistente do SQLite
```

O backend segue Clean Architecture, separando as regras de negócio das integrações com Discord, YouTube, HTTP e banco de dados.

## Executar localmente

Você precisa de Node.js 20 ou superior, npm e uma aplicação de bot criada no [Discord Developer Portal](https://discord.com/developers/applications).

```bash
git clone https://github.com/guilhermeSDB/xracing-notifier.git
cd xracing-notifier
npm ci --prefix api
npm ci --prefix front
```

### Configurar o backend

Crie `api/.env` com as configurações abaixo e substitua o token:

```dotenv
DISCORD_TOKEN=seu_token_do_bot_discord
YOUTUBE_CHANNELS=xracing:UCW3oIxTLllTLK3Vy9jzdoEg,xracing Quedas:UCfjNkkpiOZjPnvfV1mcrwmQ
DATABASE_PATH=./data/bot.db
PORT=3000
YOUTUBE_CALLBACK_URL=
WEBHOOK_SECRET=
```

Essa configuração usa apenas consultas RSS, então o desenvolvimento local dispensa uma URL pública para webhook. O backend lê `YOUTUBE_CHANNELS` (no plural), com entradas `nome:id_do_canal` separadas por vírgulas. Mantenha tokens e arquivos `.env` fora do controle de versão.

Inicie o backend em um terminal, a partir da raiz do repositório:

```bash
cd api
npm run dev
```

O endpoint HTTP de saúde fica em `http://localhost:3000/health`. Os comandos são registrados globalmente depois que o bot se conecta ao Discord.

### Configurar a landing page

Crie `front/.env` usando `front/.env.example` como referência:

```dotenv
VITE_DISCORD_CLIENT_ID=id_da_sua_aplicacao_discord
VITE_SITE_URL=http://localhost:5173
```

Use o Application ID do seu próprio bot para gerar o convite. Inicie o frontend em outro terminal, a partir da raiz do repositório:

```bash
cd front
npm run dev
```

Acesse `http://localhost:5173` e use o botão de convite para adicionar seu bot a um servidor. O idioma padrão da landing page é português; `?lang=en` seleciona inglês e `?lang=pt-BR` seleciona português brasileiro. As respostas e notificações do bot continuam em português.

## Comandos do Discord

Atualmente, todos os comandos exigem a permissão **Gerenciar Servidor** e devem ser usados dentro de um servidor. Quando aplicável, selecione um canal do YouTube configurado ou **Todos**.

| Comando | O que faz |
| --- | --- |
| `/subscribe canal:<opção>` | Inscreve o canal de texto atual nos avisos dos canais do YouTube selecionados. |
| `/unsubscribe canal:<opção>` | Remove a inscrição do servidor nos canais do YouTube selecionados. |
| `/status` | Mostra, de forma privada, as inscrições, os canais de destino e a preferência de ping. |
| `/test` | Publica um aviso de teste no canal atual sem mencionar ninguém. |
| `/configurar-ping modo:<opção>` | Permite escolher **Sem menção** ou **Mencionar @everyone**. |

O bot precisa de permissão para visualizar e enviar mensagens no canal de destino. Ative **Inserir Links** para as prévias dos vídeos. O ping `@everyone` exige tanto a preferência do servidor ativada quanto a permissão do bot para mencionar todos naquele canal.

Existe um destino por servidor e canal do YouTube. Para trocar o destino, remova a inscrição e inscreva novamente no novo canal de texto.

## WebSub e implantação

Para ativar as notificações por push, defina estas variáveis no ambiente do backend:

```dotenv
YOUTUBE_CALLBACK_URL=https://api.exemplo.com/webhook/youtube
WEBHOOK_SECRET=substitua_por_um_segredo_longo_e_aleatorio
```

O callback deve ser uma URL HTTPS pública apontando para `/webhook/youtube`. A rota aceita requisições `GET` para verificação do hub e `POST` para notificações. O segredo é obrigatório quando há uma URL de callback configurada. O backend solicita as inscrições ao iniciar e agenda sua renovação; as consultas RSS continuam ativas.

A landing page pode ser hospedada como site estático a partir de `front/dist`. O bot precisa de um processo continuamente ativo para a conexão com o Gateway do Discord e de armazenamento persistente para o SQLite.

### Docker Compose

Crie um `.env` na raiz a partir de `.env.example` e preencha `DISCORD_TOKEN`, `YOUTUBE_CALLBACK_URL` e `WEBHOOK_SECRET`. Diferentemente da configuração local que usa apenas RSS, o Compose fornecido exige os três valores.

Para uma implantação própria, ajuste os canais do YouTube e os argumentos de build do frontend (`VITE_DISCORD_CLIENT_ID` e `VITE_SITE_URL`) diretamente no `docker-compose.yml`: esses valores estão fixos no arquivo e não são lidos do `.env` da raiz.

```bash
docker compose up -d --build
```

O frontend é exposto na porta `80`, o backend na porta `3000` e o banco fica no volume `sqlite_data`. Configure um proxy reverso com HTTPS na frente do backend para usar WebSub. Para executar apenas o bot e o backend:

```bash
docker compose up -d --build api
```

## Verificações de desenvolvimento

Execute a partir da raiz do repositório:

```bash
npm test --prefix api
npm run typecheck --prefix api
npm run lint --prefix api
npm run build --prefix api
npm run build --prefix front
```

Os testes do backend cobrem regras de notificação, casos de uso de inscrições, repositórios, leitura de RSS e requisições WebSub. O build de produção do frontend inclui a verificação de tipos do TypeScript.

## Créditos

Desenvolvido por [G&G Desenvolvimento, Brasil](https://geg.dev.br/pt/), inspirado nas sessões de xracing com os amigos no Discord.
