import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const requestedPort = Number.parseInt(process.env.AUTOKLINIKA_PORT || '', 10);

function canRun(command, args = ['--version']) {
  try {
    const result = spawnSync(command, args, { stdio: 'ignore', shell: false });
    return result.status === 0;
  } catch {
    return false;
  }
}

function pythonCommand() {
  if (process.platform === 'win32' && canRun('py', ['-3', '--version'])) {
    return { command: 'py', args: ['-3', 'server.py'] };
  }
  if (canRun('python3')) return { command: 'python3', args: ['server.py'] };
  if (canRun('python')) return { command: 'python', args: ['server.py'] };
  return null;
}

function portAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once('error', () => resolve(false));
    server.listen({ host: '127.0.0.1', port }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function resolvePort() {
  if (Number.isInteger(requestedPort) && requestedPort > 0 && requestedPort < 65536) {
    if (!(await portAvailable(requestedPort))) {
      throw new Error(`Port ${requestedPort} jest zajęty.`);
    }
    return requestedPort;
  }

  for (let port = 5173; port <= 5199; port += 1) {
    if (await portAvailable(port)) return port;
  }
  throw new Error('Brak wolnego portu w zakresie 5173–5199.');
}

const py = pythonCommand();
if (!py) {
  console.error('\n[AutoKlinika] Nie znaleziono Python 3.');
  console.error('Backend tej wersji jest lokalnym serwerem Python/SQLite i nie wymaga żadnych paczek pip.');
  console.error('Zainstaluj Python 3 i uruchom ponownie: npm run dev\n');
  process.exit(1);
}

let port;
try {
  port = await resolvePort();
} catch (error) {
  console.error(`\n[AutoKlinika] ${error.message}\n`);
  process.exit(1);
}

console.log('\n=============================================');
console.log('  AutoKlinika WWW — local development');
console.log('=============================================');
console.log(`Strona:              http://127.0.0.1:${port}/`);
console.log(`Panel administratora: http://127.0.0.1:${port}/administrator/`);
console.log('Login testowy:        admin');
console.log('Hasło testowe:        admin');
console.log('Zatrzymanie serwera:  Ctrl+C\n');

const child = spawn(py.command, py.args, {
  cwd: root,
  env: {
    ...process.env,
    AUTOKLINIKA_HOST: '127.0.0.1',
    AUTOKLINIKA_PORT: String(port),
    PYTHONUNBUFFERED: '1'
  },
  stdio: 'inherit',
  shell: false
});

let stopping = false;
function stop(signal) {
  if (stopping) return;
  stopping = true;
  if (!child.killed) child.kill(signal);
  setTimeout(() => process.exit(0), 1200).unref();
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));

child.on('error', (error) => {
  console.error(`[AutoKlinika] Nie udało się uruchomić serwera: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (stopping) process.exit(0);
  if (signal) {
    console.error(`[AutoKlinika] Serwer zakończony sygnałem ${signal}.`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});
