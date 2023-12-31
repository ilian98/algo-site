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
            let dist,vertexRad=graph.graphDrawer.findAttrValue("vertex","r");
            if (tryDesperate===false) {
                if (graph.isWeight===true) dist=3*vertexRad;
                else if (graph.isMulti===true) dist=2.1*vertexRad;
                else dist=1.5*vertexRad;
            }
            else dist=0.1*vertexRad;
            let edge=graph.getEdge(ind);
            let x=edge.x,y=edge.y;
            let st=graph.svgVertices[x].coord,end=graph.svgVertices[y].coord;
            if ((edge.curveHeight===undefined)||(edge.curveHeight===0)) {
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
                if (curvePath==="") curvePath=graph.graphDrawer.calcCurvedEdge(st,end,edge.curveHeight,0)[0];
                if (Snap.path.intersection(curvePath,circlePath(center[0],center[1],dist)).length>0) return false;
                else return true;
            }
        }
        this.checkEdge = function (x, y, ind) {
            let curvePath="";
            let edge=graph.getEdge(ind);
            if ((edge.curveHeight!==undefined)&&(edge.curveHeight!==0)) {
                curvePath=graph.graphDrawer.calcCurvedEdge(graph.svgVertices[x].coord,graph.svgVertices[y].coord,
                                               edge.curveHeight,0)[0];
            }
            for (let [i, vr] of graph.getVertices()) {
                if ((i===x)||(i===y)||(graph.svgVertices[i].coord===undefined)) continue;
                if (this.vertexEdge(graph.svgVertices[i].coord,ind,curvePath)===false) return false;
            }
            return true;
        }
        function checkEdgePlanner (x, y) {
            for (let [i, edge] of graph.getEdges()) {
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
            for (let [i, ver] of graph.getVertices()) {
                if ((i===vr)||(graph.svgVertices[i].coord===undefined)||
                    ((graph.adjMatrix[vr][i].length==0)&&(graph.adjMatrix[i][vr].length===0))) continue;
                if (checkEdges(vr,i,this.checkEdge.bind(this,vr,i),tryPlanner)===false) return false;
            }
            return true;
        }
        this.calculatePossiblePos = function (flagCheckEdges) {
            possiblePos=[];
            let vers=graph.getVertices();
            for (let pos of originalPos) {
                let flag=true;
                for (let [i, vr] of vers) {
                    if (graph.svgVertices[i].coord===undefined) continue;
                    if (segmentLength(graph.svgVertices[i].coord[0],graph.svgVertices[i].coord[1],pos[0],pos[1])<
                        2*graph.graphDrawer.findAttrValue("vertex","r")+((flagCheckEdges===true)?this.distVertices:0)-1) {
                        flag=false;
                        break;
                    }
                    if (flagCheckEdges===true) {
                        for (let [j, vr] of vers) {
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
            let currPossiblePos;
            if (graph.isNetwork===false) currPossiblePos=possiblePos.slice();
            else {
                if ((vr===graph.source)||(vr===graph.sink)) {
                    currPossiblePos=[];
                    if (possiblePos.length>0) {
                        let minX=possiblePos[0][0],maxX=possiblePos[0][0];
                        for (let pos of possiblePos) {
                            if (minX>pos[0]) minX=pos[0];
                            if (maxX<pos[0]) maxX=pos[0];
                        }
                        currPossiblePos=[];
                        for (let pos of possiblePos) {
                            if ((vr===graph.source)&&(minX===pos[0])) currPossiblePos.push(pos);
                            if ((vr===graph.sink)&&(maxX===pos[0])) currPossiblePos.push(pos);
                        }
                    }
                }
                else currPossiblePos=possiblePos.slice();
            }
            
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
                for (let [v, data] of graph.getVertices()) {
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
            for (let [i, vr] of graph.getVertices()) {
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

            let vertexRad=graph.graphDrawer.findAttrValue("vertex","r");
            let x=0,y=(2*vertexRad+this.distVertices)*maxDepth,distX;
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
                y-=(2*vertexRad+this.distVertices);
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
                       prevX=graph.svgVertices[v].coord[0]+2*vertexRad+this.distVertices;
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
                    if ((nextX==this.frameW)||(2*vertexRad+this.distVertices<=(nextX-(prevX-this.distVertices))/(cnt+1))) {
                        prevX-=this.distVertices;
                        let x=prevX;
                        for (h=j; h<versDepth[i].length; h++) {
                            let v=versDepth[i][h];
                            if ((v!==-1)&&(graph.svgVertices[v].coord!==undefined)) break;
                            if (nextX!=this.frameW) x+=(nextX-prevX)/(cnt+1);
                            else x+=((nextX-vertexRad-1)-prevX)/cnt;
                            if (v!==-1) graph.svgVertices[v].coord=[x-vertexRad,y];
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
        this.changePositions = function (allPositions, versCoord) {
            if (graph.graphController!==undefined) graph.graphController.registerAction("new-positions",findPositions());
            
            if (allPositions.length>0) originalPos=allPositions;
            let i=0;
            for (let coord of versCoord) {
                if (graph.svgVertices[i]===undefined) graph.initSvgVertex(i);
                graph.svgVertices[i++].coord=coord;
            }
        }
        this.findMaxStrokeWidth = function () {
            let max=0;
            for (let [i, vertex] of graph.getVertices()) {
                max=Math.max(max,graph.graphDrawer.findAttrValue("vertex","stroke-width",i));
            }
            return max;
        }
        this.findMinX = function () {
            let weightDist=(graph.isWeighted===true)?graph.graphDrawer.findAttrValue("vertex","r")/2:0;
            return Math.max(weightDist,this.frameX)+this.findMaxStrokeWidth()/2;
        }
        this.findMinY = function () {
            let loopDist=0;
            for (let [i, edge] of graph.getEdges()) {
                if (edge.x===edge.y) {
                    loopDist=graph.graphDrawer.findLoopEdgeProperties()[0];
                    break;
                }
            }
            let weightDist=(graph.isWeighted===true)?graph.graphDrawer.findAttrValue("vertex","r")/2:0;
            return Math.max(Math.max(loopDist,weightDist),this.frameY)+this.findMaxStrokeWidth()/2;
        }
        this.findRealWidth = function () {
            return this.frameW-2*graph.graphDrawer.findAttrValue("vertex","r")-2*this.findMinX();
        }
        this.findRealHeight = function () {
            return this.frameH-2*graph.graphDrawer.findAttrValue("vertex","r")-2*this.findMinY();
        }
        this.distVertices=undefined; this.minX=undefined; this.minY=undefined;
        this.calcOriginalPos = function (minX = 0, minY = 0, dist = undefined) {
            maxTimes=parseInt(10000/graph.n);
            if (dist!==undefined) this.distVertices=dist;
            this.minX=minX; this.minY=minY;
            
            let vertexRad=graph.graphDrawer.findAttrValue("vertex","r");
            originalPos=[];
            let maxX=this.findMinX()+this.findRealWidth(),maxY=this.findMinY()+this.findRealHeight();
            let posX=[];
            posX.push(minX);
            for (;;) {
                let curr=posX[posX.length-1]+2*vertexRad+this.distVertices;
                if (curr>maxX) break;
                posX.push(curr);
            }
            let posY=[];
            posY.push(minY);
            for (;;) {
                let curr=posY[posY.length-1]+2*vertexRad+this.distVertices;
                if (curr>maxY) break;
                posY.push(curr);
            }
            for (let x of posX) {
                for (let y of posY) {
                    originalPos.push([x+vertexRad, y+vertexRad]);
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
            
            let vertexRad=graph.graphDrawer.findAttrValue("vertex","r");
            let vers=graph.getVertices();
            for (let [i, vr] of vers) {
                if (graph.svgVertices[i]===undefined) graph.initSvgVertex(i);
            }
            if (drawST===false) {
                this.calcOriginalPos();
                
                let success=false,tryPlanner=false;
                tryDesperate=false;
                function tryCalc (tryPlanner) {
                    possiblePos=originalPos.slice();
                    for (let [i, vr] of vers) {
                        graph.svgVertices[i].coord=undefined;
                    }
                    for (let [i, vr] of vers) {
                        if (this.placeVertex(i,tryPlanner)===false) return false;
                    }
                    return true;
                }
                let cntUniqueEdges=0;
                for (let i=0; i<graph.n; i++) {
                    for (let j=0; j<graph.n; j++) {
                        if (i===j) continue;
                        if (graph.adjMatrix[i][j].length>0) {
                            if ((i<j)||((i>j)&&(graph.adjMatrix[j][i].length===0))) {
                            cntUniqueEdges++;
                            }
                        }
                    }
                }
                for (let time=1; time<=maxTimes; time++) {
                    if ((time<=maxTimes/2)&&((graph.n<=2)||((graph.n>=3)&&(cntUniqueEdges<=3*graph.n-6)))) tryPlanner=true;
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
                        for (let [i, vr] of vers) {
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
                                    Math.random()*this.findRealWidth()+vertexRad,
                                    Math.random()*this.findRealHeight()+vertexRad
                                ];
                            }
                        }
                    }
                }
            }
            else {
                if (rootVertex===-1) rootVertex=vers[0][0];
            
                let edges=graph.getEdges();
                if (graph.isDirected===true) {
                    let inDegree=[];
                    for (let i=0; i<graph.n; i++) {
                        inDegree[i]=0;
                    }
                    for (let [i, edge] of edges) {
                        inDegree[edge.y]++;
                    }
                    for (let [i, vr] of vers) {
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
                dfs(rootVertex,graph.adjList,graph.getIndexedEdges(),used,treeEdges);
                findPositionsTree.call(this,rootVertex,treeEdges);
                
                let boundaryPath="M0,0 "+this.frameX+",0 "+this.frameX+","+this.frameY+" 0,"+this.frameY+" Z";
                if (graph.graphController!==undefined) graph.graphController.undoTime--;
                for (let [i, edge] of edges) {
                    let x=edge.x,y=edge.y;
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
                        graph.graphController.addChange("change-added-css-edge",
                                                        [i, [edge.addedCSS[0]]],
                                                        false);
                    if (found===true) {
                        edge.addedCSS[0]["stroke-dasharray"]="";
                        edge.curveHeight=undefined;
                        continue;
                    }
                    edge.addedCSS[0]["stroke-dasharray"]=(10*graph.size);
                    
                    let oldCurveHeight=edge.curveHeight;
                    let flag=false;
                    function checkCurveHeight (curveHeight) {
                        let res=graph.graphDrawer.calcCurvedEdge(graph.svgVertices[x].coord,graph.svgVertices[y].coord,curveHeight,0);
                        if (Snap.path.intersection(res[0],boundaryPath).length>0) return 0;
                        edge.curveHeight=curveHeight;
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
                    let prevCurveHeight=edge.curveHeight;
                    inc*=(-1);
                    for (let curveHeight=inc;;) {
                        let res=checkCurveHeight.call(this,curveHeight);
                        if (res===0) break;
                        if (res===1) {
                            if ((flag===true)&&(Math.abs(prevCurveHeight)<Math.abs(curveHeight))) {
                                edge.curveHeight=prevCurveHeight;
                                break;
                            }
                            flag=true;
                            break;
                        }
                        curveHeight+=inc;
                    }
                    if (flag===false) {
                        edge.curveHeight=oldCurveHeight;
                        continue;
                    }
                    if (graph.graphController!==undefined) 
                        graph.graphController.addChange("change-curve-height",[i, oldCurveHeight],false);
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
            let vertexRad=graph.graphDrawer.findAttrValue("vertex","r");
            this.distVertices=vertexRad*5/4+parseInt((Math.random())*vertexRad/4);
            if (graph.isWeighted===true) this.distVertices*=2;
            if (graph.isNetwork===true) this.distVertices*=2;
        }
        
        function centerGraph () {
            let vertexRad=graph.graphDrawer.findAttrValue("vertex","r");
            let minX=this.frameX+this.frameW,maxX=0;
            let minY=this.frameY+this.frameH,maxY=0;
            let vers=graph.getVertices();
            for (let [i, vr] of vers) {
                let x=graph.svgVertices[i].coord[0],y=graph.svgVertices[i].coord[1];
                if (minX>x) minX=x;
                if (maxX<x) maxX=x;
                if (minY>y) minY=y;
                if (maxY<y) maxY=y;
            }
            let lenX=maxX-minX,lenY=maxY-minY;
            let addX=(this.findRealWidth()-lenX)/2+this.findMinX()+vertexRad-minX;
            let addY=(this.findRealHeight()-lenY)/2+this.findMinY()+vertexRad-minY;
            if (minX+addX<this.findMinX()+vertexRad) addX=this.findMinX()+vertexRad-minX;
            if (minY+addY<this.findMinY()+vertexRad) addY=this.findMinY()+vertexRad-minY;
            for (let [i, vr] of vers) {
                graph.svgVertices[i].coord[0]+=addX;
                graph.svgVertices[i].coord[1]+=addY;
            }
            
            minX+=addX;
            for (;;) {
                if (minX-this.distVertices-2*vertexRad<this.findMinX()+vertexRad) break;
                minX-=(this.distVertices+2*vertexRad);
            }
            minY+=addY;
            for (;;) {
                if (minY-this.distVertices-2*vertexRad<this.findMinY()+vertexRad) break;
                minY-=(this.distVertices+2*vertexRad);
            }
            this.calcOriginalPos(minX-vertexRad,minY-vertexRad);
        }
    }
    
    window.orientedArea=orientedArea;
    window.findOrientation=findOrientation;
    window.CalcPositions = CalcPositions;
})();