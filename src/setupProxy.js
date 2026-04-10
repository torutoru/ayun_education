const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  const target = process.env.REACT_APP_FUNCTIONS_PROXY_TARGET || 'http://localhost:8888';

  app.use(
    '/.netlify/functions',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
      logLevel: 'silent'
    })
  );
};
