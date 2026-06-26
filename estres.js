import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const BASE_URL  = 'https://api-backend-solid-899756321657.us-central1.run.app';

export const options = {
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
  thresholds: {
    'error_rate':        ['rate<0.05'],
    'http_req_duration': ['p(95)<5000']
  }
};

export default function () {
  const res = http.post(
    `${BASE_URL}/api/notifications/send`,
    JSON.stringify({
      email:   'test@test.com',
      subject: 'Prueba estres',
      message: 'Mensaje de estres'
    }),
    {
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${__ENV.JWT_TOKEN}`
      },
      timeout: '15s'
    }
  );

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'tiempo < 5s': (r) => r.timings.duration < 5000
  });

  errorRate.add(!ok);
  sleep(1);
}