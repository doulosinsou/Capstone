window.addEventListener("load", function() {

  buildTrips(); //when page is loaded, give user all his logged trips
  packList(); //listen for changes to to-bring lists
  cycle(); //resets the new trip planning process
});

document.getElementById('planBtn').addEventListener("click", function() {
  resetForm();
  next("where");

});

//listen for additions to to-bring list
function packList() {
  const form = document.querySelectorAll("form.packlist");
  for (let i = 0; i < form.length; i++) {
    form[i].addEventListener("submit", function() {
      event.preventDefault();
      event.stopImmediatePropagation();
      const entry = form[i].querySelector("input[name='enter-list']");
      const list = form[i].parentNode.querySelector("ul");
      const new_item = document.createElement("li");
      new_item.innerHTML = entry.value;
      list.appendChild(new_item);
      entry.value = "";
      del();
    });

    const del = () => {
      const lis = form[i].parentNode.querySelectorAll("ul li");
      for (let b = 0; b < lis.length; b++) {
        lis[b].addEventListener("click", function() {
          lis[b].remove();
        });
      }
    };

    form[i].parentNode.querySelector("button.remove").addEventListener("click", function() {
      event.target.parentNode.querySelector("ul").innerHTML = "";
    });
  }
};

//build the DOM for all trips in the localstorage
export async function buildTrips() {
  const container = document.getElementById("trips");
  const replaceAll = document.createDocumentFragment();

  const records = JSON.parse(localStorage.getItem("trip")) || [];
  const entries = Object.entries(records);

  //order storage records by beginning of trip
  const sort = entries.sort((a, b) => {
    const aDate = a[1].stayDate.arrival;
    const bDate = b[1].stayDate.arrival;
    if (aDate > bDate) {
      return 1;
    } else {
      return -1;
    }
  });
  console.log(sort);

  //iterate through each storage record
  for (let i = 0; i < entries.length; i++) {
    let trip = entries[i];
    let tripName = trip[0];
    let tripInfo = trip[1];
    if (trip !== "undefined") {
      let storedPicture = await Client.callAPI.fetchServer("/picture", tripInfo.picture);

      let tripContainer = make("div", ["trip-container"]);

      // create the coverphoto of the trip
      let coverPhoto = make("div", ["cover-photo"]);
      let img = make("img");
      img.src = storedPicture.dataURL;
      img.alt = storedPicture.tags;

      let link = make("a", ["pix-credit"]);
      link.href = "https://pixabay.com";
      let logo = make("img");
      logo.src = "./img/pixabay_logo.png";
      logo.alt = "pixabay logo";
      link.appendChild(logo);

      coverPhoto.appendChild(img);
      coverPhoto.appendChild(link);
      tripContainer.appendChild(coverPhoto);

      // create the details of the trip
      let detContainer = make("div", ["details-container"]);
      let hThree = make("h3");
      hThree.innerHTML = tripName;
      detContainer.appendChild(hThree);

      let tripDets = make("div", ["trip-details"]);
      let where = make("p");
      where.innerHTML = '<b>Where: </b>' + tripInfo.weatherData.city_name + " " + tripInfo.weatherData.country_code;
      let when = make("p");
      when.innerHTML = '<b>When: </b>' + tripInfo.stayDate.arrival;
      let weather = make("p");
      weather.innerHTML = '<b>Weather:</b><br>';
      let weatherdets = make("span");

      //check if weatherdata is available for date of trip
      const time = new Date(tripInfo.stayDate.arrival).getTime();
      const stay = tripInfo.stayDate.stay * 86400000;
      const now = new Date(tripInfo.stayDate.today).getTime();
      const arrival = Math.ceil((time - now) / 86400000);
      const depart = Math.ceil(((time + stay) - now) / 86400000);

      if (arrival > 14) {
        weatherdets.innerHTML = "Check Weather again within 2 weeks of the trip<br>";
      } else {
        let weath = tripInfo.weather
        weatherdets.innerHTML =
          '<i>Temp: </i>' + weath.low_temp + " - " + weath.high_temp +
          ' (plan for ' + weath.av_temp +
          'F )<br>' +

          '<i>Humidity: </i>' + weath.low_hum + "% - " + weath.high_hum +
          '% (plan for ' + weath.av_hum +
          '% )<br>' +

          '<i>Precipitation: </i>' + weath.low_pop + "% - " + weath.high_pop +
          '% (plan for ' + weath.av_pop +
          '% )<br>';
      }

      let refresh = make("button", ["pass", "refresh"]);
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

      let remove = make("button", ["remove", "pass"]);
      remove.innerHTML = "Remove All";

      let save = make("button", ["main", "save"]);
      save.innerHTML = "Save";

      let delTrip = make("button", ["delete"]);
      delTrip.innerHTML = "Delete Trip";


      tripPack.appendChild(packlst);
      tripPack.appendChild(list);
      tripPack.appendChild(remove);
      tripPack.appendChild(save);
      tripPack.appendChild(delTrip);

      detContainer.appendChild(tripPack);
      tripContainer.appendChild(detContainer);

      replaceAll.appendChild(tripContainer);
    }
  }
  container.innerHTML = "";
  container.appendChild(replaceAll);
  packList();
  Client.callAPI.updateList();
  updateWeathPred();
  deleteTrip();
}

