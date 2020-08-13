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
  const entries = Object.entries(records)
  console.log(entries);
  for (let i=entries.length;i>0;i--){
    let trip = entries[i];
    if (trip !== "undefined"){
    console.log(trip);
    
    let tripContainer = document.createElement("div");
    tripContainer.className = "trip-container";

    // create the coverphoto of the trip
    // let coverPhoto = document.createElement("div");
    // coverPhoto.className = "cover-photo";
    // let img = document.createElement("img");
    // img.src= trip["picture"].src;
    // img.alt= trip["picture"].tag;

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

function make(something){
  return document.createElement(something);
}

document.getElementById("test").addEventListener("click", buildTrips)
