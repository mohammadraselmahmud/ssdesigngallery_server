/* eslint-disable @typescript-eslint/ban-ts-comment */
import dns from 'dns';
// Force Google DNS servers before any connection attempt
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

import { createServer, Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import { defaultTask } from './app/utils/defaultTask';
import colors from 'colors';

let server: Server;
const socketServer = createServer(app);

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    defaultTask();
    server = app.listen(Number(config.port), config.ip as string, () => {
      console.log(
        colors.italic.green.bold(
          `💫 Simple Server Listening on  http://${config?.ip}:${Number(config.port)} `,
        ),
      );
    });
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(
          colors.yellow(
            `⚠️  Port ${Number(config.port)} is in use. Trying next port...`,
          ),
        );
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error(err);
  }
}
main();

// const urlLauncher = (url: string) => {
//   const platform = process.platform;

//   let command = '';
//   if (platform === 'win32') {
//     command = `start ${url}`;
//   } else if (platform === 'darwin') {
//     command = `open ${url}`;
//   } else {
//     command = `xdg-open ${url}`;
//   }

//   exec(command, err => {
//     if (err) {
//       console.error('🚫 Failed to open browser automatically:', err);
//     }
//   });
// };

process.on('unhandledRejection', err => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
