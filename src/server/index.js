const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const fetch = require('node-fetch')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')


dotenv.config()
app.use(bodyParser.urlencoded({limit: '8mb', extended:false}))
app.use(bodyParser.json({limit: '8mb', extended:false}))
app.use(cors())
app.use(express.static('dist'))

app.get('/', (req,res) => {
  res.sendFile(path.resolve('dist/index.html'))
})

app.listen(3003, ()=>{
  console.log("travel planner listening on port 3003")
})

//get and post routes below

let pictureData = {};

app.get('/geoname', getGeoname)
app.get('/Weatherbit', getWeather)
app.get('/pixabay', getpicture)
app.get('/picture', returnPictureData)
app.post('/store', storePic)

async function getGeoname(req, res){
  const api = "http://api.geonames.org/searchJSON?q=";
  const key = "&maxRows=5&countryBias=US&username="+process.env.Geoname;
  const loc = req.query.q;
  // console.log(api+loc+key);
  const call = await fetch(api+loc+key);
  try {
    const response = await call.json();
    // console.log("Geoname: "+response.geonames)
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
  const key = "key="+process.env.Weatherbit;
  const loc = "&lat="+req.query.lat+"&lon="+req.query.lon;
  const units = "&units=i";
  // console.log(api+cred+loc);
  const call = await fetch(api+key+loc+units);
  try {
    const response = await call.json()
    // console.log("getWeather response: "+response)
    res.send(response)

  } catch(error){
    console.log("call error: "+error)
  }

}



async function getpicture(req, res){
  const api = "https://pixabay.com/api/";
  const key ="?key="+process.env.Pixabay;
  const params = "&safesearch=true&category=travel&image_type=photo&per_page=3";
  const q = "&q="+req.query.q;
  const def = "&q=vacation";

  let call = await fetch(api+key+params+q);
  try {
    let response = await call.json();
    if (response.total === "0"){
      call = await fetch(api+key+params+def);
      try {
        response = await call.json();
        const processedOne = await processPic(response);
        res.send(processedOne);
      }catch(error){
        console.log("default call error:"+error)
      }
    }else{
      const processedTwo = await processPic(response);
      res.send(processedTwo);
    }
  }catch(error){
    console.log("pixabay call error:"+error)
  }


}

async function processPic(data){
  const random = Math.floor(Math.random()*4);
  const picture = data.hits[random];
  console.log("processPic(data)");
  console.log(picture);

  const id = picture.id;
  if (!pictureData[id]){
    const build_obj = {
      "exists": "false",
      "id": id,
      "url": picture.webformatURL,
      "width": picture.webformatWidth,
      "height": picture.webformatHeight,
      "tags": picture.tags
      }
    return build_obj;
  }else{
    console.log("pictureData[id] passed as true");
    return pictureData[id].id;
  }
}

function storePic(req, res){
  const id = req.body.id;
  pictureData[id] = {
    "id":id,
    "dataURL":req.body.src,
    "tags": req.body.tags
  };
  console.log("storePic just saved data to pictureData[id]");
  console.log(pictureData[id]);

}

function returnPictureData(req, res){
  const id = req.query.q;
  res.send(pictureData[id]);
}
