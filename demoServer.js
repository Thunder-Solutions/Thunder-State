const express = require('express')
const app = express()
const port = 3000

app.use(express.static(__dirname))

app.get('/', (req, res) => res.sendFile(__dirname + '/demo/demo.html'))

app.listen(port, () => console.log(`Simple State demo listening on port ${port}!`))
