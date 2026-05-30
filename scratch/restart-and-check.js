const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec("touch /home/u386002233/domains/berber.al/nodejs/tmp/restart.txt && echo 'RESTARTED' && sleep 5 && cat /home/u386002233/domains/berber.al/nodejs/console.log | tail -n 30", (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    }).on('data', data => console.log('OUT: ' + data))
      .stderr.on('data', data => console.log('ERR: ' + data));
  });
}).connect({
  host: '156.67.75.120',
  port: 65002,
  username: 'u386002233',
  password: 'z8VWRD}h[oM:)_yx',
  readyTimeout: 20000
});
