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
function circleClick (event, index, graph) {
         getCoordinates(event,graph);
         graph.svgPoint=graph.svgPoint.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
         graph.mouseX=graph.svgPoint.x; graph.mouseY=graph.svgPoint.y;
         graph.flagDraw=1;
         graph.stVerDraw=index;
}
function trackMouse (event, graph) {
         var i;
         getCoordinates(event,graph);
         graph.svgPoint=graph.svgPoint.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
         if (graph.flagDraw==0) return ;
         if ((Math.abs(graph.mouseX-graph.svgPoint.x)>=1)||(Math.abs(graph.mouseY-graph.svgPoint.y)>=1)) {
            if (graph.curEdgeDraw!=null) graph.curEdgeDraw.remove();
            var st,end,edgeLen,quotient=1;
            st=[graph.verCoord[graph.stVerDraw][0]+vertexRad,graph.verCoord[graph.stVerDraw][1]+vertexRad];
            end=[graph.svgPoint.x,graph.svgPoint.y];
            edgeLen=Math.sqrt((st[0]-end[0])*(st[0]-end[0])+(st[1]-end[1])*(st[1]-end[1]));
            if (graph.isOriented==true) quotient=(edgeLen-10)/edgeLen;
            graph.curEdgeDraw=graph.s.line(st[0],st[1],st[0]+quotient*(end[0]-st[0]),st[1]+quotient*(end[1]-st[1]));
            graph.curEdgeDraw.attr({stroke: "black", "stroke-width": 1.5});
            if (graph.isOriented==true) {
               var arrow=graph.s.polygon([0,10,4,10,2,0,0,10]).attr({fill: "black"}).transform('r90');
               var marker=arrow.marker(0,0,10,10,0,5);
               graph.curEdgeDraw.attr({"marker-end": marker});
               }
            for (i=0; i<graph.n; i++) {
                graph.s.append(graph.circles[i]);
                }
            }
}
function circleEnd (graph, frameX, frameY, frameW, frameH) {
         var i,len;
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
                    if (circleSegment(graph.verCoord[graph.stVerDraw],graph.verCoord[i],graph.verCoord[j])==true) {
                       possiblePos.push(graph.verCoord[i]);
                       if (placeVertex(graph,i)==false) drawGraph(graph,frameX,frameY,frameW,frameH);
                       break;
                       }
                    }
                draw(graph,frameX,frameY,frameW,frameH,true);
                }
            }
         if (graph.curEdgeDraw!=null) graph.curEdgeDraw.remove();
         graph.flagDraw=0;
}

function Graph () {
         this.svgName=undefined; this.s=undefined;
         this.circles=undefined; this.verCircles=undefined; this.verCoord=undefined; this.textCircles=undefined;
         this.edgeLines=undefined;
         this.n=undefined; this.edgeList=undefined; this.adjList=undefined; this.adjMatrix=undefined; this.isOriented=undefined;
         this.init = function (svgName) {
             this.svgName=svgName;
             this.s=Snap(svgName); this.s.paper.clear();
             this.circles=[]; this.verCircles=[]; this.verCoord=[]; this.textCircles=[]; this.edgeLines=[];
             this.edgeList=[]; this.adjList=[]; this.adjMatrix=[];
             for (var i=0; i<this.n; i++) {
                 this.adjList[i]=[]; this.adjMatrix[i]=[];
                 for (var j=0; j<this.n; j++) {
                     this.adjMatrix[i][j]=0;
                     }
                 }
             this.flagDraw=0;
             }
         
         this.flagDraw=undefined; this.mouseX=undefined; this.mouseY=undefined;
         this.stVerDraw=undefined; this.curEdgeDraw=undefined; this.svgPoint=undefined;
         this.drawEdges = function (frameX, frameY, frameW, frameH) {
              $(document).off();
              var graph=this;
              draw(this,frameX,frameY,frameW,frameH,false);
              this.svgPoint=this.s.paper.node.createSVGPoint(); this.flagDraw=0; this.stVer=1;
              for (i=0; i<this.n; i++) {
                  this.circles[i].index=i; this.circles[i].graph=this;
                  this.circles[i].mousedown(function (event) {
                      if (window.isMobile==true) return ;
                      circleClick(event,this.index,this.graph);
                      });
                  this.circles[i].touchstart(function (event) {
                      circleClick(event,this.index,this.graph);
                      });
                  }
                
              this.s.graph=this;
              this.s.mousemove(function (event) {
                  if (window.isMobile==true) return ;
                  trackMouse(event,this.graph);
                  });
              this.s.touchmove(function (event) {
                  trackMouse(event,this.graph);
                  });

             this.s.graph=this;
             this.s.mouseup(function () {
                 if (window.isMobile==true) return ;
                 circleEnd(this.graph,frameX,frameY,frameW,frameH);
                 });
             this.s.touchend(function () {
                 circleEnd(this.graph,frameX,frameY,frameW,frameH);
                 });
             window.addEventListener("mousemove",function (event) {
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
                 },false);
             window.addEventListener("touchmove",function (event) {
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
                 },false);
             }
}

