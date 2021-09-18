"use strict";
(function () {
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
    function segmentLength (x1, y1, x2, y2) {
        return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    }
    function findBezierPoint (x1, y1, x2, y2, x3, y3) {
        let t=[-x1,-y1];
        [x1,y1]=[0,0];
        [x2,y2]=[x2+t[0],y2+t[1]];
        [x3,y3]=[x3+t[0],y3+t[1]];
        let sin=y2/segmentLength(0,0,x2,y2),cos=-x2/segmentLength(0,0,x2,y2);
        [x2,y2]=[cos*x2-sin*y2,sin*x2+cos*y2];
        [x3,y3]=[cos*x3-sin*y3,sin*x3+cos*y3];
        // y=a*x^2+b*x
        let a=(y2*x3-y3*x2)/(x2*x2*x3-x3*x3*x2);
        let b=(y2-a*x2*x2)/x2;
        let k1=2*a*x1+b,m1=y1-k1*x1; // y=k1*x+m1
        let k2=2*a*x2+b,m2=y2-k2*x2; // y=k2*x+m2
        let x=(m2-m1)/(k1-k2);
        let y=k1*x+m1;
        [x,y]=[cos*x+sin*y,-sin*x+cos*y];
        [x,y]=[x-t[0],y-t[1]];
        return [x,y];
    }
    function findPointAtDistance (x1, y1, x2, y2, d) {
        let r=Math.sqrt(((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))/4+d*d);
        return circlesIntersection(x1,y1,r,x2,y2,r)[(d>0)?0:1];
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
    function loopPath (x, y, vertexRad, r, isDirected) {
        let points=circlesIntersection(x,y+vertexRad,vertexRad,x,y-3*r/8,r);
        let p1=points[0];
        let p2;
        if (isDirected===false) p2=points[1];
        else p2=[x+r,y-3*r/8];
        return "M"+p1[0]+" "+p1[1]+" A"+[r,r,0,1,1,p2[0],p2[1]].join(" ");
    }
    function sortPoints (p1, p2) {
        if (p1[0]<p2[0]) return [p1,p2];
        else if ((p1[0]==p2[0])&&(p1[1]>p2[1])) return [p1,p2];
        else return [p2,p1];
    }

    function determineDy (text, fontFamily, fontSize) {
        let bBox=window.font[fontFamily].getPath(text.toString(),0,0,fontSize).getBoundingBox();
        let height=bBox.y2-bBox.y1;
        let underBaseline=bBox.y2;
        return height/2-underBaseline;
    }

    function Vertex (name) {
        this.name=name;
    }

    function SvgVertex () {
        this.coord=undefined;
        this.circle=undefined; this.text=undefined;
        this.group=undefined;
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
        this.isDirected=undefined; this.isMulti=undefined; this.isWeighted=undefined; this.isTree=undefined;
        this.graphChange=undefined; // function to be called after changing the graph, for exampe adding new edge
        this.init = function (svgName, n, isDirected, flagSave = false, isTree = false, graphChange = () => {}) {
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

            if (isDirected!==undefined) this.isDirected=isDirected;
            this.isMulti=false; this.isWeighted=false;
            if (isTree!==undefined) this.isTree=isTree;
            else this.isTree=false;
            if (flagSave!==undefined) {
                this.flagSave=flagSave;
                if (flagSave===true) addSaveFunctionality(svgName);
            }
            else this.flagSave=false;

            this.graphChange=graphChange;
        }

        this.initVertices = function (n) {
            this.n=n; this.vertices=[];
            for (let i=0; i<this.n; i++) {
                this.vertices[i]=new Vertex();
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
                if ((edgeSet.has(x*this.n+y))||((this.isDirected===false)&&(edgeSet.has(y*this.n+x)))) {
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
                if ((this.isDirected===false)&&(x!==y)) {
                    this.adjMatrix[y][x]++;
                    this.adjList[y].push(i);
                }
            }
        }

        this.erase = function () {
            this.s.selectAll("*").remove();
        }

        this.frameX=undefined; this.frameY=undefined; this.frameW=undefined; this.frameH=undefined; this.vertexRad=20;
        this.isDrawable=undefined; this.calcPositions=undefined;
        this.drawNewGraph = function (frameX, frameY, frameW, frameH, vertexRad, addDrawableEdges = false) {
            this.erase();

            if (frameX!==undefined) {
                this.frameX=frameX; this.frameY=frameY;
                this.frameW=frameW; this.frameH=frameH;
            }
            if (vertexRad!==undefined) this.vertexRad=vertexRad;
            for (let i=0; i<this.n; i++) {
                this.svgVertices[i] = new SvgVertex();
            }
            for (let i=0; i<this.edgeList.length; i++) {
                this.svgEdges[i] = new SvgEdge();
            }
            this.isDrawable=addDrawableEdges;
            if (this.calcPositions===undefined) this.calcPositions=new CalcPositions(this);
            this.calcPositions.init();
            this.draw(addDrawableEdges);
        }

        this.drawEdge = function (st, end, edgeInd, properties) {
            let strokeWidth=this.findStrokeWidth();
            
            let edgeLen=segmentLength(st[0],st[1],end[0],end[1]);
            let isLoop=(edgeLen<this.vertexRad)?true:false;
            let edge=new SvgEdge();

            let arrowHeight;
            if (isLoop===false) arrowHeight=5*(strokeWidth);
            else {
                let x=st[0]+properties,y=(st[1]-this.vertexRad-3*properties/8);
                arrowHeight=((st[1]-Math.sqrt(this.vertexRad*this.vertexRad-(x-st[0])*(x-st[0])))-y)*2/3;
            }
            let arrowWidth=3*arrowHeight/2;
            let arrowDist=0;
            if (this.isDirected===true) arrowDist=strokeWidth/arrowHeight*arrowWidth;
            let endDist=0;
            if (this.isDirected===true) endDist=strokeWidth/2+arrowDist;

            let pathForWeight;
            if (properties===0) {
                let quotient=(edgeLen-((edgeInd===-1)?0:this.vertexRad)-endDist)/edgeLen;
                let diff=[end[0]-st[0],end[1]-st[1]];
                end[0]=st[0]+quotient*diff[0];
                end[1]=st[1]+quotient*diff[1];
                quotient=((edgeInd===-1)?0:this.vertexRad)/edgeLen;
                st[0]+=quotient*diff[0];
                st[1]+=quotient*diff[1];
                edge.line=this.s.path(linePath(st,end));

                let points=sortPoints(st,end);
                pathForWeight=linePath(points[0],points[1]);
            }
            else {
                if (isLoop===true) { /// loop
                    edge.line=this.s.path(loopPath(st[0],st[1]-this.vertexRad,this.vertexRad,properties,this.isDirected));
                    pathForWeight=loopPath(st[0],st[1]-this.vertexRad,this.vertexRad,properties,false);
                }
                else { /// multiedge
                    let [beg,fin]=[st,end];
                    if ((st[1]>end[1])||((st[1]===end[1])&&(st[0]>end[0]))) [beg,fin]=[end,st];
                    if (beg[0]===fin[0]) properties*=(-1);
                    let sign=(beg[0]<=fin[0])?-1:1;
                    if (beg[1]===fin[1]) sign*=(-1);
                    let middlePoint=findPointAtDistance(beg[0],beg[1],fin[0],fin[1],properties*sign);
                    let bezierPoint=findBezierPoint(beg[0],beg[1],fin[0],fin[1],middlePoint[0],middlePoint[1]);
                    let p1=Snap.path.intersection(
                        bezierPath(beg,fin,bezierPoint),
                        circlePath(beg[0],beg[1],((beg===st)?this.vertexRad:(this.vertexRad+endDist)))
                    )[0];
                    let p2=Snap.path.intersection(
                        bezierPath(beg,fin,bezierPoint),
                        circlePath(fin[0],fin[1],((fin===st)?this.vertexRad:(this.vertexRad+endDist)))
                    )[0];

                    bezierPoint=findBezierPoint(p1.x,p1.y,p2.x,p2.y,middlePoint[0],middlePoint[1]);
                    if (beg!==st) [p1,p2]=[p2,p1];
                    edge.line=this.s.path(bezierPath([p1.x,p1.y],[p2.x,p2.y],bezierPoint));

                    let points=sortPoints([p1.x,p1.y],[p2.x,p2.y]);
                    pathForWeight=bezierPath(points[0],points[1],bezierPoint);
                }
            }

            edge.line.attr({fill: "none", stroke: "black", "stroke-width": strokeWidth});
            if (this.isDirected==true) {
                let arrowEnd=[3*arrowHeight/2,arrowHeight/2];
                let arrow=this.s.polygon([0,0,arrowEnd[0],arrowEnd[1],0,arrowHeight,0,0]).attr({fill: "black"});
                edge.line.marker=arrow;
                let marker=arrow.marker(0,0,arrowEnd[0],arrowHeight,(isLoop===false)?arrowEnd[0]-arrowDist:0,arrowEnd[1]).attr({markerUnits: "userSpaceOnUse"});
                edge.line.attr({"marker-end": marker});
            }

            if ((edgeInd!==-1)&&(this.edgeList[edgeInd].weight!=="")) {
                if ((isLoop===false)&&(st[0]===end[0])) {
                    let tempPath=this.s.path(pathForWeight).attr({fill: "none", stroke: "black", "stroke-width": strokeWidth});
                    let middle=edge.line.getPointAtLength(tempPath.getTotalLength()/2);
                    tempPath.remove();
                    edge.weight=this.s.text(middle.x,middle.y,this.edgeList[edgeInd].weight.toString());
                }
                else edge.weight=this.s.text(0,0,this.edgeList[edgeInd].weight.toString());
                edge.weight.attr({
                    "font-size": this.vertexRad,
                    "font-family": "Arial",
                    "text-anchor": "middle",
                    class: "unselectable",
                });
                if ((isLoop===false)&&(st[0]===end[0])) 
                    edge.weight.attr({
                        dx: (-edge.weight.getBBox().width/2-5)*((properties<=0)?1:-1),
                        dy: determineDy(this.edgeList[edgeInd].weight.toString(),"Arial",this.vertexRad)
                    });
                else {
                    if ((isLoop===false)&&(properties<0)) edge.weight.attr({dy: edge.weight.getBBox().height-2});
                    else edge.weight.attr({dy: (isLoop===false)?-7:-3});
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
            let fontSize=this.findFontSize();
            this.svgVertices[i].text=this.s.text(x,y,this.vertices[i].name);
            this.svgVertices[i].text.attr({
                "font-size": fontSize, 
                "font-family": "Consolas",
                dy: determineDy(this.vertices[i].name,"Consolas",fontSize), 
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

        this.findFontSize = function () {
            return this.vertexRad*5/4;
        }
        this.findStrokeWidth = function () {
            return this.vertexRad/20*1.5;
        }
        this.drawableEdges=undefined;
        this.draw = function (addDrawableEdges) { /// this functions expects that coordinates are already calculated
            let oldVersCoords=[],changedVers=[],cntAnimations=0;
            for (let i=0; i<this.n; i++) {
                if (this.svgVertices[i].group!==undefined) {
                    oldVersCoords[i]=this.svgVertices[i].group.getBBox();
                    if ((oldVersCoords[i].x!=this.svgVertices[i].coord[0])||(oldVersCoords[i].y!=this.svgVertices[i].coord[1])) {
                        changedVers[i]=true;
                    }
                    else changedVers[i]=false;
                }
                else changedVers[i]=false;
            }
            let oldEdgesPaths=[];
            for (let i=0; i<this.edgeList.length; i++) {
                if ((this.svgEdges[i]!==undefined)&&(this.svgEdges[i].line!==undefined)) {
                    oldEdgesPaths[i]=this.svgEdges[i].line.attr("d");
                }
                else oldEdgesPaths[i]=undefined;
            }
            
            this.erase();

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
            let height=this.vertexRad*3/10;
            let multiEdges = [[],
                              [0],
                              [height, -height],
                              [height, -height, 0],
                              [height, -height, 2*height, -2*height],
                              [height, -height, 2*height, -2*height, 0]];
            let loopEdges = [[],
                             [3*this.vertexRad/4],
                             [3*this.vertexRad/4, this.vertexRad/2]];
            let i=0;
            for (let edge of this.edgeList) {
                let x=edge.x,y=edge.y;
                let code=Math.max(x,y)*this.n+Math.min(x,y);
                let val=edgeMapCurr.get(code);
                let from=this.svgVertices[x].coord,to=this.svgVertices[y].coord;
                let st=[from[0]+this.vertexRad,from[1]+this.vertexRad];
                let end=[to[0]+this.vertexRad,to[1]+this.vertexRad];
                let properties=(x!==y)?multiEdges[edgeMapCnt.get(code)][val++]:loopEdges[edgeMapCnt.get(code)][val++];
                this.svgEdges[i]=this.drawEdge(st,end,i,properties);
                edgeMapCurr.set(code,val);
                
                if ((oldEdgesPaths[i]!==undefined)&&(oldEdgesPaths[i]!==this.svgEdges[i].line.attr("d"))) {
                    cntAnimations++;
                    let currPath=this.svgEdges[i].line.attr("d");
                    this.svgEdges[i].line.attr({d: oldEdgesPaths[i]});
                    let weight=this.svgEdges[i].weight;
                    if (weight!==undefined) weight.attr("opacity",0);
                    this.svgEdges[i].line.animate({d: currPath},500,function (graph) {
                        if (weight!==undefined) weight.attr("opacity",1);
                        this.attr({d: currPath});
                        animationsEnd.call(graph);
                    }.bind(this.svgEdges[i].line,this));
                }
                else if ((oldEdgesPaths[i]===undefined)&&((changedVers[x]===true)||(changedVers[y]===true))) {
                    cntAnimations++;
                    let currPath=this.svgEdges[i].line.attr("d"),weight=this.svgEdges[i].weight;
                    this.svgEdges[i].line.remove();
                    st=[oldVersCoords[x].x+this.vertexRad,oldVersCoords[x].y+this.vertexRad];
                    end=[oldVersCoords[y].x+this.vertexRad,oldVersCoords[y].y+this.vertexRad];
                    this.svgEdges[i]=this.drawEdge(st,end,i,properties);
                    if (this.svgEdges[i].weight!==undefined) this.svgEdges[i].weight.remove();
                    this.svgEdges[i].weight=weight;
                    if (weight!==undefined) weight.attr("opacity",0);
                    this.svgEdges[i].line.animate({d: currPath},500,function (graph) {
                        if (weight!==undefined) weight.attr("opacity",1);
                        this.attr({d: currPath});
                        animationsEnd.call(graph);
                    }.bind(this.svgEdges[i].line,this));
                }
                
                i++;
            }

            for (let i=0; i<this.n; i++) {
                if (this.vertices[i].name===undefined) {
                    this.svgVertices[i].circle=this.svgVertices[i].text=undefined;
                    this.svgVertices[i].group=undefined;
                    continue;
                }
                let x=this.svgVertices[i].coord[0]+this.vertexRad;
                let y=this.svgVertices[i].coord[1]+this.vertexRad;
                this.svgVertices[i].circle=this.s.circle(x,y,this.vertexRad);
                this.svgVertices[i].circle.attr({fill: "white", stroke: "black", "stroke-width": this.findStrokeWidth()});
                this.drawVertexText(i,this.vertices[i].name);
                
                if (changedVers[i]===true) {
                    cntAnimations++;
                    this.svgVertices[i].group.transform("t "+(oldVersCoords[i].x-this.svgVertices[i].coord[0])+" "+(oldVersCoords[i].y-this.svgVertices[i].coord[1]));
                    this.svgVertices[i].group.animate({transform: "t 0 0"},500,animationsEnd.bind(this));
                }
            }
            
            function animationsEnd () {
                cntAnimations--;
                if (cntAnimations<=0) {
                    for (let i=0; i<this.n; i++) {
                        if (addDrawableEdges===true) this.svgVertices[i].group.attr({cursor: "pointer"});
                    }
                    if (addDrawableEdges===true) {
                        if (this.drawableEdges===undefined) this.drawableEdges=new DrawableEdges(this);
                        this.drawableEdges.init();
                    }
                }
            }
            if (cntAnimations===0) animationsEnd.call(this);
        }
        
        this.addEdge = function (x, y, weight) {
            let ind=this.edgeList.length;
            this.edgeList.push(new Edge(x,y,weight));
            this.adjList[x].push(ind);
            if (this.isDirected===false) this.adjList[y].push(ind);
            this.adjMatrix[x][y]++;
            if (this.isDirected===false) this.adjMatrix[y][x]++;
        }
        this.addVertex = function (name) {
            this.vertices.push(new Vertex(name));
            this.n++;
        }
    }

    function addSaveFunctionality (svgName) {
        let parentElement=$(svgName).parent();
        let canvas=parentElement.children(".canvas-save");
        canvas.hide();
        let svgSave=parentElement.children(".svg-save");
        svgSave.hide();

        for (let saveButton of parentElement.find(".save")) {
            $(saveButton).on("click",function () {
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
    }
    
    
    window.Graph = Graph;
    window.segmentLength = segmentLength;
    window.determineDy = determineDy;
})();