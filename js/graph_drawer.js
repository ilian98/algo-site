'use strict';
function getObjectForCoordinates (event) {
    if (window.isMobile==="false") return event;
    else if (event.changedTouches!==undefined) return event.changedTouches[0];
    else if (event.touches!==undefined) return event.touches[0];
}
function setSvgPoint (event, graph) {
     let obj=getObjectForCoordinates(event);
     graph.svgPoint.x=obj.clientX;
     graph.svgPoint.y=obj.clientY;
     graph.svgPoint=graph.svgPoint.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
 }
function vertexClick (index, event) {
    let graph=this;
    setSvgPoint(event,graph);
    graph.startX=graph.svgPoint.x; graph.startY=graph.svgPoint.y;
    graph.flagDraw=1;
    graph.stVerDraw=index;
    
    let lineOut = function (graph, event) {
        if (event===undefined) return ;
        let boundBox = {
            top: $(graph.svgName)[0].getBoundingClientRect().top+window.scrollY,
            bottom: $(graph.svgName)[0].getBoundingClientRect().bottom+window.scrollY,
            left: $(graph.svgName)[0].getBoundingClientRect().left+window.scrollX,
            right: $(graph.svgName)[0].getBoundingClientRect().right+window.scrollX
        };
        let obj=getObjectForCoordinates(event);
        let point=[obj.pageX, obj.pageY];
        if ((point[0]<boundBox.left)||(point[0]>boundBox.right)||
            (point[1]<boundBox.top)||(point[1]>boundBox.bottom)) {
            clearDrawParameters(graph);
        }
    };
    $(window).off("mousemove.line-out").on("mousemove.line-out",lineOut.bind(this,graph));
    $(window).off("touchmove.line-out").on("touchmove.line-out",lineOut.bind(this,graph));
}
function trackMouse (event) {
    let graph=this;
    setSvgPoint(event,graph);
    if (graph.flagDraw==0) return ;
    if ((Math.abs(graph.startX-graph.svgPoint.x)>=1)||(Math.abs(graph.startY-graph.svgPoint.y)>=1)) {
        if (graph.currEdgeDraw!==undefined) graph.currEdgeDraw.remove();
        let st=[
            graph.svgVertices[graph.stVerDraw].coord[0]+graph.vertexRad,
            graph.svgVertices[graph.stVerDraw].coord[1]+graph.vertexRad
        ];
        let end=[graph.svgPoint.x, graph.svgPoint.y];
        let vertexRad=graph.vertexRad;
        graph.vertexRad=vertexRad/3;
        graph.currEdgeDraw=graph.drawEdge(st,end,-1,vertexRad/20*1.5,[0,0]).line;
        graph.vertexRad=vertexRad;
        graph.currEdgeDraw.prependTo(graph.s);
    }
}
function clearDrawParameters (graph) {
    graph.flagDraw=0;
    if (graph.currEdgeDraw!==undefined) graph.currEdgeDraw.remove();
    $(window).off("mousemove.line-out").off("touchmove.line-out");
}
function checkInteger (s) {
    for (let c of s) {
        if ((c<'0')||(c>'9')) return false;
    }
    return true;
}
function edgeDrawEnd (event) {
    let graph=this;
    if (graph.flagDraw==0) return ;
    clearDrawParameters(graph);
    
    for (let i=0; i<graph.n; i++) {
        if ((graph.svgPoint.x>=graph.svgVertices[i].group.getBBox().x)&&
            (graph.svgPoint.x<=graph.svgVertices[i].group.getBBox().x2)&&
            (graph.svgPoint.y>=graph.svgVertices[i].group.getBBox().y)&&
            (graph.svgPoint.y<=graph.svgVertices[i].group.getBBox().y2)) {
            if (graph.stVerDraw===i) return ;
            if ((graph.isMulti===false)&&(graph.adjMatrix[graph.stVerDraw][i]===1)) return ;
            if (graph.isMulti===true) {
                if ((graph.isOriented===false)&&(graph.adjMatrix[graph.stVerDraw][i]==5)) return ;
                if ((graph.isOriented===true)&&
                    (graph.adjMatrix[graph.stVerDraw][i]+graph.adjMatrix[i][graph.stVerDraw]==5)) return ;
            }
            
            let weight="";
            if (graph.isWeighted===true) {
                weight=window.prompt("Въведете тегло на реброто","1");
                if (checkInteger(weight.toString())===false) return ;
                weight=parseInt(weight);
                if (weight===0) return ;
            }
            let len=graph.edgeList.length;
            graph.edgeList.push(new Edge(graph.stVerDraw,i,weight));
            graph.adjList[graph.stVerDraw].push(graph.edgeList.length-1);
            if (graph.isOriented===false) graph.adjList[i].push(graph.edgeList.length-1);
            graph.adjMatrix[graph.stVerDraw][i]++;
            if (graph.isOriented===false) graph.adjMatrix[i][graph.stVerDraw]++;
            for (let j=0; j<graph.n; j++) {
                if ((j==graph.stVerDraw)||(j==i)) continue;
                if (circleSegment(graph.svgVertices[graph.stVerDraw].coord,graph.svgVertices[i].coord,graph.svgVertices[j].coord,graph.vertexRad,graph.isMulti,graph.isWeighted)===true) {
                    let oldCoords=graph.svgVertices[i].coord;
                    graph.svgVertices[i].coord=undefined;
                    calculatePossiblePos(graph);
                    if (placeVertex(graph,i,false)===false) calcPositions(graph);
                    break;
                }
            }
            graph.graphChange();
            graph.draw(true);
        }
    }
}

