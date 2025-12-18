import { check } from 'k6';
import http from 'k6/http';
import { getBaseUrl } from './getBaseUrl.js';

export function login(email, password) {
  const url = `${getBaseUrl()}/auth/login`;
  const payload = JSON.stringify({ email, password });
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
  return json.data ? json.data.token : undefined;
}
