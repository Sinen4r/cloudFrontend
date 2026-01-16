const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_BACKEND || 'http://feedback-backend:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // remove /api prefix when forwarding
      },
    })
  );
};