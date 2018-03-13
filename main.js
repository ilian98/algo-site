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

function graphExample (name, isOriented) {
         this.svgElement=document.querySelector(name+" .graph");
         this.svgElement.blockScroll=false;
         this.svgElement.ontouchstart = function (event) {
             this.blockScroll=true;
             };
         this.svgElement.ontouchend = function () {
             this.blockScroll=false;
             };
         this.svgElement.ontouchmove = function (event) {
             if (this.blockScroll==true) event.preventDefault();
             };
    
         this.startButton=document.querySelector(name+" .start");
         this.pauseButton=document.querySelector(name+" .pause");
         this.slider=document.querySelector(name+" .range");
         this.output=document.querySelector(name+" .slider-value");
         this.output.innerHTML=this.slider.value;
    
         this.DFSObject = new DFS ();
         this.DFSObject.graph.n=5;
         this.DFSObject.init(true,name,name+" .graph",isOriented);
    
         this.slider.DFSObject=this.DFSObject;
         this.slider.output=this.output;
         this.slider.oninput = function() {
            this.DFSObject.clear(true);
            this.output.innerHTML=this.value;
            this.DFSObject.graph.n=this.value;
            this.DFSObject.init(false);
            }
         
         this.startButton.DFSObject=this.DFSObject;
         this.startButton.onclick = function () {
             this.DFSObject.clear(false);
             this.DFSObject.start(false);
         };
}
function initExamples () {
         var example1 = new graphExample (".graphExample1",false);
         var example2 = new graphExample (".graphExample2",true);
}