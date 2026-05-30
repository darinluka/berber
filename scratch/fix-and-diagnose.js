const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localPath = 'C:\\Users\\x1car\\Desktop\\Berberi\\.env';
    const remotePath = '/home/u386002233/domains/berber.al/nodejs/.env';
    
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) throw err;
      console.log('Successfully uploaded .env to ' + remotePath);
      
      // Now run command to touch restart.txt and output stderr.log
      conn.exec("touch /home/u386002233/domains/berber.al/nodejs/tmp/restart.txt && tail -n 50 /home/u386002233/domains/berber.al/nodejs/stderr.log", (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
          console.error('STDERR: ' + data);
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
