const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec("/opt/alt/alt-nodejs22/root/bin/node -e \"const dbUrl = process.env.DATABASE_URL || 'NOT DEFINED'; console.log('DB_URL:', dbUrl.replace(/:[^@]+@/, ':***@'));\"", (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
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
