# Bora de xracing

> Vídeo novo. Galera na call.

Um projeto independente, gratuito e feito por fã para fãs. O bot envia no Discord os links de novos vídeos dos canais **xracing Videos** e **xracing Quedas**, para que grupos de amigos saibam quando é hora de entrar em call e assistir juntos.

Não é um produto oficial e não possui afiliação, patrocínio ou parceria com xracing, YouTube ou Discord.

## O que existe hoje

- Landing page em PT-BR e inglês, com convite OAuth2 para o Discord.
- Comandos `/subscribe` e `/unsubscribe` para acompanhar um ou ambos os canais.
- Persistência local de inscrições com SQLite.
- Leitura do feed Atom público do YouTube, sem necessidade de chave da API do Google.
- Bot em `discord.js` que entrega o link do vídeo no canal configurado.
- Webhook para notificações do hub do YouTube, quando o serviço recebe uma URL pública configurada.

## Como funciona

```text
YouTube → feed/webhook → bot → canal de texto do Discord → call com os amigos
```

O bot envia o aviso e o link. Ele não inicia chamadas, não transmite o vídeo e não compartilha a tela automaticamente.

## Estrutura

```text
front/   Landing page React + Vite
api/     Bot Discord + Express + SQLite
```

O backend usa separação entre domínio, casos de uso e infraestrutura para manter Discord, YouTube e banco de dados substituíveis.

## Rodando localmente

Você precisa de Node.js 20+ e de uma aplicação de bot criada no [Discord Developer Portal](https://discord.com/developers/applications).

```bash
git clone https://github.com/guilhermeSDB/xracing-notifier.git
cd xracing-notifier
```

Configure as variáveis de ambiente a partir de `.env.example`. Nunca inclua tokens ou arquivos `.env` no Git.

```bash
npm install --prefix api
npm install --prefix front
npm run dev --prefix api
npm run dev --prefix front
```

A landing abre, por padrão, em `http://localhost:5173`. O backend expõe `GET /health` na porta configurada (3000 por padrão).

Para habilitar WebSub no servidor, configure `YOUTUBE_CALLBACK_URL` com a URL HTTPS pública completa de `/webhook/youtube` e gere um `WEBHOOK_SECRET` longo e aleatório. O bot registra os feeds na inicialização, renova a inscrição a cada quatro dias e mantém o polling a cada cinco minutos como fallback.

### Variáveis principais

| Variável | Uso |
| --- | --- |
| `DISCORD_TOKEN` | Token secreto do bot Discord. |
| `YOUTUBE_CHANNELS` | Canais no formato `nome:ID_DO_CANAL`, separados por vírgula. |
| `DATABASE_PATH` | Caminho do arquivo SQLite. |
| `YOUTUBE_CALLBACK_URL` | URL pública do endpoint `/webhook/youtube`, caso use notificações por webhook. |
| `VITE_DISCORD_CLIENT_ID` | Client ID público usado para montar o convite do bot. |

## Comandos

| Comando | O que faz |
| --- | --- |
| `/subscribe canal:<opção>` | Inscreve o canal de texto atual nos avisos. |
| `/unsubscribe canal:<opção>` | Remove a inscrição do servidor para a opção escolhida. |
| `/status` | Mostra inscrições e a configuração de ping, de forma privada. |
| `/test` | Envia um teste no canal atual, sem mencionar ninguém. |
| `/configurar-ping modo:<opção>` | Define se avisos podem usar `@everyone` neste servidor. |

É necessário ter a permissão **Gerenciar Servidor** para alterar inscrições.

## Desenvolvimento

```bash
npm run build --prefix front
npm run typecheck --prefix api
npm test --prefix api
npm run lint --prefix api
```

## Implantação

A landing pode ser hospedada como site estático em Vercel. O bot, porém, mantém uma conexão persistente com o gateway do Discord e usa SQLite local; por isso ele precisa de um processo sempre ativo e de armazenamento persistente. Uma arquitetura prática é:

- **Vercel + Next.js:** landing, documentação, painel futuro e endpoints HTTP curtos.
- **Render, Railway, Fly.io ou VPS:** processo do bot Discord e webhook do YouTube.
- **Postgres gerenciado:** inscrições, status e preferências quando o projeto deixar de usar SQLite local.

O fluxo GitHub → Vercel pode publicar automaticamente a landing a cada push. Uma integração com a API do GitHub só é necessária se o produto for oferecer recursos que leiam ou escrevam em repositórios; não é necessária para deploy automático.

## Próximos passos

- Adicionar idioma por servidor aos comandos e às notificações.
- Guardar idioma por servidor e traduzir os avisos do bot.
- Migrar inscrições para Postgres antes de escalar ou mover o bot para ambiente serverless.
- Transformar o frontend em Next.js somente quando houver painel autenticado, configurações por servidor ou páginas renderizadas no servidor.

## Créditos

Produto [G&G Desenvolvimento, Brasil](https://geg.dev.br/pt/).
