# API do xracing

Bot Discord que avisa novos vídeos dos canais configurados do xracing. Ele usa dois caminhos complementares: WebSub para receber o evento rapidamente e RSS como fallback a cada cinco minutos.

## Recursos

- Inscrições por servidor e canal com `/subscribe` e `/unsubscribe`.
- Entrega de novo vídeo pelo Discord, sem duplicar avisos.
- Inscrição WebSub ao iniciar e renovação automática a cada quatro dias.
- Verificação HMAC do header `X-Hub-Signature` antes de processar o XML do webhook.
- `/status`, `/test` e `/configurar-ping` para operar o bot dentro do Discord.
- SQLite persistente para inscrições e preferências de ping.

## Ambiente

Crie `.env` a partir de `../.env.example`:

```env
DISCORD_TOKEN=token_do_bot
YOUTUBE_CHANNELS=xracing:ID_DO_CANAL,xracing Quedas:ID_DO_CANAL
DATABASE_PATH=./data/bot.db
YOUTUBE_CALLBACK_URL=https://api.seu-dominio.com/webhook/youtube
WEBHOOK_SECRET=um_segredo_longo_e_aleatorio
PORT=3000
```

`YOUTUBE_CALLBACK_URL` precisa ser uma URL HTTPS pública e apontar exatamente para `/webhook/youtube`. Quando ela está configurada, `WEBHOOK_SECRET` passa a ser obrigatório. O servidor deve manter essa rota acessível durante a confirmação que o hub do YouTube envia ao criar ou renovar a inscrição.

Sem URL de callback, o bot continua funcionando somente pelo RSS. Isso é útil no desenvolvimento local, mas tem mais latência.

## Comandos

| Comando | Resultado |
| --- | --- |
| `/subscribe canal:<opção>` | Inscreve o canal de texto atual nos avisos. |
| `/unsubscribe canal:<opção>` | Remove a inscrição selecionada. |
| `/status` | Mostra inscrições e preferência de ping de forma privada. |
| `/test` | Publica uma mensagem de teste no canal atual sem ping. |
| `/configurar-ping modo:<opção>` | Ativa ou desativa `@everyone` para novos avisos deste servidor. |

Os comandos de configuração requerem a permissão **Gerenciar Servidor**. Mesmo com a preferência ativada, o bot só menciona `@everyone` se tiver essa permissão no canal.

## Executar

```bash
npm install
npm run dev
```

Para validar antes de publicar:

```bash
npm test
npm run typecheck
npm run build
npm run lint
```

## Produção com Docker

O `docker-compose.yml` na raiz mantém o banco SQLite no volume `sqlite_data`. Defina os segredos no ambiente do servidor ou em um arquivo `.env` que não seja enviado ao Git e execute:

```bash
docker compose up -d --build api
```

Coloque um proxy reverso com TLS (por exemplo, Nginx ou Caddy) na frente da porta 3000 e encaminhe `https://api.seu-dominio.com/webhook/youtube` para o container. Não publique o banco SQLite nem os arquivos `.env`.

## Arquitetura

`src/domain` contém entidades e contratos; `src/application` reúne os casos de uso; `src/infra` integra Discord, YouTube, SQLite e HTTP; `src/main` compõe dependências, cron e inicialização. Essa separação permite trocar SQLite por Postgres ou mover o webhook sem reescrever a regra de negócio.
