// localStorage.clear();

window.addEventListener("load", packList);

function packList(){
const form = document.querySelectorAll("form.packlist");
for (let i=0; i<form.length; i++){
  form[i].addEventListener("submit", function(event){
    event.preventDefault();
    const entry = event.target.querySelector("input[name='enter-list']");
    const list = event.target.parentNode.querySelector("ul");
      if(list.querySelector("li.sample")){
        list.innerHTML="";
      }
    const new_item = document.createElement("li");
    new_item.innerHTML = entry.value;
    list.appendChild(new_item);
    del();
    entry.value = "";

  })

const del = ()=>{
  const lis = form[i].parentNode.querySelectorAll("ul li");
    for (let b=0; b<lis.length; b++){
      lis[b].addEventListener("click", function(){
        lis[b].remove();
      })
    }
  }

del();

  form[i].parentNode.querySelector("button.remove").addEventListener("click", function(){
    event.target.parentNode.querySelector("ul").innerHTML="";
  })
}
}

export async function buildTrips(){

  const container = document.getElementById("trips");
  const replaceAll = document.createDocumentFragment();

  const records = JSON.parse(localStorage.getItem("trip"));

  const entries = Object.entries(records);

  const sort = entries.sort((a,b)=>{
    const aDate = a[1].stayDate.arrival;
    const bDate = b[1].stayDate.arrival;
    if (aDate>bDate){
      return 1;
    }else{
      return -1;
    }
});
  console.log(sort);

  for (let i=0; i<entries.length;i++){


    let trip = entries[i];
    let tripName = trip[0];
    let tripInfo = trip[1];
    if (trip !== "undefined"){

    let storedPicture = await Client.callAPI.fetchServer("/picture", tripInfo.picture);

    let tripContainer = make("div", ["trip-container"]);

    // create the coverphoto of the trip
    let coverPhoto = make("div",["cover-photo"]);
    let img = make("img");
    img.src= storedPicture.dataURL;
    img.alt= storedPicture.tags;

    let link = make("a",["pix-credit"]);
    link.href = "https://pixabay.com";
    let logo = make("img");
    logo.src="./img/pixabay_logo.png";
    logo.alt="pixabay logo";
    link.appendChild(logo);

    coverPhoto.appendChild(img);
    coverPhoto.appendChild(link);
    tripContainer.appendChild(coverPhoto);

    // create the details of the trip
    let detContainer = make("div",["details-container"]);
    let hThree = make("h3");
    hThree.innerHTML = tripName;
    detContainer.appendChild(hThree);

    let tripDets = make("div",["trip-details"]);
    let where = make("p");
    where.innerHTML = '<b>Where: </b>'+tripInfo.weatherData.city_name+" "+tripInfo.weatherData.country_code;
    let when = make("p");
    when.innerHTML = '<b>When: </b>'+tripInfo.stayDate.arrival;
    let weather = make("p");
    weather.innerHTML = '<b>Weather:</b><br>';
    let weatherdets = make("span");
    let weath = tripInfo.weather
    weatherdets.innerHTML =
    '<i>Temp: </i>'+ weath.low_temp+" - "+weath.high_temp
    +' (plan for '+ weath.av_temp
    +'F )<br>'+

    '<i>Humidity: </i>'+ weath.low_hum+"% - "+weath.high_hum
    +'% (plan for '+ weath.av_hum
    +'% )<br>'+

    '<i>Precipitation: </i>'+ weath.low_pop+"% - "+ weath.high_pop
    +'% (plan for '+ weath.av_pop
    +'% )<br>';

    let refresh = make("button", ["pass","refresh"]);
    refresh.innerHTML = "Update Weather Predictions";
    weatherdets.appendChild(refresh);
    weather.appendChild(weatherdets);

    tripDets.appendChild(where);
    tripDets.appendChild(when);
    tripDets.appendChild(weather);
    detContainer.appendChild(tripDets);

    // packlist
    let tripPack = make("div", ["trip-pack-list"]);
    let packlst = make("form", ["packlist"]);
    let listLab = make("label");
    listLab.for = "enter-list";
    listLab.innerHTML = "Things to bring"
    let entList = make("input");
    entList.name = "enter-list";
    entList.type = "text"

    packlst.appendChild(listLab);
    packlst.appendChild(entList);

    let list = make("ul", ["list"]);
    list.innerHTML = tripInfo.userlist;
    // list.innerHTML = tripInfo.userlist[0].slice(1,-1);

    let remove = make("button", ["remove", "pass"]);
    remove.innerHTML = "Remove All";

    let save = make("button", ["main", "save"]);
    save.innerHTML = "Save";

    tripPack.appendChild(packlst);
    tripPack.appendChild(list);
    tripPack.appendChild(remove);
    tripPack.appendChild(save);

    detContainer.appendChild(tripPack);
    tripContainer.appendChild(detContainer);

    replaceAll.appendChild(tripContainer);
  }
  }
  container.innerHTML = "";
  container.appendChild(replaceAll);
  packList();
  Client.callAPI.updateList();
  // updateWeathPred();
}

function make(el, classes){
  if (classes===undefined){
    classes=[]
  }
  const newEl = document.createElement(el);
  classes.forEach(addClass);
  function addClass(name, index){
    newEl.classList.add(name);
  }
  return newEl
}

document.getElementById("test").addEventListener("click", buildTrips)

async function updateWeathPred(){
  const refBtns = document.querySelectorAll(".refresh");
  for (let i=0;i<refBtns.length; i++){
    refBtns[i].addEventListener("click", async function(){
      const parent = event.target.closest(".details-container");
      const tripName = parent.querySelector("h3").innerHTML;
      const storage = JSON.parse(localStorage.getItem("trip")) || [];

      const city = storage[tripName].weatherData.city_name+" "+storage[tripName].weatherData.country_code;
      const validate = await Client.callAPI.validate(city);
      const newWeather = await fetchServer("/Weatherbit", validate);
      const analyzed = await analyze();

      // storage[tripName].weatherData = list;

      // localStorage.setItem("trip", JSON.stringify(storage));


    })


  }

}
