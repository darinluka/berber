const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  
  // Read current .htaccess
  conn.exec("cat ~/domains/berber.al/public_html/.htaccess", (err, stream) => {
    if (err) throw err;
    let content = '';
    stream.on('close', () => {
      console.log('=== .htaccess ===');
      console.log(content);
      conn.end();
    }).on('data', data => content += data)
      .stderr.on('data', data => console.log('ERR: ' + data));
  });
}).connect({
  host: '156.67.75.120',
  port: 65002,
  username: 'u386002233',
  password: 'z8VWRD}h[oM:)_yx',
  readyTimeout: 20000
});
