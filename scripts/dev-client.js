const { spawn } = require('child_process');
const path = require('path');

const clientDir = path.resolve(__dirname, '..', 'client');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log(`⚡ Launching MoodTrack Vite development server in: ${clientDir}`);
const child = spawn(npmCmd, ['run', 'dev'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