function circlesIntersection (x1, y1, r1, x2, y2, r2) {
    x2-=x1; y2-=y1;
    let flag=false;
    if (y2==0) {
        y2+=x2; x2=y2-x2; y2=y2-x2;
        y1+=x1; x1=y1-x1; y1=y1-x1;
        flag=true;
    }
    /* x^2+y^2=r1^2
    (x-x2)^2+(y-y2)^2=r2^2
    => -2*x2*x+x2^2-2*y2*y+y2^2=r2^2-r1^2
    => y=(x2^2+y2^2+r1^2-r2^2)/(2*y2)-x2/y2*x, u=(x2^2+y2^2+r1^2-r2^2)/(2*y2), v=x2/y2, y=u-v*x
    => x^2+u^2-2*u*v*x+v^2*x^2=r1^2
    (v^2+1)*x^2-2*u*v*x+u^2-r1^2=0
    D=u^2*v^2-u^2*v^2+v^2*r1^2-u^2+r1^2
    D=r1^2+v^2*r1^2-u^2*/
    let u=(x2*x2+r1*r1-r2*r2)/(2*y2)+y2/2,v=x2/y2;
    let a=(v*v+1),k=-u*v,c=u*u-r1*r1;
    let D=r1*r1+v*v*r1*r1-u*u;
    let xs=[(-k-Math.sqrt(D))/a,(-k+Math.sqrt(D))/a];
    let ys=[u-v*xs[0],u-v*xs[1]];
    for (let i=0; i<2; i++) {
        xs[i]+=x1;
        ys[i]+=y1;
    }
    if (flag===false) return [[xs[0],ys[0]],[xs[1],ys[1]]];
    else return [[ys[0],xs[0]],[ys[1],xs[1]]];
}
function findPoints (x1, y1, x2, y2, d) {
    let r=Math.sqrt(((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))/4+d*d);
    return circlesIntersection(x1,y1,r,x2,y2,r);
}
function linePath (st, end) {
    return "M"+st[0]+","+st[1]+" "+end[0]+","+end[1];
}
function bezierPath (st, end, q) {
    return "M"+st[0]+","+st[1]+" Q"+q[0]+","+q[1]+" "+end[0]+","+end[1];
}
function circlePath (cx, cy, r) {
    let p="M"+cx+","+cy;
    p+="m"+(-r)+",0";
    p+="a"+r+","+r+" 0 1,0 "+(r*2)+",0";
    p+="a"+r+","+r+" 0 1,0 "+-(r*2)+",0";
    return p;
}
function loopPath (x, y, vertexRad, r) {
    let points=circlesIntersection(x,y+vertexRad,vertexRad,x,y-3*r/8,r);
    let p1=points[0],p2=points[1];
    return "M"+p1[0]+" "+p1[1]+" A"+[r,r,0,1,1,p2[0],p2[1]].join(" ");
}
function sortPoints (p1, p2) {
    if (p1[0]<p2[0]) return [p1,p2];
    else if ((p1[0]==p2[0])&&(p1[1]>p2[1])) return [p1,p2];
    else return [p2,p1];
}

function determineDy (text) {
    var largeLetters=['b','d','f','h','k','l','t','б','в','й','','ж','з','и','к'];
    var lowLetters=['g','j','p','q','y','р','y','ц','щ'];
    var flagNonLetter=false,flagLargeLetter=false,flagLowLetter=false,flagSmallLetter=false;
    for (var i=0; i<text.length; i++) {
        if (text[i]=='ф') return "0.255em";
        if (largeLetters.includes(text[i])==true) flagLargeLetter=true;
        else if (lowLetters.includes(text[i])==true) flagLowLetter=true;
        if (((text[i]>='a')&&(text[i]<='z'))||((text[i]>='а')&&(text[i]<='я'))) flagSmallLetter=true;
        else flagNonLetter=true;
        }
    if ((flagNonLetter==true)||(flagLargeLetter==true)) {
        if (flagLowLetter==true) return "0.255em";
        return "0.34em";
        }
    else {
        if (flagLowLetter==true) return "0.18em";
        return "0.255em";
        }
}

