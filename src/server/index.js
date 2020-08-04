const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const fetch = require('node-fetch')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

dotenv.config()
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('dist'))

app.get('/', (req,res) => {
  res.sendFile(path.resolve('dist/index.html'))
})

app.listen(3003, ()=>{
  console.log("travel planner listening on port 3003")
})

//get and post routes below
