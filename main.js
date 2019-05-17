const express = require('express')
const localtunnel = require('localtunnel')
const route = require('./route')
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express()
const port = process.env.PORT || 3000
const hostname = process.env.HOST || 'localhost'
const subdomain = process.env.LTSUBDOMAIN

if (!subdomain) {
  // throw new Error('environment variable LTSUBDOMAIN required')
  console.error('environment variable LTSUBDOMAIN required')
  process.exit(0)
}
app.use(cors())
app.use(express.json())
app.use(route)

app.listen(port, hostname, () => {
  console.debug(`App url http://${hostname}:${port}`)
})

const tunnel = localtunnel(port, {
  subdomain,
  local_host: hostname
}, (err, result) => {
  console.debug(`Tunnel url ${result.url}`)
})

tunnel.on('close', function(e) {
  // tunnels are closed
  console.error('Tunnel close')
  process.exit(0)
});