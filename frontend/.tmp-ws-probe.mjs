import SockJS from 'sockjs-client';
import * as StompModule from 'stompjs';

const login = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@university.edu', password: 'daniel123' }),
});
const auth = await login.json();

const stompFactory = StompModule?.default ?? StompModule?.Stomp ?? StompModule;
const socket = new SockJS('http://localhost:8080/ws-notifications');
const client = stompFactory.over(socket);
client.debug = (msg) => console.log('[stomp]', msg);

await new Promise((resolve, reject) => {
  client.connect(
    { Authorization: `Bearer ${auth.accessToken}` },
    () => {
      console.log('connected');
      client.disconnect(() => {
        console.log('disconnected');
        resolve();
      });
    },
    (error) => {
      console.error('connect-error', error);
      reject(error);
    }
  );
});
