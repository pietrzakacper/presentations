const express = require('express')

const app = express()

app.use(express.static(__dirname + '/static'))

const IP = '10.0.0.2'
const PORT = 3000
app.listen(PORT, IP, () => console.log(`App is listening on ${IP}:${PORT}`))