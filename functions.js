function flagsPosition () {
         $("#flags").css({top: $("nav").height()+parseInt($("nav").css("paddingBottom"))+parseInt($("nav").css("paddingTop")),
                          width: $("nav").width()+parseInt($("nav").css("paddingRight"))+parseInt($("nav").css("paddingLeft"))});
}
function toggleText (name) {
         if (cur===null) return 0;
         var cur=document.getElementById(name);
         if (cur.style.display==="block") cur.style.display="none";
         else cur.style.display="block";
         flagsPosition();
}
function sliderUnoriented () {
         var slider=document.getElementById("rangeUnoriented");
         var output=document.getElementById("sliderValueUnoriented");
         output.innerHTML=slider.value;
         var DFSObject = new DFS ();
         DFSObject.n=5;
         DFSObject.init("graphUnoriented");
         slider.oninput=function() {
            DFSObject.clear(true);
            output.innerHTML=this.value;
            DFSObject.n=this.value;
            DFSObject.init();
            }
        $("#startUnoriented").on("click",function () {
            DFSObject.clear(false);
            DFSObject.start();
        });
}
function sliderOriented () {
         var slider=document.getElementById("rangeOriented");
         var output=document.getElementById("sliderValueOriented");
         output.innerHTML=slider.value;
         var DFSObject = new DFS ();
         DFSObject.n=5;
         DFSObject.init("graphOriented");
         slider.oninput=function() {
            DFSObject.clear(true);
            output.innerHTML=this.value;
            DFSObject.n=this.value;
            DFSObject.init();
            }
        $("#startOriented").on("click",function () {
            DFSObject.clear(false);
            DFSObject.start();
        });
}