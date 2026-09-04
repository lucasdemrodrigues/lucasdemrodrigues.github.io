// Google Analytics 4 — configuração base do portfólio.
// Os eventos personalizados serão centralizados neste arquivo em etapas futuras.
const GA_MEASUREMENT_ID = 'G-6TRWK5XYBQ';

window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }

gtag('js', new Date());
gtag('config', GA_MEASUREMENT_ID);

const analyticsScript = document.createElement('script');
analyticsScript.async = true;
analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
document.head.appendChild(analyticsScript);
