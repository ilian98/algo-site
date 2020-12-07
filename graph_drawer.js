var possiblePos=[],distVertices,vertexRad=20;

function getCoordinates (event, graph) {
         if (window.isMobile==false) {
            graph.svgPoint.x=event.clientX; graph.svgPoint.y=event.clientY;
            }
         else if (event.changedTouches!=undefined) {
                 graph.svgPoint.x=event.changedTouches[0].clientX;
                 graph.svgPoint.y=event.changedTouches[0].clientY;
                 }
         else if (event.touches!=undefined) {
                 graph.svgPoint.x=event.touches[0].clientX;
                 graph.svgPoint.y=event.touches[0].clientY;
                 }
 }
function circleClick (event) {
         var index=this.index,graph=this.graph;
         getCoordinates(event,graph);
         graph.svgPoint=graph.svgPoint.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
         graph.mouseX=graph.svgPoint.x; graph.mouseY=graph.svgPoint.y;
         graph.flagDraw=1;
         graph.stVerDraw=index;
}
function trackMouse (event) {
         var i,graph=this.graph;
         getCoordinates(event,graph);
         graph.svgPoint=graph.svgPoint.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
         if (graph.flagDraw==0) return ;
         if ((Math.abs(graph.mouseX-graph.svgPoint.x)>=1)||(Math.abs(graph.mouseY-graph.svgPoint.y)>=1)) {
            if (graph.curEdgeDraw!=null) graph.curEdgeDraw.remove();
            var st,end,edgeLen,quotient=1;
            st=[graph.verCoord[graph.stVerDraw][0]+graph.vertexRad,graph.verCoord[graph.stVerDraw][1]+graph.vertexRad];
            end=[graph.svgPoint.x,graph.svgPoint.y];
            edgeLen=Math.sqrt((st[0]-end[0])*(st[0]-end[0])+(st[1]-end[1])*(st[1]-end[1]));
            if (graph.isOriented==true) quotient=(edgeLen-10)/edgeLen;
            if (graph.curEdgeDraw!=undefined) graph.curEdgeDraw.remove();
            graph.curEdgeDraw=graph.s.line(st[0],st[1],st[0]+quotient*(end[0]-st[0]),st[1]+quotient*(end[1]-st[1]));
            graph.curEdgeDraw.attr({stroke: "black", "stroke-width": graph.vertexRad/20*1.5});
            graph.curEdgeDraw.prependTo(graph.s);
            if (graph.isOriented==true) {
               var arrow=graph.s.polygon([0,10,4,10,2,0,0,10]).attr({fill: "black"}).transform('r90');
               var marker=arrow.marker(0,0,10,10,0,5);
               graph.curEdgeDraw.attr({"marker-end": marker});
               }
            }
}
function circleEnd (event) {
         var i,j,h,len;
         var graph=this.graph;
         for (i=0; i<graph.n; i++) { 
             if ((graph.svgPoint.x>=graph.circles[i].getBBox().x)&&(graph.svgPoint.x<=graph.circles[i].getBBox().x2)&&
                 (graph.svgPoint.y>=graph.circles[i].getBBox().y)&&(graph.svgPoint.y<=graph.circles[i].getBBox().y2)) {
                if (graph.flagDraw==0) return ;
                graph.flagDraw=0; graph.curEdgeDraw.remove();
                if (graph.stVerDraw==i) return ;
                if (graph.adjMatrix[graph.stVerDraw][i]==1) return ;
                len=graph.edgeList.length;
                graph.edgeList.push([graph.stVerDraw,i]);
                graph.adjList[graph.stVerDraw].push(i);
                if (graph.isOriented==false) graph.adjList[i].push(graph.stVerDraw);
                graph.adjMatrix[graph.stVerDraw][i]=1;
                if (graph.isOriented==false) graph.adjMatrix[i][graph.stVerDraw]=1;
                for (j=0; j<graph.n; j++) {
                    if ((j==graph.stVerDraw)||(j==i)) continue;
                    if (circleSegment(graph.verCoord[graph.stVerDraw],graph.verCoord[i],graph.verCoord[j],graph.vertexRad)==true) {
                       possiblePos.push(graph.verCoord[i]);
                       if (placeVertex(graph,i)==false) drawGraph(graph,graph.frameX,graph.frameY,graph.frameW,graph.frameH,graph.vertexRad);
                       break;
                       }
                    }
                draw(graph,true);
                }
            }
         if (graph.curEdgeDraw!=null) graph.curEdgeDraw.remove();
         graph.flagDraw=0;
}
function lineOut (event) {
         var graph=this;
         if (window.isMobile==true) return ;
         var boundBox = {
             top: $(graph.svgName)[0].getBoundingClientRect().top+window.scrollY,
             bottom: $(graph.svgName)[0].getBoundingClientRect().bottom+window.scrollY,
             left: $(graph.svgName)[0].getBoundingClientRect().left+window.scrollX,
             right: $(graph.svgName)[0].getBoundingClientRect().right+window.scrollX
             };
         if (window.isMobile==false) var point=[event.pageX,event.pageY];
         else if (event.changeTouches!=undefined) var point=[event.changedTouches[0].pageX,event.changedTouches[0].pageY];
         else var point=[event.touches[0].pageX,event.touches[0].pageY];
         if ((point[0]<boundBox.left)||(point[0]>boundBox.right)||
             (point[1]<boundBox.top)||(point[1]>boundBox.bottom)) {
            if (graph.curEdgeDraw!=null) graph.curEdgeDraw.remove();
            graph.flagDraw=0;
            }
}

