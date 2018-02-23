var possiblePos=[],distVertices,vertexRad=20;
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
function eraseGraph (circles, verCircles, textCircles, edgeLines, n) {
         for (var i=0; i<edgeLines.length; i++) {
             if (edgeLines[i]!=null) edgeLines[i].remove();
             }
         for (var i=0; i<n; i++) {
             if (verCircles[i]!=null) verCircles[i].remove();
             if (textCircles[i]!=null) textCircles[i].remove();
             if (circles[i]!=null) circles[i].remove();
             }
}
function checkVertex (verCoord, vr, n, adjMatrix) {
         var i,j;
         for (i=0; i<n; i++) {
             if ((i==vr)||(verCoord[i]==null)) continue;
             if ((adjMatrix[vr][i]==0)&&(adjMatrix[i][vr]==0)) continue;
             for (j=0; j<n; j++) {
                 if ((j==vr)||(j==i)||(verCoord[j]==null)) continue;
                 if (circleSegment(verCoord[vr],verCoord[i],verCoord[j])==true) return false;
                 }
             }
         return true;
}
function placeVertex (verCoord, vr, n, adjMatrix) {
         var i,j,h,ind,curpossiblePos=[];
         curpossiblePos=possiblePos.slice();
         for (i=0; i<n; i++) {
             if ((i==vr)||(verCoord[i]==null)) continue;
             for (j=0; j<n; j++) {
                 if ((j==vr)||(verCoord[j]==null)||((adjMatrix[i][j]==0)&&(adjMatrix[j][i]==0))) continue;
                 for (h=0; h<curpossiblePos.length; h++) {
                     if (circleSegment(verCoord[i],verCoord[j],curpossiblePos[h])==true) {
                        curpossiblePos.splice(h,1); h--;
                        }
                     }
                 }
             }
         for (;;) {
             if (curpossiblePos.length==0) return false;
             ind=parseInt(Math.random()*(10*curpossiblePos.length))%curpossiblePos.length;
             verCoord[vr]=curpossiblePos[ind];
             if (checkVertex(verCoord,vr,n,adjMatrix)==false) {
                curpossiblePos.splice(ind,1);
                continue;
                }
             possiblePos.splice(possiblePos.findIndex(function (elem) {
                 return (elem==verCoord[vr]);
                 }),1);
             break;
             }
        return true;
}
function drawGraph (s, circles, verCircles, verCoord, textCircles, edgeLines, frameX, frameY, frameW, frameH, n, adjMatrix, adjList, edgeList, isOriented) {
         eraseGraph(circles,verCircles,textCircles,edgeLines,n);
         var i,j;
         distVertices=vertexRad*3/4+parseInt((Math.random())*vertexRad/4);
         possiblePos=[];
         for (i=0; i<=(frameW-2*vertexRad)/(2*vertexRad+distVertices); i++) {
             for (j=0; j<=(frameH-2*vertexRad)/(2*vertexRad+distVertices); j++) {
                 possiblePos.push([i*(2*vertexRad+distVertices)+frameX,j*(2*vertexRad+distVertices)+frameY]);
                 }
             }
         verCoord.splice(0,verCoord.length);
         for (i=0; i<n; i++) {
             if (placeVertex(verCoord,i,n,adjMatrix)==false) {
                 drawGraph(s,circles,verCircles,verCoord,textCircles,edgeLines,frameX,frameY,frameW,frameH,n,adjMatrix,adjList,edgeList,isOriented);
                return ;
                }
             }
         draw(s,circles,verCircles,verCoord,textCircles,edgeLines,frameX,frameY,frameW,frameH,n,adjMatrix,adjList,edgeList,isOriented,true);
         }
