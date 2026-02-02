const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/request', (req, res) => {
  console.log(req.body);
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});
