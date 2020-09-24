function toggleText (name) {
         if (cur===null) return 0;
         var cur=document.getElementById(name);
         if (cur.style.display==="block") cur.style.display="none";
         else cur.style.display="block";
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
    this.saveButton=document.querySelector(name+" .save");
    
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
                if (this.DFSObject.graph.minas!==undefined) {
                    for (var i=0; i<this.DFSObject.graph.minas.length; i++) {
                        this.DFSObject.graph.minas[i][0].pause();
                        }
                    }
                this.DFSObject.graph.s.selectAll("*").forEach(function (element) {
                    if (element.inAnim().length!=0) element.inAnim()[0].mina.pause();
                    });
                }
            else {
                this.flagPause=false; this.innerText="Пaуза";
                if (this.DFSObject.graph.minas!==undefined) {
                    for (var i=0; i<this.DFSObject.graph.minas.length; i++) {
                        this.DFSObject.graph.minas[i][0].resume();
                        }
                    }
                this.DFSObject.graph.s.selectAll("*").forEach(function (element) {
                    if (element.inAnim().length!=0) element.inAnim()[0].mina.resume();
                    });
                }
            }
        }
    
    this.saveButton.DFSObject=this.DFSObject;
    this.saveButton.canvas=document.querySelector(name+" .canvas-save");
    this.saveButton.canvas.style.display="none";
    this.saveButton.svgSave=document.querySelector(name+" .svg-save");
    this.saveButton.svgSave.style.display="none";
    this.saveButton.onclick = function () {
        var canvas=this.canvas;
        var context=canvas.getContext('2d');
        var svg=document.querySelector(this.DFSObject.graph.svgName);
        this.svgSave.setAttribute("width",svg.getBoundingClientRect().width);
        this.svgSave.setAttribute("height",svg.getBoundingClientRect().height);
        $(name+' .graph').clone().appendTo($(name+" .svg-save"));
        canvas.width=svg.getBoundingClientRect().width;
        canvas.height=svg.getBoundingClientRect().height;
        
        this.svgSave.style.display="";
        var data=(new XMLSerializer()).serializeToString(this.svgSave);
        var DOMURL=window.URL || window.webkitURL || window;
        var image = new Image();
        var svgBlob = new Blob([data],{type: 'image/svg+xml;charset=utf-8'});
        var url=DOMURL.createObjectURL(svgBlob);
        image.src=url;
        image.svgSave=this.svgSave;
        image.onload = function () {
            this.svgSave.style.display="none";
            context.drawImage(image,0,0);
            DOMURL.revokeObjectURL(url);
            var imageURL=canvas.toDataURL('image/png').replace('image/png','image/octet-stream');
            var event = new MouseEvent('click',{view: window, bubbles: false, cancelable: true});
            var temp=document.createElement('a');
            temp.setAttribute('download','graph.png');
            temp.setAttribute('href',imageURL);
            temp.setAttribute('target','_blank');
            temp.dispatchEvent(event);
            $(name+" .svg-save").empty();
            }
        }
}
function initExamples (page) {
    if (page==0) {
        var example1 = new Graph ();
        example1.n=5; example1.isOriented=true;
        example1.init(".graphExample1");
        example1.edgeList=[[0,1],[0,2],[0,3],[1,4],[2,4]];
        example1.adjList=[[1,2,3],[4],[4],[],[]];
        example1.adjMatrix=[[0,1,1,1,0],
                            [0,0,0,0,1],
                            [0,0,0,0,1],
                            [0,0,0,0,0],
                            [0,0,0,0,0]];
        drawGraph(example1,1,1,299,299);

        var example2 = new Graph ();
        example2.n=5; example2.isOriented=false;
        example2.init(".graphExample2");
        example2.edgeList=[[0,1],[0,2],[0,3],[1,4],[2,4]];
        example2.adjList=[[1,2,3],[0,4],[0,4],[0],[1,2]];
        example2.adjMatrix=[[0,1,1,1,0],
                            [1,0,0,0,1],
                            [1,0,0,0,1],
                            [1,0,0,0,0],
                            [0,1,1,0,0]];
        drawGraph(example2,1,1,299,299);
        }
    if (page==1) {
        var example1 = new graphExample (".graphExample1",false);
        var example2 = new graphExample (".graphExample2",true);
        }
}