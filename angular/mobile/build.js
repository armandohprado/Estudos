import { readdirSync, renameSync } from 'fs';
import { resolve } from 'path';
import Zip from 'adm-zip';
import { spawn } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const buildName = require('./package.json').name;

const args = {
  dev: false,
  prod: false,
  homolog: false,
  all: false,
  zip: false,
};

function setArgs() {
  const argv = process.argv.slice(2);
  for (const arg of argv) {
    switch (arg) {
      case '--dev':
      case '-d': {
        args.dev = true;
        break;
      }
      case '--homolog':
      case '-h': {
        args.homolog = true;
        break;
      }
      case '--prod':
      case '-p': {
        args.prod = true;
        break;
      }
      case '--all':
      case '-a': {
        args.all = true;
        break;
      }
      case '--zip':
      case '-z': {
        args.zip = true;
        break;
      }
      case '--no-zip': {
        args.zip = false;
        break;
      }
    }
  }
}

async function runBuild(build) {
  if (!args[build] && !args.all) {
    return;
  }
  return new Promise((resolve, reject) => {
    try {
      console.log(`Gerando build de ${build}`);
      const buildCmd = spawn('yarn', [`build-${build}`], { shell: true });
      buildCmd.stdout.on('data', data => {
        console.log(`${data}`);
      });
      buildCmd.stderr.on('data', data => {
        console.error(`${data}`);
      });
      buildCmd.on('close', () => {
        console.log(`Build de ${build} terminou!`);
        renameAndZip(build);
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

const builds = ['dev', 'homolog', 'prod'];

function renameAndZip(build) {
  const distPath = resolve('dist');

  const folder = readdirSync(distPath).find(f => f === buildName);

  function padLeft(value) {
    return ('' + value).padStart(2, '0');
  }

  function getDate() {
    const date = new Date();
    return `${padLeft(date.getDate())}-${padLeft(date.getMonth() + 1)}-${date.getFullYear()}-${padLeft(
      date.getHours()
    )}-${padLeft(date.getMinutes())}-${padLeft(date.getSeconds())}`;
  }

  const newFolderName = `${folder}-${build} (${getDate()})`;

  console.log(`Renomeando pasta de "${folder}" para "${newFolderName}"`);

  const newPathName = resolve(`${distPath}/${newFolderName}`);
  renameSync(resolve(`${distPath}/${folder}`), newPathName);
  if (args.zip) {
    console.log('Zippando...');

    const zip = new Zip();
    zip.addLocalFolder(newPathName);
    zip.writeZip(resolve(newPathName + '.zip'), err => {
      if (err) {
        console.error(err);
      }
    });
  }

  console.log(`Fim do processo da build de ${build}`);
}

(async () => {
  setArgs();
  for (const build of builds) {
    await runBuild(build);
  }
})();
