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
        this.originalPos=[];
        let possiblePos;
        
        let tryDesperate;
        this.vertexEdge = function (center, ind) {
            let dist;
            if (tryDesperate===false) {
                if (graph.isWeight===true) dist=3*graph.vertexRad;
                else if (graph.isMulti===true) dist=2.1*graph.vertexRad;
                else dist=1.5*graph.vertexRad;
            }
            else dist=0.1*graph.vertexRad;
            let x=graph.edgeList[ind].x,y=graph.edgeList[ind].y;
            let st=graph.svgVertices[x].coord,end=graph.svgVertices[y].coord;
            if (graph.edgeList[ind].curveHeight===undefined) {
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
                let res=graph.calcCurvedEdge(st,end,graph.edgeList[ind].curveHeight,0);
                if (Snap.path.intersection(res[0],circlePath(center[0],center[1],dist)).length>0) return false;
                else return true;
            }
        }
        this.checkEdge = function (x, y, ind) {
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                if ((i==x)||(i==y)||(graph.svgVertices[i].coord===undefined)) continue;
                if (this.vertexEdge(graph.svgVertices[i].coord,ind)===false) {
                    return false;
                }
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
            for (let pos of this.originalPos) {
                let flag=true;
                for (let i=0; i<graph.n; i++) {
                    if (graph.vertices[i]===undefined) continue;
                    if (graph.svgVertices[i].coord===undefined) continue;
                    if (segmentLength(graph.svgVertices[i].coord[0],graph.svgVertices[i].coord[1],pos[0],pos[1])<
                        2*graph.vertexRad+((flagCheckEdges===true)?distVertices:0)-1) {
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
        function findMaxDepth (vr, father, dep, adjList, edgeList) {
            let max=dep;
            for (let ind of adjList[vr]) {
                let child=edgeList[ind].findEndPoint(vr);
                if (child!=father) {
                    let value=findMaxDepth(child,vr,dep+1,adjList,edgeList);
                    if (max<value) max=value;
                }
            }
            return max;
        }
        function fillVersDepth (vr, father, dep, maxDepth, adjList, edgeList, versDepth) {
            versDepth[dep].push(vr);
            let flagChildren=false;
            if (vr!=-1) {
                for (let ind of adjList[vr]) {
                    let child=edgeList[ind].findEndPoint(vr);
                    if (child!==father) {
                        flagChildren=true;
                        fillVersDepth(child,vr,dep+1,maxDepth,adjList,edgeList,versDepth);
                    }
                }
            }
            if ((flagChildren===false)&&(dep<maxDepth)) fillVersDepth(-1,-2,dep+1,maxDepth,adjList,edgeList,versDepth);
        }

        let maxTimes,distVertices;
        function calc () {
            let oldCoords=[];
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                if ((graph.svgVertices[i]===undefined)||(graph.svgVertices[i].coord===undefined)) continue;
                oldCoords[i]=[graph.svgVertices[i].coord[0], graph.svgVertices[i].coord[1]];
            }
            graph.undoStack.push({time: graph.undoTime, type: "new-positions", data: [this.originalPos.slice(), oldCoords]});
            graph.undoTime++;
            graph.redoStack=[];
            
            if (graph.isTree===false) {
                this.originalPos=[];
                for (let i=0; i<=(graph.frameW-2*graph.vertexRad)/(2*graph.vertexRad+distVertices); i++) {
                    for (let j=0; j<=(graph.frameH-2*graph.vertexRad)/(2*graph.vertexRad+distVertices); j++) {
                        this.originalPos.push([
                            i*(2*graph.vertexRad+distVertices)+graph.frameX+graph.vertexRad,
                            j*(2*graph.vertexRad+distVertices)+graph.frameY+graph.vertexRad
                        ]);
                    }
                }   
                
                let success=false,tryPlanner=false;
                tryDesperate=false;
                function tryCalc (tryPlanner) {
                    possiblePos=this.originalPos.slice();
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
                            if (ind<this.originalPos.length) {
                                graph.svgVertices[v].coord=[this.originalPos[ind][0], this.originalPos[ind][1]];
                                ind++;
                            }
                            else {
                                graph.svgVertices[v].coord=[
                                    graph.frameX+Math.random()*(graph.frameW-2*graph.vertexRad)+graph.vertexRad,
                                    graph.frameY+Math.random()*(graph.frameH-2*graph.vertexRad)+graph.vertexRad
                                ];
                            }
                        }
                    }
                }
            }
            else {
                let versDepth=[],inDegree=[],root=0;
                for (let i=0; i<graph.n; i++) {
                    if (graph.vertices[i]===undefined) continue;
                    versDepth[i]=[];
                    inDegree[i]=0;
                    graph.svgVertices[i].coord=undefined;
                }
                if (graph.isDirected===true) {
                    for (let i=0; i<graph.edgeList.length; i++) {
                        if (graph.edgeList[i]===undefined) continue;
                        let v=graph.edgeList[i].y;
                        inDegree[v]++;
                    }
                    for (let i=0; i<graph.n; i++) {
                        if (graph.vertices[i]===undefined) continue;
                        if (inDegree[i]==0) {
                            root=i;
                            break;
                        }
                    }
                }
                let maxDepth=findMaxDepth(root,-1,0,graph.adjList,graph.edgeList);
                fillVersDepth(root,-1,0,maxDepth,graph.adjList,graph.edgeList,versDepth);

                let x,y=(2*graph.vertexRad+distVertices)*maxDepth,distX;
                x=0; distX=(graph.frameW-2*graph.vertexRad-graph.frameX)/(versDepth[maxDepth].length-1);
                for (let vertex of versDepth[maxDepth]) {
                    if (vertex!==-1) graph.svgVertices[vertex].coord=[x,y];
                    x+=distX;
                }
                for (let i=maxDepth-1; i>=0; i--) {
                    y-=(2*graph.vertexRad+distVertices);
                    let ind=0;
                    while (versDepth[i+1][ind]===-1) {
                        ind++;
                    }
                    for (let vertex of versDepth[i]) {
                        if (vertex===-1) continue;
                        if ((ind===versDepth[i+1].length)||(graph.adjMatrix[vertex][versDepth[i+1][ind]].length===0)) {
                           graph.svgVertices[vertex].coord=undefined;
                           continue;
                        }
                        let sum=0,cnt=0;
                        for (; ind<versDepth[i+1].length; ind++) {
                            let child=versDepth[i+1][ind];
                            if (child===-1) continue;
                            if (graph.adjMatrix[vertex][child].length===0) break;
                            sum+=graph.svgVertices[child].coord[0];
                            cnt++;
                        }
                        graph.svgVertices[vertex].coord=[sum/cnt,y];
                    }
                    let prevX=0;
                    for (let j=0; j<versDepth[i].length; j++) {
                        let v=versDepth[i][j];
                        if ((v!==-1)&&(graph.svgVertices[v].coord!==undefined)) {
                           prevX=graph.svgVertices[v].coord[0]+2*graph.vertexRad+distVertices;
                           continue;
                        }
                        let nextX=graph.frameW,cnt=0;
                        for (let h=j; h<versDepth[i].length; h++) {
                            let next=versDepth[i][h];
                            if ((next!==-1)&&(graph.svgVertices[next].coord!==undefined)) {
                               nextX=graph.svgVertices[next].coord[0];
                               break;
                            }
                            cnt++;
                        }
                        let h;
                        if ((nextX==graph.frameW)||(2*graph.vertexRad+distVertices<=(nextX-(prevX-distVertices))/(cnt+1))) {
                            prevX-=distVertices;
                            let x=prevX;
                            for (h=j; h<versDepth[i].length; h++) {
                                let v=versDepth[i][h];
                                if ((v!==-1)&&(graph.svgVertices[v].coord!==undefined)) break;
                                if (nextX!=graph.frameW) x+=(nextX-prevX)/(cnt+1);
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
                                x+=(nextX-prevX-distVertices)/cnt;
                            }
                        }
                        j=h-1;
                    }
                }
            }

            if (graph.isDrawable===false) graph.centerGraph();
        }
        this.init = function () {
            maxTimes=parseInt(10000/graph.n);
            distVertices=graph.vertexRad*5/4+parseInt((Math.random())*graph.vertexRad/4);
            if (graph.isWeighted===true) distVertices*=2;
            calc.call(this);
        }
    }
    
    window.orientedArea=orientedArea;
    window.findOrientation=findOrientation;
    window.CalcPositions = CalcPositions;
})();