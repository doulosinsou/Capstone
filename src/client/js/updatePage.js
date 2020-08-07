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

    const lis = form[i].parentNode.querySelectorAll("ul li");
      for (let b=0; b<lis.length; b++){
        lis[b].addEventListener("click", function(){
          lis[b].remove();
        })
      }
  })

  form[i].parentNode.querySelector("button").addEventListener("click", function(){
    event.target.parentNode.querySelector("ul").innerHTML="";
  })
}
