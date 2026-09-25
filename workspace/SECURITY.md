# Segurança do Workspace

O repositório é público. O código do Workspace pode ser público; os dados do Workspace não.

## Pode existir no GitHub

- HTML, CSS e JavaScript da interface;
- scripts SQL de estrutura e policies;
- URL pública do projeto Supabase;
- chave `publishable/anon` do Supabase;
- nomes de tabelas e campos;
- código da Edge Function sem secrets;
- exemplos explicitamente fictícios e anonimizados.

## Nunca deve ser versionado

- senha de login;
- senha do banco;
- `service_role`;
- `GROQ_API_KEY` ou qualquer chave `gsk_...`;
- tokens de sessão;
- dumps do banco;
- candidaturas, metas, hábitos ou notas pessoais reais;
- peso, pressão arterial ou outros registros pessoais de Saúde;
- respostas reais geradas pela IA;
- screenshots públicos que revelem dados privados.

## Onde os dados ficam

Os registros reais vivem apenas no Supabase. As tabelas privadas usam Supabase Auth e Row Level Security (RLS), com acesso limitado ao próprio `user_id`.

Os insights gerados pela IA são armazenados na tabela `workspace_ai_insights` e não são gravados em arquivos do GitHub.

A chave da Groq fica somente nos secrets das Supabase Edge Functions.

## Regra para futuras funcionalidades

Novos módulos devem seguir o mesmo padrão:

1. código e schema podem ser públicos;
2. dados reais nunca entram no repositório;
3. toda tabela pessoal deve habilitar RLS antes de ser usada;
4. nenhum secret deve chegar ao navegador;
5. demonstrações públicas devem usar dados fictícios.
