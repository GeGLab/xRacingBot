# Bora de xracing

Landing page de um bot gratuito e independente, criado por um fã para levar os vídeos do xracing às rodas de amigos no Discord.

## Direção da página

**Nome proposto: Bora de xracing.** “Bora” funciona como um convite brasileiro para assistir junto. A marca permanece igual em inglês, acompanhada de uma descrição localizada que explica o bot.

- Português: **Vídeo novo. Galera na call.**
- Inglês: **New video. Meet in voice chat.**
- Outras opções de nome para avaliar: **Bora Assistir** (mais amplo, com “xracing no Discord” como descrição) e **xracing na Call** (mais direto sobre o encontro).
- A escolha é uma proposta editorial; disponibilidade de marca e domínio não foi verificada.

A história do desenvolvedor e do Gustavo substitui depoimentos sem origem comprovada. A página explica que o bot envia links, enquanto os amigos entram na call e compartilham a tela. A condição de projeto de fã, não oficial e sem objetivo de lucro, aparece desde a primeira seção.

## Desenvolvimento

```sh
npm ci
npm run dev
npm run build
```

O convite usa `VITE_DISCORD_CLIENT_ID` e preserva o Application ID existente como padrão. A mudança de nome da landing não altera o nome da aplicação no Discord Developer Portal.

Os textos estão em `src/content.ts`; `src/i18n.tsx` controla o idioma, a preferência local e os metadados em execução. PT-BR é o padrão. `?lang=en` e `?lang=pt-BR` permitem compartilhar uma escolha explícita de idioma, com prioridade sobre a preferência salva. O seletor continua funcionando quando o navegador bloqueia localStorage.

O HTML inicial e os metadados estáticos estão em português. A seleção de inglês funciona no cliente; indexação e prévias sociais distintas por idioma exigem futuramente prerenderização ou renderização no servidor.

O exemplo de Discord é ilustrativo, sem consulta a vídeos em tempo real. O texto real da notificação continua em português, inclusive na versão inglesa, com uma explicação visível. A landing não anuncia tradução dos comandos nem dos vídeos.

A navbar flutua em uma cápsula translúcida e se compacta após a primeira rolagem. A prévia principal usa perspectiva, profundidade entre camadas e iluminação que acompanha o cursor; em telas de toque ela mantém a composição tridimensional estática, e a animação é desativada quando o navegador pede movimento reduzido.

## Próximas melhorias, em ordem sugerida

1. **Confiabilidade das notificações:** revisar o agendamento em `api/src/main/jobs/checkNewVideos.job.ts`. A expressão atual consulta a cada meia hora, entre 18h e 22h, às segundas, quintas e sextas; o comentário diz cinco minutos. Definir fuso explicitamente, conferir renovação do webhook e cobrir publicações fora dessa janela antes de prometer rapidez.
2. **Inglês no bot:** adicionar preferência de idioma por servidor e localizar descrições, escolhas, respostas e notificações, preservando títulos originais dos vídeos.
3. **Controle de menções:** oferecer uma opção explícita para nenhum ping, um cargo escolhido ou @everyone. Hoje o código decide pela permissão do bot no canal.
4. **Configuração visível:** um comando de status que mostre canais acompanhados, destino dos avisos e idioma; avaliar um aviso de teste sem ping geral.
5. **Portfólio:** transformar o README técnico em um estudo de caso com problema, arquitetura, testes, decisões e aprendizados, com imagens reais quando disponíveis.
6. **Preparar a publicação:** confirmar nome e domínio, revisar o nome/avatar no Discord, escrever documentos reais de privacidade e termos conforme a operação e substituir as URLs de implantação existentes em `public/robots.txt`, `public/sitemap.xml` e na configuração. Os antigos links vazios de documentos e as avaliações sem comprovação foram removidos da landing.
7. **Apresentação ao criador:** compartilhar a história, uma demonstração e o escopo gratuito do projeto. Qualquer menção a parceria deve esperar uma autorização real.

## Verificação desta revisão

- Build de produção com TypeScript e Vite.
- Verificação de renderização nos dois idiomas e de prioridade da preferência de idioma.
- Layout com breakpoints para celular/tablet/desktop, navegação móvel, foco visível, link para pular ao conteúdo e respeito à preferência de movimento reduzido.
- Sem validação visual em navegador nesta revisão e sem instalação do bot em um servidor real.
