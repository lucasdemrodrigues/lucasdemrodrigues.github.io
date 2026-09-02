# Portfólio — Lucas Rodrigues

Site pessoal desenvolvido para GitHub Pages, com foco em Marketing, CRM, Inteligência Comercial e Dados.

## Conteúdo

- Experiência e resultados profissionais
- Ferramentas e conhecimentos
- Projetos de Power BI, análise de dados e IA
- Links para os repositórios completos
- Versões em português, inglês e espanhol
- Tema escuro e claro

## Tecnologias do site

HTML, CSS e JavaScript, sem frameworks ou dependências de build.

## Estrutura do repositório

- `index.html` — estrutura e conteúdo-base da página.
- `styles.css` — estilos visuais principais e responsividade.
- `theme.css` — regras complementares de tema e ajustes visuais.
- `script.js` — interações gerais do site, como animações, menu, tema, cursor, copiar e-mail, números animados e efeitos do Hero.
- `project-gallery.js` — sincronização e renderização dinâmica dos projetos a partir do GitHub e dos arquivos `portfolio.json`.
- `i18n.js` — internacionalização do site e seletor PT · EN · ES.
- `assets/` — arquivos visuais locais utilizados pelo site.
- `README.md` — documentação do projeto.

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

## Publicação

Este repositório utiliza o padrão de site pessoal do GitHub Pages: `lucasdemrodrigues.github.io`.