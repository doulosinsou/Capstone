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

app.get('/geoname', getGeoname)
app.get('/Weatherbit', getWeather)

async function getGeoname(req, res){
  const api = "http://api.geonames.org/searchJSON?q=";
  const cred = "&maxRows=5&countryBias=US&username="+process.env.Geoname;
  const loc = req.query.q;
  console.log(api+loc+cred);
  const call = await fetch(api+loc+cred);
  try {
    const response = await call.json();
    console.log(response.geonames)
    if (response.geonames !== null){
      res.send(response.geonames)
    }else{
      res.send("Error")
    }
  } catch (error){
    console.log(error)
  }
}


async function getWeather(req, res){
  const api = "http://api.weatherbit.io/v2.0/forecast/daily?";
  const cred = "key="+process.env.Weatherbit;
  const loc = "&lat="+req.query.lat+"&lon="+req.query.lon;
  const units = "&units=i";
  // console.log(api+cred+loc);
  const call = await fetch(api+cred+loc+units);
  try {
    const response = await call.json()
    console.log(response)
    res.send(response)

  } catch(error){
    console.log("call error: "+error)
  }

}
