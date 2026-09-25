<a id="inicio"></a>

![Capa do portfólio](assets/portfolio-cover.webp)

<h1 align="center">
  Construção de um portfólio profissional com apoio de IA, Analytics e Workspace privado
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
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20PostgreSQL-0F766E?logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-92400E?logo=cloudflare&logoColor=white" alt="Cloudflare Workers">
  <img src="https://img.shields.io/badge/Groq-IA-DB2777" alt="Groq">
</p>

<p align="center">
  🔗 <a href="https://lucasdemrodrigues.github.io">Acessar site</a>
</p>

## 📑 Índice

- 🔎 [Visão geral](#-visão-geral)
- 👤 [Meu papel](#-meu-papel)
- 🧰 [Stack e ferramentas](#-stack-e-ferramentas)
- ⚙️ [Arquitetura e funcionalidades](#arquitetura-e-funcionalidades)
- 🔐 [Workspace privado](#workspace-privado)
- 📊 [Mensuração com GA4](#mensuracao-com-ga4)
- 🧩 [Desafios e soluções](#desafios-e-solucoes)
- 🚀 [Deploy e manutenção](#deploy-e-manutencao)

## 🔎 Visão geral

Este portfólio foi criado para complementar meu currículo e LinkedIn em um formato mais visual e integrado. Ele reúne perfil, projetos, certificações e principais resultados profissionais para que recrutadores e gestores compreendam rapidamente minhas competências e os tipos de problema que já ajudei a resolver.

Ao mesmo tempo, o projeto foi pensado como uma experiência prática de aprendizado, sendo estruturado do zero com apoio de IA generativa e aprimorado continuamente. Com a evolução do projeto, passou a incluir também um Workspace privado autenticado, conectado à mesma proposta de organização, análise e tomada de decisão, sem expor dados pessoais no repositório público.

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

O projeto mantém um front-end público simples e leve, sem frameworks, e adiciona serviços específicos apenas quando há benefício claro para integração, autenticação, persistência de dados ou IA.

- **Front-end público:** HTML5, CSS3 e JavaScript puro
- **Versionamento e repositório:** Git e GitHub
- **Hospedagem pública:** GitHub Pages
- **Integração de projetos:** GitHub API e `portfolio.json`
- **Analytics:** Google Analytics 4
- **Workspace privado:** Cloudflare Workers
- **Banco e autenticação:** Supabase Auth + PostgreSQL
- **IA no Workspace:** Groq, acionada sob demanda
- **IA de apoio ao desenvolvimento:** ChatGPT e Gemini

**Custo atual:** serviços utilizados dentro dos planos gratuitos, sem infraestrutura paga recorrente.

---

<a id="arquitetura-e-funcionalidades"></a>
## ⚙️ Arquitetura e funcionalidades

### Estrutura do repositório

- `index.html` — estrutura e conteúdo-base da home, incluindo a seção de certificações em destaque.
- `certificacoes.html` — página dedicada ao catálogo completo de certificações.
- `certificacoes.css` — estilos, responsividade, filtros, cards e modal da página de certificações.
- `certificacoes.js` — carregamento do catálogo, filtros, ordenação, resumo, tema, cursor e visualização ampliada dos certificados.
- `certificacoes.json` — base estruturada das certificações, com metadados como área, coleção, carga horária, modalidade, emissor e links.
- `styles.css` — estrutura visual geral, layout, responsividade e componentes estáticos principais.
- `theme.css` — tema claro, tipografia de detalhe e complementos visuais do Hero, Foco e faixa de competências.
- `components.css` — seletor de idiomas, componentes visuais complementares, Easter egg do terminal SQL e toda a camada visual dos projetos, incluindo fallback estático, filtros e galeria dinâmica.
- `analytics.js` — configuração do Google Analytics 4 e camada central de instrumentação dos eventos personalizados do portfólio.
- `core.js` — interações gerais do site: animações de entrada, tema, cursor, menu, expansão da marca no header, scroll spy, números animados, cópia de e-mail e modal das certificações em destaque.
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
- Seção de certificações em destaque integrada à home;
- Página dedicada de certificações, com filtros por área e coleção, ordenação, resumo por indicadores e visualização ampliada em modal;
- Layout responsivo para desktop e mobile;
- Metadados para SEO, Open Graph e compartilhamento social;
- Navegação por teclado e melhorias de acessibilidade;
- Animações com suporte a `prefers-reduced-motion`;
- Preloader de entrada com identidade visual da marca `LR.`;
- Microinterações e Easter eggs discretos no Hero;
- Links diretos para projetos, LinkedIn e contato por e-mail;
- Mensuração com Google Analytics 4 e eventos personalizados para aquisição, engajamento e intenção de contato;
- Workspace privado autenticado como extensão do projeto público, com persistência de dados e recursos de IA sob demanda.

---

<a id="workspace-privado"></a>
## 🔐 Workspace privado

Como evolução do portfólio, o projeto também possui uma área privada autenticada voltada à organização e ao acompanhamento de informações pessoais e profissionais. O conteúdo interno não é documentado neste repositório público; aqui é apresentada apenas a visão arquitetural necessária para contextualizar a solução.

### Arquitetura resumida

**Portfólio público → GitHub Pages → GitHub API + GA4**

**Workspace privado → Cloudflare Workers → Supabase Auth → PostgreSQL com RLS → IA sob demanda via Groq**

A separação entre as duas camadas permite manter o portfólio público leve e acessível, enquanto autenticação, dados privados e processamento de IA permanecem isolados no Workspace.

### Princípios adotados

- Conteúdo pessoal não é armazenado no repositório público;
- Autenticação e persistência de dados ficam fora do front-end público;
- O banco utiliza políticas de acesso por usuário;
- Recursos de IA são acionados apenas quando solicitados, evitando processamento contínuo desnecessário;
- A arquitetura é mantida modular para permitir evolução ou substituição de serviços sem reestruturar todo o projeto.

---

<a id="mensuracao-com-ga4"></a>
## 📊 Mensuração com GA4

O portfólio utiliza Google Analytics 4 para acompanhar aquisição (origem dos acessos), engajamento e sinais de intenção profissional. A instrumentação personalizada fica centralizada em `analytics.js` e complementa os eventos automáticos fornecidos pela medição otimizada do GA4.

### Eventos personalizados

- `section_view` — visualização qualificada das seções do site, com `section_name`, incluindo a nova seção de certificações da home;
- `project_click` — clique em projeto, com `project_name`, `project_category` e `project_position`;
- `certificate_view` — abertura da visualização ampliada de um certificado ao clicar em sua imagem, com `certificate_name`, `certificate_area`, `certificate_issuer`, `certificate_featured`, `certificate_location` e `certificate_position`;
- `certificate_original_click` — clique em **Abrir original** após visualizar um certificado, reutilizando os mesmos parâmetros de identificação;
- `certifications_page_click` — clique no CTA da home que leva ao catálogo completo de certificações;
- `linkedin_click` — clique no LinkedIn na área de contato;
- `email_copy` — cópia concluída do endereço de e-mail;
- `contact_intent` — consolida sinais de intenção de contato, com `contact_method` (`linkedin` ou `email`);
- `language_change` — mudança ativa de idioma, com `selected_language` (`pt`, `en` ou `es`);
- `theme_change` — mudança ativa de tema, com `theme` (`light` ou `dark`);
- `easter_egg_trigger` — acionamento dos Easter eggs, com `easter_egg_name` (`matrix` ou `portfolio_sql`).

Para facilitar a análise nos relatórios e explorações do GA4, os principais parâmetros dos eventos podem ser registrados como dimensões personalizadas. Os eventos `project_click` e `contact_intent` permanecem como Eventos principais, representando, respectivamente, interesse nos projetos e intenção de contato profissional. As interações com certificados são tratadas como sinais intermediários de interesse e não como conversões.

**Funil principal:** Visita → Projetos / Certificações → Clique em projeto ou visualização de certificado → Intenção de contato.

**Funil de certificações:** Seção de certificações na home → Catálogo completo → `certificate_view` → `certificate_original_click`.

A origem dos acessos por canais controlados pode ser identificada por parâmetros UTM, incluindo LinkedIn, currículo, plataformas de candidatura, assinatura de e-mail e Taggo.

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

O portfólio público é hospedado no GitHub Pages a partir do repositório `lucasdemrodrigues.github.io`. O Workspace privado utiliza Cloudflare Workers como camada de acesso e permanece separado do conteúdo público.

### Atualização dos projetos

Para adicionar ou atualizar um projeto na galeria, os metadados são definidos no arquivo `portfolio.json` do respectivo repositório. Quando necessário, o fallback estático também é mantido sincronizado como alternativa à consulta ao GitHub.

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

---

> 💡 Sinta-se à vontade para usar este projeto como referência. Para reutilizações relevantes da estrutura ou do design, agradeço a citação deste repositório. Conteúdos pessoais não devem ser reproduzidos.
>
> Encontrou um erro? [Abra uma issue](https://github.com/lucasdemrodrigues/lucasdemrodrigues.github.io/issues).

<p align="center">
  <a href="#inicio">⬆️ Voltar ao início</a>
</p>
