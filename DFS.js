var s,vertices=[],edges=[];
var adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]],used=[],verticesCoord,animations=[];
function loadSvg () {
         s=Snap("#img");
         var edgeList=[[1,2],[1,3],[1,4],[1,5],[2,3]],vertexR=20,n=5,edges=[];
         verticesCoord=drawGraph(1,1,299,299,n,edgeList,vertexR);
         for (var i=0; i<edgeList.length; i++) {
             var st=verticesCoord[edgeList[i][0]-1],end=verticesCoord[edgeList[i][1]-1];
             edges[i]=s.line(st[0]+vertexR,st[1]+vertexR,end[0]+vertexR,end[1]+vertexR);
             edges[i].attr({stroke: "black", "stroke-width": 1.5});
             }
         for (var i=0; i<n; i++) {
             vertices[i]=s.circle(verticesCoord[i][0]+vertexR,verticesCoord[i][1]+vertexR,vertexR,vertexR);
             var text=s.text(verticesCoord[i][0]+vertexR,verticesCoord[i][1]+vertexR,(i+1).toString());
             text.attr({"font-size": 25});
             text.attr({x: text.getBBox().x-text.getBBox().w/2, y:text.getBBox().y+text.getBBox().h, class: "unselectable"});
             vertices[i].attr({fill: "white", stroke: "black", "stroke-width": 1.5});
             }
}
function start () {
         used=[];
         for (var i=0; i<5; i++) {
             used[i]=0;
             }
         animations.push([1,[0,0,"red"]])
         dfs(0);
         var animFuncs=[];
         for (i=animations.length-1; i>=0; i--) {
             animFuncs[i]={
                index: i,
                func: function () {
                         var i=this.index,cur;
                         for (var j=1; j<animations[i][0]; j++) {
                             cur=animations[i][j];
                             if (cur[0]==0) vertices[cur[1]].animate({fill: cur[2]},1000);
                             else { var stx,sty,endx,endy;
                                    stx=verticesCoord[cur[1]][0]+20; sty=verticesCoord[cur[1]][1]+20;
                                    endx=verticesCoord[cur[2]][0]+20; endy=verticesCoord[cur[2]][1]+20;
                                    var matrix=new Snap.matrix();
                                    matrix.translate(endx-stx,endy-sty);
                                    var cir=s.circle(stx,sty,2,2).attr({fill: "red"});
                                    cir.animate({transform: matrix},1000,function () {
                                        cir.remove();
                                        });
                                    }
                             }
                         cur=animations[i][animations[i][0]];
                         if (cur[0]==0) vertices[cur[1]].animate({fill: cur[2]},1000,function () {
                                            if (i!=animations.length-1) animFuncs[i+1].func();
                                            });
                         else { var stx,sty,endx,endy;
                                stx=verticesCoord[cur[1]][0]+20; sty=verticesCoord[cur[1]][1]+20;
                                endx=verticesCoord[cur[2]][0]+20; endy=verticesCoord[cur[2]][1]+20;
                                var matrix=new Snap.matrix();
                                matrix.translate(endx-stx,endy-sty);
                                var cir=s.circle(stx,sty,2,2).attr({fill: "red"});
                                cir.animate({transform: matrix},1000,function () {
                                    cir.remove();
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
                if (fl!=0) animations.push([1,[0,vr,"red"]]);
                animations.push([3,[0,vr,"white"],[1,vr,adjList[vr][i]],[0,adjList[vr][i],"red"]]);
                dfs(adjList[vr][i]);
                fl++;
                }
             }
        if (fl==0) animations.push([1,[0,vr,"white"]]);
}