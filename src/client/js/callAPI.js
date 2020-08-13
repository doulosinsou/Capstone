export async function search(){
  event.preventDefault()
    const userInput = document.getElementById("location").value;
    validate(userInput)
    .then( async function(valid){
      if(valid){
        console.log("validated response is: "+valid)
      const options = await fetchServer("/geoname", valid)
      return options;
      } else{
      console.log("validator failed");
      }
    })
    .then( async function(options){
      if (options !== "Error"){
        refine(options)

        document.getElementById("go").addEventListener("click", async function(){
          event.preventDefault();
          const select = document.getElementById("select");
          const weather = await fetchServer("/Weatherbit", select.value);

          weatherData = weather;
          console.log(weatherData);
          next(when);
        })
              }else{
        relocate("error")
      }
    })
    .then( async function(choice){
      // console.log(choice)
    })


}

let weatherData = {};//Raw 16 day forecast from Weatherbit
let stayDate = {};//arrival date, length of stay, and logged date marked with .arrival .stay .today
const weather = {}; //Analyzed weather data: lows, highs, average, median of temp, hum, and pop


async function validate(userInput){
  const nums = new RegExp(/\d/);
  const numbers = nums.test(userInput);
  if (!numbers){
    relocate("passed");
    const encode = encodeURI(userInput);
    return encode;
  } else {
    relocate("error");
  }
}

function relocate(error){
  let relocate = document.getElementById('relocate');
  if (error == "error"){
  relocate.innerHTML = "Please input valid location";
} else {
  relocate.innerHTML = "";
}
}

const refine = async (options)=>{
  const form = document.getElementById("refine");
  const select = document.createElement('select');
  const blank = document.createElement('option');
  blank.value = "Choose";
  select.appendChild(blank);
  select.id="select";
  for (let i=0;i<options.length;i++){
    let cityname = options[i].toponymName;
    if (cityname.length >15){
      cityname = cityname.substring(0,15)+"...";
    }
    let country = options[i].countryName;
    let state = options[i].adminName1;
    let coor = "&lat=" + options[i].lat + "&lon=" + options[i].lng;

    let option = document.createElement('option');
    option.innerHTML = cityname+" "+state+", "+country;
    option.value = coor;

    select.appendChild(option)
  }
  const go = document.createElement('button');
  go.id = "go";
  go.textContent = "Go";


  form.innerHTML="<p>Refine your search</p>";
  form.appendChild(select);
  form.appendChild(go);
}

function next(sec){
  const section = document.getElementById(sec);

}

document.getElementById('submitWhen').addEventListener("click", function(){
  event.preventDefault()
  const arrival = document.getElementById('date').value;
  const stay = document.getElementById('length').value;
  const today = new Date();

  stayDate = {"arrival": arrival, "stay":stay, "today":today};
  console.log(stayDate);

  next(what);
  prepare();
});

function prepare(){

  const time = new Date(stayDate.arrival).getTime();
  const stay = stayDate.stay*86400000;
  const now = new Date(stayDate.today).getTime();
  const arrival = Math.ceil((time - now)/86400000);
  const depart = Math.ceil(((time+stay)-now)/86400000);

  console.log("planning to arrive in "+arrival+" days");
  console.log("planning to depart in "+depart+" days");

  if (depart<16){
    const weather = analyze(arrival, depart);

    packbags(weather);

  }else if(arrival<16){

  }else {

  }

}

