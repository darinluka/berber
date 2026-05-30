const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  
  // Write the test script directly on the remote server
  const testScript = `
const { PrismaClient } = require('@prisma/client');
async function test() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.argv[2]
      }
    }
  });
  try {
    const count = await prisma.salon.count();
    console.log('SUCCESS! count:', count);
  } catch (err) {
    console.error('FAILED!', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
`;
  
  // We can write this file using a shell command (since it's small) or SFTP
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const stream = sftp.createWriteStream('/home/u386002233/domains/berber.al/nodejs/test-prisma.js');
    stream.write(testScript);
    stream.end(() => {
      console.log('Test script written to server.');
      
      // Let's test connection strings!
      const connStrings = [
        "mysql://u386002233_berber:3tmx2tl|bJ|X@127.0.0.1:3306/u386002233_berber",
        "mysql://u386002233_berber:3tmx2tl%7CbJ%7CX@127.0.0.1:3306/u386002233_berber",
        "mysql://u386002233_berber:3tmx2tl|bJ|X@localhost:3306/u386002233_berber",
        "mysql://u386002233_berber:3tmx2tl%7CbJ%7CX@localhost:3306/u386002233_berber"
      ];
      
      let chain = Promise.resolve();
      connStrings.forEach(str => {
        chain = chain.then(() => {
          return new Promise(resolve => {
            console.log('Testing: ' + str.replace(/:[^@]+@/, ':***@'));
            conn.exec(`/opt/alt/alt-nodejs22/root/bin/node /home/u386002233/domains/berber.al/nodejs/test-prisma.js "${str}"`, (err, cmdStream) => {
              if (err) throw err;
              cmdStream.on('close', () => resolve())
                .on('data', data => console.log('STDOUT: ' + data))
                .stderr.on('data', data => console.log('STDERR: ' + data));
            });
          });
        });
      });
      
      chain.then(() => {
        // Cleanup test-prisma.js
        conn.exec("rm /home/u386002233/domains/berber.al/nodejs/test-prisma.js", () => {
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
