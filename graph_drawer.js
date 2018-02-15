var possiblePos=[];
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
function eraseGraph () {
         for (var i=0; i<edgeLines.length; i++) {
             if (edgeLines[i]!=null) edgeLines[i].remove();
             }
         for (var i=0; i<n; i++) {
             if (verCircles[i]!=null) verCircles[i].remove();
             if (textCircles[i]!=null) textCircles[i].remove();
             if (circles[i]!=null) circles[i].remove();
             }
}
function checkVertex (vr) {
         var i,j;
         for (i=0; i<n; i++) {
             if ((i==vr)||(verCoord[i]==null)) continue;
             if (adjMatrix[vr][i]==0) continue;
             for (j=0; j<n; j++) {
                 if ((j==vr)||(j==i)||(verCoord[j]==null)) continue;
                 if (circleSegment(verCoord[vr],verCoord[i],verCoord[j])==true) return false;
                 }
             }
         return true;
}
function placeVertex (vr) {
         var i,j,ind,curpossiblePos=[];
         curpossiblePos=possiblePos.slice();
         for (;;) {
             if (curpossiblePos.length==0) return false;
             ind=parseInt(Math.random()*(10*curpossiblePos.length))%curpossiblePos.length;
             verCoord[vr]=curpossiblePos[ind];
             if (checkVertex(vr)==0) {
                curpossiblePos.splice(ind,1);
                continue;
                }
             possiblePos.splice(possiblePos.findIndex(function (elem) {
                 return (elem==verCoord[vr]);
                 }),1);
             for (i=0; i<n; i++) {
                 if ((i==vr)||(verCoord[i]==null)) continue;
                 if (adjMatrix[vr][i]==0) continue;
                 for (j=0; j<possiblePos.length; j++) {
                     if (circleSegment(verCoord[vr],verCoord[i],possiblePos[j])==true) {
                        possiblePos.splice(j,1); j--;
                        }
                     }
                 }
             break;
             }
        return true;
         
}
function drawGraph (frameX, frameY, frameW, frameH) {
         eraseGraph();
         var i,j,dist;
         dist=vertexRad/2+(Math.random())*vertexRad/2;
         possiblePos=[];
         for (i=0; i<=(frameW-2*vertexRad)/(2*vertexRad+dist); i++) {
             for (j=0; j<=(frameH-2*vertexRad)/(2*vertexRad+dist); j++) {
                 possiblePos.push([i*(2*vertexRad+dist)+frameX,j*(2*vertexRad+dist)+frameY]);
                 }
             }
         verCoord=[];
         for (i=0; i<n; i++) {
             placeVertex(i);
             }
         draw(true);
         }
function draw (addDraw) {
         eraseGraph();
         for (i=0; i<edgeList.length; i++) {
             var st=verCoord[edgeList[i][0]],end=verCoord[edgeList[i][1]];
             edgeLines[i]=s.line(st[0]+vertexRad,st[1]+vertexRad,end[0]+vertexRad,end[1]+vertexRad);
             edgeLines[i].attr({stroke: "black", "stroke-width": 1.5});
             }
         for (i=0; i<n; i++) {
             verCircles[i]=s.circle(verCoord[i][0]+vertexRad,verCoord[i][1]+vertexRad,vertexRad,vertexRad);
             verCircles[i].attr({fill: "white", stroke: "black", "stroke-width": 1.5});
             textCircles[i]=s.text(verCoord[i][0]+vertexRad,verCoord[i][1]+vertexRad,(i+1).toString());
             textCircles[i].attr({"font-size": 25});
             textCircles[i].attr({x: textCircles[i].getBBox().x-textCircles[i].getBBox().w/2, y:textCircles[i].getBBox().y+textCircles[i].getBBox().h, class: "unselectable"});
             circles[i]=s.group(verCircles[i],textCircles[i]);
             }
         if (addDraw==true) drawEdges();
}