function circleSegment (segPoint1, segPoint2, center) {
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
                 if (circleSegment(graph.verCoord[vr],graph.verCoord[i],graph.verCoord[j])==true) return false;
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
                     if (circleSegment(graph.verCoord[i],graph.verCoord[j],curpossiblePos[h])==true) {
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
function drawGraph (graph, frameX, frameY, frameW, frameH) {
         eraseGraph(graph);
         var i,j;
         distVertices=vertexRad*3/4+parseInt((Math.random())*vertexRad/4);
         possiblePos=[];
         for (i=0; i<=(frameW-2*vertexRad)/(2*vertexRad+distVertices); i++) {
             for (j=0; j<=(frameH-2*vertexRad)/(2*vertexRad+distVertices); j++) {
                 possiblePos.push([i*(2*vertexRad+distVertices)+frameX,j*(2*vertexRad+distVertices)+frameY]);
                 }
             }
         graph.verCoord.splice(0,graph.verCoord.length);
         for (i=0; i<graph.n; i++) {
             if (placeVertex(graph,i)==false) {
                drawGraph(graph,frameX,frameY,frameW,frameH);
                return ;
                }
             }
         draw(graph,frameX,frameY,frameW,frameH,true);
}
function draw (graph, frameX, frameY, frameW, frameH, addDraw) {
         eraseGraph(graph);
         for (i=0; i<graph.edgeList.length; i++) {
             var st=graph.verCoord[graph.edgeList[i][0]],end=graph.verCoord[graph.edgeList[i][1]],edgeLen,quotient=1;
             st=[graph.verCoord[graph.edgeList[i][0]][0]+vertexRad,graph.verCoord[graph.edgeList[i][0]][1]+vertexRad];
             end=[graph.verCoord[graph.edgeList[i][1]][0]+vertexRad,graph.verCoord[graph.edgeList[i][1]][1]+vertexRad];
             edgeLen=Math.sqrt((st[0]-end[0])*(st[0]-end[0])+(st[1]-end[1])*(st[1]-end[1]));
             if (graph.isOriented==true) quotient=(edgeLen-vertexRad-10)/edgeLen;
             graph.edgeLines[i]=graph.s.line(st[0],st[1],st[0]+quotient*(end[0]-st[0]),st[1]+quotient*(end[1]-st[1]));
             graph.edgeLines[i].attr({stroke: "black", "stroke-width": 1.5});
             if (graph.isOriented==true) {
                var arrow=graph.s.polygon([0,10,4,10,2,0,0,10]).attr({fill: "black"}).transform('r90');
                var marker=arrow.marker(0,0,10,10,0,5);
                graph.edgeLines[i].attr({"marker-end": marker});
                }
             }
         for (i=0; i<graph.n; i++) {
             graph.verCircles[i]=graph.s.circle(graph.verCoord[i][0]+vertexRad,graph.verCoord[i][1]+vertexRad,vertexRad,vertexRad);
             graph.verCircles[i].attr({fill: "white", stroke: "black", "stroke-width": 1.5});
             graph.textCircles[i]=graph.s.text(graph.verCoord[i][0]+vertexRad,graph.verCoord[i][1]+vertexRad,(i+1).toString());
             graph.textCircles[i].attr({"font-size": 25});
             graph.textCircles[i].attr({x: graph.textCircles[i].getBBox().x-graph.textCircles[i].getBBox().w/2, y:graph.textCircles[i].getBBox().y+graph.textCircles[i].getBBox().h, class: "unselectable"});
             graph.circles[i]=graph.s.group(graph.verCircles[i],graph.textCircles[i]);
             }
         if (addDraw==true) graph.drawEdges(frameX,frameY,frameW,frameH);
}