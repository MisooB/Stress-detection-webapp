const express = require('express');
const http = require('http');
const path = require('path');
const multer = require('multer');
const upload = multer({dest: path.resolve(__dirname, 'temp')});
const processSound = require('./exec');
const port = normalizePort(process.env.PORT || '3000');
const app = express();


function main() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.set('port', port);

  app.use('/', express.static(path.resolve(__dirname, '../public')));
  app.post('/process_sound/', upload.single('temp-sound'), processSound);

  const server = http.createServer(app);
  server.listen(port);
  server.on('error', onError);
  server.on('listening', () => onListening(server));
}

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening(server) {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + (addr.port);
  console.log('Listening on ' + bind);
}

main();

app.get('/',);

