const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec("cat ~/domains/berber.al/nodejs/server.js", (err, stream) => {
    if (err) throw err;
    let content = '';
    stream.on('close', (code, signal) => {
      console.log('=== CONTENT START ===');
      console.log(content);
      console.log('=== CONTENT END ===');
      conn.end();
    }).on('data', (data) => {
      content += data;
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
}).connect({
  host: '156.67.75.120',
  port: 65002,
  username: 'u386002233',
  password: 'z8VWRD}h[oM:)_yx'
});
