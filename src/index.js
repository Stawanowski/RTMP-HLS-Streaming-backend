const { app, httpServer } = require('./app');

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
// app.listen(port, () => {
//   console.log(`Listening on port: ${port}`);
// });
