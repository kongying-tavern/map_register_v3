const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv')

let configPath = '';
let configPathEnv = path.resolve(__dirname, './.env');
let configPathEnvLocal = path.resolve(__dirname, './.env.local');
let env = {
};

configPath = fs.existsSync(configPathEnvLocal) ? configPathEnvLocal : configPathEnv

env = dotenv
  .config({
    path: configPath
  })
  .parsed;

module.exports = env;
