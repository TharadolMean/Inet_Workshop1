const express = require('express');
const routes = require('./routes');
const r = require('./utils/response');

const app = express();
app.use(express.json());

app.use('/api/v1', routes);

// 404
app.use((_req, res) => r.badRequest(res, 'route not found'));

// error handler (รวม JSON parse error และ error ที่ไม่คาดคิด)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return r.badRequest(res, 'invalid JSON body');
  if (err.name === 'ValidationError') return r.badRequest(res, err.message);
  console.error(err);
  return r.serverError(res);
});

module.exports = app;
