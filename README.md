![Capa do portfólio](assets/portfolio-cover.webp)

<h1 align="center">
  Construção de um portfólio profissional com apoio de IA
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20evolução-0891B2" alt="Status">
  <img src="https://img.shields.io/badge/Projeto-Pessoal-2E7D32" alt="Projeto">
  <img src="https://img.shields.io/badge/IA-Assisted%20Development-673AB7" alt="IA Assisted Development">
  <img src="https://img.shields.io/badge/GA4-Analytics-E37400?logo=googleanalytics&logoColor=white" alt="GA4 Analytics">
  <img src="https://img.shields.io/badge/GitHub-API-3B82F6?logo=github&logoColor=white" alt="GitHub API">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
</p>

<p align="center">
  🔗 <a href="https://lucasdemrodrigues.github.io">Acessar site</a>
</p>

## 📑 Índice

- 🔎 [Visão geral](#-visão-geral)
- 👤 [Meu papel](#-meu-papel)
- 🧰 [Stack e ferramentas](#-stack-e-ferramentas)
- ⚙️ [Arquitetura e funcionalidades](#arquitetura-e-funcionalidades)
- 📊 [Mensuração com GA4](#mensuracao-com-ga4)
- 🧩 [Desafios e soluções](#desafios-e-solucoes)
- 🚀 [Deploy e manutenção](#deploy-e-manutencao)

## 🔎 Visão geral

Este portfólio foi criado para complementar meu currículo e LinkedIn em um formato mais visual e integrado. Ele reúne perfil, projetos e principais resultados profissionais para que recrutadores e gestores compreendam rapidamente minhas competências e os tipos de problema que já ajudei a resolver.

Ao mesmo tempo, o projeto foi pensado como uma experiência prática de aprendizado, utilizando IA generativa como apoio ao desenvolvimento e ao aprimoramento contínuo do portfólio.

---

## 👤 Meu papel

Fui responsável pela direção e evolução do projeto, definindo objetivos, prioridades, conteúdo, experiência do usuário e critérios de qualidade. A IA generativa atuou como apoio consultivo e agente de execução, propondo e aplicando mudanças no código a partir dos prompts e critérios definidos por mim.

Na prática, minhas principais responsabilidades foram:

- Definir posicionamento, prioridades, funcionalidades e conteúdo do portfólio;
- Estabelecer critérios de UX, responsividade, acessibilidade e direção visual;
- Traduzir necessidades em prompts e instruções claras;
- Testar, revisar e validar funcional e visualmente as propostas geradas.

O fluxo de trabalho seguia, de forma geral:

**Necessidade → Prompt → Proposta/execução pela IA → Revisão → Ajuste → Validação**

---

## 🧰 Stack e ferramentas

O portfólio foi desenvolvido com uma stack simples, leve e sem frameworks, buscando manter a solução enxuta, reduzir dependências e facilitar a manutenção do projeto.

- **Front-end:** HTML5, CSS3 e JavaScript puro
- **Versionamento e repositório:** Git e GitHub
- **Hospedagem e integração:** GitHub Pages, GitHub API e `portfolio.json`
- **Analytics:** Google Analytics 4
- **IA de apoio:** ChatGPT e Gemini

---

<a id="arquitetura-e-funcionalidades"></a>
## ⚙️ Arquitetura e funcionalidades

### Estrutura do repositório

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

### Integração com GitHub

A galeria de projetos consome a API do GitHub e utiliza os arquivos `portfolio.json` de cada repositório para identificar quais projetos devem ser exibidos, além de carregar seus principais metadados.

Para aumentar a resiliência do site, o carregamento segue uma sequência de fallback:

**GitHub → cache local → fallback estático**

Assim, quando a consulta à API não está disponível, o site tenta utilizar uma versão local previamente válida e, em último caso, recorre aos cards estáticos presentes no próprio HTML.

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

<a id="mensuracao-com-ga4"></a>
## 📊 Mensuração com GA4

O portfólio utiliza Google Analytics 4 para acompanhar aquisição (origem dos acessos), engajamento e sinais de intenção profissional. A instrumentação personalizada fica centralizada em `analytics.js` e complementa os eventos automáticos fornecidos pela medição otimizada do GA4.

### Eventos personalizados

- `section_view` — visualização qualificada das seções do site, com `section_name`;
- `project_click` — clique em projeto, com `project_name`, `project_category` e `project_position`;
- `linkedin_click` — clique no LinkedIn na área de contato;
- `email_copy` — cópia concluída do endereço de e-mail;
- `contact_intent` — consolida sinais de intenção de contato, com `contact_method` (`linkedin` ou `email`);
- `language_change` — mudança ativa de idioma, com `selected_language` (`pt`, `en` ou `es`);
- `theme_change` — mudança ativa de tema, com `theme` (`light` ou `dark`);
- `easter_egg_trigger` — acionamento dos Easter eggs, com `easter_egg_name` (`matrix` ou `portfolio_sql`).

Para facilitar a análise nos relatórios e explorações do GA4, os principais parâmetros dos eventos foram registrados como dimensões personalizadas. Os eventos `project_click` e `contact_intent` foram definidos como Eventos principais, representando, respectivamente, interesse nos projetos e intenção de contato profissional.

**Funil principal:** Visita → Projetos → Clique em projeto → Intenção de contato.

A origem dos acessos por canais controlados será identificada por parâmetros UTM, incluindo LinkedIn, currículo, plataformas de candidatura, assinatura de e-mail e Taggo.

---

<a id="desafios-e-solucoes"></a>
## 🧩 Desafios e soluções

| Desafio | Contexto | Solução adotada | Aprendizado |
|---|---|---|---|
| **Organização do JavaScript** | Diferentes comportamentos estavam concentrados no antigo `script.js` | Separação das responsabilidades entre arquivos específicos | Uma estrutura mais modular facilita manutenção e futuras alterações |
| **Resiliência da galeria** | A API do GitHub pode ficar indisponível ou limitada | Cache local + fallback estático | Ter alternativas reduz a dependência de uma única fonte |
| **PT/EN/ES** | Mudanças podiam gerar inconsistências entre idiomas | Traduções centralizadas em `i18n.js` | Centralização reduz retrabalho e divergências |
| **Acessibilidade** | O terminal SQL e elementos decorativos podiam interferir na navegação assistiva | Ajustes de foco, atributos de acessibilidade e elementos decorativos | Recursos visuais podem coexistir com uma experiência acessível |
| **Simplificação** | Algumas propostas adicionavam complexidade maior que o benefício | Ajuste ou descarte de soluções excessivas | Nem sempre a solução mais complexa é a mais adequada |

---

<a id="deploy-e-manutencao"></a>
## 🚀 Deploy e manutenção

### Publicação

O portfólio é hospedado no GitHub Pages a partir do repositório `lucasdemrodrigues.github.io`, utilizando a estrutura padrão de site pessoal da plataforma.

### Atualização dos projetos

Os projetos exibidos na galeria são identificados por meio do arquivo `portfolio.json` presente em cada repositório.

Quando um novo projeto deve aparecer no portfólio, seus metadados são definidos nesse arquivo e passam a ser consumidos pela galeria.

Para manter a resiliência, o fallback estático também deve ser atualizado quando necessário, garantindo uma alternativa caso a consulta ao GitHub não esteja disponível.

### Padrão de apresentação dos projetos

As descrições dos projetos priorizam uma narrativa orientada ao negócio:

**Problema/pergunta → análise/abordagem → finalidade**

O objetivo é destacar primeiro o problema investigado e o valor da análise, evitando descrições baseadas apenas em ferramentas ou tarefas executadas.

### Manutenção e evolução

A manutenção do projeto segue uma diretriz de preservar estabilidade e evitar complexidade desnecessária.

Sempre que possível:

- Refatorações são feitas de forma gradual e em partes pequenas;
- Alterações estruturais são refletidas no `README.md`;
- Mudanças devem preservar o comportamento existente, a responsividade e a acessibilidade;
- Soluções mais complexas só são adotadas quando trazem benefício claro;
- O site continua evoluindo conforme novos projetos, aprendizados e necessidades surgem.
