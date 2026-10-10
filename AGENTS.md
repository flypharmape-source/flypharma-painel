<!-- bmad:context -->
<!-- Verificado em 2026-10-09 contra 148f71d. Gerenciado por bmad-project-context; edições dentro deste bloco são substituídas no refresh. Mantenha fora dos marcadores o que quiser preservar. -->

## flypharma-painel

Painel web do FlyPharma (admin, farmácia e farmacêutico): página estática em HTML e JS puro, sem build. Publicado em painel.flypharma.com.br pelo GitHub Pages, direto da `master`. Consome a API do `flypharma-backend`.

## Política

- Trabalhe sempre em branch (`chore/`, `fix/` ou `feat/`) e integre por PR. O merge na `master` publica o painel na hora. A tag `estado-atual-2026-10-09` marca o repo antes dos ajustes.
- O repositório é público: nunca coloque senhas, tokens, chaves nem dados reais de clientes, farmácias ou receitas no código, em exemplos ou em commits.
- Fluxo de cada alteração, nesta ordem: SP (`bmad-sprint-planning`, uma vez por sprint), BD (`bmad-build`, uma história por branch), CR (`bmad-code-review`, antes de abrir o PR), QA (`bmad-qa-generate-e2e-tests`; o PR só integra com os testes passando), merge por PR, ER (`bmad-retrospective`, ao fim de cada épico). Só pule uma etapa a pedido explícito. As histórias estão em `epics.md` do repositório `flypharma-docs`.

## Onde ficam as coisas

- Telas e lógica ficam em `index.html`; `privacidade.html` é a política de privacidade, linkada pelos apps.
- `CNAME` define o domínio; não edite nem apague.
- `painel_chat.js` não é carregado pelo `index.html` (o chat está embutido nele); editar esse arquivo não muda o painel.

## Rodando e verificando

- Não há build, `package.json` nem testes: abra `index.html` no navegador.
- O `index.html` tem ~830 KB; leia por trechos (busca ou offset), nunca o arquivo inteiro.

## Convenções que diferem do padrão

- A URL da API (`const API`) e a do socket (`io(...)`) estão fixas no `index.html` e apontam para o staging (`web-production-b66cd.up.railway.app`); troque as duas juntas ao ir para produção.
<!-- /bmad:context -->
