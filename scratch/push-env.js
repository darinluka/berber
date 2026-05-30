const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localPath = 'C:\\Users\\x1car\\Desktop\\Berberi\\.env';
    const remotePath = '/home/u386002233/domains/berber.al/public_html/.env';
    
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) throw err;
      console.log('Successfully uploaded .env to ' + remotePath);
      conn.end();
    });
  });
}).connect({
  host: '156.67.75.120',
  port: 65002,
  username: 'u386002233',
  password: 'z8VWRD}h[oM:)_yx'
});