//helper for making DOM elements
function make(el, classes) {
  if (classes === undefined) {
    classes = []
  }
  const newEl = document.createElement(el);
  classes.forEach(addClass);

  function addClass(name, index) {
    newEl.classList.add(name);
  }

  return newEl
}

//automatically initiates the new Trip process, but provides all the data from the localStorage. The effect is to refresh the current weather predictions for the trip
function updateWeathPred() {
  const refBtns = document.querySelectorAll(".refresh");

  //reset form values
  const date = document.getElementById("date");
  const length = document.getElementById('length');
  const list = document.getElementById('list').querySelector('ul.list');
  const location = document.getElementById('location');
  const nameTrip = document.getElementById('nameTrip');

  for (let i = 0; i < refBtns.length; i++) {
    refBtns[i].addEventListener("click", async function() {
      const parent = event.target.closest(".details-container");
      const tripName = parent.querySelector("h3").innerHTML;
      const storage = JSON.parse(localStorage.getItem("trip"))[tripName];

      const city = storage.weatherData.city_name + " " + storage.weatherData.country_code;

      location.value = city;
      date.value = storage.stayDate.arrival;
      length.value = storage.stayDate.stay;
      list.innerHTML = storage.userlist;
      nameTrip.value = tripName;

      const latLon = "&lat=" + storage.weatherData.lat + "&lon=" + storage.weatherData.lon;

      Client.callAPI.weatherbit(latLon)
        .then(() => {
          Client.callAPI.subWhen()
          Client.callAPI.prepare()
          Client.callAPI.finalize()
          console.log("updateWeatherPrediction called");

        })
    })
  }

};

//allow user to delete the trip from localstorage
function deleteTrip() {
  const trips = document.querySelectorAll(".delete");
  for (let i = 0; i < trips.length; i++) {
    trips[i].addEventListener("click", function() {
      const parent = event.target.closest(".details-container");
      const tripName = parent.querySelector("h3").innerHTML;

      const storage = JSON.parse(localStorage.getItem("trip"));
      delete storage[tripName];
      localStorage.setItem("trip", JSON.stringify(storage));
      buildTrips();

    })
  }
}

//starts the new Trip
function cycle() {
  const firstCover = document.querySelector(".cover");
  firstCover.addEventListener("click", function() {
    next("where");
  })
};

//reveals each section of building the new Trip
export function next(sec) {
  const section = document.getElementById(sec).querySelector(".cover");
  section.classList.add("fade");
  setTimeout(function() {
      section.style.display = "none";
    },
    1500
  );
};

//Starts the new trip process over again
function resetForm() {
  const covers = document.querySelectorAll(".cover");
  for (let i = 0; i < covers.length; i++) {
    covers[i].classList.remove("fade");
    covers[i].style.display = "flex";
  }
  cycle();
  location.hash = "#where";
}