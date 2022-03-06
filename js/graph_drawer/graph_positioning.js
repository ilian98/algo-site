"use strict";
(function () {
    function orientedArea (x1, y1, x2, y2, x3, y3) {
        return x1*y2+y1*x3+x2*y3-y1*x2-x1*y3-y2*x3;
    }
    function findOrientation (p1, p2, p3) {
        let area=orientedArea(p1[0],p1[1],p2[0],p2[1],p3[0],p3[1]);
        if (area<0) return -1;
        if (area>0) return +1;
        return 0;
    }
        
    function CalcPositions (graph) {
        let originalPos=[],possiblePos;
        
        let tryDesperate=false;
        this.vertexEdge = function (center, ind, curvePath = "") {
            let dist;
            if (tryDesperate===false) {
                if (graph.isWeight===true) dist=3*graph.vertexRad;
                else if (graph.isMulti===true) dist=2.1*graph.vertexRad;
                else dist=1.5*graph.vertexRad;
            }
            else dist=0.1*graph.vertexRad;
            let x=graph.edgeList[ind].x,y=graph.edgeList[ind].y;
            let st=graph.svgVertices[x].coord,end=graph.svgVertices[y].coord;
            if ((graph.edgeList[ind].curveHeight===undefined)||(graph.edgeList[ind].curveHeight===0)) {
                let area,height,sides=[];    
                area=Math.abs(orientedArea(st[0],st[1],end[0],end[1],center[0],center[1]))/2;
                sides[0]=segmentLength(st[0],st[1],end[0],end[1],2);
                sides[1]=segmentLength(st[0],st[1],center[0],center[1],2);
                sides[2]=segmentLength(end[0],end[1],center[0],center[1],2);
                if ((sides[0]*sides[0]+sides[2]*sides[2]-sides[1]*sides[1]>0)&&
                    (sides[0]*sides[0]+sides[1]*sides[1]-sides[2]*sides[2]>0)) {
                    let height=area*2/sides[0];
                    if (height<=dist) return false;
                }
                return true;
            }
            else {
                if (curvePath==="") curvePath=graph.calcCurvedEdge(st,end,graph.edgeList[ind].curveHeight,0)[0];
                if (Snap.path.intersection(curvePath,circlePath(center[0],center[1],dist)).length>0) return false;
                else return true;
            }
        }
        this.checkEdge = function (x, y, ind) {
            let curvePath="";
            if ((graph.edgeList[ind].curveHeight!==undefined)&&(graph.edgeList[ind].curveHeight!==0)) {
                curvePath=graph.calcCurvedEdge(graph.svgVertices[x].coord,graph.svgVertices[y].coord,
                                               graph.edgeList[ind].curveHeight,0)[0];
            }
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                if ((i==x)||(i==y)||(graph.svgVertices[i].coord===undefined)) continue;
                if (this.vertexEdge(graph.svgVertices[i].coord,ind,curvePath)===false) return false;
            }
            return true;
        }
        function checkEdgePlanner (x, y) {
            for (let edge of graph.edgeList) {
                if (edge===undefined) continue;
                let u=edge.x,v=edge.y;
                if ((u===x)||(u===y)||(v===x)||(v===y)) continue;
                if (u===v) continue;
                if ((graph.svgVertices[u].coord===undefined)||(graph.svgVertices[v].coord===undefined)) continue;
                if ((findOrientation(graph.svgVertices[x].coord,graph.svgVertices[y].coord,graph.svgVertices[u].coord)!=
                     findOrientation(graph.svgVertices[x].coord,graph.svgVertices[y].coord,graph.svgVertices[v].coord))&&
                    (findOrientation(graph.svgVertices[u].coord,graph.svgVertices[v].coord,graph.svgVertices[x].coord)!=
                     findOrientation(graph.svgVertices[u].coord,graph.svgVertices[v].coord,graph.svgVertices[y].coord))) {
                    return false;
                }
            }
            return true;
        }
        function checkEdges (x, y, check, tryPlanner = false) {
            for (let ind of graph.adjMatrix[x][y]) {
                if (check(ind)===false) return false;
            }
            if (graph.isDirected===true) {
                for (let ind of graph.adjMatrix[y][x]) {
                    if (check(ind)===false) return false;
                }
            }
            if ((tryPlanner===true)&&(checkEdgePlanner(x,y)===false)) return false;
            return true;
        }
        function checkVertex (vr, tryPlanner) {
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                if ((i===vr)||(graph.svgVertices[i].coord===undefined)||
                    ((graph.adjMatrix[vr][i].length==0)&&(graph.adjMatrix[i][vr].length===0))) continue;
                if (checkEdges(vr,i,this.checkEdge.bind(this,vr,i),tryPlanner)===false) return false;
            }
            return true;
        }
        this.calculatePossiblePos = function (flagCheckEdges) {
            possiblePos=[];
            for (let pos of originalPos) {
                let flag=true;
                for (let i=0; i<graph.n; i++) {
                    if (graph.vertices[i]===undefined) continue;
                    if (graph.svgVertices[i].coord===undefined) continue;
                    if (segmentLength(graph.svgVertices[i].coord[0],graph.svgVertices[i].coord[1],pos[0],pos[1])<
                        2*graph.vertexRad+((flagCheckEdges===true)?this.distVertices:0)-1) {
                        flag=false;
                        break;
                    }
                    if (flagCheckEdges===true) {
                        for (let j=0; j<graph.n; j++) {
                            if (graph.vertices[j]===undefined) continue;
                            if ((j===i)||(graph.svgVertices[j].coord===undefined)||
                                ((graph.adjMatrix[i][j].length===0)&&(graph.adjMatrix[j][i].length===0))) continue;
                            if (checkEdges(i,j,this.vertexEdge.bind(this,pos))===false) {
                                flag=false;
                                break;
                            }
                        }
                        if (flag===false) break;
                    }
                }
                if (flag===true) possiblePos.push(pos);
            }
            return possiblePos;
        }
        this.placeVertex = function (vr, tryPlanner) {
            let currPossiblePos=possiblePos.slice();
            for (;;) {
                if (currPossiblePos.length===0) return false;
                let ind=parseInt(Math.random()*(10*currPossiblePos.length))%currPossiblePos.length;
                graph.svgVertices[vr].coord=currPossiblePos[ind];
                if (checkVertex.call(this,vr,tryPlanner)===false) {
                    currPossiblePos.splice(ind,1);
                    continue;
                }

                possiblePos.splice(possiblePos.findIndex(function (elem) {
                    return (elem==graph.svgVertices[vr].coord);
                }),1);
                for (let v=0; v<graph.n; v++) {
                    if (graph.vertices[v]===undefined) continue;
                    if ((v===vr)||(graph.svgVertices[v].coord===undefined)||
                        ((graph.adjMatrix[vr][v].length===0)&&(graph.adjMatrix[v][vr].length===0))) continue;
                    for (let i=0; i<possiblePos.length; i++) {
                        let pos=possiblePos[i];
                        if (checkEdges(vr,v,this.vertexEdge.bind(this,pos))===false) {
                            possiblePos.splice(i,1); i--;
                        }
                    }
                }
                break;
            }
            return true;
        }
        function findMaxDepth (vr, father, dep, adjList) {
            let max=dep;
            for (let child of adjList[vr]) {
                if (child!=father) {
                    let value=findMaxDepth(child,vr,dep+1,adjList);
                    if (max<value) max=value;
                }
            }
            return max;
        }
        function fillVersDepth (vr, father, dep, maxDepth, adjList, versDepth) {
            versDepth[dep].push(vr);
            let flagChildren=false;
            if (vr!=-1) {
                for (let child of adjList[vr]) {
                    if (child!==father) {
                        flagChildren=true;
                        fillVersDepth(child,vr,dep+1,maxDepth,adjList,versDepth);
                    }
                }
            }
            if ((flagChildren===false)&&(dep<maxDepth)) fillVersDepth(-1,-2,dep+1,maxDepth,adjList,versDepth);
        }
        function findPositionsTree (root, treeEdges) {
            let versDepth=[];
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                versDepth[i]=[];
                graph.svgVertices[i].coord=undefined;
            }
            let adjList=[];
            for (let i=0; i<graph.n; i++) {
                adjList.push([]);
            }
            for (let [x, y] of treeEdges) {
                adjList[x].push(y);
                if (graph.isDirected===false) adjList[y].push(x);
            }
            let maxDepth=findMaxDepth(root,-1,0,adjList);
            fillVersDepth(root,-1,0,maxDepth,adjList,versDepth);

            let x=0,y=(2*graph.vertexRad+this.distVertices)*maxDepth,distX;
            if (versDepth[maxDepth].length>4) {
                distX=this.findRealWidth()/(versDepth[maxDepth].length-1);
                for (let vertex of versDepth[maxDepth]) {
                    if (vertex!==-1) graph.svgVertices[vertex].coord=[x,y];
                    x+=distX;
                }
            }
            else {
                distX=this.findRealWidth()/versDepth[maxDepth].length;
                for (let vertex of versDepth[maxDepth]) {
                    x+=distX;
                    if (vertex!==-1) graph.svgVertices[vertex].coord=[x,y];
                }
            }
            for (let i=maxDepth-1; i>=0; i--) {
                y-=(2*graph.vertexRad+this.distVertices);
                let ind=0;
                while (versDepth[i+1][ind]===-1) {
                    ind++;
                }
                for (let vertex of versDepth[i]) {
                    if (vertex===-1) continue;
                    if ((ind===versDepth[i+1].length)||(adjList[vertex].includes(versDepth[i+1][ind])===false)) {
                       graph.svgVertices[vertex].coord=undefined;
                       continue;
                    }
                    let sum=0,cnt=0;
                    for (; ind<versDepth[i+1].length; ind++) {
                        let child=versDepth[i+1][ind];
                        if (child===-1) continue;
                        if (adjList[vertex].includes(child)===false) break;
                        sum+=graph.svgVertices[child].coord[0];
                        cnt++;
                    }
                    graph.svgVertices[vertex].coord=[sum/cnt,y];
                }
                let prevX=0;
                for (let j=0; j<versDepth[i].length; j++) {
                    let v=versDepth[i][j];
                    if ((v!==-1)&&(graph.svgVertices[v].coord!==undefined)) {
                       prevX=graph.svgVertices[v].coord[0]+2*graph.vertexRad+this.distVertices;
                       continue;
                    }
                    let nextX=this.frameW,cnt=0;
                    for (let h=j; h<versDepth[i].length; h++) {
                        let next=versDepth[i][h];
                        if ((next!==-1)&&(graph.svgVertices[next].coord!==undefined)) {
                           nextX=graph.svgVertices[next].coord[0];
                           break;
                        }
                        cnt++;
                    }
                    let h;
                    if ((nextX==this.frameW)||(2*graph.vertexRad+this.distVertices<=(nextX-(prevX-this.distVertices))/(cnt+1))) {
                        prevX-=this.distVertices;
                        let x=prevX;
                        for (h=j; h<versDepth[i].length; h++) {
                            let v=versDepth[i][h];
                            if ((v!==-1)&&(graph.svgVertices[v].coord!==undefined)) break;
                            if (nextX!=this.frameW) x+=(nextX-prevX)/(cnt+1);
                            else x+=((nextX-graph.vertexRad-1)-prevX)/cnt;
                            if (v!==-1) graph.svgVertices[v].coord=[x-graph.vertexRad,y];
                        }
                    }
                    else {
                        let x=prevX;
                        for (h=j; h<versDepth[i].length; h++) {
                            let v=versDepth[i][h];
                            if ((v!==-1)&&(graph.svgVertices[v].coord!==undefined)) break;
                            if (v!==-1) graph.svgVertices[v].coord=[x,y];
                            x+=(nextX-prevX-this.distVertices)/cnt;
                        }
                    }
                    j=h-1;
                }
            }
        }

        let maxTimes;
        function findPositions () {
            let oldCoords=[],i=0;
            for (let svgVertex of graph.svgVertices) {
                if ((svgVertex===undefined)||(svgVertex.coord===undefined)) {
                    oldCoords[i++]=undefined;
                    continue;
                }
                oldCoords[i++]=[svgVertex.coord[0], svgVertex.coord[1]];
            }
            return [originalPos.slice(), oldCoords];
        }
        this.changePositions = function (allPositions, versCoord, undoType) {
            if (graph.graphController!==undefined) graph.graphController.registerAction("new-positions",findPositions(),undoType);
            
            if (allPositions.length>0) originalPos=allPositions;
            let i=0;
            for (let coord of versCoord) {
                if (graph.svgVertices[i]===undefined) graph.initSvgVertex(i);
                graph.svgVertices[i++].coord=coord;
            }
        }
        this.findMinX = function () {
            let weightDist=(graph.isWeighted===true)?graph.vertexRad/2:0;
            return Math.max(weightDist,this.frameX)+graph.findStrokeWidth()/2;
        }
        this.findMinY = function () {
            let loopDist=0;
            for (let edge of graph.edgeList) {
                if (edge===undefined) continue;
                if (edge.x===edge.y) {
                    loopDist=graph.findLoopEdgeProperties()[0];
                    break;
                }
            }
            let weightDist=(graph.isWeighted===true)?graph.vertexRad/2:0;
            return Math.max(Math.max(loopDist,weightDist),this.frameY)+graph.findStrokeWidth()/2;
        }
        this.findRealWidth = function () {
            return this.frameW-2*graph.vertexRad-2*this.findMinX();
        }
        this.findRealHeight = function () {
            return this.frameH-2*graph.vertexRad-2*this.findMinY();
        }
        this.distVertices=undefined; this.minX=undefined; this.minY=undefined;
        this.calcOriginalPos = function (minX = 0, minY = 0, dist = undefined) {
            maxTimes=parseInt(10000/graph.n);
            if (dist!==undefined) this.distVertices=dist;
            this.minX=minX; this.minY=minY;
            
            originalPos=[];
            let maxX=this.findMinX()+this.findRealWidth(),maxY=this.findMinY()+this.findRealHeight();
            let posX=[];
            posX.push(minX);
            for (;;) {
                let curr=posX[posX.length-1]+2*graph.vertexRad+this.distVertices;
                if (curr>maxX) break;
                posX.push(curr);
            }
            let posY=[];
            posY.push(minY);
            for (;;) {
                let curr=posY[posY.length-1]+2*graph.vertexRad+this.distVertices;
                if (curr>maxY) break;
                posY.push(curr);
            }
            for (let x of posX) {
                for (let y of posY) {
                    originalPos.push([x+graph.vertexRad, y+graph.vertexRad]);
                }
            }
        }
        function dfs (vr, adjList, edgeList, used, treeEdges) {
            used[vr]=true;
            for (let ind of adjList[vr]) {
                let child=edgeList[ind].findEndPoint(vr);
                if (used[child]===false) {
                    dfs(child,adjList,edgeList,used,treeEdges);
                    treeEdges.push([vr,child]);
                }
            }
        }
        this.calc = function (drawST = false, rootVertex = -1) {
            if (graph.graphController!==undefined)
                graph.graphController.registerAction("new-positions",findPositions());
            
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                if (graph.svgVertices[i]===undefined) graph.initSvgVertex(i);
            }
            if (drawST===false) {
                this.calcOriginalPos();
                
                let success=false,tryPlanner=false;
                tryDesperate=false;
                function tryCalc (tryPlanner) {
                    possiblePos=originalPos.slice();
                    for (let i=0; i<graph.n; i++) {
                        if (graph.vertices[i]===undefined) continue;
                        graph.svgVertices[i].coord=undefined;
                    }
                    for (let i=0; i<graph.n; i++) {
                        if (graph.vertices[i]===undefined) continue;
                        if (this.placeVertex(i,tryPlanner)===false) return false;
                    }
                    return true;
                }
                for (let time=1; time<=maxTimes; time++) {
                    if ((time<=maxTimes/2)&&((graph.n<=2)||((graph.n>=3)&&(graph.edgeList.length<=3*graph.n-6)))) tryPlanner=true;
                    if (tryCalc.call(this,tryPlanner)===true) {
                        success=true;
                        break;
                    }
                }
                if (success===false) {
                    tryDesperate=true;
                    for (let time=1; time<=1000; time++) {
                        if (tryCalc.call(this,false)===true) {
                            success=true;
                            break;
                        }
                    }
                    tryDesperate=false;
                    if (success===false) {
                        let shuffle=[];
                        for (let i=0; i<graph.n; i++) {
                            if (graph.vertices[i]===undefined) continue;
                            shuffle.push(i);
                        }
                        for (let i=shuffle.length-1; i>0; i--) {
                            let j=parseInt(Math.random()*(i+1));
                            [shuffle[i], shuffle[j]]=[shuffle[j], shuffle[i]];
                        }
                        let ind=0;
                        for (let i=0; i<shuffle.length; i++) {
                            let v=shuffle[i];
                            if (ind<originalPos.length) {
                                graph.svgVertices[v].coord=[originalPos[ind][0], originalPos[ind][1]];
                                ind++;
                            }
                            else {
                                graph.svgVertices[v].coord=[
                                    Math.random()*this.findRealWidth()+graph.vertexRad,
                                    Math.random()*this.findRealHeight()+graph.vertexRad
                                ];
                            }
                        }
                    }
                }
            }
            else {
                if (rootVertex===-1) {
                    for (let i=0; i<graph.n; i++) {
                        if (graph.vertices[i]!==undefined) {
                            rootVertex=i;
                            break;
                        }
                    }
                }
            
                if (graph.isDirected===true) {
                    let inDegree=[];
                    for (let i=0; i<graph.n; i++) {
                        inDegree[i]=0;
                    }
                    for (let edge of graph.edgeList) {
                        inDegree[edge.y]++;
                    }
                    for (let i=0; i<graph.n; i++) {
                        if (graph.vertices[i]===undefined) continue;
                        if (inDegree[i]===0) {
                            rootVertex=i;
                            break;
                        }
                    }
                }
            
                let used=[];
                for (let i=0; i<graph.n; i++) {
                    used[i]=false;
                }
                let treeEdges=[];
                dfs(rootVertex,graph.adjList,graph.edgeList,used,treeEdges);
                findPositionsTree.call(this,rootVertex,treeEdges);
                
                let boundaryPath="M0,0 "+this.frameX+",0 "+this.frameX+","+this.frameY+" 0,"+this.frameY+" Z";
                if (graph.graphController!==undefined) graph.graphController.undoTime--;
                for (let i=0; i<graph.edgeList.length; i++) {
                    if (graph.edgeList[i]===undefined) continue;
                    let x=graph.edgeList[i].x,y=graph.edgeList[i].y;
                    let found=false;
                    for (let edge of treeEdges) {
                        if ((x===edge[0])&&(y===edge[1])) {
                            found=true;
                            break;
                        }
                        if ((graph.isDirected===false)&&(y===edge[0])&&(x===edge[1])) {
                            found=true;
                            break;
                        }
                    }
                    if (graph.graphController!==undefined) 
                        graph.graphController.addChange("change-css-edge",
                                                        [i, [graph.edgeList[i].addedCSS[0], graph.edgeList[i].addedCSS[1]]],
                                                        undefined,
                                                        false);
                    if (found===true) {
                        let s=graph.edgeList[i].addedCSS[0];
                        for (;;) {
                            let beg=s.indexOf(";;stroke-dasharray: "),end;
                            if (beg===-1) break;
                            for (let j=beg+2; ; j++) {
                                if (s[j]===';') {
                                    end=j;
                                    break;
                                }
                            }
                            let remove=s.substring(beg,end+1);
                            s=graph.edgeList[i].addedCSS[0]=s.replace(remove,"");
                        }
                        graph.edgeList[i].curveHeight=undefined;
                        continue;
                    }
                    graph.edgeList[i].addedCSS[0]+="; ;;stroke-dasharray: "+(graph.vertexRad/2)+";";
                    
                    let oldCurveHeight=graph.edgeList[i].curveHeight;
                    let flag=false;
                    function checkCurveHeight (curveHeight) {
                        let res=graph.calcCurvedEdge(graph.svgVertices[x].coord,graph.svgVertices[y].coord,curveHeight,0);
                        if (Snap.path.intersection(res[0],boundaryPath).length>0) return 0;
                        graph.edgeList[i].curveHeight=curveHeight;
                        if (this.checkEdge(x,y,i)===true) return 1;
                        return 2;
                    }
                    let inc=parseInt(Math.random()*2);
                    if (inc===0) inc=-1;
                    for (let curveHeight=0;;) {
                        let res=checkCurveHeight.call(this,curveHeight);
                        if (res===0) break;
                        if (res===1) {
                            flag=true;
                            break;
                        }
                        curveHeight+=inc;
                    }
                    let prevCurveHeight=graph.edgeList[i].curveHeight;
                    inc*=(-1);
                    for (let curveHeight=inc;;) {
                        let res=checkCurveHeight.call(this,curveHeight);
                        if (res===0) break;
                        if (res===1) {
                            if ((flag===true)&&(Math.abs(prevCurveHeight)<Math.abs(curveHeight))) {
                                graph.edgeList[i].curveHeight=prevCurveHeight;
                                break;
                            }
                            flag=true;
                            break;
                        }
                        curveHeight+=inc;
                    }
                    if (flag===false) {
                        graph.edgeList[i].curveHeight=oldCurveHeight;
                        continue;
                    }
                    if (graph.graphController!==undefined) 
                        graph.graphController.addChange("change-curve-height",[i, oldCurveHeight],undefined,false);
                }
                if (graph.graphController!==undefined) graph.graphController.undoTime++;
            }

            centerGraph.call(this);
        }
        
        this.frameX=undefined; this.frameY=undefined; this.frameW=undefined; this.frameH=undefined;
        this.init = function (frameX, frameY, frameW, frameH) {
            if (frameX!==undefined) {
                this.frameX=frameX; this.frameY=frameY;
                this.frameW=frameW; this.frameH=frameH;
            }
            this.distVertices=graph.vertexRad*5/4+parseInt((Math.random())*graph.vertexRad/4);
            if (graph.isWeighted===true) this.distVertices*=2;
        }
        
        function centerGraph () {
            let minX=this.frameX+this.frameW,maxX=0;
            let minY=this.frameY+this.frameH,maxY=0;
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                let x=graph.svgVertices[i].coord[0],y=graph.svgVertices[i].coord[1];
                if (minX>x) minX=x;
                if (maxX<x) maxX=x;
                if (minY>y) minY=y;
                if (maxY<y) maxY=y;
            }
            let lenX=maxX-minX,lenY=maxY-minY;
            let strokeWidth=graph.findStrokeWidth();
            let addX=(this.findRealWidth()-lenX)/2+this.findMinX()+graph.vertexRad-minX;
            let addY=(this.findRealHeight()-lenY)/2+this.findMinY()+graph.vertexRad-minY;
            if (minX+addX<this.findMinX()+graph.vertexRad) addX=this.findMinX()+graph.vertexRad-minX;
            if (minY+addY<this.findMinY()+graph.vertexRad) addY=this.findMinY()+graph.vertexRad-minY;
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                graph.svgVertices[i].coord[0]+=addX;
                graph.svgVertices[i].coord[1]+=addY;
            }
            
            minX+=addX;
            for (;;) {
                if (minX-this.distVertices-2*graph.vertexRad<this.findMinX()+graph.vertexRad) break;
                minX-=(this.distVertices+2*graph.vertexRad);
            }
            minY+=addY;
            for (;;) {
                if (minY-this.distVertices-2*graph.vertexRad<this.findMinY()+graph.vertexRad) break;
                minY-=(this.distVertices+2*graph.vertexRad);
            }
            this.calcOriginalPos(minX-graph.vertexRad,minY-graph.vertexRad);
        }
    }
    
    window.orientedArea=orientedArea;
    window.findOrientation=findOrientation;
    window.CalcPositions = CalcPositions;
})();