function Vertex () {
    this.id=undefined;
    this.name=undefined;
}

function SvgVertex () {
	this.coord=undefined;
    this.circle=undefined; this.text=undefined;
}

function Edge (x, y, weight = "") {
    this.x=x;
    this.y=y;
    this.weight=weight;
    
    this.findEndPoint = function (vr) {
        if (this.x==vr) return this.y;
        else return this.x;
    }
}

function SvgEdge () {
    this.line=undefined;
    this.weight=undefined;
}

function Graph () {
    this.svgName=undefined; this.s=undefined; this.flagSave=undefined;
    this.svgVertices=undefined; this.svgEdges=undefined;
    this.n=undefined; this.vertices=undefined;
    this.edgeList=undefined; this.adjList=undefined; this.adjMatrix=undefined;
    this.isOriented=undefined; this.isMulti=undefined; this.isWeighted=undefined; this.isTree=undefined;
    this.graphChange=undefined; // function to be called after changing the graph, for exampe adding new edge
    this.frameX=undefined; this.frameY=undefined; this.frameW=undefined; this.frameH=undefined; this.vertexRad=20;
    this.init = function (svgName, n, isOriented, flagSave, isTree, graphChange = () => {}) {
        if (this.s===undefined) {
            this.svgName=svgName;
            this.s=Snap(svgName);
        }
        this.s.selectAll("*").forEach(function (element) {
            element.stop();
            element.remove();
        });
        this.svgVertices=[]; this.svgEdges=[];
        
		if (n!==undefined) this.n=n;
        this.initVertices(this.n);
        for (let i=0; i<this.n; i++) {
            this.vertices[i].name=(i+1).toString();
        }
		
		this.edgeList=[]; this.adjList=[]; this.adjMatrix=[];
        for (let i=0; i<this.n; i++) {
            this.adjList[i]=[]; this.adjMatrix[i]=[];
            for (let j=0; j<this.n; j++) {
                this.adjMatrix[i][j]=0;
			}
		}
        
        if (isOriented!==undefined) this.isOriented=isOriented;
        this.isMulti=false; this.isWeighted=false;
        if (isTree!==undefined) this.isTree=isTree;
        else this.isTree=false;
        if (flagSave!==undefined) {
            this.flagSave=flagSave;
            if (flagSave===true) addSaveFunctionality(svgName);
        }
        this.flagDraw=0;
        
        this.graphChange=graphChange;
    }
    
    this.initVertices = function (n) {
        this.n=n; this.vertices=[];
        for (let i=0; i<this.n; i++) {
			this.vertices[i] = new Vertex();
            this.vertices[i].id=i+1;
		}
    }
    
    this.buildEdgeDataStructures = function (edges) {
        let edgeList=this.edgeList=[];
        for (let edge of edges) {
            if (edge.length==2) edgeList.push(new Edge(edge[0],edge[1]));
            else {
                edgeList.push(new Edge(edge[0],edge[1],edge[2]));
                this.isWeighted=true;
            }
        }
        let max=0;
        for (let edge of edgeList) {
            if (max<edge.x) max=edge.x;
            if (max<edge.y) max=edge.y;
        }
        this.n=max+1;
        
        let edgeSet = new Set();
        for (let edge of edgeList) {
            let x=edge.x,y=edge.y;
            if ((edgeSet.has(x*this.n+y))||((this.isOriented===false)&&(edgeSet.has(y*this.n+x)))) {
                this.isMulti=true;
            }
            else edgeSet.add(x*this.n+y);
        }
        
        for (let i=0; i<=max; i++) {
            this.adjMatrix[i]=[];
            for (let j=0; j<=max; j++) {
                this.adjMatrix[i][j]=0;
            }
            this.adjList[i]=[];
        }
        for (let i=0; i<edgeList.length; i++) {
            let x=edgeList[i].x,y=edgeList[i].y;
            this.adjMatrix[x][y]++;
            this.adjList[x].push(i);
            if ((this.isOriented===false)&&(x!==y)) {
                this.adjMatrix[y][x]++;
                this.adjList[y].push(i);
            }
        }
    }
         
    this.flagDraw=undefined; this.startX=undefined; this.startY=undefined;
    this.stVerDraw=undefined; this.currEdgeDraw=undefined; this.svgPoint=undefined;
    this.drawableEdges = function () {
        if (window.isMobile==="true") {
            let svgElement=$(this.svgName);
            svgElement.blockScroll=false;
            svgElement.on("touchstart", function (event) {
                this.blockScroll=true;
            });
            svgElement.on("touchend", function () {
                this.blockScroll=false;
            });
            svgElement.on("touchmove", function (event) {
                if (this.blockScroll===true) event.preventDefault();
            });
        }
        
        this.svgPoint=this.s.paper.node.createSVGPoint(); this.flagDraw=0; this.stVer=1;
        let graph=this;
        for (let i=0; i<this.n; i++) {
            if (this.svgVertices[i].group===undefined) continue;
            if (window.isMobile==="false") {
                this.svgVertices[i].group.unmousedown(vertexClick);
                this.svgVertices[i].group.mousedown(vertexClick.bind(graph,i));
            }
            else {
                this.svgVertices[i].group.untouchstart(vertexClick);
                this.svgVertices[i].group.touchstart(vertexClick.bind(graph,i));
            }
        }
                
        if (window.isMobile==="false") {
            this.s.unmousemove(trackMouse);
            this.s.mousemove(trackMouse.bind(graph));
            this.s.unmouseup(edgeDrawEnd);
            this.s.mouseup(edgeDrawEnd.bind(graph));
        }
        else {
            this.s.untouchmove(trackMouse);
            this.s.touchmove(trackMouse.bind(graph));
            this.s.untouchend(edgeDrawEnd);
            this.s.touchend(edgeDrawEnd.bind(graph));
        }
    }
        
    this.erase = function () {
        this.s.selectAll("*").remove();
    }
    
    this.originalPos=undefined; this.possiblePos=undefined;
    this.drawNewGraph = function (frameX, frameY, frameW, frameH, vertexRad, addDrawableEdges) {
        this.erase();
        
        if (frameX!==undefined) {
            this.frameX=frameX; this.frameY=frameY;
            this.frameW=frameW; this.frameH=frameH;
        }
        if (vertexRad!==undefined) this.vertexRad=vertexRad;
        for (let i=0; i<this.n; i++) {
			this.svgVertices[i] = new SvgVertex();
		}
        calcPositions(this);
		this.draw(addDrawableEdges);
	}
    
    this.drawEdge = function (st, end, edgeInd, strokeWidth, properties) {
        let edgeLen=Math.sqrt((st[0]-end[0])*(st[0]-end[0])+(st[1]-end[1])*(st[1]-end[1]));
        let isLoop=(edgeLen<this.vertexRad)?true:false;
        let edge = new SvgEdge();
        let arrowDist=0;
        if (this.isOriented===true) arrowDist=1.5;
        let pathForWeight;
        if (properties[0]===0) {
            let quotient=(edgeLen-this.vertexRad-arrowDist)/edgeLen;
            let diff=[end[0]-st[0],end[1]-st[1]];
            end[0]=st[0]+quotient*diff[0];
            end[1]=st[1]+quotient*diff[1];
            quotient=this.vertexRad/edgeLen;
            st[0]+=quotient*diff[0];
            st[1]+=quotient*diff[1];
            edge.line=this.s.path(linePath(st,end));
            
            let points=sortPoints(st,end);
            pathForWeight=linePath(points[0],points[1]);
        }
        else {
            if (isLoop===true) { /// loop
                edge.line=this.s.path(loopPath(st[0],st[1]-this.vertexRad,this.vertexRad,properties[0]));
                pathForWeight=edge.line.attr("d");
            }
            else { /// multiedge
                let bezierPoint=findPoints(st[0],st[1],end[0],end[1],properties[0])[properties[1]];
                let p1=Snap.path.intersection(bezierPath(st,end,bezierPoint),circlePath(st[0],st[1],this.vertexRad))[0];
                let p2=Snap.path.intersection(bezierPath(st,end,bezierPoint),circlePath(end[0],end[1],this.vertexRad+arrowDist))[0];

                let quotient=(this.vertexRad+1)/edgeLen;
                let edgeCircle=[st[0]+quotient*(end[0]-st[0]),st[1]+quotient*(end[1]-st[1])];
                let dist=Math.sqrt((edgeCircle[0]-p1.x)*(edgeCircle[0]-p1.x)+(edgeCircle[1]-p1.y)*(edgeCircle[1]-p1.y));
                bezierPoint=findPoints(st[0],st[1],end[0],end[1],properties[0]-dist)[properties[1]];
                edge.line=this.s.path(bezierPath([p1.x,p1.y],[p2.x,p2.y],bezierPoint));
                
                let points=sortPoints([p1.x,p1.y],[p2.x,p2.y]);
                pathForWeight=bezierPath(points[0],points[1],bezierPoint);
            }
        }

        edge.line.attr({fill: "none", stroke: "black", "stroke-width": strokeWidth});
        if (this.isOriented==true) {
            let unit=(isLoop===true)?3:5;
            let arrowEnd=[3*unit/2,unit/2];
            let arrowHeight=unit;
            let arrow=this.s.polygon([0,0,arrowEnd[0],arrowEnd[1],0,arrowHeight,0,0]).attr({fill: "black"});
            edge.line.marker=arrow;
            let marker=arrow.marker(0,0,arrowEnd[0],arrowHeight,arrowEnd[0]-arrowDist,arrowEnd[1]);
            edge.line.attr({"marker-end": marker});
        }
        
        if ((edgeInd!==-1)&&(this.edgeList[edgeInd].weight!=="")) {
            let sign=+1;
            if (properties[1]===1) sign=-1;
            if ((isLoop===false)&&(st[0]===end[0])) {
                if (properties[0]!==0) console.log(properties[1]);
                let middle=edge.line.getPointAtLength(this.s.path(pathForWeight).getTotalLength()/2);
                edge.weight=this.s.text(middle.x,middle.y,this.edgeList[edgeInd].weight.toString());
                edge.weight.attr({x: (middle.x-sign*edge.weight.getBBox().width/2)});
            }
            else edge.weight=this.s.text(0,0,this.edgeList[edgeInd].weight.toString());
            edge.weight.attr({
                "font-size": this.vertexRad,
                "font-family": "Arial",
                "text-anchor": "middle",
                class: "unselectable"
            });
            if ((isLoop===false)&&(st[0]===end[0])) 
                edge.weight.attr({
                    dx: ((properties[0]===0)?-5:-7)*sign,
                    dy: determineDy(this.edgeList[edgeInd].weight.toString())
                });
            else {
                if ((isLoop==false)&&(properties[1]===1)) edge.weight.attr({dy: edge.weight.getBBox().height/2+14});
                else edge.weight.attr({dy: (isLoop===false)?-7*sign:(-3*sign)});
                edge.weight.attr({textpath: pathForWeight});
                edge.weight.textPath.attr({"startOffset": "50%"});
            }
        }
        return edge;
    }
    
    this.drawVertexText = function (i, text) {
        let x=this.svgVertices[i].coord[0]+this.vertexRad;
        let y=this.svgVertices[i].coord[1]+this.vertexRad;
        if (this.svgVertices[i].text!==undefined) this.svgVertices[i].text.remove();
        this.vertices[i].name=text;
        this.svgVertices[i].text=this.s.text(x,y,this.vertices[i].name);
        this.svgVertices[i].text.attr({
            "font-size": this.vertexRad*5/4, 
            "font-family": "Consolas",
            dy: determineDy(this.vertices[i].name), 
            "text-anchor": "middle", 
            class: "unselectable"
        });
        this.svgVertices[i].group=this.s.group(this.svgVertices[i].circle,this.svgVertices[i].text);
    }

    this.centerGraph = function () {
        let minX=this.frameX+this.frameW,maxX=0;
        let minY=this.frameY+this.frameH,maxY=0;
        for (let i=0; i<this.n; i++) {
            if (this.vertices[i].name===undefined) {
                this.svgVertices[i].circle=this.svgVertices[i].text=undefined;
                continue;
            }
            let x=this.svgVertices[i].coord[0],y=this.svgVertices[i].coord[1];
            if (minX>x) minX=x;
            if (maxX<x) maxX=x;
            if (minY>y) minY=y;
            if (maxY<y) maxY=y;
        }
        let lenX=maxX-minX,lenY=maxY-minY;
        let addX=(this.frameW-2*this.vertexRad-this.frameX-lenX)/2+this.frameX-minX;
        let addY=(this.frameH-2*this.vertexRad-this.frameY-lenY)/2+this.frameY-minY;
        for (let i=0; i<this.n; i++) {
            if (this.vertices[i].name===undefined) {
                this.svgVertices[i].circle=this.svgVertices[i].text=undefined;
                continue;
            }
            this.svgVertices[i].coord[0]+=addX;
            this.svgVertices[i].coord[1]+=addY;
        }
    }
    
    this.draw = function (addDrawableEdges) { /// this functions expects that coordinates are already calculated
        this.erase();
        if (addDrawableEdges===false) this.centerGraph();
        
        let fontSize=this.vertexRad*5/4,strokeWidth=this.vertexRad/20*1.5;
        let edgeMapCnt = new Map(), edgeMapCurr = new Map();
        for (let edge of this.edgeList) {
            let x=edge.x,y=edge.y;
            let code=Math.max(x,y)*this.n+Math.min(x,y);
            if (edgeMapCnt.has(code)) {
                let val=edgeMapCnt.get(code);
                edgeMapCnt.set(code,val+1);
            }
            else {
                edgeMapCnt.set(code,1);
                edgeMapCurr.set(code,0);
            }
        }
        let multiEdges = [[],
                          [[0, 0]],
                          [[this.vertexRad/2, 0], [this.vertexRad/2, 1]],
                          [[this.vertexRad/2, 0], [this.vertexRad/2, 1], [0, 0]],
                          [[this.vertexRad/2, 0], [this.vertexRad/2, 1], [this.vertexRad, 0], [this.vertexRad, 1]],
                          [[this.vertexRad/2, 0], [this.vertexRad/2, 1], [this.vertexRad, 0], [this.vertexRad, 1], [0, 0]]];
        let loopEdges = [[],
                         [[this.vertexRad/2, 0]],
                         [[this.vertexRad/2, 0], [3*this.vertexRad/4, 0]]];
        let i=0;
		for (let edge of this.edgeList) {
            let x=edge.x,y=edge.y;
            let code=Math.max(x,y)*this.n+Math.min(x,y);
            let val=edgeMapCurr.get(code);
            let from=this.svgVertices[x].coord,to=this.svgVertices[y].coord;
            let st=[from[0]+this.vertexRad, from[1]+this.vertexRad];
            let end=[to[0]+this.vertexRad, to[1]+this.vertexRad];
            if (x!==y) this.svgEdges[i]=this.drawEdge(st,end,i,strokeWidth,multiEdges[edgeMapCnt.get(code)][val++]);
            else this.svgEdges[i]=this.drawEdge(st,end,i,strokeWidth,loopEdges[edgeMapCnt.get(code)][val++]);
            edgeMapCurr.set(code,val);
            i++;
        }
        
        for (let i=0; i<this.n; i++) {
            if (this.vertices[i].name===undefined) {
                this.svgVertices[i].circle=this.svgVertices[i].text=undefined;
                continue;
            }
            let x=this.svgVertices[i].coord[0]+this.vertexRad;
            let y=this.svgVertices[i].coord[1]+this.vertexRad;
            this.svgVertices[i].circle=this.s.circle(x,y,this.vertexRad);
            this.svgVertices[i].circle.attr({fill: "white", stroke: "black", "stroke-width": strokeWidth})
            this.drawVertexText(i,this.vertices[i].name);
            if (addDrawableEdges===true) this.svgVertices[i].group.attr({cursor: "pointer"});
        }
        
        if (addDrawableEdges===true) this.drawableEdges();
	}
}

