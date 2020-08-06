export async function search(){
  event.preventDefault()
    const userInput = document.getElementById("location").value;
    validate(userInput)
    .then( function (res){
      if(res){
        console.log("validated response is:"+res)
      fetchServer("/geoname", res)
      } else{
      console.log("validator failed");
      }
    })
}

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

const fetchServer = async (path, data)=>{
  const query = "?loc=";
  const fordevserver = "http://localhost:3003";
  const call = await fetch(fordevserver+path+query+data);
  try {
    const response = await call.json()
    console.log(response)
    if (response !== "Error"){
      refine(response)
    }else{
      relocate("error")
    }
  } catch (error){
    console.log(error);
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
  for (let i=0;i<options.length;i++){
    let cityname = options[i].toponymName;
    if (cityname.length >15){
      cityname = cityname.substring(0,15)+"...";
    }
    let country = options[i].countryName;
    let state = options[i].adminName1;
    let coor = options[i].lat + "&" + options[i].lng;

    let option = document.createElement('option');
    option.innerHTML = cityname+" "+state+", "+country;
    option.value = coor;

    select.appendChild(option)
  }
  form.innerHTML="<p>Refine your search</p>";
  form.appendChild(select);
}
