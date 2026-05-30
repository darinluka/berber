const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  
  // New .htaccess content with DATABASE_URL added
  const newHtaccess = `PassengerAppRoot /home/u386002233/domains/berber.al/nodejs
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs22/root/bin/node
PassengerStartupFile server.js
PassengerBaseURI /
PassengerRestartDir /home/u386002233/domains/berber.al/nodejs/tmp
SetEnv NODE_OPTIONS "--require /home/u386002233/domains/berber.al/public_html/.builds/config/preload-timestamp.js"
SetEnv LSNODE_CONSOLE_LOG console.log
SetEnv TOKIO_WORKER_THREADS 2
SetEnv DATABASE_URL "mysql://u386002233_berber:Berber2026secure@localhost:3306/u386002233_berber"
RewriteRule ^\\.builds - [F,L]
`;

  conn.sftp((err, sftp) => {
    if (err) throw err;
    const writeStream = sftp.createWriteStream('/home/u386002233/domains/berber.al/public_html/.htaccess');
    writeStream.write(newHtaccess);
    writeStream.end(() => {
      console.log('✅ .htaccess updated with DATABASE_URL!');
      // Now touch restart.txt to restart the app
      conn.exec("touch /home/u386002233/domains/berber.al/nodejs/tmp/restart.txt", (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          console.log('✅ App restart triggered!');
          conn.end();
        });
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
