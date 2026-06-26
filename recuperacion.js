import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://api-backend-solid-899756321657.us-central1.run.app';

export const options = {
  stages: [
    { duration: '1m',  target: 500 },
    { duration: '30s', target: 0   },
    { duration: '3m',  target: 0   }
  ]
};

export default function () {
  const res = http.post(
    `${BASE_URL}/api/notifications/send`,
    JSON.stringify({
      email:   'test@test.com',
      subject: 'Prueba recuperacion',
      message: 'Mensaje de recuperacion'
    }),
    {
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${__ENV.JWT_TOKEN}`
      },
      timeout: '15s'
    }
  );

  check(res, {
    'status 200': (r) => r.status === 200,
    'tiempo < 5s': (r) => r.timings.duration < 5000
  });

  sleep(1);
}