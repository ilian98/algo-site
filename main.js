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
         this.pauseButton.style.display="none";
         this.animText=document.querySelector(name+" .anim-text");
         this.animText.innerHTML="";
         this.slider=document.querySelector(name+" .range");
         this.output=document.querySelector(name+" .slider-value");
         this.slider.value=5;
         this.output.innerHTML=this.slider.value;
    
         this.DFSObject = new DFS ();
         this.DFSObject.graph.n=5;
         this.DFSObject.init(true,name,name+" .graph",isOriented);
    
         this.slider.DFSObject=this.DFSObject;
         this.slider.output=this.output;
         this.slider.pauseButton=this.pauseButton;
         this.slider.animText=this.animText;
         this.slider.oninput = function() {
            this.DFSObject.clear(true);
            this.output.innerHTML=this.value;
            this.DFSObject.graph.n=this.value;
            this.DFSObject.init(false);
            this.pauseButton.style.display="none";
            this.animText.innerHTML="";
            }
         
         this.startButton.DFSObject=this.DFSObject;
         this.startButton.pause=this.pauseButton;
         
         this.startButton.onclick = function () {
             this.DFSObject.clear(false);
             this.DFSObject.start(false);
             this.pause.style.display="block";
             this.pause.DFSObject=this.DFSObject;
             this.pause.flagPause=false; this.pause.innerText="Пауза";
             this.pause.onclick = function () {
                 if (this.flagPause==false) {
                    this.flagPause=true; this.innerText="Пусни";
                    this.DFSObject.graph.s.selectAll("*").forEach(function (element) {
                        if (element.inAnim().length!=0) element.inAnim()[0].mina.pause();
                        });
                    }
                 else { this.flagPause=false; this.innerText="Пaуза";
                        this.DFSObject.graph.s.selectAll("*").forEach(function (element) {
                            if (element.inAnim().length!=0) element.inAnim()[0].mina.resume();
                            }); }
                 }
             }
}
function initExamples () {
         this.example1=undefined;
         this.init = function () {
         /*
         if (this.example1!=undefined) {
            this.example1.DFSObject.graph.s.selectAll("*").forEach(function (element) {
                element.stop();
                });
            }
         if (this.example2!=undefined) {
            this.example2.DFSObject.graph.s.selectAll("*").forEach(function (element) {
                element.stop();
                });
            }*/
         this.example1 = new graphExample (".graphExample1",false);
         var example2 = new graphExample (".graphExample2",true);
         }
}