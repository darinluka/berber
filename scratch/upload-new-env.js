const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    const newEnvContent = 'DATABASE_URL="mysql://u386002233_berber:Berber2026secure@localhost:3306/u386002233_berber"\n';
    
    const writeStream = sftp.createWriteStream('/home/u386002233/domains/berber.al/nodejs/.env');
    writeStream.write(newEnvContent);
    writeStream.end(() => {
      console.log('✅ .env uploaded with new password!');
      
      // Verify it was written correctly
      conn.exec("cat /home/u386002233/domains/berber.al/nodejs/.env", (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          // Restart the app
          conn.exec("touch /home/u386002233/domains/berber.al/nodejs/tmp/restart.txt", (err, s) => {
            if (err) throw err;
            s.on('close', () => {
              console.log('✅ App restarted!');
              conn.end();
            });
          });
        }).on('data', data => console.log('ENV FILE: ' + data))
          .stderr.on('data', data => console.log('ERR: ' + data));
      });
    });
  });
}).connect({
  host: '156.67.75.120',
  port: 65002,
  username: 'u386002233',
  password: 'z8VWRD}h[oM:)_yx',
  readyTimeout: 20000
});
