// api-gateway/gateway.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const proxy = require('express-http-proxy');
const csrf = require('csurf');
require('dotenv').config();

const { verifyToken } = require('./middlewares/authMiddleware');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

const csrfProtection = csrf({ cookie: true });
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.use('/api/auth', csrfProtection, proxy('http://localhost:4000', {
    proxyReqPathResolver: (req) => {
        return req.originalUrl; 
    }
}));

app.use('/api/todos', csrfProtection, verifyToken, proxy('http://localhost:5000', {
    proxyReqPathResolver: (req) => {
        return req.originalUrl; 
    },
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
        if (srcReq.user) {
            proxyReqOpts.headers['X-User-Id'] = srcReq.user.user_id;
            proxyReqOpts.headers['X-User-Role'] = srcReq.user.role;
        }
        return proxyReqOpts;
    }
}));

app.use('/api/logs', csrfProtection, verifyToken, proxy('http://localhost:5000', {
    proxyReqPathResolver: (req) => {
        return req.originalUrl;
    }
}));

app.use('/api/files', csrfProtection, verifyToken, proxy('http://localhost:6000', {
    proxyReqPathResolver: (req) => {
        return req.originalUrl;
    }
}));

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Gateway: Invalid CSRF Token' });
    }
    console.error(`[Gateway Error]: ${err.message}`);
    res.status(500).json({ error: 'API Gateway Error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🌐 API Gateway is running on http://localhost:${PORT}`);
});