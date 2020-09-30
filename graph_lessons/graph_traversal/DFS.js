function DFS () {

    this.name=undefined; this.graph = new Graph();
    this.used=undefined; this.animations=undefined;
    this.init = function (firstTime, name, svgName, isOriented) {
         this.graph.init(svgName);
         if (firstTime==true) {
            this.name=name;
            if (isOriented==false) {
               this.graph.edgeList=[[0,1],[0,2],[0,3],[0,4],[1,2]];
               this.graph.adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]];
               this.graph.adjMatrix=[[0,1,1,1,1],
                                     [1,0,1,0,0],
                                     [1,1,0,0,0],
                                     [1,0,0,0,0],
                                     [1,0,0,0,0]];
               this.graph.isOriented=false;
               }
             else {
                this.graph.s=Snap(svgName);
                this.graph.edgeList=[[0,1],[1,0],[0,2],[2,0],[0,3],[3,0],[0,4],[4,0],[1,2],[2,1]];
                this.graph.adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]];
                this.graph.adjMatrix=[[0,1,1,1,1],
                                      [1,0,1,0,0],
                                      [1,1,0,0,0],
                                      [1,0,0,0,0],
                                      [1,0,0,0,0]];
                this.graph.isOriented=true;
                }
             }        
         this.used=[]; this.animations=[];
         drawGraph(this.graph,1,1,299,299);
         };
    
    this.start = function () {
         draw(this.graph,false);
         
         this.graph.minas=[];
         this.used=[];
         for (var i=0; i<this.graph.n; i++) {
             this.used[i]=0;
             }
         this.animations=[];
         this.animations.push([[0,0,"red","Започваме обхождането от връх номер 1."]]);
         this.dfs(0);
         var animFuncs=[];
         for (i=this.animations.length-1; i>=0; i--) {
             animFuncs[i] = {
                index: i,
                graph: this.graph,
                name: this.name,
                animations: this.animations,
                func: function () {
                         var i=this.index,curAnim,animLen=this.animations[i].length;
                         for (var j=0; j<animLen; j++) {
                             curAnim=this.animations[i][j];
                             if (curAnim[0]==0) {
                                this.graph.verCircles[curAnim[1]].isLast=(j==animLen-1);
                                this.graph.verCircles[curAnim[1]].graph=this.graph;
                                this.graph.verCircles[curAnim[1]].name=this.name;
                                this.graph.verCircles[curAnim[1]].animations=this.animations;
                                $(this.name+" .anim-text").text(curAnim[3]);
                                this.graph.verCircles[curAnim[1]].animate({fill: curAnim[2]},2000,function () {
                                    if (this.isLast==true) {
                                       if (i!=this.animations.length-1) animFuncs[i+1].func();
                                       else { $(this.name+" .pause").css("display","none");
                                              $(this.name+" .anim-text").text("");
                                              this.graph.drawEdges(1,1,299,299); }
                                       }
                                    });
                                }
                             else if (curAnim[0]==2) {
                                     this.graph.textCircles[curAnim[1]].isLast=(j==animLen-1);
                                     this.graph.textCircles[curAnim[1]].graph=this.graph;
                                     this.graph.textCircles[curAnim[1]].name=this.name;
                                     this.graph.textCircles[curAnim[1]].animations=this.animations;
                                     $(this.name+" .anim-text").text(curAnim[3]);
                                     this.graph.textCircles[curAnim[1]].animate({fill: curAnim[2]},2000,function () {
                                         if (this.isLast==true) {
                                            if (i!=this.animations.length-1) animFuncs[i+1].func();
                                            else { $(this.name+" .pause").css("display","none");
                                                   $(this.name+" .anim-text").text("");
                                                   this.graph.drawEdges(1,1,299,299); }
                                            }
                                         });
                                     }
                             else { var stx,sty,endx,endy;
                                    stx=this.graph.verCoord[curAnim[1]][0]+vertexRad;
                                    sty=this.graph.verCoord[curAnim[1]][1]+vertexRad;
                                    endx=this.graph.verCoord[curAnim[2]][0]+vertexRad;
                                    endy=this.graph.verCoord[curAnim[2]][1]+vertexRad;
                                    var path="M "+stx.toString()+","+sty.toString()+" L"+endx.toString()+","+endy.toString();
                                    var length=Snap.path.getTotalLength(path);
                                    var lineDraw=this.graph.s.path(path);
                                    lineDraw.attr({fill: "none", stroke: "red", "stroke-width": 4,
                                                   "stroke-dasharray": length.toString()+" "+length.toString(),
                                                   "stroke-dashoffset": length, "stroke-linecap": "round",
                                                   "stroke-linejoin": "round", "stroke-miterlimit": 10});
                                    this.graph.s.append(this.graph.circles[curAnim[1]]);
                                    this.graph.s.append(this.graph.circles[curAnim[2]]);
                                    lineDraw.isLast=(j==animLen-1);
                                    lineDraw.graph=this.graph;
                                    lineDraw.name=this.name;
                                    lineDraw.animations=this.animations;
                                    $(this.name+" .anim-text").text(curAnim[3]);
                                    this.graph.minas.push([Snap.animate(length,0, function (value) {
                                        lineDraw.attr({strokeDashoffset: value});
                                    },2000, function () {
                                        if (lineDraw.isLast==true) {
                                           if (i!=lineDraw.animations.length-1) animFuncs[i+1].func();
                                           else { $(lineDraw.name+" .pause").css("display","none");
                                                  $(lineDraw.name+" .anim-text").text("");
                                                  lineDraw.graph.drawEdges(1,1,299,299); }
                                           }
                                        lineDraw.remove();
                                    }),lineDraw]);
                                    lineDraw.stop();
                                    }
                             }
                        }
                }
             }
        animFuncs[0].func();
        };
    
    this.dfs = function (vr) {
         var verColour=0,text;
         this.used[vr]=1;
         for (var i=0; i<this.graph.adjList[vr].length; i++) {
             if (this.used[this.graph.adjList[vr][i]]==0) {
                if (verColour!=0) {
                   text="Връщаме се на връх "+(vr+1)+".";
                   this.animations.push([[0,vr,"red",text],[2,vr,"black",text]]);
                   verColour=0;
                   }
                text="Напускаме връх "+(vr+1)+" и отиваме в "+(this.graph.adjList[vr][i]+1)+".";
                this.animations.push([[0,vr,"grey",text],[1,vr,this.graph.adjList[vr][i]],[2,vr,"white",text]]);
                text="Сега сме във връх "+(this.graph.adjList[vr][i]+1)+".";
                this.animations.push([[0,this.graph.adjList[vr][i],"red",text],[2,this.graph.adjList[vr][i],"black",text]]);
                this.dfs(this.graph.adjList[vr][i]);
                verColour=1;
                }
             else { if (verColour!=0) {
                       text="Връщаме се на връх "+(vr+1)+".";
                       this.animations.push([[0,vr,"red",text],[2,vr,"black",text]]);
                       verColour=0;
                       }
                    text="Oказва се, че съседът с номер "+(this.graph.adjList[vr][i]+1)+" вече е обходен.";
                    this.animations.push([[1,vr,this.graph.adjList[vr][i],text]]); }
             }
        if (verColour==1) {
           text="Връщаме се на връх "+(vr+1)+" и се оказва, че сме проверили всички негови съседи.";
           this.animations.push([[0,vr,"red",text],[2,vr,"black",text]]);
           }
        text="Вече проверихме всички съседи на връх "+(vr+1)+" и го напускаме.";
        this.animations.push([[0,vr,"grey",text],[2,vr,"white",text]]);
        };
    
    this.clear = function (remove) {
         if (this.graph.minas!==undefined) {
            for (var i=0; i<this.graph.minas.length; i++) {
                this.graph.minas[i][0].stop();
                this.graph.minas[i][1].remove();
                }
            }
         this.graph.s.selectAll("*").forEach(function (elem) {
             if (elem.inAnim().length!=0) elem.inAnim()[0].mina.s=0;
             elem.stop();
             });
         if (remove==true) this.graph.s.selectAll("*").remove();
         }
        
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
        var svgString=(new XMLSerializer()).serializeToString(this.svgSave);
        this.svgSave.style.display="none";
        var image = new Image();
        image.src="data:image/svg+xml; charset=utf8, "+encodeURIComponent(svgString);
        image.onload = function () {
            context.drawImage(image,0,0);
            var imageURI=canvas.toDataURL('image/png').replace('image/png','image/octet-stream');
            var event = new MouseEvent('click',{view: window, bubbles: false, cancelable: true});
            var temp=document.createElement('a');
            temp.setAttribute('download','graph.png');
            temp.setAttribute('href',imageURI);
            temp.setAttribute('target','_blank');
            temp.dispatchEvent(event);
            $(name+" .svg-save").empty();
            }
        }
}