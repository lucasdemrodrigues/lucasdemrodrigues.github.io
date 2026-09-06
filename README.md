![Capa do portfólio](assets/portfolio-cover.webp)

<h1 align="center">
  Construção de um portfólio profissional com apoio de IA
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20evolução-0891B2" alt="Status">
  <img src="https://img.shields.io/badge/Projeto-Pessoal-B45309" alt="Projeto">
  <img src="https://img.shields.io/badge/IA-Vibe%20Coding-673AB7" alt="IA">
  <img src="https://img.shields.io/badge/GA4-Analytics-E37400?logo=googleanalytics&logoColor=white" alt="GA4 Analytics">
  <img src="https://img.shields.io/badge/GitHub-API-181717?logo=github&logoColor=white" alt="GitHub API">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
</p>

<p align="center">
  🔗 <a href="https://lucasdemrodrigues.github.io">Acessar site</a>
</p>

## 📑 Índice

- 🔎 [Visão geral](#visão-geral)
- 👤 [Meu papel](#meu-papel)
- 🧰 [Stack e ferramentas](#stack-e-ferramentas)
- 🤖 [Fluxo com Inteligência Artificial](#fluxo-com-inteligência-artificial)
- ⚙️ [Arquitetura e funcionalidades](#arquitetura-e-funcionalidades)
- 📊 [Mensuração com GA4](#mensuração-com-ga4)
- 🧩 [Desafios e soluções](#desafios-e-soluções)
- 🚀 [Deploy e manutenção](#deploy-e-manutenção)

## 🔎 Visão Geral

Este portfólio foi criado para complementar meu currículo e LinkedIn em um formato mais visual e integrado. Ele reúne perfil, projetos e principais resultados profissionais para que recrutadores e gestores compreendam rapidamente minhas competências e os tipos de problema que já ajudei a resolver.

Ao mesmo tempo, o projeto foi pensado como uma experiência prática de aprendizado, utilizando IA generativa como apoio ao desenvolvimento e ao aprimoramento contínuo do portfólio.

### Principais funcionalidades

- Versões em português, inglês e espanhol;
- Tema claro e escuro;
- Galeria de projetos integrada à API do GitHub;
- Cache local e fallback estático para maior resiliência;
- Filtros por categoria de projeto;
- Indicadores e resultados profissionais em destaque;
- Layout responsivo para desktop e mobile;
- Navegação por teclado e melhorias de acessibilidade;
- Animações com suporte a `prefers-reduced-motion`;
- Microinterações e Easter eggs discretos no Hero;
- Links diretos para projetos, LinkedIn e contato por e-mail;
- Mensuração com Google Analytics 4 e eventos personalizados para aquisição, engajamento e intenção de contato.

---

## 👤 Meu papel

Fui responsável pela direção e evolução do portfólio, definindo objetivos, prioridades, conteúdo, experiência do usuário, critérios de implementação e decisões técnicas ao longo do projeto.

A IA generativa foi utilizada como ferramenta de apoio ao desenvolvimento, enquanto a avaliação das propostas e as decisões finais permaneceram sob minha responsabilidade.

Na prática, isso envolveu:

- Definição do objetivo e do posicionamento do portfólio;
- Direção visual e criativa;
- Definição e priorização de funcionalidades;
- Decisões de conteúdo e estrutura;
- Definição de critérios de UX, responsividade e acessibilidade;
- Avaliação e validação das propostas geradas por IA;
- Revisão e validação das alterações de código;
- Testes dos principais fluxos e interações;
- Decisão sobre o que implementar, ajustar ou descartar;
- Organização e evolução contínua do repositório.

____

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
- `analytics.js` — configuração do Google Analytics 4 e camada central de instrumentação dos eventos personalizados do portfólio.
- `core.js` — interações gerais do site: animações de entrada, tema, cursor, menu, expansão da marca no header, scroll spy, números animados e cópia de e-mail.
- `hero-sql.js` — digitação da consulta SQL do Hero, acessibilidade do terminal e Easter egg com glitch/Matrix.
- `hero-flow.js` — fundo animado de partículas e conexões do Hero, incluindo adaptação aos temas e preferência por movimento reduzido.
- `project-gallery.js` — descoberta, validação, cache, sincronização e renderização dos projetos a partir do GitHub e dos arquivos `portfolio.json`.
- `i18n.js` — internacionalização do conteúdo e estados da interface em português, inglês e espanhol.
- `assets/` — arquivos visuais locais utilizados pelo site.
- `README.md` — documentação do projeto.

## Fluxo de interação entre os scripts

Cada arquivo JavaScript mantém uma responsabilidade principal:

- `analytics.js` inicializa o GA4, centraliza o envio de eventos e observa interações relevantes sem espalhar chamadas diretas ao serviço pelos demais módulos.
- `core.js` controla os estados e interações gerais da página e define preferências de interação compartilhadas pelos módulos carregados em seguida.
- `hero-sql.js` concentra exclusivamente o comportamento do terminal SQL e de seu Easter egg; sua aparência permanece em `components.css`.
- `hero-flow.js` concentra exclusivamente a animação de fundo do Hero.
- `project-gallery.js` é a fonte de dados dos projetos e publica os metadados carregados para o restante do site.
- `i18n.js` traduz a interface e reage aos estados publicados pelos outros scripts, sem refazer as consultas dos projetos.

A comunicação entre os scripts utiliza eventos customizados, como mudanças de tema, menu, cópia de e-mail, status da galeria, atualização dos metadados dos projetos e acionamento do Easter egg Matrix. Isso evita acoplamento desnecessário entre os módulos e permite que a camada de analytics registre interações sem alterar seu comportamento visual.

## Mensuração com Google Analytics 4

O portfólio utiliza Google Analytics 4 para acompanhar aquisição, engajamento e sinais de intenção profissional. A instrumentação personalizada fica centralizada em `analytics.js` e complementa os eventos automáticos fornecidos pela métrica otimizada do GA4.

Eventos personalizados atuais:

- `section_view` — visualização qualificada das seções do site, com `section_name`;
- `project_click` — clique em projeto, com `project_name`, `project_category` e `project_position`;
- `linkedin_click` — clique no LinkedIn na área de contato;
- `email_copy` — cópia concluída do endereço de e-mail;
- `contact_intent` — consolida sinais de intenção de contato, com `contact_method` (`linkedin` ou `email`);
- `language_change` — mudança ativa de idioma, com `selected_language` (`pt`, `en` ou `es`);
- `theme_change` — mudança ativa de tema, com `theme` (`light` ou `dark`);
- `easter_egg_trigger` — acionamento dos Easter eggs, com `easter_egg_name` (`matrix` ou `portfolio_sql`).

O evento `github_click` não é utilizado na taxonomia atual para evitar duplicidade: acessos aos repositórios de projetos já são representados por `project_click`, enquanto o link `portfolio.sql` é medido como `easter_egg_trigger`.

A aquisição por canais controlados será diferenciada por parâmetros UTM, incluindo LinkedIn, currículo, candidaturas específicas, assinatura de e-mail e Taggo via NFC ou QR Code.

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
