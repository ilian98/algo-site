function DFS () {

    this.s=undefined;
    this.circles=undefined; this.verCircles=undefined; this.verCoord=undefined; this.textCircles=undefined;
    this.edgeLines=undefined;
    this.n=undefined; this.edgeList=undefined; this.adjList=undefined; this.adjMatrix=undefined; this.isOriented=undefined;
    this.used=undefined; this.animations=undefined;
    this.init = function (svgName) {
         this.circles=[]; this.verCircles=[]; this.verCoord=[]; this.textCircles=[]; this.edgeLines=[];
         this.edgeList=[]; this.adjList=[]; this.adjMatrix=[];
         for (var i=0; i<this.n; i++) {
             this.adjList[i]=[]; this.adjMatrix[i]=[];
             for (var j=0; j<this.n; j++) {
                 this.adjMatrix[i][j]=0;
                 }
             }
         if (svgName=="graphUnoriented") {
            this.s=Snap("#"+svgName);
            this.edgeList=[[0,1],[0,2],[0,3],[0,4],[1,2]];
            this.adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]];
            this.adjMatrix=[[0,1,1,1,1],
                            [1,0,1,0,0],
                            [1,1,0,0,0],
                            [1,0,0,0,0],
                            [1,0,0,0,0]];
            this.isOriented=false;
            }
         else if (svgName=="graphOriented") {
                 this.s=Snap("#"+svgName);
                 this.edgeList=[[0,1],[1,0],[0,2],[2,0],[0,3],[3,0],[0,4],[4,0],[1,2],[2,1]];
                 this.adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]];
                 this.adjMatrix=[[0,1,1,1,1],
                                 [1,0,1,0,0],
                                 [1,1,0,0,0],
                                 [1,0,0,0,0],
                                 [1,0,0,0,0]];
                 this.isOriented=true;
                 }
         this.used=[]; this.animations=[];
         drawGraph(this.s,this.circles,this.verCircles,this.verCoord,this.textCircles,this.edgeLines,1,1,299,299,this.n,this.adjMatrix,this.adjList,this.edgeList,this.isOriented);
         };
    this.start = function () {
         s=this.s; circles=this.circles; verCircles=this.verCircles; verCoord=this.verCoord; textCircles=this.textCircles;
         edgeLines=this.edgeLines;
         n=this.n; edgeList=this.edgeList; adjList=this.adjList; adjMatrix=this.adjMatrix; isOriented=this.isOriented;
         draw(s,circles,verCircles,verCoord,textCircles,edgeLines,1,1,299,299,n,adjMatrix,adjList,edgeList,isOriented,false);
         this.used=[];
         for (var i=0; i<n; i++) {
             this.used[i]=0;
             }
         this.animations=[];
         this.animations.push([[0,0,"red"]])
         this.dfs(0);
         animations=this.animations;
         var animFuncs=[];
         for (i=animations.length-1; i>=0; i--) {
             animFuncs[i]={
                index: i,
                func: function () {
                         var i=this.index,curAnim,animLen=animations[i].length; console.log(isOriented);
                         for (var j=0; j<animLen; j++) {
                             curAnim=animations[i][j];
                             if (curAnim[0]==0) {
                                verCircles[curAnim[1]].isLast=(j==animLen-1);
                                verCircles[curAnim[1]].animate({fill: curAnim[2]},1000,function () {
                                    if (this.isLast==true) {
                                       if (i!=animations.length-1) animFuncs[i+1].func();
                                       else drawEdges(s,circles,verCircles,verCoord,textCircles,edgeLines,1,1,299,299,n,adjMatrix,adjList,edgeList,isOriented);
                                       }
                                    });
                                }
                             else if (curAnim[0]==2) {
                                     textCircles[curAnim[1]].isLast=(j==animLen-1);
                                     textCircles[curAnim[1]].animate({fill: curAnim[2]},1000,function () {
                                         if (this.isLast==true) {
                                            if (i!=animations.length-1) animFuncs[i+1].func();
                                            else drawEdges(s,circles,verCircles,verCoord,textCircles,edgeLines,1,1,299,299,n,adjMatrix,adjList,edgeList,isOriented);
                                            }
                                         });
                                     }
                             else { var stx,sty,endx,endy;
                                    stx=verCoord[curAnim[1]][0]+vertexRad; sty=verCoord[curAnim[1]][1]+vertexRad;
                                    endx=verCoord[curAnim[2]][0]+vertexRad; endy=verCoord[curAnim[2]][1]+vertexRad;
                                    var path="M "+stx.toString()+","+sty.toString()+" L"+endx.toString()+","+endy.toString();
                                    var length=Snap.path.getTotalLength(path);
                                    var lineDraw=s.path(path);
                                    lineDraw.attr({fill: "none", stroke: "red", "stroke-width": 4,
                                                   "stroke-dasharray": length.toString()+" "+length.toString(),
                                                   "stroke-dashoffset": length, "stroke-linecap": "round",
                                                   "stroke-linejoin": "round", "stroke-miterlimit": 10});
                                    s.append(circles[curAnim[1]]);
                                    s.append(circles[curAnim[2]]);
                                    lineDraw.isLast=(j==animLen-1);
                                    lineDraw.animate({strokeDashoffset: 0},1000,function () {
                                        lineDraw.remove();
                                        if (this.isLast==true) {
                                           if (i!=animations.length-1) animFuncs[i+1].func();
                                           else drawEdges(s,circles,verCircles,verCoord,textCircles,edgeLines,1,1,299,299,n,adjMatrix,adjList,edgeList,isOriented);
                                           }
                                        });
                                    }
                             }
                        }
                }
             }
        animFuncs[0].func();
        };
    this.dfs = function (vr) {
         var verColour=0;
         this.used[vr]=1;
         for (var i=0; i<this.adjList[vr].length; i++) {
             if (this.used[this.adjList[vr][i]]==0) {
                if (verColour!=0) {
                   this.animations.push([[0,vr,"red"],[2,vr,"black"]]);
                   verColour=0;
                   }
                this.animations.push([[0,vr,"grey"],[1,vr,this.adjList[vr][i]],[2,vr,"white"]]);
                this.animations.push([[0,this.adjList[vr][i],"red"],[2,this.adjList[vr][i],"black"]]);
                this.dfs(this.adjList[vr][i]);
                verColour=1;
                }
             else { if (verColour!=0) {
                       this.animations.push([[0,vr,"red"],[2,vr,"black"]]);
                       verColour=0;
                       }
                    this.animations.push([[1,vr,this.adjList[vr][i]]]); }
             }
        if (verColour==1) this.animations.push([[0,vr,"red"],[2,vr,"black"]]);
        this.animations.push([[0,vr,"grey"],[2,vr,"white"]]);
        };
    this.clear = function (remove) {
         this.s.selectAll("*").forEach(function (elem) {
            elem.stop();
            });
         if (remove==true) this.s.selectAll("*").remove();
         }
        
}