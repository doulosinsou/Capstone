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
    entry.value = "";
  })
  const lis = form[i].parentNode.querySelectorAll("ul li");
    for (let b=0; b<lis.length; b++){
      lis[b].addEventListener("click", function(){
        lis[b].remove();
      })
    }

  form[i].parentNode.querySelector("button.remove").addEventListener("click", function(){
    event.target.parentNode.querySelector("ul").innerHTML="";
  })
}

export async function dataCanvas(pixdata){

  const random = Math.floor(Math.random()*4);
  const picture = pixdata.hits[random];
  const preview = picture.webformatURL;
  console.log(picture);

  const show = document.createElement("img");
  show.src = preview;
  show.crossOrigin = "anonymous";

  const canvas = document.createElement('canvas');
  const context = canvas.getContext("2d");

  const pixwidth = picture.webformatWidth;
  const pixheight = picture.webformatHeight;
  canvas.width = pixwidth;
  canvas.height = pixheight;


  const blarg = new Promise(function(resolve, reject){
    show.addEventListener("load", function(){
    let imgDataUrl;
    context.drawImage(show, 0, 0, pixwidth, pixheight);
    imgDataUrl = canvas.toDataURL("image/jpg", .8);
    // console.log(imgDataUrl);

    const newdata = {"src": imgDataUrl, "tag":picture.tags}
    resolve(newdata);
  })
  });
  return blarg;
}

export function buildTrips(){

  const container = document.getElementById("trips");
  const replaceAll = document.createDocumentFragment();

  let link = document.createElement("a")
  link.className = "pix-credit";
  link.href = "https://pixabay.com";
  let logo = document.createElement("img");
  logo.src="./img/pixabay_logo.png";
  logo.alt="pixabay logo";
  link.appendChild(logo);

  const records = JSON.parse(localStorage.getItem("trip"));
  console.log(records)

  const entries = Object.entries(records);
  entries.reverse();
    // console.log(entries);
  for (let i=0; i<entries.length;i++){
    // console.log("trip name is: "+entries[i][0]);
    // console.log("trip userlist is: "+entries[i][1].userlist);

    let trip = entries[i];
    let tripName = trip[0];
    let tripInfo = trip[1];
    if (trip !== "undefined"){
    console.log(tripName);

    let tripContainer = make("div", ["trip-container"]);

    // create the coverphoto of the trip
    let coverPhoto = make("div",["cover-photo"]);
    let img = make("img");
    img.src= tripInfo.picture.src;
    img.alt= tripInfo.picture.tag;
    console.log(img);

    // coverPhoto.appendChild(img);
    // coverPhoto.appendChild(link);
    // tripContainer.appendChild(coverPhoto);

    // create the details of the trip
    // let detContainer = document.createElement("div");
    // detContainer.className = "details-container";
    //
    // let hThree = make("h3")
    // detContainer.appendChild(hThree);


  }
  }

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
