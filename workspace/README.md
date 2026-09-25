# Workspace privado

Fundação isolada da futura área pessoal do portfólio.

## Objetivo

Manter a implementação reversível e desacoplada do site público. Nenhum arquivo existente do portfólio é alterado nesta etapa.

## Estrutura

- `index.html`: interface de login e shell inicial autenticado.
- `workspace.css`: estilos exclusivos da área privada.
- `workspace.js`: sessão, login e logout via Supabase Auth.
- `supabase-config.js`: apenas URL pública e chave anon/publishable.

## Segurança

O GitHub Pages continua público e estático. A segurança não depende de esconder arquivos ou rotas.

Os dados privados deverão permanecer no Supabase e ser protegidos por:
1. Supabase Auth;
2. Row Level Security (RLS);
3. policies vinculadas ao usuário autenticado;
4. ausência total de `service_role` ou outros segredos no repositório.

A URL do projeto e a chave anon/publishable podem existir no cliente; elas não substituem RLS.

## Ativação

A interface está deliberadamente desativada enquanto `SUPABASE_URL` e `SUPABASE_ANON_KEY` estiverem vazios. A configuração do projeto Supabase deve ser concluída antes de integrar esta branch ao `main`.

## Reversibilidade

Para remover a área privada no futuro, basta excluir a pasta `workspace/`. Como esta primeira etapa não modifica os arquivos públicos existentes, não há dependências espalhadas pelo restante do portfólio.
