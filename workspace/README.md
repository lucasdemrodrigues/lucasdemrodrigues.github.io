# Workspace privado

Área pessoal autenticada e isolada do portfólio público.

## Objetivo

Manter ferramentas pessoais em uma estrutura simples, reversível e desacoplada do restante do site. O portfólio público continua funcionando de forma independente; o Workspace concentra apenas autenticação, módulos privados e integração com o Supabase.

## Estrutura

### Fundação

- `index.html` — login e home autenticada do Workspace.
- `workspace.css` — estilos compartilhados da home, autenticação e componentes-base.
- `workspace.js` — login, logout e estado da sessão na home.
- `shared.js` — cliente do Supabase e utilitários compartilhados pelos módulos.
- `export-excel.js` — função única de exportação para arquivos `.xlsx`.
- `supabase-config.js` — URL pública do projeto e chave publishable/anon.

### Módulos

Cada módulo mantém seu próprio HTML, CSS e JavaScript para continuar independente e fácil de remover:

- `carreira.*` — oportunidades e candidaturas.
- `metas.*` — metas mensais e anuais.
- `habitos.*` — hábitos e check-ins.
- `cultura.*` — filmes e livros.

### Banco de dados

A pasta `sql/` guarda os scripts de criação e migração do banco. Alterações de schema devem ser registradas ali para que a estrutura do Supabase permaneça documentada no repositório.

## Organização do código

A arquitetura segue estas regras:

1. lógica compartilhada fica em arquivos compartilhados, sem duplicação entre módulos;
2. regras específicas permanecem dentro do módulo correspondente;
3. conteúdo vindo do banco é escapado antes de ser inserido em HTML dinâmico;
4. exportações usam uma única implementação;
5. mudanças no banco ficam versionadas em `sql/`;
6. nenhum módulo deve depender de outro módulo.

## Segurança

O GitHub Pages é público e estático. A privacidade dos dados não depende de esconder arquivos ou rotas.

Os dados privados permanecem no Supabase e são protegidos por:

1. Supabase Auth;
2. Row Level Security (RLS);
3. policies vinculadas ao usuário autenticado;
4. ausência de `service_role`, senha do banco ou outros segredos no repositório.

A URL do projeto e a chave publishable/anon podem existir no navegador; elas não substituem RLS.

## Reversibilidade

O Workspace foi mantido dentro da pasta `workspace/`. Os módulos têm dependências apenas na fundação compartilhada dessa pasta e no Supabase.

Se um módulo for abandonado, seus arquivos e tabelas podem ser removidos sem afetar o portfólio público. Se todo o Workspace for removido, basta retirar a pasta `workspace/` e o link público que aponta para ela.