function Graph () {
         this.svgName=undefined; this.s=undefined; this.flagSave=undefined;
         this.circles=undefined; this.verCircles=undefined; this.verCoord=undefined; this.textCircles=undefined;
         this.edgeLines=undefined;
         this.n=undefined; this.verNames=undefined;
         this.edgeList=undefined; this.adjList=undefined; this.adjMatrix=undefined;
         this.isOriented=undefined; this.isTree=undefined;
         this.frameX=undefined; this.frameY=undefined; this.frameW=undefined; this.frameH=undefined; this.vertexRad=undefined;
         this.init = function (svgName, n, isOriented, flagSave, isTree) {
             if (this.s==undefined) {
                this.svgName=svgName;
                this.s=Snap(svgName);
                }
             this.s.selectAll("*").forEach(function (element) {
                 element.stop();
                 element.remove();
                 });
             if (flagSave!==undefined) {
                this.flagSave=flagSave;
                if (flagSave===true) {
                   var parentElement=document.querySelector(svgName).parentElement;
                   var saveButton=parentElement.querySelector(".save");
                   saveButton.canvas=parentElement.querySelector(".canvas-save");
                   saveButton.canvas.style.display="none";
                   saveButton.svgSave=parentElement.querySelector(".svg-save");
                   saveButton.svgSave.style.display="none";
                   saveButton.onclick = function () {
                       var canvas=this.canvas;
                       var context=canvas.getContext('2d');
                       var svg=parentElement.querySelector(".graph");
                       var svgWidth=svg.getBoundingClientRect().width,svgHeight=svg.getBoundingClientRect().height;
                       this.svgSave.setAttribute("width",svgWidth);
                       this.svgSave.setAttribute("height",svgHeight);
                       $(svgName).clone().appendTo($(svgName).parent().children(".svg-save"));
                       canvas.width=svgWidth;
                       canvas.height=svgHeight;

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
                           $(svgName).parent().children(".svg-save").empty();
                           }
                       }
                   }
                }
             
             this.circles=[]; this.verCircles=[]; this.verCoord=[]; this.textCircles=[];
             this.edgeLines=[]; this.markers=[];
             if (n!==undefined) this.n=n; this.verNames = [];
             this.edgeList=[]; this.adjList=[]; this.adjMatrix=[];
             if (isOriented!==undefined) this.isOriented=isOriented;
             if (isTree!==undefined) this.isTree=isTree;
             else this.isTree=false;
             for (var i=0; i<this.n; i++) {
                 this.adjList[i]=[]; this.adjMatrix[i]=[];
                 for (var j=0; j<this.n; j++) {
                     this.adjMatrix[i][j]=0;
                     }
                 }
             this.flagDraw=0;
             }
         this.fillAdjListMatrix = function () {
             var edgeList=this.edgeList,max=0;
             for (i=0; i<edgeList.length; i++) {
                 if (max<edgeList[i][0]) max=edgeList[i][0];
                 if (max<edgeList[i][1]) max=edgeList[i][1];
                 }
             this.n=max+1;
             for (i=0; i<=max; i++) {
                 this.adjMatrix[i]=[];
                 for (j=0; j<=max; j++) {
                     this.adjMatrix[i][j]=0;
                     }
                 this.adjList[i]=[];
                 }
             for (i=0; i<edgeList.length; i++) {
                 var x=edgeList[i][0],y=edgeList[i][1];
                 this.adjMatrix[x][y]=1;
                 this.adjList[x].push(y);
                 if (this.isOriented==0) {
                    this.adjMatrix[y][x]=1;
                    this.adjList[y].push(x);
                    }
                 }
             }
         
         this.flagDraw=undefined; this.mouseX=undefined; this.mouseY=undefined;
         this.stVerDraw=undefined; this.curEdgeDraw=undefined; this.svgPoint=undefined;
         this.drawEdges = function () {
              var graph=this;
              draw(this,false);
              this.svgPoint=this.s.paper.node.createSVGPoint(); this.flagDraw=0; this.stVer=1;
              for (i=0; i<this.n; i++) {
                  if (this.circles[i]===undefined) continue;
                  this.circles[i].index=i; this.circles[i].graph=this;
                  this.circles[i].unmousedown(circleClick);
                  this.circles[i].mousedown(circleClick);
                  this.circles[i].untouchstart(circleClick);
                  this.circles[i].touchstart(circleClick);
                  }
                
              this.s.graph=this;
              this.s.unmousemove(trackMouse);
              this.s.mousemove(trackMouse);
              this.s.untouchmove(trackMouse);
              this.s.touchmove(trackMouse);

              this.s.graph=this;
              this.s.unmouseup(circleEnd);
              this.s.mouseup(circleEnd);
              this.s.untouchend(circleEnd);
              this.s.touchend(circleEnd);
             
              if (graph.hasOwnProperty("lineOut")==true) window.removeEventListener("mousemove",graph.lineOut,false);
              if (graph.hasOwnProperty("lineOut")==true) window.removeEventListener("touchmove",graph.lineOut,false);
              graph.lineOut = function (event) {
                 if (event==undefined) return ;
                 var graph=this;
                 if (window.isMobile==true) return ;
                 var boundBox = {
                     top: $(graph.svgName)[0].getBoundingClientRect().top+window.scrollY,
                     bottom: $(graph.svgName)[0].getBoundingClientRect().bottom+window.scrollY,
                     left: $(graph.svgName)[0].getBoundingClientRect().left+window.scrollX,
                     right: $(graph.svgName)[0].getBoundingClientRect().right+window.scrollX
                     };
                 if (window.isMobile==false) var point=[event.pageX,event.pageY];
                 else if (event.changeTouches!=undefined) var point=[event.changedTouches[0].pageX,event.changedTouches[0].pageY];
                 else var point=[event.touches[0].pageX,event.touches[0].pageY];
                 if ((point[0]<boundBox.left)||(point[0]>boundBox.right)||
                     (point[1]<boundBox.top)||(point[1]>boundBox.bottom)) {
                    if (graph.curEdgeDraw!=null) graph.curEdgeDraw.remove();
                    graph.flagDraw=0;
                    }
                 }.bind(graph);
              window.addEventListener("mousemove",graph.lineOut,false);
              window.addEventListener("touchmove",graph.lineOut,false);
              }
}

