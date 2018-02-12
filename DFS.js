var s,verCircles=[],textCircles=[],edgeLines=[];
var vertexRad=20,n=5,edgeList=[[1,2],[1,3],[1,4],[1,5],[2,3]],adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]];
var used=[],verCoord,animations=[];
function loadSvg () {
         s=Snap("#graph");
         verCoord=drawGraph(1,1,299,299,n,edgeList,vertexRad);
         for (var i=0; i<edgeList.length; i++) {
             var st=verCoord[edgeList[i][0]-1],end=verCoord[edgeList[i][1]-1];
             edgeLines[i]=s.line(st[0]+vertexRad,st[1]+vertexRad,end[0]+vertexRad,end[1]+vertexRad);
             edgeLines[i].attr({stroke: "black", "stroke-width": 1.5});
             }
         for (var i=0; i<n; i++) {
             verCircles[i]=s.circle(verCoord[i][0]+vertexRad,verCoord[i][1]+vertexRad,vertexRad,vertexRad);
             verCircles[i].attr({fill: "white", stroke: "black", "stroke-width": 1.5});
             textCircles[i]=s.text(verCoord[i][0]+vertexRad,verCoord[i][1]+vertexRad,(i+1).toString());
             textCircles[i].attr({"font-size": 25});
             textCircles[i].attr({x: textCircles[i].getBBox().x-textCircles[i].getBBox().w/2, y:textCircles[i].getBBox().y+textCircles[i].getBBox().h, class: "unselectable"});
             }
}
function start () {
         used=[];
         for (var i=0; i<n; i++) {
             used[i]=0;
             }
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
                                    s.append(verCircles[curAnim[1]]); s.append(textCircles[curAnim[1]]);
                                    s.append(verCircles[curAnim[2]]); s.append(textCircles[curAnim[2]]);
                                    lineDraw.animate({strokeDashoffset: 0},1000);
                                    }
                             }
                         curAnim=animations[i][animLen-1];
                         if (curAnim[0]==0) verCircles[curAnim[1]].animate({fill: curAnim[2]},1000,function () {
                                            if (i!=animations.length-1) animFuncs[i+1].func();
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
                                s.append(verCircles[curAnim[1]]); s.append(textCircles[curAnim[1]]);
                                s.append(verCircles[curAnim[2]]); s.append(textCircles[curAnim[2]]);
                                lineDraw.animate({strokeDashoffset: 0},1000,function () {
                                    lineDraw.remove();
                                    if (i!=animations.length-1) animFuncs[i+1].func();
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
             }
        if (fl==0) animations.push([[0,vr,"white"]]);
}