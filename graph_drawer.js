function circleSegment (segPoint1, segPoint2, center, rad) {
         var area,height,sides=[];    
         area=Math.abs(segPoint1[0]*segPoint2[1]+segPoint1[1]*center[0]+segPoint2[0]*center[1]-
                       segPoint1[1]*segPoint2[0]-segPoint1[0]*center[1]-segPoint2[1]*center[0])/2;
         sides[0]=Math.sqrt(Math.pow(segPoint1[0]-segPoint2[0],2)+Math.pow(segPoint1[1]-segPoint2[1],2));
         sides[1]=Math.sqrt(Math.pow(segPoint1[0]-center[0],2)+Math.pow(segPoint1[1]-center[1],2));
         sides[2]=Math.sqrt(Math.pow(segPoint2[0]-center[0],2)+Math.pow(segPoint2[1]-center[1],2));
         if ((sides[0]*sides[0]+sides[2]*sides[2]-sides[1]*sides[1]>0)&&
             (sides[0]*sides[0]+sides[1]*sides[1]-sides[2]*sides[2]>0)) {
            height=area*2/sides[0];
            if (height<=1.1*rad) return true;
            }
         return false;
}
function drawGraph (frameX, frameY, frameW, frameH) {
         var adjMatrix=[],coord=[],possiblePos=[],possiblePosLen=0,dist;
         for (var i=0; i<n; i++) {
             adjMatrix[i]=[];
             for (var j=0; j<n; j++) {
                 adjMatrix[i][j]=0;
                 }
             }
         for (var i=0; i<edgeList.length; i++) {
             adjMatrix[edgeList[i][0]-1][edgeList[i][1]-1]=adjMatrix[edgeList[i][1]-1][edgeList[i][0]-1]=1;
             }
         dist=vertexRad/2+(Math.random()).toPrecision(4)*vertexRad/2;
         for (var i=0; i<=(frameW-2*vertexRad)/(2*vertexRad+dist); i++) {
             for (var j=0; j<=(frameH-2*vertexRad)/(2*vertexRad+dist); j++) {
                 possiblePos[possiblePosLen++]=[i*(2*vertexRad+dist)+frameX,j*(2*vertexRad+dist)+frameY];
                 }
             }
         for (var i=0; i<n; i++) {
             var ind,j,h,fl,curPoint;
             curpossiblePos=possiblePos.slice();
             for (;;) {
                 if (curpossiblePos.length==0) return drawGraph(frameX,frameY,frameW,frameH,n,edgeList,vertexRad);
                 ind=parseInt(Math.random()*(10*curpossiblePos.length))%curpossiblePos.length;
                 curPoint=curpossiblePos[ind];
                 fl=0;
                 for (j=0; j<i; j++) {
                     if (adjMatrix[i][j]==0) continue;
                     for (h=0; h<i; h++) {
                         if (h==j) continue;
                         if (circleSegment(curPoint,coord[j],coord[h],vertexRad)==true) {
                            fl++;
                            break;
                            }
                         }
                     if (fl!=0) break;
                     }
                 if (fl!=0) {
                    curpossiblePos.splice(ind,1);
                    continue;
                    }
                 coord[i]=curPoint;
                 possiblePos.splice(possiblePos.findIndex(function (elem) {
                     return (elem==curPoint);
                     }),1);
                 
                 for (j=0; j<i; j++) {
                     if (adjMatrix[i][j]==0) continue;
                     for (h=0; h<possiblePos.length; h++) {
                         if (circleSegment(curPoint,coord[j],possiblePos[h],vertexRad)==true) {
                            possiblePos.splice(h,1); h--;
                            }
                         }
                     }
                 break;
                 }
             }
         return coord;
}