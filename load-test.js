import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ─── Métricas personalizadas ────────────────────────────────
const errorRate    = new Rate('error_rate');
const responseTime = new Trend('response_time', true);
const successCount = new Counter('success_count');
const errorCount   = new Counter('error_count');

// ─── Configuración URL ──────────────────────────────────────
const BASE_URL = 'https://api-backend-solid-899756321657.us-central1.run.app';
const TOKEN    = __ENV.JWT_TOKEN;

const PAYLOAD = JSON.stringify({
  email:   'test@test.com',
  subject: 'Prueba de carga',
  message: 'Mensaje de carga - K6'
});

const HEADERS = {
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

// ─── Escenarios ─────────────────────────────────────────────
export const options = {
  scenarios: {

    // Actividad 1 — Línea Base
    linea_base: {
      executor:  'constant-vus',
      vus:       10,
      duration:  '1m',
      startTime: '0s',
      tags:      { scenario: 'linea_base' }
    },

    // Actividad 2 — Incremento Progresivo
    incremento_50: {
      executor:  'constant-vus',
      vus:       50,
      duration:  '2m',
      startTime: '1m30s',
      tags:      { scenario: 'incremento_50' }
    },

    incremento_100: {
      executor:  'constant-vus',
      vus:       100,
      duration:  '2m',
      startTime: '4m',
      tags:      { scenario: 'incremento_100' }
    },

    incremento_250: {
      executor:  'constant-vus',
      vus:       250,
      duration:  '2m',
      startTime: '6m30s',
      tags:      { scenario: 'incremento_250' }
    },

    incremento_500: {
      executor:  'constant-vus',
      vus:       500,
      duration:  '2m',
      startTime: '9m',
      tags:      { scenario: 'incremento_500' }
    },

    // Actividad 4 — Prueba de Estrés
    estres: {
      executor: 'ramping-vus',
      startTime: '12m',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100  },
        { duration: '1m', target: 250  },
        { duration: '1m', target: 500  },
        { duration: '1m', target: 750  },
        { duration: '1m', target: 1000 },
        { duration: '1m', target: 1500 },
        { duration: '1m', target: 2000 },
        { duration: '2m', target: 0    }
      ],
      tags: { scenario: 'estres' }
    },

    // Actividad 5 — Prueba de Recuperación
    recuperacion: {
      executor: 'ramping-vus',
      startTime: '21m',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 500 }, // carga alta
        { duration: '30s', target: 0  }, // detener
        { duration: '3m', target: 0   }  // observar recuperación
      ],
      tags: { scenario: 'recuperacion' }
    }
  },

  // Umbrales — Actividad 4: detener si supera estos valores
  thresholds: {
    'error_rate':                ['rate<0.05'],   // menos de 5% errores
    'http_req_duration':         ['p(95)<5000'],  // P95 menor a 5s
    'http_req_duration{scenario:linea_base}':     ['p(95)<2000'],
    'http_req_duration{scenario:incremento_50}':  ['p(95)<3000'],
    'http_req_duration{scenario:incremento_100}': ['p(95)<3000'],
    'http_req_duration{scenario:incremento_250}': ['p(95)<4000'],
    'http_req_duration{scenario:incremento_500}': ['p(95)<5000'],
  }
};

// ─── Test principal ─────────────────────────────────────────
export default function () {
  const res = http.post(
    `${BASE_URL}/api/notifications/send`,
    PAYLOAD,
    { headers: HEADERS, timeout: '10s' }
  );

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'tiempo < 5s': (r) => r.timings.duration < 5000,
  });

  responseTime.add(res.timings.duration);
  errorRate.add(!ok);

  if (ok) {
    successCount.add(1);
  } else {
    errorCount.add(1);
    console.error(`[ERROR] Status: ${res.status} | Body: ${res.body} | Scenario: ${__ENV.K6_SCENARIO}`);
  }

  sleep(1);
}

// ─── Resumen final ──────────────────────────────────────────
export function handleSummary(data) {
  const metrics = data.metrics;

  const summary = {
    prueba:        'Prueba de Carga - api-backend-solid',
    fecha:          new Date().toISOString(),
    total_requests: metrics.http_reqs?.values?.count || 0,
    exitosos:       metrics.success_count?.values?.count || 0,
    errores:        metrics.error_count?.values?.count || 0,
    tasa_errores:   ((metrics.error_rate?.values?.rate || 0) * 100).toFixed(2) + '%',
    tiempo_promedio: (metrics.http_req_duration?.values?.avg || 0).toFixed(2) + 'ms',
    tiempo_minimo:   (metrics.http_req_duration?.values?.min || 0).toFixed(2) + 'ms',
    tiempo_maximo:   (metrics.http_req_duration?.values?.max || 0).toFixed(2) + 'ms',
    p95:             (metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2) + 'ms',
    p99:             (metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2) + 'ms',
    rps:             (metrics.http_reqs?.values?.rate || 0).toFixed(2)
  };

  console.log('\n========== RESUMEN DE PRUEBA ==========');
  Object.entries(summary).forEach(([k, v]) => console.log(`${k}: ${v}`));
  console.log('========================================\n');

  return {
    'resultado_k6.json': JSON.stringify(summary, null, 2),
    stdout: JSON.stringify(summary, null, 2)
  };
}