const { spawnSync } = require('node:child_process');
const path = require('node:path');

function run(script, args = [], env = process.env) {
  console.log(`\n> ${script} ${args.join(' ')}`);
  const result = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(path.join(path.dirname(require.resolve('eslint/package.json')), 'bin/eslint.js'), ['.']);
run(require.resolve('typescript/bin/tsc'), ['--noEmit']);
run('--test', ['scripts/tests/reliability.cjs']);
for (const platform of ['android', 'ios', 'web']) {
  run(require.resolve('expo/bin/cli'), [
    'export', '--platform', platform, '--output-dir', `artifacts/verification/${platform}`,
  ], { ...process.env, CI: '1', EXPO_PUBLIC_API_ORIGIN: 'https://api.example.invalid' });
}