function draw (s, circles, verCircles, verCoord, textCircles, edgeLines, frameX, frameY, frameW, frameH, n, adjMatrix, adjList, edgeList, isOriented, addDraw) {
         eraseGraph(circles,verCircles,textCircles,edgeLines,n);
         for (i=0; i<edgeList.length; i++) {
             var st=verCoord[edgeList[i][0]],end=verCoord[edgeList[i][1]],edgeLen,quotient=1;
             st=[verCoord[edgeList[i][0]][0]+vertexRad,verCoord[edgeList[i][0]][1]+vertexRad];
             end=[verCoord[edgeList[i][1]][0]+vertexRad,verCoord[edgeList[i][1]][1]+vertexRad];
             edgeLen=Math.sqrt((st[0]-end[0])*(st[0]-end[0])+(st[1]-end[1])*(st[1]-end[1]));
             if (isOriented==true) quotient=(edgeLen-vertexRad-10)/edgeLen;
             edgeLines[i]=s.line(st[0],st[1],st[0]+quotient*(end[0]-st[0]),st[1]+quotient*(end[1]-st[1]));
             edgeLines[i].attr({stroke: "black", "stroke-width": 1.5});
             if (isOriented==true) {
                var arrow=s.polygon([0,10,4,10,2,0,0,10]).attr({fill: "black"}).transform('r90');
                var marker=arrow.marker(0,0,10,10,0,5);
                edgeLines[i].attr({"marker-end": marker});
                }
             }
         for (i=0; i<n; i++) {
             verCircles[i]=s.circle(verCoord[i][0]+vertexRad,verCoord[i][1]+vertexRad,vertexRad,vertexRad);
             verCircles[i].attr({fill: "white", stroke: "black", "stroke-width": 1.5});
             textCircles[i]=s.text(verCoord[i][0]+vertexRad,verCoord[i][1]+vertexRad,(i+1).toString());
             textCircles[i].attr({"font-size": 25});
             textCircles[i].attr({x: textCircles[i].getBBox().x-textCircles[i].getBBox().w/2, y:textCircles[i].getBBox().y+textCircles[i].getBBox().h, class: "unselectable"});
             circles[i]=s.group(verCircles[i],textCircles[i]);
             }
         if (addDraw==true) drawEdges(s,circles,verCircles,verCoord,textCircles,edgeLines,frameX,frameY,frameW,frameH,n,adjMatrix,adjList,edgeList,isOriented);
}
function drawEdges (s, circles, verCircles, verCoord, textCircles, edgeLines, frameX, frameY, frameW, frameH, n, adjMatrix, adjList, edgeList, isOriented) {
         draw(s,circles,verCircles,verCoord,textCircles,edgeLines,frameX,frameY,frameW,frameH,n,adjMatrix,adjList,edgeList,isOriented,false);
         var flag=0,mouseX,mouseY,stVer,curEdge,i,len;
         //var svgElem=$("svg")[0];
         //console.log(svgElem,s.selectAll("*")[0]);
         if (isOriented==false) var svgElem=$("#graphUnoriented")[0];
         else var svgElem=$("#graphOriented")[0];
         var point=svgElem.createSVGPoint();
         for (i=0; i<n; i++) {
             circles[i].index=i;
             circles[i].mousedown(function (event) {
                point.x=event.x; point.y=event.y;
                point=point.matrixTransform(svgElem.getScreenCTM().inverse());
                mouseX=point.x; mouseY=point.y;
                flag=1;
                stVer=this.index;
                });
             }
         s.mousemove(function (event) {
            point.x=event.x; point.y=event.y;
            point=point.matrixTransform(svgElem.getScreenCTM().inverse());
            if (flag==0) return ;
            if ((Math.abs(mouseX-point.x)>=1)||(Math.abs(mouseY-point.y)>=1)) {
               if (curEdge!=null) curEdge.remove();
               var st,end,edgeLen,quotient=1;
               st=[verCoord[stVer][0]+vertexRad,verCoord[stVer][1]+vertexRad];
               end=[point.x,point.y];
               edgeLen=Math.sqrt((st[0]-end[0])*(st[0]-end[0])+(st[1]-end[1])*(st[1]-end[1]));
               if (isOriented==true) quotient=(edgeLen-10)/edgeLen;
               curEdge=s.line(st[0],st[1],st[0]+quotient*(end[0]-st[0]),st[1]+quotient*(end[1]-st[1]));
               curEdge.attr({stroke: "black", "stroke-width": 1.5});
               if (isOriented==true) {
                  var arrow=s.polygon([0,10,4,10,2,0,0,10]).attr({fill: "black"}).transform('r90');
                  var marker=arrow.marker(0,0,10,10,0,5);
                  curEdge.attr({"marker-end": marker});
                  }
               for (i=0; i<n; i++) {
                   s.append(circles[i]);
                   }
               }
            });
         for (i=0; i<n; i++) {
             circles[i].mouseup(function () {
                if (flag==0) return ;
                flag=0;
                if (stVer==this.index) return ;
                if (adjMatrix[stVer][this.index]==1) return ;
                len=edgeList.length;
                curEdge.remove();
                edgeList.push([stVer,this.index]);
                adjList[stVer].push(this.index);
                if (isOriented==false) adjList[this.index].push(stVer);
                adjMatrix[stVer][this.index]=1;
                if (isOriented==false) adjMatrix[this.index][stVer]=1;
                for (i=0; i<n; i++) {
                    if ((i==stVer)||(i==this.index)) continue;
                    if (circleSegment(verCoord[stVer],verCoord[this.index],verCoord[i])==true) {
                       possiblePos.push(verCoord[this.index]);
                       if (placeVertex(verCoord,this.index,n,adjMatrix)==false) drawGraph(s,circles,verCircles,verCoord,textCircles,edgeLines,frameX,frameY,frameW,frameH,n,adjMatrix,adjList,edgeList,isOriented);
                       break;
                       }
                    }
                 draw(s,circles,verCircles,verCoord,textCircles,edgeLines,frameX,frameY,frameW,frameH,n,adjMatrix,adjList,edgeList,isOriented,true);
                });
             }
         s.mouseup(function () {
            if (curEdge!=null) curEdge.remove();
            flag=0;
            });
         $("#graph").mouseleave(function () {
            if (curEdge!=null) curEdge.remove();
            flag=0;
            });
}