function drawGraph (frameX, frameY, frameW, frameH, n, edgeList, vertexR) {
         var adjMatrix=[],verCoord=[],pos=[],posLen=0;
         for (i=0; i<edgeList.length; i++) {
             adjMatrix[i]=[];
             }
         for (var i=0; i<edgeList.length; i++) {
             adjMatrix[edgeList[i][0]][edgeList[i][1]]=1;   
             }
         for (var i=0; i<=(frameW-2*vertexR)/(3*vertexR); i++) {
             for (var j=0; j<=(frameH-2*vertexR)/(3*vertexR); j++) {
                 pos[posLen++]=[i*(3*vertexR)+frameX,j*(3*vertexR)+frameY];
                 }
             }
         for (var i=0; i<n; i++) {
             var ind,j,h,fl,points=[],minX,maxX,cur,area,height;
             curPos=pos;
             for (;;) {
                 if (curPos.length==0) return drawGraph(frameX,frameY,frameW,frameH,n,edgeList,vertexR);
                 ind=parseInt(Math.random()*(10*curPos.length))%curPos.length;
                 cur=curPos[ind];
                 fl=0;
                 for (j=0; j<i; j++) {
                     for (h=0; h<j; h++) {
                         if ((adjMatrix[i][j]==0)&&(adjMatrix[i][h]==0)&&(adjMatrix[j][h]==0)) continue;
                         points[0]=verCoord[j]; points[1]=verCoord[h]; points[2]=cur;
                         area=Math.abs(points[0][0]*points[1][1]+points[0][1]*points[2][0]+points[1][0]*points[2][1]-
                                       points[0][1]*points[1][0]-points[0][0]*points[2][1]-points[1][1]*points[2][0])/2;
                         height=area*2/Math.sqrt(Math.pow(points[0][0]-points[1][0],2)+Math.pow(points[0][1]-points[1][1],2));
                         if (height<=11/10*vertexR) {
                            fl++;
                            break;
                            }
                         height=area*2/Math.sqrt(Math.pow(points[0][0]-points[2][0],2)+Math.pow(points[0][1]-points[2][1],2));
                         if (height<=11/10*vertexR) {
                            fl++;
                            break;
                            }
                         height=area*2/Math.sqrt(Math.pow(points[1][0]-points[2][0],2)+Math.pow(points[1][1]-points[2][1],2));
                         if (height<=11/10*vertexR) {
                            fl++;
                            break;
                            }
                         }
                     if (fl!=0) break;
                     }
                 if (fl!=0) {
                    curPos.splice(ind,1);
                    continue;
                    }
                 verCoord[i]=cur;
                 pos.splice(pos.findIndex(function (elem) {
                                return (elem==cur);
                                }),1);
                 break;
                 }
             }
         return verCoord;
}