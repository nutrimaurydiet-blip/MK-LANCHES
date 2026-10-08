'use strict';

const crypto = require('crypto');

if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
  throw new Error('Execute este gerador em um terminal interativo.');
}

process.stdout.write('Nova senha (mínimo de 12 caracteres, entrada oculta): ');
let password = '';
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on('data', (chunk) => {
  for (const byte of chunk) {
    if (byte === 3) {
      process.stdin.setRawMode(false);
      process.stdout.write('\nCancelado.\n');
      process.exit(1);
    }
    if (byte === 13 || byte === 10) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
      if (Buffer.byteLength(password, 'utf8') < 12) {
        process.stderr.write('A senha deve ter pelo menos 12 bytes.\n');
        process.exitCode = 1;
        return;
      }
      const salt = crypto.randomBytes(16);
      const hash = crypto.scryptSync(password, salt, 64);
      process.stdout.write(`ADMIN_PASSWORD_HASH=scrypt$${salt.toString('base64')}$${hash.toString('base64')}\n`);
      password = '';
      return;
    }
    if (byte === 8 || byte === 127) {
      password = password.slice(0, -1);
      continue;
    }
    if (byte < 32 || byte > 126) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stderr.write('Use somente caracteres ASCII imprimíveis nesta senha.\n');
      password = '';
      process.exitCode = 1;
      return;
    }
    password += String.fromCharCode(byte);
  }
});
