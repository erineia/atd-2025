import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { getBaseUrl } from './helpers/getBaseUrl.js';
const loginData = JSON.parse(open('./data/loginDataDriven.data.json'));

export let options = {
  vus: 7,
  iterations: 7,
  thresholds: {
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const user = loginData[__ITER % loginData.length];

  group('Register User', function () {
    const registerUrl = `${getBaseUrl()}/auth/register`;
    const registerPayload = JSON.stringify({
      email: user.email,
      password: user.password,
      name: 'DataDriven User',
    });
    const registerRes = http.post(registerUrl, registerPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
    // Não precisa checar status 201, pois pode já existir
  });

  group('Login Data-Driven', function () {
    const url = `${getBaseUrl()}/auth/login`;
    const payload = JSON.stringify({
      email: user.email,
      password: user.password,
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(url, payload, params);
    let json = {};
    try {
      json = res.json() || {};
    } catch (e) {
      json = {};
    }
    check(res, {
      'login status 200': (r) => r.status === 200,
      'login success true': (r) => json.success === true,
      'login has token': (r) => !!(json.data && json.data.token),
    });
  });
  sleep(1);

  group('Register User', function () {
    const registerUrl = `${getBaseUrl()}/auth/register`;
    const registerPayload = JSON.stringify({
      email: user.email,
      password: user.password,
      name: 'DataDriven User',
    });
    const registerRes = http.post(registerUrl, registerPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
    // Não precisa checar status 201, pois pode já existir
  });

  group('Login Data-Driven', function () {
    const url = `${getBaseUrl()}/auth/login`;
    const payload = JSON.stringify({
      email: user.email,
      password: user.password,
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(url, payload, params);
    let json = {};
    try {
      json = res.json() || {};
    } catch (e) {
      json = {};
    }
    check(res, {
      'login status 200': (r) => r.status === 200,
      'login success true': (r) => json.success === true,
      'login has token': (r) => !!(json.data && json.data.token),
    });
  });
  sleep(1);
}
