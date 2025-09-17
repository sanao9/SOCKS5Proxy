# Simple SOCKS5 Proxy Server (Node.js)

A minimal SOCKS5 proxy server built with Node.js.  
Supports username/password authentication, connection logging, and basic tunneling.

---

##  How to Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/socks5-proxy.git
   cd socks5-proxy
Install dependencies

bash
npm install
Create a .env file

env
PORT=1080
AUTH_USER=test
AUTH_PASS=secret
Start the proxy

bash
node proxy.js
You should see:

nginx
SOCKS5 proxy running on port 1080
