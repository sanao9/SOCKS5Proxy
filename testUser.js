const { SocksProxyAgent } = require('socks-proxy-agent');
const https = require('https');

const proxy = 'socks5://user:pass@127.0.0.1:1080';
const agent = new SocksProxyAgent(proxy);

https.get('https://example.com', { agent }, (res) => {
  console.log('statusCode:', res.statusCode);
  res.on('data', (chunk) => {
    console.log(chunk.toString());
  });
});
