import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://api-backend-solid-899756321657.us-central1.run.app';

export const options = {
  vus:      250,
  duration: '2m'
};

export default function () {
  const res = http.post(
    `${BASE_URL}/api/notifications/send`,
    JSON.stringify({
      email:   'test@test.com',
      subject: 'Prueba',
      message: 'Mensaje de carga'
    }),
    {
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${__ENV.JWT_TOKEN}`
      }
    }
  );

  check(res, {
    'status 200': (r) => r.status === 200,
    'tiempo < 5s': (r) => r.timings.duration < 5000
  });

  sleep(1);
}