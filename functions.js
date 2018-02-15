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
function slider () {
         var slider=document.getElementById("range");
         var output=document.getElementById("sliderValue");
         output.innerHTML=slider.value;
         slider.oninput=function() {
            output.innerHTML=this.value;
            eraseGraph();
            n=this.value;
            edgeList=[]; adjList=[]; adjMatrix=[];
            for (var i=0; i<n; i++) {
                adjList[i]=[]; adjMatrix[i]=[];
                for (var j=0; j<n; j++) {
                    adjMatrix[i][j]=0;
                    }
                }
            drawGraph(1,1,299,299);
            }
}