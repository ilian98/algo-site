function DFS () {

    this.name=undefined; this.graph = new Graph();
    this.used=undefined; this.animations=undefined;
    this.init = function (firstTime, name, svgName, isOriented) {
         this.graph.init();
         if (firstTime==true) {
            this.name=name; this.graph.svgName=svgName; this.graph.s=Snap(svgName);
            if (isOriented==false) {
               this.graph.edgeList=[[0,1],[0,2],[0,3],[0,4],[1,2]];
               this.graph.adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]];
               this.graph.adjMatrix=[[0,1,1,1,1],
                                     [1,0,1,0,0],
                                     [1,1,0,0,0],
                                     [1,0,0,0,0],
                                     [1,0,0,0,0]];
               this.graph.isOriented=false;
               }
             else {
                this.graph.s=Snap(svgName);
                this.graph.edgeList=[[0,1],[1,0],[0,2],[2,0],[0,3],[3,0],[0,4],[4,0],[1,2],[2,1]];
                this.graph.adjList=[[1,2,3,4],[0,2],[0,1],[0],[0]];
                this.graph.adjMatrix=[[0,1,1,1,1],
                                      [1,0,1,0,0],
                                      [1,1,0,0,0],
                                      [1,0,0,0,0],
                                      [1,0,0,0,0]];
                this.graph.isOriented=true;
                }
             }        
         this.used=[]; this.animations=[];
         drawGraph(this.graph,1,1,299,299);
         };
    
    this.start = function () {
         draw(this.graph,1,1,299,299,false);
         
         this.used=[];
         for (var i=0; i<this.graph.n; i++) {
             this.used[i]=0;
             }
         this.animations=[];
         this.animations.push([[0,0,"red"]]);
         this.dfs(0);
         var animFuncs=[];
         for (i=this.animations.length-1; i>=0; i--) {
             animFuncs[i] = {
                index: i,
                graph: this.graph,
                animations: this.animations,
                func: function () {
                         var i=this.index,curAnim,animLen=this.animations[i].length;
                         for (var j=0; j<animLen; j++) {
                             curAnim=this.animations[i][j];
                             if (curAnim[0]==0) {
                                this.graph.verCircles[curAnim[1]].isLast=(j==animLen-1);
                                this.graph.verCircles[curAnim[1]].graph=this.graph;
                                this.graph.verCircles[curAnim[1]].animations=this.animations;
                                this.graph.verCircles[curAnim[1]].animate({fill: curAnim[2]},1000,function () {
                                    if (this.isLast==true) {
                                       if (i!=this.animations.length-1) {
                                          animFuncs[i+1].func();
                                       }
                                       else this.graph.drawEdges(1,1,299,299);
                                       }
                                    });
                                }
                             else if (curAnim[0]==2) {
                                     this.graph.textCircles[curAnim[1]].isLast=(j==animLen-1);
                                     this.graph.textCircles[curAnim[1]].graph=this.graph;
                                     this.graph.textCircles[curAnim[1]].animations=this.animations;
                                     this.graph.textCircles[curAnim[1]].animate({fill: curAnim[2]},1000,function () {
                                         if (this.isLast==true) {
                                            if (i!=this.animations.length-1) animFuncs[i+1].func();
                                            else this.graph.drawEdges(1,1,299,299);
                                            }
                                         });
                                     }
                             else { var stx,sty,endx,endy;
                                    stx=this.graph.verCoord[curAnim[1]][0]+vertexRad;
                                    sty=this.graph.verCoord[curAnim[1]][1]+vertexRad;
                                    endx=this.graph.verCoord[curAnim[2]][0]+vertexRad;
                                    endy=this.graph.verCoord[curAnim[2]][1]+vertexRad;
                                    var path="M "+stx.toString()+","+sty.toString()+" L"+endx.toString()+","+endy.toString();
                                    var length=Snap.path.getTotalLength(path);
                                    var lineDraw=this.graph.s.path(path);
                                    lineDraw.attr({fill: "none", stroke: "red", "stroke-width": 4,
                                                   "stroke-dasharray": length.toString()+" "+length.toString(),
                                                   "stroke-dashoffset": length, "stroke-linecap": "round",
                                                   "stroke-linejoin": "round", "stroke-miterlimit": 10});
                                    this.graph.s.append(this.graph.circles[curAnim[1]]);
                                    this.graph.s.append(this.graph.circles[curAnim[2]]);
                                    lineDraw.isLast=(j==animLen-1);
                                    lineDraw.graph=this.graph;
                                    lineDraw.animations=this.animations;
                                    lineDraw.animate({strokeDashoffset: 0},1000,function () {
                                        lineDraw.remove();
                                        if (this.isLast==true) {
                                           if (i!=this.animations.length-1) animFuncs[i+1].func();
                                           else this.graph.drawEdges(1,1,299,299);
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
         for (var i=0; i<this.graph.adjList[vr].length; i++) {
             if (this.used[this.graph.adjList[vr][i]]==0) {
                if (verColour!=0) {
                   this.animations.push([[0,vr,"red"],[2,vr,"black"]]);
                   verColour=0;
                   }
                this.animations.push([[0,vr,"grey"],[1,vr,this.graph.adjList[vr][i]],[2,vr,"white"]]);
                this.animations.push([[0,this.graph.adjList[vr][i],"red"],[2,this.graph.adjList[vr][i],"black"]]);
                this.dfs(this.graph.adjList[vr][i]);
                verColour=1;
                }
             else { if (verColour!=0) {
                       this.animations.push([[0,vr,"red"],[2,vr,"black"]]);
                       verColour=0;
                       }
                    this.animations.push([[1,vr,this.graph.adjList[vr][i]]]); }
             }
        if (verColour==1) this.animations.push([[0,vr,"red"],[2,vr,"black"]]);
        this.animations.push([[0,vr,"grey"],[2,vr,"white"]]);
        };
    
    this.clear = function (remove) {
         this.graph.s.selectAll("*").forEach(function (elem) {
            elem.stop();
            });
         if (remove==true) this.graph.s.selectAll("*").remove();
         }
        
}