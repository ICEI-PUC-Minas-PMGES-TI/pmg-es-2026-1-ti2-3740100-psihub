const METRIC_EVENT_NAME = 'psihub:metric';

export function initFrontendMetrics() {
  if (typeof window === 'undefined' || window.__psihubMetricsInitialized) return;

  window.__psihubMetricsInitialized = true; // Evita duplicar observers em StrictMode e hot reload.
  observeNavigationTiming(); // Mede tempos iniciais para dar rastreabilidade minima ao carregamento.
  observeLargestContentfulPaint(); // Captura LCP sem adicionar dependencia nova ao bundle.
  observeCumulativeLayoutShift(); // Captura CLS para identificar instabilidade visual em producao.
  observeLongInteractions(); // Usa Event Timing como proxy de INP quando suportado pelo navegador.
}

export function trackUiEvent(name, attributes = {}) {
  reportMetric(`ui.${name}`, 1, attributes); // Centraliza eventos de fluxo para permitir analytics depois.
}

function observeNavigationTiming() {
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return;

    reportMetric('navigation.ttfb', navigation.responseStart, { unit: 'ms' }); // TTFB ajuda a separar gargalo de rede/API do frontend.
    reportMetric('navigation.domContentLoaded', navigation.domContentLoadedEventEnd, { unit: 'ms' }); // Registra quando o HTML inicial ficou interativo.
  }, { once: true });
}

function observeLargestContentfulPaint() {
  let lastEntry = null;
  const observer = createObserver('largest-contentful-paint', (entries) => {
    lastEntry = entries[entries.length - 1]; // LCP valido e o ultimo candidato observado antes da pagina ocultar.
  });

  if (!observer) return;

  reportOnPageHide(() => {
    if (lastEntry) reportMetric('webvital.lcp', lastEntry.startTime, { unit: 'ms' });
  });
}

function observeCumulativeLayoutShift() {
  let cls = 0;
  const observer = createObserver('layout-shift', (entries) => {
    entries.forEach((entry) => {
      if (!entry.hadRecentInput) cls += entry.value; // Ignora mudancas causadas por interacao intencional do usuario.
    });
  });

  if (!observer) return;

  reportOnPageHide(() => reportMetric('webvital.cls', cls, { unit: 'score' }));
}

function observeLongInteractions() {
  let worstInteraction = 0;
  const observer = createObserver('event', (entries) => {
    entries.forEach((entry) => {
      worstInteraction = Math.max(worstInteraction, entry.duration || 0); // Mantem a pior interacao para diagnosticar responsividade.
    });
  }, { durationThreshold: 40 });

  if (!observer) return;

  reportOnPageHide(() => reportMetric('webvital.inp_proxy', worstInteraction, { unit: 'ms' }));
}

function createObserver(type, onEntries, options = {}) {
  if (!('PerformanceObserver' in window)) return null;

  try {
    const observer = new PerformanceObserver((list) => onEntries(list.getEntries()));
    observer.observe({ type, buffered: true, ...options }); // Usa buffered para nao perder metricas geradas antes do observer.
    return observer;
  } catch {
    return null; // Navegadores sem suporte ao tipo de metrica simplesmente ignoram a coleta.
  }
}

function reportOnPageHide(callback) {
  let reported = false; // Impede envio duplicado quando visibilitychange e pagehide disparam na mesma saida.
  const reportOnce = () => {
    if (reported) return;
    reported = true;
    callback();
  };

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') reportOnce(); // Reporta antes da aba fechar ou ir para background.
  });
  window.addEventListener('pagehide', reportOnce); // Garante coleta tambem em navegadores que nao disparam visibilitychange.
}

function reportMetric(name, value, attributes = {}) {
  const detail = {
    name,
    value,
    attributes,
    at: new Date().toISOString(),
  };

  window.dispatchEvent(new CustomEvent(METRIC_EVENT_NAME, { detail })); // Expõe um contrato unico para testes, analytics e monitoramento.

  // TODO(produto): definir destino de analytics/observabilidade antes de enviar dados para terceiros.
  if (import.meta.env.DEV) console.info('[metrics]', detail);
}
