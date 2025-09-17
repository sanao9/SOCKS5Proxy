require('dotenv').config();
const net = require('net');

// Configuration
const PORT = process.env.PORT ;
const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASS = process.env.AUTH_PASSWORD;

// SOCKS5 constants
const VERSION = 0x05;
const NO_AUTH = 0x00;
const USER_PASS = 0x02;
const SUCCESS = 0x00;
const FAILURE = 0x01;

const server = net.createServer((clientSocket) => {
    console.log(`Client connected: ${clientSocket.remoteAddress}:${clientSocket.remotePort}`);

    clientSocket.once('data', (data) => {
        // SOCKS5 handshake
        if (data[0] !== VERSION) {
            clientSocket.end();
            return;
        }

        const nMethods = data[1];
        const methods = data.slice(2, 2 + nMethods);

        // Check if username/password auth is supported
        if (methods.includes(USER_PASS)) {
            clientSocket.write(Buffer.from([VERSION, USER_PASS]));
            handleAuth(clientSocket);
        } else {
            clientSocket.write(Buffer.from([VERSION, 0xFF]));
            clientSocket.end();
        }
    });
});

function handleAuth(clientSocket) {
    clientSocket.once('data', (data) => {
        // Username/Password auth
        const uLen = data[1];
        const username = data.slice(2, 2 + uLen).toString();
        const pLen = data[2 + uLen];
        const password = data.slice(3 + uLen, 3 + uLen + pLen).toString();

        if (username === AUTH_USER && password === AUTH_PASS) {
            clientSocket.write(Buffer.from([0x01, SUCCESS]));
            handleRequest(clientSocket);
        } else {
            clientSocket.write(Buffer.from([0x01, FAILURE]));
            clientSocket.end();
        }
    });
}

function handleRequest(clientSocket) {
    clientSocket.once('data', (data) => {
        if (data[0] !== VERSION) {
            clientSocket.end();
            return;
        }

        const cmd = data[1];
        const addrType = data[3];

        let destAddr;
        let destPort;
        let offset = 4;

        if (addrType === 0x01) { // IPv4
            destAddr = `${data[offset++]}.${data[offset++]}.${data[offset++]}.${data[offset++]}`;
        } else if (addrType === 0x03) { // Domain
            const domainLen = data[offset++];
            destAddr = data.slice(offset, offset + domainLen).toString();
            offset += domainLen;
        } else {
            clientSocket.end();
            return;
        }

        destPort = data.readUInt16BE(offset);

        console.log(`Connecting to ${destAddr}:${destPort} from ${clientSocket.remoteAddress}`);

        // Connect to destination
        const remoteSocket = net.createConnection(destPort, destAddr, () => {
            const reply = Buffer.from([VERSION, 0x00, 0x00, 0x01, 0,0,0,0, (destPort >> 8), (destPort & 0xff)]);
            clientSocket.write(reply);

            // Pipe data both ways
            clientSocket.pipe(remoteSocket);
            remoteSocket.pipe(clientSocket);
        });

        remoteSocket.on('error', () => clientSocket.end());
    });
}

server.listen(PORT, () => { 
    console.log(`SOCKS5 proxy running on port ${PORT}`);
});
