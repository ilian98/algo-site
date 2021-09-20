"use strict";
(function () {
    function orientedArea (x1, y1, x2, y2, x3, y3) {
        return x1*y2+y1*x3+x2*y3-y1*x2-x1*y3-y2*x3;
    }
    function orientation (p1, p2, p3) {
        let area=orientedArea(p1[0],p1[1],p2[0],p2[1],p3[0],p3[1]);
        if (area<0) return -1;
        if (area>0) return +1;
        return 0;
    }
        
    function CalcPositions (graph) {
        let originalPos,possiblePos;
        
        this.circleSegment = function (segPoint1, segPoint2, center) {
            let area,height,sides=[];    
            area=Math.abs(orientedArea(segPoint1[0],segPoint1[1],segPoint2[0],segPoint2[1],center[0],center[1]))/2;
            sides[0]=segmentLength(segPoint1[0],segPoint1[1],segPoint2[0],segPoint2[1],2);
            sides[1]=segmentLength(segPoint1[0],segPoint1[1],center[0],center[1],2);
            sides[2]=segmentLength(segPoint2[0],segPoint2[1],center[0],center[1],2);
            if ((sides[0]*sides[0]+sides[2]*sides[2]-sides[1]*sides[1]>0)&&(sides[0]*sides[0]+sides[1]*sides[1]-sides[2]*sides[2]>0)) {
                height=area*2/sides[0];
                if ((graph.isWeighted===true)&&(height<=3*graph.vertexRad)) return true;
                else if ((graph.isMulti===true)&&(height<=2.1*graph.vertexRad)) return true;
                else if (((graph.isMulti===false)&&(graph.isWeighted===false))&&(height<=1.5*graph.vertexRad)) return true;
            }
            return false;
        }
        this.checkEdge = function (x, y, tryPlanner = false) {
            for (let i=0; i<graph.n; i++) {
                if ((i==x)||(i==y)||(graph.svgVertices[i].coord===undefined)) continue;
                if (this.circleSegment(graph.svgVertices[x].coord,graph.svgVertices[y].coord,graph.svgVertices[i].coord)==true) {
                    return false;
                }
            }
                
            if (tryPlanner===true) {
                for (let edge of graph.edgeList) {
                    let u=edge.x,v=edge.y;
                    if ((u===x)||(u===y)||(v===x)||(v===y)) continue;
                    if (u===v) continue;
                    if ((graph.svgVertices[u].coord===undefined)||(graph.svgVertices[v].coord===undefined)) continue;
                    if ((orientation(graph.svgVertices[x].coord,graph.svgVertices[y].coord,graph.svgVertices[u].coord)!=
                         orientation(graph.svgVertices[x].coord,graph.svgVertices[y].coord,graph.svgVertices[v].coord))&&
                        (orientation(graph.svgVertices[u].coord,graph.svgVertices[v].coord,graph.svgVertices[x].coord)!=
                         orientation(graph.svgVertices[u].coord,graph.svgVertices[v].coord,graph.svgVertices[y].coord))) {
                        return false;
                    }
                }
            }
            return true;
        }
        function checkVertex (vr, tryPlanner) {
            for (let i=0; i<graph.n; i++) {
                if ((i===vr)||(graph.svgVertices[i].coord===undefined)||
                    ((graph.adjMatrix[vr][i]==0)&&(graph.adjMatrix[i][vr]===0))) continue;
                if (this.checkEdge(vr,i,tryPlanner)===false) return false;
            }
            return true;
        }
        this.calculatePossiblePos = function () {
            possiblePos=[];
            for (let pos of originalPos) {
                let flag=true;
                for (let i=0; i<graph.n; i++) {
                    if (graph.svgVertices[i].coord===undefined) continue;
                    if (graph.svgVertices[i].coord===pos) {
                        flag=false;
                        break;
                    }
                    for (let j=0; j<graph.n; j++) {
                        if ((j===i)||(graph.svgVertices[j].coord===undefined)||
                            ((graph.adjMatrix[i][j]===0)&&(graph.adjMatrix[j][i]===0))) continue;
                        if (this.circleSegment(graph.svgVertices[i].coord,graph.svgVertices[j].coord,pos)===true) {
                            flag=false;
                            break;
                        }
                    }
                    if (flag===false) break;
                }
                if (flag===true) possiblePos.push(pos);
            }
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
                    if ((v===vr)||(graph.svgVertices[v].coord===undefined)||
                        ((graph.adjMatrix[vr][v]===0)&&(graph.adjMatrix[v][vr]===0))) continue;
                    for (let i=0; i<possiblePos.length; i++) {
                        let pos=possiblePos[i];
                        if (this.circleSegment(graph.svgVertices[vr].coord,graph.svgVertices[v].coord,pos)==true) {
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
        function calc (time) {
            if (time>maxTimes) {
                alert("Неуспешно начертаване на графа, възможна причина е недостатъчно място за чертане!");
                graph.n=0; graph.edgeList=[];
                return ;
            }
            let tryPlanner=false;
            if ((time<=maxTimes/2)&&((graph.n<=2)||((graph.n>=3)&&(graph.edgeList.length<=3*graph.n-6)))) tryPlanner=true;

            if (graph.isTree===false) {
                originalPos=[];
                for (let i=0; i<=(graph.frameW-2*graph.vertexRad)/(2*graph.vertexRad+distVertices); i++) {
                    for (let j=0; j<=(graph.frameH-2*graph.vertexRad)/(2*graph.vertexRad+distVertices); j++) {
                        originalPos.push([
                            i*(2*graph.vertexRad+distVertices)+graph.frameX+graph.vertexRad,
                            j*(2*graph.vertexRad+distVertices)+graph.frameY+graph.vertexRad
                        ]);
                    }
                }
                possiblePos=originalPos.slice();
                for (let i=0; i<graph.n; i++) {
                    graph.svgVertices[i].coord=undefined;
                }
                for (let i=0; i<graph.n; i++) {
                    if (this.placeVertex(i,tryPlanner)===false) {
                        calc.call(this,time+1);
                        break;
                    }
                }
            }
            else {
                let versDepth=[],inDegree=[],root=0;
                for (let i=0; i<graph.n; i++) {
                    versDepth[i]=[];
                    inDegree[i]=0;
                    graph.svgVertices[i].coord=undefined;
                }
                if (graph.isDirected===true) {
                    for (let i=0; i<graph.edgeList.length; i++) {
                        let v=graph.edgeList[i].y;
                        inDegree[v]++;
                    }
                    for (let i=0; i<graph.n; i++) {
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
                        if ((ind===versDepth[i+1].length)||(graph.adjMatrix[vertex][versDepth[i+1][ind]]===0)) {
                           graph.svgVertices[vertex].coord=undefined;
                           continue;
                        }
                        let sum=0,cnt=0;
                        for (; ind<versDepth[i+1].length; ind++) {
                            let child=versDepth[i+1][ind];
                            if (child===-1) continue;
                            if (graph.adjMatrix[vertex][child]==-0) break;
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

            if ((time===1)&&(graph.isDrawable===false)) graph.centerGraph();
        }
        this.init = function () {
            maxTimes=parseInt(8000/graph.n);
            distVertices=graph.vertexRad*5/4+parseInt((Math.random())*graph.vertexRad/4);
            if (graph.isWeighted===true) distVertices*=2;
            calc.call(this,1);
        }
    }
    
    window.CalcPositions = CalcPositions;
})();