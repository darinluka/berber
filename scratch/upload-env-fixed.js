const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localPath = 'C:\\Users\\x1car\\Desktop\\Berberi\\.env';
    const remotePath = '/home/u386002233/domains/berber.al/nodejs/.env';
    
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) throw err;
      console.log('Successfully uploaded fixed .env to ' + remotePath);
      
      conn.exec("touch /home/u386002233/domains/berber.al/nodejs/tmp/restart.txt", (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          conn.end();
        });
      });
    });
  });
}).connect({
  host: '156.67.75.120',
  port: 65002,
  username: 'u386002233',
  password: 'z8VWRD}h[oM:)_yx'
});
