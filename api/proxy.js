import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PROXY_PORT;

// Route API requests to Node.js backend
app.use('/api', createProxyMiddleware({
    target: 'http://127.0.0.1:3000',
    changeOrigin: true,
}));

// Route everything else to Vite frontend
app.use('/', createProxyMiddleware({
    target: 'http://127.0.0.1:5173',
    changeOrigin: true,
    ws: true, // For Vite HMR
}));

app.listen(PORT, '127.0.0.1', () => {
    console.log(`[Reverse Proxy] running at http://127.0.0.1:${PORT}`);
    console.log(`[Reverse Proxy] routing /api to http://127.0.0.1:3000`);
    console.log(`[Reverse Proxy] routing / to http://127.0.0.1:5173`);
    console.log(`\nTo expose the webhook for testing, run:`);
    console.log(`npx localtunnel --port ${PORT}`);
});
