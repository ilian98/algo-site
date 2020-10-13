function DFS () {
    
    this.name=undefined; this.graph = new Graph();
    this.used=undefined; this.animations=undefined;
    this.startButton=undefined; this.pauseButton=undefined;
    this.animText=undefined; this.animFuncs=undefined;
    this.currAnimation=undefined;
    this.speed=undefined;
    this.init = function (firstTime, name, svgName, isOriented) {
        var graph=this.graph;
        graph.init(svgName);
        if (firstTime==true) {
            this.name=name;
            if (isOriented==false) {
                graph.edgeList=[[0,1],[0,2],[0,3],[0,4],[1,2]];
                graph.adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]];
                graph.adjMatrix=[[0,1,1,1,1],
                                 [1,0,1,0,0],
                                 [1,1,0,0,0],
                                 [1,0,0,0,0],
                                 [1,0,0,0,0]];
                graph.isOriented=false;
                }
            else {
                graph.s=Snap(svgName);
                graph.edgeList=[[0,1],[1,0],[0,2],[2,0],[0,3],[3,0],[0,4],[4,0],[1,2],[2,1]];
                graph.adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]];
                graph.adjMatrix=[[0,1,1,1,1],
                                 [1,0,1,0,0],
                                 [1,1,0,0,0],
                                 [1,0,0,0,0],
                                 [1,0,0,0,0]];
                graph.isOriented=true;
                }
            }
        this.used=[]; this.animations=[];
        this.speed=2000;
        drawGraph(graph,1,1,299,299);
        };
    
    this.start = function () {
        var graph = this.graph;
        var animations = this.animations = [];
        var startButton = this.startButton;
        var pauseButton = this.pauseButton;
        var animText = this.animText;
        var DFSObject = this;
        var speed = parseInt(this.speed);
        draw(graph,false);
        
        graph.minas=[];
        this.used=[];
        for (var i=0; i<graph.n; i++) {
            this.used[i]=0;
            }
        animations.push([[0,0,"red","Започваме обхождането от връх номер 1."]]);
        this.dfs(0);
        var animFuncs = this.animFuncs = [];
        for (i=animations.length-1; i>=0; i--) {
            animFuncs[i] = {
                index: i,
                func: function () {
                    var i=this.index,curAnim,animLen=animations[i].length;
                    DFSObject.currAnimation = i;
                    for (var j=0; j<animLen; j++) {
                        curAnim=animations[i][j];
                        if (curAnim[0]==0) {
                            graph.verCircles[curAnim[1]].isLast=(j==animLen-1);
                            animText.innerText=curAnim[3];
                            graph.verCircles[curAnim[1]].animate({fill: curAnim[2]},speed,function () {
                                if (this.isLast==true) {
                                    if (i!=animations.length-1) animFuncs[i+1].func();
                                    }
                                });
                            }
                        else if (curAnim[0]==2) {
                            graph.textCircles[curAnim[1]].isLast=(j==animLen-1);
                            animText.innerText=curAnim[3];
                            graph.textCircles[curAnim[1]].animate({fill: curAnim[2]},speed,function () {
                                if (this.isLast==true) {
                                    if (i!=animations.length-1) animFuncs[i+1].func();
                                    }
                                });
                            }
                        else {
                            var stx,sty,endx,endy;
                            stx=graph.verCoord[curAnim[1]][0]+vertexRad;
                            sty=graph.verCoord[curAnim[1]][1]+vertexRad;
                            endx=graph.verCoord[curAnim[2]][0]+vertexRad;
                            endy=graph.verCoord[curAnim[2]][1]+vertexRad;
                            var path="M "+stx.toString()+","+sty.toString()+" L"+endx.toString()+","+endy.toString();
                            var length=Snap.path.getTotalLength(path);
                            var lineDraw=graph.s.path(path);
                            lineDraw.attr({fill: "none", stroke: "red", "stroke-width": 4,
                                           "stroke-dasharray": length.toString()+" "+length.toString(),
                                           "stroke-dashoffset": length, "stroke-linecap": "round",
                                           "stroke-linejoin": "round", "stroke-miterlimit": 10});
                            graph.s.append(graph.circles[curAnim[1]]);
                            graph.s.append(graph.circles[curAnim[2]]);
                            lineDraw.isLast=(j==animLen-1);
                            animText.innerText=curAnim[3];
                            graph.minas.push([Snap.animate(length,0,
                                function (value) {
                                    lineDraw.attr({strokeDashoffset: value});
                                    },speed,
                                function () {
                                    if (lineDraw.isLast==true) {
                                        if (i!=animations.length-1) animFuncs[i+1].func();
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
        var graph=this.graph;
        var animations=this.animations;
        var verColour=0,text;
        this.used[vr]=1;
        for (var i=0; i<graph.adjList[vr].length; i++) {
            if (this.used[graph.adjList[vr][i]]==0) {
                if (verColour!=0) {
                    text="Връщаме се на връх "+(vr+1)+".";
                    animations.push([[0,vr,"red",text],[2,vr,"black",text]]);
                    verColour=0;
                    }
                text="Напускаме връх "+(vr+1)+" и отиваме в "+(graph.adjList[vr][i]+1)+".";
                animations.push([[0,vr,"grey",text],[1,vr,graph.adjList[vr][i]],[2,vr,"white",text]]);
                text="Сега сме във връх "+(graph.adjList[vr][i]+1)+".";
                animations.push([[0,graph.adjList[vr][i],"red",text],[2,graph.adjList[vr][i],"black",text]]);
                this.dfs(graph.adjList[vr][i]);
                verColour=1;
                }
            else {
                if (verColour!=0) {
                    text="Връщаме се на връх "+(vr+1)+".";
                    animations.push([[0,vr,"red",text],[2,vr,"black",text]]);
                    verColour=0;
                    }
                text="Oказва се, че съседът с номер "+(graph.adjList[vr][i]+1)+" вече е обходен.";
                animations.push([[1,vr,graph.adjList[vr][i],text]]);
                }
            }
        if (verColour==1) {
            text="Връщаме се на връх "+(vr+1)+" и се оказва, че сме проверили всички негови съседи.";
            animations.push([[0,vr,"red",text],[2,vr,"black",text]]);
            }
        text="Вече проверихме всички съседи на връх "+(vr+1)+" и го напускаме.";
        animations.push([[0,vr,"black",text],[2,vr,"white",text]]);
        };
    
    this.clearGraph = function (remove) {
        var graph=this.graph;
        if (graph.minas!==undefined) {
            for (var i=0; i<graph.minas.length; i++) {
                graph.minas[i][0].stop();
                graph.minas[i][1].remove();
                }
            }
        graph.s.selectAll("*").forEach(function (elem) {
            if (elem.inAnim().length!=0) elem.inAnim()[0].mina.s=0;
            elem.stop();
            });
        if (remove==true) graph.s.selectAll("*").remove();
        }
    
    this.clear = function () {
        this.startButton.flag=false; this.startButton.innerText="Старт!";
        this.pauseButton.style.display="none";
        this.previousButton.style.display="none"; this.nextButton.style.display="none";
        this.animText.innerText="";
        this.clearGraph(true);
        this.graph.drawEdges(1,1,299,299);
    }
        
}

function dfsUntilStep (graph, used, vr, curStep, step) {
    if (step==0) return 0;
    var verColour=0;
    used[vr]=1;
    for (var i=0; i<graph.adjList[vr].length; i++) {
        if (used[graph.adjList[vr][i]]==0) {
            if (verColour!=0) {
                graph.verCircles[vr].attr("fill","red");
                graph.textCircles[vr].attr("fill","black");
                curStep++;
                if (curStep==step) return curStep;
                verColour=0;
                }
            graph.verCircles[vr].attr("fill","grey");
            graph.textCircles[vr].attr("fill","white");
            curStep++;
            if (curStep==step) return curStep;
            
            graph.verCircles[graph.adjList[vr][i]].attr("fill","red");
            graph.textCircles[graph.adjList[vr][i]].attr("fill","black");
            curStep++;
            if (curStep==step) return curStep;
            
            curStep=dfsUntilStep(graph,used,graph.adjList[vr][i],curStep,step);
            if (curStep==step) return curStep;
            verColour=1;
            }
        else {
            if (verColour!=0) {
                graph.verCircles[vr].attr("fill","red");
                graph.textCircles[vr].attr("fill","black");
                curStep++;
                if (curStep==step) return curStep;
                verColour=0;
                }
            curStep++;
            if (curStep==step) return curStep;
            }
        }
    if (verColour==1) {
        graph.verCircles[vr].attr("fill","red");
        graph.textCircles[vr].attr("fill","black");
        curStep++;
        if (curStep==step) return curStep;
        }
    graph.verCircles[vr].attr("fill","black");
    graph.textCircles[vr].attr("fill","white");
    curStep++;
    return curStep;
}

function graphExample (name, isOriented) {
    
    var DFSObject = this.DFSObject = new DFS ();
    DFSObject.graph.n=5;
    DFSObject.init(true,name,name+" .graph",isOriented);
    
    var svgElement = document.querySelector(name+" .graph");
    svgElement.blockScroll=false;
    svgElement.ontouchstart = function (event) {
        this.blockScroll=true;
        };
    svgElement.ontouchend = function () {
        this.blockScroll=false;
        };
    svgElement.ontouchmove = function (event) {
        if (this.blockScroll==true) event.preventDefault();
        };
    
    var startButton = DFSObject.startButton = document.querySelector(name+" .start");
    var pauseButton = DFSObject.pauseButton = document.querySelector(name+" .pause");
    var previousButton = DFSObject.previousButton = document.querySelector(name+" .previous");
    var nextButton = DFSObject.nextButton = document.querySelector(name+" .next");
    var animText = DFSObject.animText = document.querySelector(name+" .anim-text");
    DFSObject.clear();
    
    var slider=document.querySelector(name+" .range");
    var output=document.querySelector(name+" .slider-value");
    slider.value=5;
    output.innerHTML=slider.value;
    
    slider.oninput = function() {
        DFSObject.clear();
        output.innerHTML=this.value;
        DFSObject.graph.n=this.value;
        DFSObject.init(false);
        }
    
    var speed=document.querySelector(name+" .form-group");
    var speedInput=document.querySelector(name+" .speed");
    speedInput.value="2";
    
    startButton.flag=false;
    startButton.onclick = function () {
        if (this.flag==false) {
            speed.style.display="none";
            if (speedInput.value==="") DFSObject.speed=4000/2;
            else DFSObject.speed=4000/speedInput.value;
            
            this.flag=true; this.innerText="Стоп";
            
            DFSObject.clearGraph(false);
            DFSObject.start(false);
            
            pauseButton.style.display="block";
            pauseButton.flagPause=false; pauseButton.flagStep=false;
            pauseButton.innerText="Пауза";
            pauseButton.onclick = function () {
                if (this.flagPause==false) {
                    this.flagPause=true; this.innerText="Пусни";
                    if (DFSObject.graph.minas!==undefined) {
                        for (var i=0; i<DFSObject.graph.minas.length; i++) {
                            DFSObject.graph.minas[i][0].pause();
                            }
                        }
                    DFSObject.graph.s.selectAll("*").forEach(function (element) {
                        if (element.inAnim().length!=0) element.inAnim()[0].mina.pause();
                        });
                    }
                else {
                    this.flagPause=false; this.innerText="Пaуза";
                    if (DFSObject.graph.minas!==undefined) {
                        for (var i=0; i<DFSObject.graph.minas.length; i++) {
                            DFSObject.graph.minas[i][0].resume();
                            }
                        }
                    DFSObject.graph.s.selectAll("*").forEach(function (element) {
                        if (element.inAnim().length!=0) element.inAnim()[0].mina.resume();
                        });
                    if (this.flagStep==true) DFSObject.animFuncs[DFSObject.currAnimation].func();
                    this.flagStep=false;
                    }
                }
            
            previousButton.style.display="block";
            previousButton.onclick = function () {
                var currAnimation = DFSObject.currAnimation;
                if ((currAnimation!==undefined)&&(currAnimation>0)) {
                    pauseButton.flagPause=false; pauseButton.flagStep=true;
                    pauseButton.click();
                    DFSObject.clearGraph(true);
                    DFSObject.graph.drawEdges(1,1,299,299);
                    DFSObject.currAnimation--;
                    var used=[];
                    for (var i=0; i<DFSObject.graph.n; i++) used[i]=0;
                    dfsUntilStep(DFSObject.graph,used,0,0,currAnimation-1);
                    animText.innerText=DFSObject.animations[currAnimation-1][0][3];
                    }
                }
            
            nextButton.style.display="block";
            nextButton.onclick = function () {
                var currAnimation = DFSObject.currAnimation;
                if ((currAnimation!==undefined)&&(currAnimation<DFSObject.animFuncs.length-1)) {
                    pauseButton.flagPause=false; pauseButton.flagStep=true;
                    pauseButton.click();
                    DFSObject.clearGraph(true);
                    DFSObject.graph.drawEdges(1,1,299,299);
                    DFSObject.currAnimation++;
                    var used=[];
                    for (var i=0; i<DFSObject.graph.n; i++) used[i]=0;
                    dfsUntilStep(DFSObject.graph,used,0,0,currAnimation+1);
                    animText.innerText=DFSObject.animations[currAnimation+1][0][3];
                    }
                }
            }
        else {
            speed.style.display="block";
            if (speedInput.value==="") speedInput.value="2";
            this.flag=false; this.innerText="Старт!";
            DFSObject.clear();
            DFSObject.graph.drawEdges(1,1,299,299);
            }
        }
    
    var saveButton=document.querySelector(name+" .save");
    saveButton.canvas=document.querySelector(name+" .canvas-save");
    saveButton.canvas.style.display="none";
    saveButton.svgSave=document.querySelector(name+" .svg-save");
    saveButton.svgSave.style.display="none";
    saveButton.onclick = function () {
        var canvas=this.canvas;
        var context=canvas.getContext('2d');
        var svg=document.querySelector(DFSObject.graph.svgName);
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