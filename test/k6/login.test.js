import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { getBaseUrl } from './helpers/getBaseUrl.js';
import { login } from './helpers/login.js';
import { randomEmail } from './helpers/randomEmail.js';

export let options = {
  thresholds: {
    http_req_duration: ['p(95)<=2000', 'p(99)<=2000'],
    http_req_failed: ['rate<0.99'],
  },
  stages: [
    { duration: '3s', target: 10 },
    { duration: '15s', target: 10 },
    { duration: '5s', target: 0 },
  ],
};

const checkoutTrend = new Trend('checkout_duration');

export default function () {
  let email, password, token, productId;
  const baseUrl = getBaseUrl();

  group('User Registration', function () {
    email = randomEmail();
    password = 'password123';
    const payload = JSON.stringify({
      email: email,
      password: password,
      name: 'Test User',
    });
    const res = http.post(`${baseUrl}/auth/register`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    let json = {};
    try {
      json = res.json() || {};
    } catch (e) {
      json = {};
    }
    check(res, {
      'register status 201': (r) => r.status === 201,
      'register success true': (r) => json.success === true,
    });
  });

  group('User Login', function () {
    token = login(email, password);
  });

  group('Product Creation', function () {
    const productPayload = JSON.stringify({
      name: `Product ${Math.random().toString(36).substring(7)}`,
      description: 'Performance test product',
      price: 99.99,
      stock: 100,
    });
    const res = http.post(`${baseUrl}/products`, productPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    let json = {};
    try {
      json = res.json() || {};
    } catch (e) {
      json = {};
    }
    check(res, {
      'product status 201': (r) => r.status === 201,
      'product success true': (r) => json.success === true,
      'product has id': (r) => !!(json.data && json.data.id),
    });
    productId = json.data ? json.data.id : undefined;
  });

  group('Checkout', function () {
    const checkoutPayload = JSON.stringify({
      items: [
        {
          productId: productId,
          quantity: 1,
        },
      ],
      paymentMethod: 'cash',
    });
    const start = Date.now();
    const res = http.post(`${baseUrl}/checkout`, checkoutPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const duration = Date.now() - start;
    checkoutTrend.add(duration);
    let json = {};
    try {
      json = res.json() || {};
    } catch (e) {
      json = {};
    }
    check(res, {
      'checkout status 200': (r) => r.status === 200,
      'checkout success true': (r) => json.success === true,
    });
  });

  sleep(1);
}
