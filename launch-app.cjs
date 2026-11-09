const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('========================================================');
console.log('   Al-Bayan: AI-Powered Quran & Tafseer Ecosystem       ');
console.log('========================================================\n');

// 1. Ensure dist build exists
const distIndex = path.join(__dirname, 'dist', 'index.html');
if (!fs.existsSync(distIndex)) {
  console.log('[1/3] Building production assets (Vite)...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    console.log('[1/3] Build completed successfully.\n');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
} else {
  console.log('[1/3] Compiled production assets verified in dist/.\n');
}

// 2. Start server
console.log('[2/3] Starting Al-Bayan application server...');
const isWindows = process.platform === 'win32';
const tsxCli = require.resolve('tsx/cli');

const serverProcess = spawn(process.execPath, [tsxCli, 'server.ts'], {
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
  stdio: ['pipe', 'pipe', 'pipe'],
});

let serverUrl = '';
let launchedApp = false;

serverProcess.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);

  const match = text.match(/running at (http:\/\/[^\s]+)/i);
  if (match && !launchedApp) {
    serverUrl = match[1];
    launchDesktopWindow(serverUrl);
  }
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

serverProcess.on('exit', (code) => {
  console.log(`\n[Al-Bayan] Server process exited with code ${code}`);
  process.exit(code || 0);
});

function launchDesktopWindow(url) {
  launchedApp = true;
  console.log(`\n[3/3] Launching Al-Bayan Desktop App Window at ${url}...\n`);

  if (isWindows) {
    // Try launching Microsoft Edge or Google Chrome in standalone App Mode
    const edgePaths = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\Application\\msedge.exe',
    ];

    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    ];

    const edgeExe = edgePaths.find((p) => fs.existsSync(p));
    const chromeExe = chromePaths.find((p) => fs.existsSync(p));

    const appBrowser = edgeExe || chromeExe;

    if (appBrowser) {
      spawn(appBrowser, [`--app=${url}`, '--window-size=1380,880'], {
        detached: true,
        stdio: 'ignore',
      }).unref();
      console.log('>> Native standalone app window launched successfully.');
      console.log('>> Press Ctrl+C in this console to stop the app.\n');
      return;
    }

    // Fallback: standard default browser
    spawn('cmd.exe', ['/c', 'start', url], { detached: true, stdio: 'ignore' }).unref();
  } else {
    // macOS / Linux fallback
    const openCmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
    spawn(openCmd, [url], { detached: true, stdio: 'ignore' }).unref();
  }
}

// Clean termination
function handleExit() {
  if (serverProcess) {
    try {
      if (isWindows) {
        execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' });
      } else {
        serverProcess.kill('SIGTERM');
      }
    } catch (e) {}
  }
  process.exit(0);
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
