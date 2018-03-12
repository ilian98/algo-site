var possiblePos=[],distVertices,vertexRad=20;
function Graph () {
         this.svgName=undefined; this.s=undefined;
         this.circles=undefined; this.verCircles=undefined; this.verCoord=undefined; this.textCircles=undefined;
         this.edgeLines=undefined;
         this.n=undefined; this.edgeList=undefined; this.adjList=undefined; this.adjMatrix=undefined; this.isOriented=undefined;
         this.init = function () {
             this.circles=[]; this.verCircles=[]; this.verCoord=[]; this.textCircles=[]; this.edgeLines=[];
             this.edgeList=[]; this.adjList=[]; this.adjMatrix=[];
             for (var i=0; i<this.n; i++) {
                 this.adjList[i]=[]; this.adjMatrix[i]=[];
                 for (var j=0; j<this.n; j++) {
                     this.adjMatrix[i][j]=0;
                     }
                 }
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
         if (addDraw==true) drawEdges(graph,frameX,frameY,frameW,frameH);
}
function drawEdges (graph, frameX, frameY, frameW, frameH) {
         draw(graph,frameX,frameY,frameW,frameH,false);
         var flag=0,mouseX,mouseY,stVer=1,curEdge,i,len;
         var point=graph.s.paper.node.createSVGPoint();
        
         function circlesClick (event, device, index) {
                  if (device=="desktop") {
                     point.x=event.x; point.y=event.y;
                     }
                  else {
                     point.x=event.touches[0].x; point.y=event.touches[0].y;
                     }
                  point=point.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
                  mouseX=point.x; mouseY=point.y;
                  flag=1;
                  stVer=index;
                  }
         for (i=0; i<graph.n; i++) {
             graph.circles[i].index=i;
             graph.circles[i].mousedown(function (event) {
                circlesClick(event,"desktop",this.index);
                });
             graph.circles[i].touchstart(function (event) {
                circlesClick(event,"mobile",this.index);
                });
             }
    
         function trackMouse (event, device) {
                  if (device=="desktop") {
                     point.x=event.x; point.y=event.y;
                     }
                  else {
                     point.x=event.changedTouches[0].x; point.y=event.changedTouches[0].y;
                     }
                  point=point.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
                  if (flag==0) return ;
                  if ((Math.abs(mouseX-point.x)>=1)||(Math.abs(mouseY-point.y)>=1)) {
                     if (curEdge!=null) curEdge.remove();
                     var st,end,edgeLen,quotient=1; //console.log(stVer);
                     st=[graph.verCoord[stVer][0]+vertexRad,graph.verCoord[stVer][1]+vertexRad];
                     end=[point.x,point.y];
                     edgeLen=Math.sqrt((st[0]-end[0])*(st[0]-end[0])+(st[1]-end[1])*(st[1]-end[1]));
                     if (graph.isOriented==true) quotient=(edgeLen-10)/edgeLen;
                     curEdge=graph.s.line(st[0],st[1],st[0]+quotient*(end[0]-st[0]),st[1]+quotient*(end[1]-st[1]));
                     curEdge.attr({stroke: "black", "stroke-width": 1.5});
                     if (graph.isOriented==true) {
                        var arrow=graph.s.polygon([0,10,4,10,2,0,0,10]).attr({fill: "black"}).transform('r90');
                        var marker=arrow.marker(0,0,10,10,0,5);
                        curEdge.attr({"marker-end": marker});
                        }
                     for (i=0; i<graph.n; i++) {
                         graph.s.append(graph.circles[i]);
                         }
                     }
                  }
         graph.s.mousemove(function (event) {
            trackMouse(event,"desktop");
            });
         graph.s.touchmove(function (event) {
            trackMouse(event,"mobile");
            });
         
         function circlesEnd (index) {
                  if (flag==0) return ;
                  flag=0;
                  if (stVer==index) return ;
                  if (graph.adjMatrix[stVer][index]==1) return ;
                  len=graph.edgeList.length;
                  curEdge.remove();
                  graph.edgeList.push([stVer,index]);
                  graph.adjList[stVer].push(index);
                  if (graph.isOriented==false) graph.adjList[index].push(stVer);
                  graph.adjMatrix[stVer][index]=1;
                  if (graph.isOriented==false) graph.adjMatrix[index][stVer]=1;
                  for (i=0; i<graph.n; i++) {
                      if ((i==stVer)||(i==index)) continue;
                      if (circleSegment(graph.verCoord[stVer],graph.verCoord[index],graph.verCoord[i])==true) {
                         possiblePos.push(graph.verCoord[index]);
                         if (placeVertex(graph,index)==false) drawGraph(graph,frameX,frameY,frameW,frameH);
                         break;
                         }
                      }
                  draw(graph,frameX,frameY,frameW,frameH,true);
                  }
         for (i=0; i<graph.n; i++) {
             graph.circles[i].mouseup(function () {
                circlesEnd(this.index);
                });
             graph.circles[i].touchend(function () {
                circlesEnd(this.index);
                });
             }
    
         graph.s.mouseup(function () {
            if (curEdge!=null) curEdge.remove();
            flag=0;
            });
         graph.s.touchend(function () {
            if (curEdge!=null) curEdge.remove();
            });
    
         $(graph.svgName).mouseleave(function () {
            if (curEdge!=null) curEdge.remove();
            flag=0;
            });
}