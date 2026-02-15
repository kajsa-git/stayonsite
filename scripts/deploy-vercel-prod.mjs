#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const EXPECTED = {
  orgId: 'team_2z7im4hdV6W7LgmjNBo4fFvv',
  projectId: 'prj_Re0S5ewCgyUHoM1aFqQyyaY9cCZI',
  projectName: 'stayonsite',
};

const LINK_COMMAND = 'npx vercel link --project stayonsite --scope ac0 --yes';

function fail(message) {
  console.error(`[deploy-guard] ${message}`);
  process.exit(1);
}

async function readProjectConfig() {
  const projectFile = resolve(process.cwd(), '.vercel/project.json');

  try {
    const raw = await readFile(projectFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    fail(
      `Could not read .vercel/project.json (${String(error)}).\n` +
        `Run: ${LINK_COMMAND}`
    );
  }
}

function validateConfig(config) {
  const mismatches = [];

  for (const [key, expectedValue] of Object.entries(EXPECTED)) {
    const actualValue = config[key];
    if (actualValue !== expectedValue) {
      mismatches.push(
        `${key}: expected "${expectedValue}", got "${actualValue ?? 'undefined'}"`
      );
    }
  }

  return mismatches;
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  const config = await readProjectConfig();
  const mismatches = validateConfig(config);

  if (mismatches.length > 0) {
    fail(
      `Wrong Vercel project is linked.\n` +
        `${mismatches.join('\n')}\n` +
        `Fix with: ${LINK_COMMAND}`
    );
  }

  console.log(
    `[deploy-guard] Verified Vercel link: ${config.projectName} (${config.projectId}) in ${config.orgId}`
  );

  if (checkOnly) {
    console.log('[deploy-guard] Check passed. No deployment started.');
    return;
  }

  const args = ['vercel', '--prod', '--yes', '--scope', 'ac0'];
  const child = spawn('npx', args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('error', (error) => {
    fail(`Failed to start deploy command (${String(error)})`);
  });

  child.on('exit', (code) => {
    process.exit(code ?? 1);
  });
}

main().catch((error) => {
  fail(String(error));
});
