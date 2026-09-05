![Capa do portfólio](assets/portfolio-cover.webp)

# Portfólio profissional com apoio de IA: Construção e Evolução

![Status](https://img.shields.io/badge/Status-Em%20evolução-brightgreen)
![Projeto](https://img.shields.io/badge/Projeto-Pessoal-5B2A86)
![IA](https://img.shields.io/badge/IA-Vibe%20Coding-673AB7)
![GitHub API](https://img.shields.io/badge/GitHub-API-181717?logo=github&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

Site pessoal desenvolvido para GitHub Pages, com foco em Marketing, CRM, Inteligência Comercial e Dados.

## Conteúdo

- Experiência e resultados profissionais
- Competências e ferramentas
- Projetos de Power BI, análise de dados e IA
- Links para os repositórios completos
- Versões em português, inglês e espanhol
- Tema escuro e claro

## Tecnologias do site

HTML, CSS e JavaScript, sem frameworks ou dependências de build.

## Estrutura do repositório

- `index.html` — estrutura e conteúdo-base da página, sem estilos ou comportamentos inline.
- `styles.css` — estrutura visual geral, layout, responsividade e componentes estáticos principais.
- `theme.css` — tema claro, tipografia de detalhe e complementos visuais do Hero, Foco e faixa de competências.
- `components.css` — seletor de idiomas, componentes visuais complementares, Easter egg do terminal SQL e toda a camada visual dos projetos, incluindo fallback estático, filtros e galeria dinâmica.
- `core.js` — interações gerais do site: animações de entrada, tema, cursor, menu, expansão da marca no header, scroll spy, números animados e cópia de e-mail.
- `hero-sql.js` — digitação da consulta SQL do Hero, acessibilidade do terminal e Easter egg com glitch/Matrix.
- `hero-flow.js` — fundo animado de partículas e conexões do Hero, incluindo adaptação aos temas e preferência por movimento reduzido.
- `project-gallery.js` — descoberta, validação, cache, sincronização e renderização dos projetos a partir do GitHub e dos arquivos `portfolio.json`.
- `i18n.js` — internacionalização do conteúdo e estados da interface em português, inglês e espanhol.
- `assets/` — arquivos visuais locais utilizados pelo site.
- `README.md` — documentação do projeto.

## Fluxo de interação entre os scripts

Cada arquivo JavaScript mantém uma responsabilidade principal:

- `core.js` controla os estados e interações gerais da página e define preferências de interação compartilhadas pelos módulos carregados em seguida.
- `hero-sql.js` concentra exclusivamente o comportamento do terminal SQL e de seu Easter egg; sua aparência permanece em `components.css`.
- `hero-flow.js` concentra exclusivamente a animação de fundo do Hero.
- `project-gallery.js` é a fonte de dados dos projetos e publica os metadados carregados para o restante do site.
- `i18n.js` traduz a interface e reage aos estados publicados pelos outros scripts, sem refazer as consultas dos projetos.

A comunicação entre os scripts utiliza eventos customizados, como mudanças de tema, menu, cópia de e-mail, status da galeria e atualização dos metadados dos projetos. Isso evita que o sistema de idiomas precise observar alterações indiretas no DOM ou repetir requisições ao GitHub.

## Padrão para projetos exibidos no portfólio

Os projetos são identificados por um arquivo `portfolio.json` no próprio repositório do projeto. O campo `portfolio` deve estar definido como `true`.

Estrutura recomendada:

```json
{
  "portfolio": true,
  "order": 1,
  "title": "Título em português",
  "title_en": "Title in English",
  "title_es": "Título en español",
  "categories": ["Power BI"],
  "description": "Descrição em português.",
  "description_en": "Description in English.",
  "description_es": "Descripción en español.",
  "image": "URL da imagem de preview",
  "tags": ["Power BI", "DAX"],
  "eyebrow": "POWER BI",
  "eyebrow_en": "POWER BI",
  "eyebrow_es": "POWER BI"
}
```

`categories` funciona como identificador interno dos filtros e, por isso, não precisa ser traduzido. Os campos visíveis ao visitante — título, descrição e eyebrow — podem possuir versões específicas para inglês e espanhol.

A galeria mantém uma versão local válida dos metadados em cache para uso temporário quando a consulta ao GitHub não estiver disponível. O HTML também contém cards básicos como fallback de segurança.

### Adicionando novos projetos

Todo projeto que deve aparecer automaticamente na galeria precisa possuir um arquivo `portfolio.json` válido no próprio repositório, incluindo os campos visíveis em português, inglês e espanhol.

O fallback final do site é independente da sincronização com o GitHub e deve permanecer enxuto. Caso um novo projeto também deva aparecer nesse modo de segurança, adicionar seu card básico ao `index.html` e suas traduções PT/EN/ES ao objeto `fallbackProjects` em `i18n.js`.

Fluxo da galeria: **GitHub → cache local → fallback estático**.

## Padrão para descrições de projetos

Para os cards do portfólio, priorizar uma descrição curta e orientada ao negócio seguindo esta lógica:

**Problema/pergunta → análise/abordagem → finalidade**

A descrição deve deixar claro:

1. **Problema/pergunta:** o que precisava ser entendido, analisado ou resolvido.
2. **Análise/abordagem:** como o projeto investigou ou tratou a questão, citando métodos ou ferramentas apenas quando agregarem contexto.
3. **Finalidade:** para que a análise serve, como apoiar decisões, identificar oportunidades, facilitar entendimento ou melhorar processos.

Evitar descrições que sejam apenas uma lista de ferramentas ou tarefas executadas. O foco principal deve ser o valor do projeto e a pergunta que ele ajuda a responder.

Exemplo de estrutura:

> Análise de [tema/problema] para identificar [achado ou questão investigada], utilizando [abordagem, quando relevante], com foco em [finalidade de negócio].

Para páginas ou READMEs de projetos mais completos, pode-se usar uma narrativa mais detalhada:

**Problema → estratégia → execução → resultado**

Essa segunda estrutura é mais adequada para transformar o projeto em um mini-case, enquanto a primeira deve ser a referência principal para os cards do site.

## Diretriz de manutenção

A prioridade é manter o site simples e estável. Mudanças de organização interna devem preservar o comportamento e a aparência existentes, evitando dependências ou arquivos adicionais sem necessidade.

Antes de alterar um arquivo, trabalhar sempre sobre sua versão atual para evitar sobrescrever mudanças recentes. Refatorações devem ser pequenas e isoladas sempre que possível.

## Publicação

Este repositório utiliza o padrão de site pessoal do GitHub Pages: `lucasdemrodrigues.github.io`.
