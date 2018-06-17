/**
 *
 */
var path = require('path');

const EVENT = process.env.npm_lifecycle_event || '';

/**
 * Helper functions.
 */
var ROOT = path.resolve(__dirname, '..');

function hasProcessFlag(flag) {
  return process.argv.join('').indexOf(flag) > -1;
}

function hasNpmFlag(flag) {
  return EVENT.includes(flag);
}

function isWebpackDevServer() {
  return process.argv[1] && !! (/webpack-dev-server/.exec(process.argv[1]));
}

function resourcePath(oripath, resource){
  let rs;

  if(process.env.PACK === 'Y'){
    rs = path.join('resources',resource);
    rs = '.'.concat(path.sep).concat(rs);
  } else if(oripath){
    rs =path.join(oripath,resource);
  }
  return rs;
}

function getElectronConfigPath(){
  let rs;
  if(process.env.mode === 'EXE'){
    rs = path.join('.', 'resources', 'conf');
  } else {
    rs = path.resolve(path.join(process.cwd(), 'src-main', 'config'));
  }
  console.log('ElectronConfigPath: ', rs);
  return rs;
}

function getElectronWebAppPath(){
  let rs;
  if(process.env.mode === 'EXE'){
    rs = path.join('.', 'resources');
  } else {
    rs = path.resolve(path.join(process.cwd(), 'dist'));
  }
  console.log('getElectronResourcePath: ', rs);
  return rs;
}

function getAppEntry(){
  // return isWebpackDevServer()? '': 'devbox';
  return isWebpackDevServer()? '': 'kgen';
}

function getBaseUrl(){
  // return isWebpackDevServer()?'/ksck':'./';
  // return isWebpackDevServer()?'/':'/ksck/';
  return isWebpackDevServer()?'/': '';
}

var root = path.join.bind(path, ROOT);

exports.hasProcessFlag = hasProcessFlag;
exports.hasNpmFlag = hasNpmFlag;
exports.isWebpackDevServer = isWebpackDevServer;
exports.root = root;
exports.resourcePath = resourcePath;
exports.getAppEntry = getAppEntry;
exports.getBaseUrl = getBaseUrl;
exports.getElectronConfigPath = getElectronConfigPath;
exports.getElectronWebAppPath = getElectronWebAppPath;