function addSaveFunctionality (svgName) {
    let parentElement=$(svgName).parent();
    let saveButton=parentElement.children(".save");
    let canvas=parentElement.children(".canvas-save");
    canvas.hide();
    let svgSave=parentElement.children(".svg-save");
    svgSave.hide();
    
    saveButton.on("click",function () {
        let context=canvas[0].getContext('2d');
        let svg=parentElement.children(".graph");
        let svgWidth=svg.width(),svgHeight=svg.height();
        svgSave.attr("width",svgWidth);
        svgSave.attr("height",svgHeight);
        
        $(svgName).clone().appendTo(svgSave);
        canvas.prop("width",svgWidth);
        canvas.prop("height",svgHeight);

        svgSave.show();
        let svgString=(new XMLSerializer()).serializeToString(svgSave[0]);
        svgSave.hide();
        
        let image=$("<img>").prop("src","data:image/svg+xml; charset=utf8, "+encodeURIComponent(svgString));
        image.on("load", function () {
            context.drawImage(image[0],0,0);
            let imageURI=canvas[0].toDataURL('image/png').replace('image/png','image/octet-stream');
            $("<a>").prop("download","graph.png")
                .prop("href",imageURI)
                .prop("target",'_blank')[0].click();
            $(svgSave).empty();
        });
    });
}

