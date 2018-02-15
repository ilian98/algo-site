var s,circles=[],verCircles=[],textCircles=[],edgeLines=[];
var vertexRad=20,n=5,edgeList=[[0,1],[0,2],[0,3],[0,4],[1,2]],adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]];
var adjMatrix=[[0,1,1,1,1],
               [1,0,1,0,0],
               [1,1,0,0,0],
               [1,0,0,0,0],
               [1,0,0,0,0]];
var used=[],verCoord=[],animations=[];
function loadSvg () {
         s=Snap("#graph");
         drawGraph(1,1,299,299);
}
function drawEdges () {
         var flag=0,mouseX,mouseY,stVer,curEdge,i,len;
         var svgElem=$("#graph")[0];
         var point=svgElem.createSVGPoint();
         for (i=0; i<n; i++) {
             circles[i]["index"]=i;
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
               curEdge=s.line(verCoord[stVer][0]+vertexRad,verCoord[stVer][1]+vertexRad,point.x,point.y);
               curEdge.attr({stroke: "black", "stroke-width": 1.5});
               for (i=0; i<n; i++) {
                   s.append(circles[i]);
                   }
               }
            });
         for (i=0; i<n; i++) {
             circles[i].mouseup(function () {
                flag=0;
                if (stVer==this.index) return ;
                if (adjMatrix[stVer][this.index]==1) return ;
                len=edgeList.length;
                edgeLines[len]=s.line(verCoord[stVer][0]+vertexRad,verCoord[stVer][1]+vertexRad,verCoord[this.index][0]+vertexRad,verCoord[this.index][1]+vertexRad);
                edgeLines[len].attr({stroke: "black", "stroke-width": 1.5});
                curEdge.remove();
                edgeList.push([stVer,this.index]);
                adjList[stVer].push(this.index); adjList[this.index].push(stVer);
                adjMatrix[stVer][this.index]=1; adjMatrix[this.index][stVer]=1;
                for (i=0; i<n; i++) {
                    s.append(circles[i]);
                    }
                for (i=0; i<n; i++) {
                    if ((i==stVer)||(i==this.index)) continue;
                    if (circleSegment(verCoord[stVer],verCoord[this.index],verCoord[i])==true) {
                       possiblePos.push(verCoord[stVer]);
                       if (placeVertex(stVer)==false) drawGraph(1,1,299,299);
                       else draw(true);
                       break;
                       }
                    }
                });
             }
         s.mouseup(function () {
            if (curEdge!=null) curEdge.remove();
            flag=0;
            });
}
function start () {
         eraseGraph();
         draw(false);
         used=[];
         for (var i=0; i<n; i++) {
             used[i]=0;
             }
         animations=[];
         animations.push([[0,0,"red"]])
         dfs(0);
         var animFuncs=[];
         for (i=animations.length-1; i>=0; i--) {
             animFuncs[i]={
                index: i,
                func: function () {
                         var i=this.index,curAnim,animLen=animations[i].length;
                         for (var j=0; j<animLen-1; j++) {
                             curAnim=animations[i][j];
                             if (curAnim[0]==0) verCircles[curAnim[1]].animate({fill: curAnim[2]},1000);
                             else { var stx,sty,endx,endy;
                                    stx=verCoord[curAnim[1]][0]+20; sty=verCoord[curAnim[1]][1]+20;
                                    endx=verCoord[curAnim[2]][0]+20; endy=verCoord[curAnim[2]][1]+20;
                                    var path="M "+stx.toString()+","+sty.toString()+" L"+endx.toString()+","+endy.toString();
                                    var length=Snap.path.getTotalLength(path);
                                    var lineDraw=s.path(path);
                                    lineDraw.attr({fill: "none", stroke: "red", "stroke-width": 2.5,
                                                   "stroke-dasharray": length.toString()+" "+length.toString(),
                                                   "stroke-dashoffset": length, "stroke-linecap": "round",
                                                   "stroke-linejoin": "round", "stroke-miterlimit": 10});
                                    s.append(circles[curAnim[1]]);
                                    s.append(circles[curAnim[2]]);
                                    lineDraw.animate({strokeDashoffset: 0},1000);
                                    }
                             }
                         curAnim=animations[i][animLen-1];
                         if (curAnim[0]==0) verCircles[curAnim[1]].animate({fill: curAnim[2]},1000,function () {
                                            if (i!=animations.length-1) animFuncs[i+1].func();
                                            else drawEdges();
                                            });
                         else { var stx,sty,endx,endy;
                                stx=verCoord[curAnim[1]][0]+20; sty=verCoord[curAnim[1]][1]+20;
                                endx=verCoord[curAnim[2]][0]+20; endy=verCoord[curAnim[2]][1]+20;
                                var path="M "+stx.toString()+","+sty.toString()+" L"+endx.toString()+","+endy.toString();
                                var length=Snap.path.getTotalLength(path);
                                var lineDraw=s.path(path);
                                lineDraw.attr({fill: "none", stroke: "red", "stroke-width": 2.5,
                                               "stroke-dasharray": length.toString()+" "+length.toString(),
                                               "stroke-dashoffset": length, "stroke-linecap": "round",
                                               "stroke-linejoin": "round", "stroke-miterlimit": 10});
                                s.append(circles[curAnim[1]]);
                                s.append(circles[curAnim[2]]);
                                lineDraw.animate({strokeDashoffset: 0},1000,function () {
                                    lineDraw.remove();
                                    if (i!=animations.length-1) animFuncs[i+1].func();
                                    else drawEdges();
                                    });
                                }
                        }
                }
             }
        animFuncs[0].func();
}
function dfs (vr) {
         var fl=0;
         used[vr]=1;
         for (var i=0; i<adjList[vr].length; i++) {
             if (used[adjList[vr][i]]==0) {
                if (fl!=0) animations.push([[0,vr,"red"]]);
                animations.push([[0,vr,"white"],[1,vr,adjList[vr][i]]]);
                animations.push([[0,adjList[vr][i],"red"]]);
                dfs(adjList[vr][i]);
                fl++;
                }
             else animations.push([[1,vr,adjList[vr][i]]]);
             }
        if (fl==0) animations.push([[0,vr,"white"]]);
}