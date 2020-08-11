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
  const preview = await picture.webformatURL;
  // const preview = "../src/client/img/sunset.jpg"
  console.log(picture);

  const show = document.querySelector(".cover-photo img");
  show.src = preview;
  show.crossOrigin = "anonymous";

  const canvas = document.createElement('canvas');
  const context = canvas.getContext("2d");

  const pixwidth = picture.webformatWidth;
  const pixheight = picture.webformatHeight;
  canvas.width = pixwidth;
  canvas.height = pixheight;

  show.addEventListener("load", function(){
    context.drawImage(show, 0, 0, pixwidth, pixheight);
    const imgDataUrl = canvas.toDataURL("image/jpg", .8);
    show.src = imgDataUrl;
    show.alt = picture.tags;
  });
}