function circleSegment (segPoint1, segPoint2, center, vertexRad) {
         var area,height,sides=[];    
         area=Math.abs(segPoint1[0]*segPoint2[1]+segPoint1[1]*center[0]+segPoint2[0]*center[1]-
                       segPoint1[1]*segPoint2[0]-segPoint1[0]*center[1]-segPoint2[1]*center[0])/2;
         sides[0]=Math.sqrt(Math.pow(segPoint1[0]-segPoint2[0],2)+Math.pow(segPoint1[1]-segPoint2[1],2));
         sides[1]=Math.sqrt(Math.pow(segPoint1[0]-center[0],2)+Math.pow(segPoint1[1]-center[1],2));
         sides[2]=Math.sqrt(Math.pow(segPoint2[0]-center[0],2)+Math.pow(segPoint2[1]-center[1],2));
         if ((sides[0]*sides[0]+sides[2]*sides[2]-sides[1]*sides[1]>0)&&
             (sides[0]*sides[0]+sides[1]*sides[1]-sides[2]*sides[2]>0)) {
            height=area*2/sides[0];
            if (height<=1.1*vertexRad) return true;
            }
         return false;
}
function eraseGraph (graph) {
         for (var i=0; i<graph.edgeLines.length; i++) {
             if (graph.edgeLines[i]!=null) graph.edgeLines[i].remove();
             }
         for (var i=0; i<graph.n; i++) {
             if (graph.verCircles[i]!=null) graph.verCircles[i].remove();
             if (graph.textCircles[i]!=null) graph.textCircles[i].remove();
             if (graph.circles[i]!=null) graph.circles[i].remove();
             }
}
function checkVertex (graph, vr) {
         var i,j;
         for (i=0; i<graph.n; i++) {
             if ((i==vr)||(graph.verCoord[i]==null)) continue;
             if ((graph.adjMatrix[vr][i]==0)&&(graph.adjMatrix[i][vr]==0)) continue;
             for (j=0; j<graph.n; j++) {
                 if ((j==vr)||(j==i)||(graph.verCoord[j]==null)) continue;
                 if (circleSegment(graph.verCoord[vr],graph.verCoord[i],graph.verCoord[j],graph.vertexRad)==true) return false;
                 }
             }
         return true;
}
function placeVertex (graph, vr) {
         var i,j,h,ind,curpossiblePos=[];
         curpossiblePos=possiblePos.slice();
         for (i=0; i<graph.n; i++) {
             if ((i==vr)||(graph.verCoord[i]==null)) continue;
             for (j=0; j<graph.n; j++) {
                 if ((j==vr)||(graph.verCoord[j]==null)||((graph.adjMatrix[i][j]==0)&&(graph.adjMatrix[j][i]==0))) continue;
                 for (h=0; h<curpossiblePos.length; h++) {
                     if (circleSegment(graph.verCoord[i],graph.verCoord[j],curpossiblePos[h],graph.vertexRad)==true) {
                        curpossiblePos.splice(h,1); h--;
                        }
                     }
                 }
             }
         for (;;) {
             if (curpossiblePos.length==0) return false;
             ind=parseInt(Math.random()*(10*curpossiblePos.length))%curpossiblePos.length;
             graph.verCoord[vr]=curpossiblePos[ind];
             if (checkVertex(graph,vr)==false) {
                curpossiblePos.splice(ind,1);
                continue;
                }
             possiblePos.splice(possiblePos.findIndex(function (elem) {
                 return (elem==graph.verCoord[vr]);
                 }),1);
             break;
             }
         return true;
}
function fillVersDepth (vr, father, dep, adjList, versDepth) {
    versDepth[dep].push(vr);
    var max=dep;
    for (var i=0; i<adjList[vr].length; i++) {
        if (adjList[vr][i]!=father) {
            var value=fillVersDepth(adjList[vr][i],vr,dep+1,adjList,versDepth);
            if (max<value) max=value;
            }
        }
    return max;
}
function drawGraph (graph, frameX, frameY, frameW, frameH, vertexRad) {
    eraseGraph(graph);
    graph.frameX=frameX; graph.frameY=frameY;
    graph.frameW=frameW; graph.frameH=frameH;
    graph.vertexRad=vertexRad;
    var distVertices=vertexRad*5/4+parseInt((Math.random())*vertexRad/4);
    var i,j,h;   
    if (graph.isTree===false) {
       possiblePos=[];
       for (i=0; i<=(frameW-2*vertexRad)/(2*vertexRad+distVertices); i++) {
           for (j=0; j<=(frameH-2*vertexRad)/(2*vertexRad+distVertices); j++) {
               possiblePos.push([i*(2*vertexRad+distVertices)+frameX,j*(2*vertexRad+distVertices)+frameY]);
               }
           }
       graph.verCoord.splice(0,graph.verCoord.length);
       for (i=0; i<graph.n; i++) {
           if (placeVertex(graph,i)==false) {
              drawGraph(graph,frameX,frameY,frameW,frameH,vertexRad);
              return ;
              }
           }
       }
    else {
        var versDepth=[],inDegree=[],root=0;
        for (i=0; i<=graph.n; i++) {
            versDepth[i]=[];
            inDegree[i]=0;
            }
        if (graph.isOriented==true) {
           for (i=0; i<graph.edgeList.length; i++) {
               inDegree[graph.edgeList[i][1]]++;
               }
           for (i=0; i<graph.n; i++) {
               if (inDegree[i]==0) {
                  root=i;
                  break;
                  }
               }
           }
        var maxDepth=fillVersDepth(root,-1,0,graph.adjList,versDepth);
        var x,y=(2*vertexRad+distVertices)*maxDepth+vertexRad,distX;
        x=0; distX=(frameW-2*vertexRad-1)/(versDepth[maxDepth].length-1);
        for (vertex of versDepth[maxDepth]) {
            graph.verCoord[vertex]=[x+frameX,y+frameY];
            x+=distX;
            }
        for (i=maxDepth-1; i>=0; i--) {
            y-=(2*vertexRad+distVertices);
            var ind=0;
            for (vertex of versDepth[i]) {
                if ((ind==versDepth[i+1].length)||(graph.adjMatrix[versDepth[i+1][ind]][vertex]==0)) {
                   graph.verCoord[vertex]=undefined;
                   continue;
                   }
                var sum=0,cnt=0;
                for (; ind<versDepth[i+1].length; ind++) {
                    if (graph.adjMatrix[versDepth[i+1][ind]][vertex]==0) break;
                    sum+=graph.verCoord[versDepth[i+1][ind]][0];
                    cnt++;
                    }
                graph.verCoord[vertex]=[sum/cnt,y+frameY];
                }
            var prevX=0;
            for (j=0; j<versDepth[i].length; j++) {
                if (graph.verCoord[versDepth[i][j]]!==undefined) {
                   prevX=graph.verCoord[versDepth[i][j]][0];
                   continue;
                   }
                var cnt=1,nextX=frameX+frameW;
                for (h=j; h<versDepth[i].length; h++) {
                    if (graph.verCoord[versDepth[i][h]]!==undefined) {
                       nextX=graph.verCoord[versDepth[i][h]][0];
                       break;
                       }
                    cnt++;
                    }
                var x=prevX;
                for (h=j; h<versDepth[i].length; h++) {
                    if (graph.verCoord[versDepth[i][h]]!==undefined) break;
                    x+=(nextX-prevX)/cnt;
                    graph.verCoord[versDepth[i][h]]=[x,y+frameY];
                    }
                j=h-1;
                }
            }
        }
    draw(graph,true);
}
function determineDy (text) {
    var largeLetters=['b','d','f','h','k','l','t','б','в','й','','ж','з','и','к'];
    var lowLetters=['g','j','p','q','y','р','y','ц','щ'];
    var flagNonLetter=false,flagLargeLetter=false,flagLowLetter=false,flagSmallLetter=false;
    for (var i=0; i<text.length; i++) {
        if (text[i]=='ф') return "0.255em";
        if (largeLetters.includes(text[i])==true) flagLargeLetter=true;
        else if (lowLetters.includes(text[i])==true) flagLowLetter=true;
        if (((text[i]>='a')&&(text[i]<='z'))||((text[i]>='а')&&(text[i]<='я'))) flagSmallLetter=true;
        else flagNonLetter=true;
        }
    if ((flagNonLetter==true)||(flagLargeLetter==true)) {
        if (flagLowLetter==true) return "0.255em";
        return "0.34em";
        }
    else {
        if (flagLowLetter==true) return "0.18em";
        return "0.255em";
        }
}
function draw (graph, addDraw) {
    eraseGraph(graph);
    var fontSize=graph.vertexRad*5/4,strokeWidth=graph.vertexRad/20*1.5;
    for (var i=0; i<graph.edgeList.length; i++) {
        var from=graph.verCoord[graph.edgeList[i][0]],to=graph.verCoord[graph.edgeList[i][1]],edgeLen,quotient=1;
        var st=[from[0]+graph.vertexRad,from[1]+graph.vertexRad];
        var end=[to[0]+graph.vertexRad,to[1]+graph.vertexRad];
        edgeLen=Math.sqrt((st[0]-end[0])*(st[0]-end[0])+(st[1]-end[1])*(st[1]-end[1]));
        if (graph.isOriented==true) quotient=(edgeLen-graph.vertexRad-graph.vertexRad/2)/edgeLen;
        graph.edgeLines[i]=graph.s.line(st[0],st[1],st[0]+quotient*(end[0]-st[0]),st[1]+quotient*(end[1]-st[1]));
        graph.edgeLines[i].attr({stroke: "black", "stroke-width": strokeWidth});
        if (graph.isOriented==true) {
           var arrow=graph.s.polygon([0,10,4,10,2,0,0,10]).attr({fill: "black"}).transform('r90');
           graph.markers[i]=arrow;
           var marker=arrow.marker(0,0,10,10,0,5);
           graph.edgeLines[i].attr({"marker-end": marker});
           }
        }
    for (var i=0; i<graph.n; i++) {
        if ((graph.verNames.length!=0)&&(graph.verNames[i]===undefined)) {
           graph.verCircles[i]=graph.textCircles[i]=graph.circles[i]=undefined;
           continue;
           }
        var x=graph.verCoord[i][0]+graph.vertexRad,y=graph.verCoord[i][1]+graph.vertexRad;
        graph.verCircles[i]=graph.s.circle(x,y,graph.vertexRad);
        graph.verCircles[i].attr({fill: "white", stroke: "black", "stroke-width": strokeWidth});
        var text;
        if (graph.verNames.length==0) text=(i+1).toString();
        else text=graph.verNames[i];
        graph.textCircles[i]=graph.s.text(x,y,text);
        graph.textCircles[i].attr({"font-size": fontSize, dy: determineDy(text), "text-anchor": "middle", class: "unselectable"});
        graph.circles[i]=graph.s.group(graph.verCircles[i],graph.textCircles[i]);
        }
    if (addDraw==true) graph.drawEdges();
}