//Analyze weather data and return lows, highs, average, and median of temperature, humitidy, and precipitation for days picked
function analyze(arrive, depart){
  const data = weatherData.data;
  const min_max_temp = [];
  const average_temp = [];
  const hum_av = [];
  const pop_range = []

  for(let i=(arrive); i<(depart); i++){
    const day = data[i];
    min_max_temp.push(day.max_temp);
    min_max_temp.push(day.min_temp);
    average_temp.push(day.temp);
    hum_av.push(day.rh);
    pop_range.push(day.pop);
  }

  const range_avr = (min_max, av) => {
    const value={};
    av.sort();

    value.low = Math.round(Math.min(...min_max));
    value.high = Math.round(Math.max(...min_max));
    const avr = avr => avr.reduce((a,b)=> a + b, 0) / avr.length;
    value.av = Math.round(avr(av));

    if (av.length % 2 === 0){ // is the number of items even
      value.med = (av[av.length / 2 -1] + av[av.length/2])/2; //median
    }else{ // is the number of items odd
      value.med = av[(av.length-1)/2];
    }

    return value;
  }


  const temp_range = range_avr(min_max_temp, average_temp);
  weather.low_temp = temp_range.low;
  weather.high_temp = temp_range.high;
  weather.av_temp = temp_range.av;
  weather.med_temp = temp_range.med

  const hum_range = range_avr(hum_av,hum_av);
  weather.low_hum = hum_range.low;
  weather.high_hum = hum_range.high;
  weather.av_hum = hum_range.av;
  weather.med_hum = hum_range.med;

  const pop = range_avr(pop_range, pop_range);
  weather.low_pop = pop.low;
  weather.high_pop = pop.high;
  weather.av_pop = pop.av;
  weather.med_pop = pop.med;

  return weather;
}

function packbags(weather){
  const lookslike = document.getElementById('lookslike');
  const intro = "<p>Here's what you can expect the weather to be like:</p>";
  const temp = "<p>Temperature: "+weather.low_temp+"F - "+weather.high_temp+"F, Average: "+weather.av_temp+"F</p>";
  const hum = "<p>Humidity: "+weather.low_hum+"% - "+weather.high_hum+"%, Average: "+weather.av_hum+"%</p>";
  const prec = "<p>Precipitation: "+weather.low_pop+"% - "+weather.high_pop+"%, Average: "+weather.av_pop+"%</p>";
  const normal = "<p>You can expect a normal day to be: "+weather.med_temp+"F, hum: "+weather.med_hum+"%, prec: "+weather.med_pop+"%</p>";
  lookslike.innerHTML = intro+temp+hum+prec+normal;
}

//universal caller
const fetchServer = async (path, data)=>{
  const query = "?q=";
  const fordevserver = "http://localhost:3003";
  const call = await fetch(fordevserver+path+query+data);
  try {
    const response = await call.json()
    return response
  } catch (error){
    console.log(error);
  }

}

document.getElementById('finalize').addEventListener("click", async function(){
  let nameTrip;
  if (document.getElementById("nameTrip").value === ""){
    nameTrip = "Trip to "+weatherData.city_name+"on "+stayDate.arrival;
  }else{
    nameTrip = document.getElementById("nameTrip").value;
  }

  const vacation = weatherData.city_name+"+"+weatherData.country_code;


  const findpic = await fetchServer('/pixabay', vacation)
  .then(async function(findpic){
    const datapicture= await Client.updatePage.dataCanvas(findpic);
    return datapicture
  })

// console.log(findpic)

  const list = document.querySelector("#list ul");
  const string = JSON.stringify(list.innerHTML);
  let userlist = [string];

  let saveWeather = {
    "weatherData":weatherData,
    "stayDate":stayDate,
    "weather":weather,
    "userlist":userlist,
    "picture":findpic
  };

let alltrips;
  if (JSON.parse(localStorage.getItem("trip"))){
    alltrips = JSON.parse(localStorage.getItem("trip"));
  }else{
    alltrips = {};
  }

  alltrips[nameTrip] = saveWeather;

  localStorage.setItem("trip", JSON.stringify(alltrips));

  // console.log(JSON.parse(localStorage.getItem("trip")));
  Client.updatePage.buildTrips();

})



function updateList(){
const savebtn = document.querySelectorAll(".save");
for (let i=0;i<savebtn.length;i++){
  savebtn[i].addEventListener("click", function(){
    const list = JSON.stringify(event.target.parentNode.querySelector("ul.list").innerHTML);
    const parent = event.target.closest(".details-container");
    const tripName = parent.querySelector("h3").innerHTML;
    const storage = JSON.parse(localStorage.getItem("trip")) || [];
    storage[tripName].userlist = list;

    localStorage.setItem("trip", JSON.stringify(storage));
    console.log(JSON.parse(localStorage.getItem("trip")));

  })
}
}