function orientedArea (x1, y1, x2, y2, x3, y3) {
    return x1*y2+y1*x3+x2*y3-y1*x2-x1*y3-y2*x3;
}
function orientation (p1, p2, p3) {
    let area=orientedArea(p1[0],p1[1],p2[0],p2[1],p3[0],p3[1]);
    if (area<0) return -1;
    if (area>0) return +1;
    return 0;
}
function circleSegment (segPoint1, segPoint2, center, vertexRad, isMulti, isWeighted) {
    let area,height,sides=[];    
    area=Math.abs(orientedArea(segPoint1[0],segPoint1[1],segPoint2[0],segPoint2[1],center[0],center[1]))/2;
    sides[0]=Math.sqrt(Math.pow(segPoint1[0]-segPoint2[0],2)+Math.pow(segPoint1[1]-segPoint2[1],2));
    sides[1]=Math.sqrt(Math.pow(segPoint1[0]-center[0],2)+Math.pow(segPoint1[1]-center[1],2));
    sides[2]=Math.sqrt(Math.pow(segPoint2[0]-center[0],2)+Math.pow(segPoint2[1]-center[1],2));
    if ((sides[0]*sides[0]+sides[2]*sides[2]-sides[1]*sides[1]>0)&&(sides[0]*sides[0]+sides[1]*sides[1]-sides[2]*sides[2]>0)) {
        height=area*2/sides[0];
        if (((isMulti===true)||(isWeighted===true))&&(height<=2.1*vertexRad)) return true;
        if (((isMulti===false)&&(isWeighted===false))&&(height<=1.5*vertexRad)) return true;
    }
    return false;
}
function checkVertex (graph, vr, tryPlanner) {
    for (let i=0; i<graph.n; i++) {
        if ((i==vr)||(graph.svgVertices[i].coord===undefined)||
            ((graph.adjMatrix[vr][i]==0)&&(graph.adjMatrix[i][vr]==0))) continue;
        for (let j=0; j<graph.n; j++) {
            if ((j==vr)||(j==i)||(graph.svgVertices[j].coord===undefined)) continue;
            if (circleSegment(graph.svgVertices[vr].coord,graph.svgVertices[i].coord,graph.svgVertices[j].coord,graph.vertexRad,graph.isMulti,graph.isWeighted)==true) return false;
        }
    }
    if (tryPlanner===true) {
        for (let i=0; i<graph.n; i++) {
            if ((i==vr)||(graph.svgVertices[i].coord===undefined)||
                ((graph.adjMatrix[vr][i]==0)&&(graph.adjMatrix[i][vr]==0))) continue;
            for (let edge of graph.edgeList) {
                let u=edge.x,v=edge.y;
                if ((u==vr)||(u==i)||(v==vr)||(v==i)) continue;
                if (u==v) continue;
                if ((graph.svgVertices[u].coord===undefined)||(graph.svgVertices[v].coord===undefined)) continue;
                if ((orientation(graph.svgVertices[vr].coord,graph.svgVertices[i].coord,graph.svgVertices[u].coord)!=
                    orientation(graph.svgVertices[vr].coord,graph.svgVertices[i].coord,graph.svgVertices[v].coord))&&
                    (orientation(graph.svgVertices[u].coord,graph.svgVertices[v].coord,graph.svgVertices[vr].coord)!=
                    orientation(graph.svgVertices[u].coord,graph.svgVertices[v].coord,graph.svgVertices[i].coord))) {
                    return false;
                }
            }
        }
    }
    return true;
}
function calculatePossiblePos (graph) {
    graph.possiblePos=[];
    for (let pos of graph.originalPos) {
        let flag=true;
        for (let i=0; i<graph.n; i++) {
            if (graph.svgVertices[i].coord===undefined) continue;
            if (graph.svgVertices[i].coord===pos) {
                flag=false;
                break;
            }
            for (let j=0; j<graph.n; j++) {
                if ((j==i)||(graph.svgVertices[j].coord===undefined)||
                    ((graph.adjMatrix[i][j]==0)&&(graph.adjMatrix[j][i]==0))) continue;
                if (circleSegment(graph.svgVertices[i].coord,graph.svgVertices[j].coord,pos,graph.vertexRad,graph.isMulti,graph.isWeighted)==true) {
                    flag=false;
                    break;
                }
            }
            if (flag==false) break;
        }
        if (flag==true) graph.possiblePos.push(pos);
    }
}
function placeVertex (graph, vr, tryPlanner) {
    let currPossiblePos=graph.possiblePos.slice();
    for (;;) {
        if (currPossiblePos.length==0) return false;
        let ind=parseInt(Math.random()*(10*currPossiblePos.length))%currPossiblePos.length;
        graph.svgVertices[vr].coord=currPossiblePos[ind];
        if (checkVertex(graph,vr,tryPlanner)==false) {
            currPossiblePos.splice(ind,1);
            continue;
        }
        
        graph.possiblePos.splice(graph.possiblePos.findIndex(function (elem) {
            return (elem==graph.svgVertices[vr].coord);
        }),1);
        for (let v=0; v<graph.n; v++) {
            if ((v==vr)||(graph.svgVertices[v].coord===undefined)||
                ((graph.adjMatrix[vr][v]==0)&&(graph.adjMatrix[v][vr]==0))) continue;
            for (let i=0; i<graph.possiblePos.length; i++) {
                let pos=graph.possiblePos[i];
                if (circleSegment(graph.svgVertices[vr].coord,graph.svgVertices[v].coord,pos,graph.vertexRad,graph.isMulti,graph.isWeighted)==true) {
                    graph.possiblePos.splice(i,1); i--;
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
function calcPositions (graph, time = 1) {
    let maxTimes=parseInt(10000/graph.n);
    if (time>maxTimes) {
        alert("Неуспешно начертаване на графа, възможна причина е недостатъчно място за чертане!");
        graph.n=0; graph.edgeList=[];
        return ;
    }
    let tryPlanner=false;
    if ((time<=maxTimes/2)&&((graph.n<=2)||((graph.n>=3)&&(graph.edgeList.length<=3*graph.n-6)))) tryPlanner=true;
    
    let distVertices=graph.vertexRad*5/4+parseInt((Math.random())*graph.vertexRad/4);
    if (graph.isWeighted===true) distVertices*=2;
    if (graph.isTree===false) {
        graph.originalPos=[];
        for (let i=0; i<=(graph.frameW-2*graph.vertexRad)/(2*graph.vertexRad+distVertices); i++) {
            for (let j=0; j<=(graph.frameH-2*graph.vertexRad)/(2*graph.vertexRad+distVertices); j++) {
                graph.originalPos.push([
                    i*(2*graph.vertexRad+distVertices)+graph.frameX,
                    j*(2*graph.vertexRad+distVertices)+graph.frameY
                ]);
            }
        }
        graph.possiblePos=graph.originalPos.slice();
        for (let i=0; i<graph.n; i++) {
            graph.svgVertices[i].coord=undefined;
        }
        for (let i=0; i<graph.n; i++) {
            if (placeVertex(graph,i,tryPlanner)===false) {
                calcPositions(graph,time+1);
                return ;
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
        if (graph.isOriented===true) {
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
        x=0; distX=(graph.frameW-2*graph.vertexRad-1)/(versDepth[maxDepth].length-1);
        for (let vertex of versDepth[maxDepth]) {
            if (vertex!=-1) graph.svgVertices[vertex].coord=[x,y];
            x+=distX;
        }
        for (let i=maxDepth-1; i>=0; i--) {
            y-=(2*graph.vertexRad+distVertices);
            let ind=0;
            while (versDepth[i+1][ind]==-1) {
                ind++;
            }
            for (let vertex of versDepth[i]) {
                if (vertex==-1) continue;
                if ((ind==versDepth[i+1].length)||(graph.adjMatrix[vertex][versDepth[i+1][ind]]==0)) {
                   graph.svgVertices[vertex].coord=undefined;
                   continue;
                }
                let sum=0,cnt=0;
                for (; ind<versDepth[i+1].length; ind++) {
                    let child=versDepth[i+1][ind];
                    if (child==-1) continue;
                    if (graph.adjMatrix[vertex][child]==0) break;
                    sum+=graph.svgVertices[child].coord[0];
                    cnt++;
                }
                graph.svgVertices[vertex].coord=[sum/cnt,y];
            }
            let prevX=0;
            for (let j=0; j<versDepth[i].length; j++) {
                let v=versDepth[i][j];
                if ((v!=-1)&&(graph.svgVertices[v].coord!==undefined)) {
                   prevX=graph.svgVertices[v].coord[0]+2*graph.vertexRad+distVertices;
                   continue;
                }
                let nextX=graph.frameW,cnt=0;
                for (let h=j; h<versDepth[i].length; h++) {
                    let next=versDepth[i][h];
                    if ((next!=-1)&&(graph.svgVertices[next].coord!==undefined)) {
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
                        if ((v!=-1)&&(graph.svgVertices[v].coord!==undefined)) break;
                        if (nextX!=graph.frameW) x+=(nextX-prevX)/(cnt+1);
                        else x+=((nextX-graph.vertexRad-1)-prevX)/cnt;
                        if (v!=-1) graph.svgVertices[v].coord=[x-graph.vertexRad,y];
                    }
                }
                else {
                    let x=prevX;
                    for (h=j; h<versDepth[i].length; h++) {
                        let v=versDepth[i][h];
                        if ((v!=-1)&&(graph.svgVertices[v].coord!==undefined)) break;
                        if (v!=-1) graph.svgVertices[v].coord=[x,y];
                        x+=(nextX-prevX-distVertices)/cnt;
                    }
                }
                j=h-1;
            }
        }

        let minX=graph.frameW,minY=graph.frameH;
        for (let i=0; i<=maxDepth; i++) {
            for (let vertex of versDepth[i]) {
                if (vertex==-1) continue;
                if (minX>graph.svgVertices[vertex].coord[0]) minX=graph.svgVertices[vertex].coord[0];
                if (minY>graph.svgVertices[vertex].coord[1]) minY=graph.svgVertices[vertex].coord[1];
            }
        }
        for (let i=0; i<=maxDepth; i++) {
            for (let vertex of versDepth[i]) {
                if (vertex==-1) continue;
                graph.svgVertices[vertex].coord[0]+=-minX+graph.frameX;
                graph.svgVertices[vertex].coord[1]+=-minY+graph.frameY+distVertices;
            }
        }
    }
}