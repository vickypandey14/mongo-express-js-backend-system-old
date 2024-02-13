setInterval(function(){
    var d=new Date();
    document.querySelector("#time").innerHTML=`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
},1000);