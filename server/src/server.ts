import express from 'express';

const app = express();


app.get('/users', () => {
  console.log('list users');
});

app.listen(3333);