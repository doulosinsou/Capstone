let weatherData = {};//Raw 16 day forecast from Weatherbit
let stayDate = {};//arrival date, length of stay, and logged date marked with .arrival .stay .today
const weather = {}; //Analyzed weather data: lows, highs, average, median of temp, hum, and pop

document.getElementById("form-container").querySelector("form").addEventListener("submit", search);

export async function search(){
  event.preventDefault()
    const userInput = document.getElementById("location").value;

    const val = validate(userInput);
    const options = await fetchServer("/geoname", val)
    .then((options)=>{
      refine(options);
    })

    document.getElementById("go").addEventListener("click", function(){
      weatherbit();
      Client.updatePage.next("when");
    });

    document.getElementById('submitWhen').addEventListener("click", function(){
      subWhen();
      prepare();
      Client.updatePage.next("what");
    });

    document.getElementById('finalize').addEventListener("click", finalize);
};

export function validate(userInput){
  const nums = new RegExp(/\d/);
  const numbers = nums.test(userInput);
  if (!numbers){
    relocate("passed");
    const encode = encodeURI(userInput);
    console.log("validated response is: "+encode)
    return encode;
  } else {
    console.log("validator failed");
    relocate("error");
  }
};

function relocate(error){
  let relocate = document.getElementById('relocate');
  if (error == "error"){
  relocate.innerHTML = "Please input valid location";
} else {
  relocate.innerHTML = "";
}
};

export const refine = async (options)=>{
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
  go.classList.add("main");


  form.innerHTML="<p>Refine your search</p>";
  form.appendChild(select);
  form.appendChild(go);
};

export async function weatherbit(manual){
  let select;
  if(event){
    event.preventDefault();
    select = document.getElementById("select").value;
    console.log("clicked on weatherbit");
  }else{
    select = manual;
    console.log("refreshed weatherbit");
  }
console.log(select);
    const weather = await fetchServer("/Weatherbit", select);
    weatherData = weather;
    console.log(weatherData);
    return weather;
};

export function subWhen(){
  if(event){
    event.preventDefault();
  }
  const arrival = document.getElementById('date').value;
  const stay = document.getElementById('length').value;
  const today = new Date();

  stayDate = {"arrival": arrival, "stay":stay, "today":today};
  console.log(stayDate);

};

export function prepare(){

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
  }else{

    packbags("Check the weather within about two weeks of trip");
  }
};

//Analyze weather data and return lows, highs, average, and median of temperature, humitidy, and precipitation for days picked
function analyze(arrive, depart){
  let data = weatherData.data

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
      value.med = Math.round((av[av.length / 2 -1] + av[av.length/2])/2); //median
    }else{ // is the number of items odd
      value.med = Math.round(av[(av.length-1)/2]);
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
};

function packbags(weather){
  if (weather === "Check the weather within about two weeks of trip"){
    lookslike.innerHTML = weather;
  }else{
  const lookslike = document.getElementById('lookslike');
  const intro = "<p>Here's what you can expect the weather to be like:</p>";
  const temp = "<p>Temperature: "+weather.low_temp+"F - "+weather.high_temp+"F, Average: "+weather.av_temp+"F</p>";
  const hum = "<p>Humidity: "+weather.low_hum+"% - "+weather.high_hum+"%, Average: "+weather.av_hum+"%</p>";
  const prec = "<p>Precipitation: "+weather.low_pop+"% - "+weather.high_pop+"%, Average: "+weather.av_pop+"%</p>";
  const normal = "<p>You can expect a normal day to be:<br> "+weather.med_temp+"F,<br>"+weather.med_hum+"% hum,<br>"+weather.med_pop+"% prec</p>";
  lookslike.innerHTML = intro+"<br>"+temp+"<br>"+hum+"<br>"+prec+"<br>"+normal;
}
};

//universal caller
export const fetchServer = async (path, data)=>{
  const query = "?q=";
  const fordevserver = "http://localhost:3003";
  const call = await fetch(fordevserver+path+query+data);
  try {
    const response = await call.json()
    return response
  } catch (error){
    console.log(error);
  }

};


export async function finalize(){

  let nameTrip;
  if (document.getElementById("nameTrip").value === ""){
    nameTrip = "Trip to "+weatherData.city_name+" on "+stayDate.arrival;
  }else{
    nameTrip = document.getElementById("nameTrip").value;
  }

  const vacation = weatherData.city_name;

  let picdata;
  const findpic = await fetchServer('/pixabay', vacation);
  if (findpic.exists === "false"){

    const build = await storeJPG(findpic);
    console.log("passed as Exists:false");
    picdata = build;

  } else {
    console.log("already logged");
    picdata = findpic[0];
  }

  console.log(picdata);

  const list = document.querySelector("#list ul").innerHTML;
  const string = JSON.stringify(list.innerHTML);
  let userlist = [string];

  let saveWeather = {
    "weatherData":weatherData,
    "stayDate":stayDate,
    "weather":weather,
    "userlist":list,
    "picture":picdata
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

};

export function updateList(){
const savebtn = document.querySelectorAll(".save");
for (let i=0;i<savebtn.length;i++){
  savebtn[i].addEventListener("click", function(){
    const list =  event.target.parentNode.querySelector("ul.list").innerHTML;
    const parent = event.target.closest(".details-container");
    const tripName = parent.querySelector("h3").innerHTML;
    const storage = JSON.parse(localStorage.getItem("trip")) || [];
    // console.log(tripName);

    storage[tripName].userlist = list;

    localStorage.setItem("trip", JSON.stringify(storage));
    console.log(JSON.parse(localStorage.getItem("trip")));

  })
}
};

async function storeJPG(picture){

    const preview = picture.url;

    const show = document.createElement("img");
    show.src = preview;
    show.crossOrigin = "anonymous";

    const canvas = document.createElement('canvas');
    const context = canvas.getContext("2d");

    canvas.width = picture.width;
    canvas.height = picture.height;

    const pixdata = new Promise(function(resolve, reject){
      show.addEventListener("load", function(){
      let imgDataUrl;
      context.drawImage(show, 0, 0, picture.width, picture.height);
      imgDataUrl = canvas.toDataURL("image/jpg", .8);

      const newdata = {
        "id": picture.id,
        "src": imgDataUrl,
        "tags":picture.tags
      }
      resolve(newdata);
    })
    });
    const sendPic = await pixdata;
      const fordevserver = "http://localhost:3003";
      fetch(fordevserver+'/store', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendPic),
      });
    return sendPic.id;
};
