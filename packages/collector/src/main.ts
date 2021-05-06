const { ArgumentParser } = require('argparse');
const { version } = require('../package.json');

const parser = new ArgumentParser({
  description: 'Argparse example'
});

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-f', '--foo', { help: 'foo bar' });
parser.add_argument('-b', '--bar', { help: 'bar foo' });
parser.add_argument('--baz', { help: 'baz bar' });

console.dir(parser.parse_args());


const WebSock = require('ws');

const wss = new WebSock.Server({ port: 8080 })

wss.on('connection', (ws: any) => {
  ws.on('message', (message: any) => {
    console.log(`Received message => ${message}`)
  })
  ws.send('ho!')
})

