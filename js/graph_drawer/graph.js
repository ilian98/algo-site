"use strict";
(function () {
    function circlesIntersection (x1, y1, r1, x2, y2, r2) {
        x2-=x1; y2-=y1;
        let flag=false;
        if (y2==0) {
            [x1, y1]=[y1, x1];
            [x2, y2]=[y2, x2];
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
        x2+=x1; y2+=y1;
        if (flag===true) {
            [xs[0], ys[0]]=[ys[0], xs[0]];
            [xs[1], ys[1]]=[ys[1], xs[1]];
            [x1, y1]=[y1, x1];
            [x2, y2]=[y2, x2];
        }
        if (findOrientation([x1, y1],[x2, y2],[xs[0], ys[0]])<0) return [[xs[0], ys[0]],[xs[1], ys[1]]];
        else return [[xs[1], ys[1]],[xs[0], ys[0]]];
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
    function bezierPath (st, end, q) {
        return "M"+st[0]+","+st[1]+" Q"+q[0]+","+q[1]+" "+end[0]+","+end[1];
    }
    function linePath (st, end) {
        return bezierPath(st, end, [(st[0]+end[0])/2, (st[1]+end[1])/2]);
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

    function Vertex (name, css=["",""]) {
        this.name=name;
        
        this.defaultCSS=["",""];
        this.addedCSS=css;
    }

    function SvgVertex () {
        this.coord=undefined;
        this.circle=undefined; this.text=undefined;
        this.group=undefined;
    }

    function Edge (x, y, weight = "", css=["",""], curveHeight=undefined) {
        this.x=x;
        this.y=y;
        this.weight=weight;
        
        this.defaultCSS=["",""];
        this.addedCSS=css;
        
        this.curveHeight=curveHeight;

        this.findEndPoint = function (vr) {
            if (this.x==vr) return this.y;
            else return this.x;
        }
    }

    function SvgEdge () {
        this.line=undefined;
        this.weight=undefined;
        this.drawProperties=undefined;
    }

    function Graph () {
        this.svgName=undefined; this.s=undefined;
        this.svgVertices=undefined; this.svgEdges=undefined;
        this.n=undefined; this.vertices=undefined;
        this.edgeList=undefined; this.adjList=undefined; this.adjMatrix=undefined;
        this.isDirected=undefined; this.isMulti=undefined; this.isWeighted=undefined; this.isTree=undefined;
        this.graphChange=undefined; // function to be called after changing the graph, for exampe adding new edge
        this.undoStack=undefined; this.undoTime=undefined; this.redoStack=undefined; this.redoTime=undefined;
        this.init = function (svgName, n, isDirected, isTree = false, graphChange = () => {}) {
            $(svgName).css({
                "border-style": "dotted",
                "border-color": "transparent",
                "border-width": "2px",
                "border-radius": "5px"
            });
            if (this.s===undefined) {
                this.svgName=svgName;
                this.s=Snap(svgName);
            }
            this.erase();
            this.svgVertices=[]; this.svgEdges=[];

            if (n!==undefined) this.n=n;
            this.initVertices(this.n);
            for (let i=0; i<this.n; i++) {
                this.vertices[i].name=(i+1).toString();
            }

            this.edgeList=[]; this.adjList=[]; this.reverseAdjList=[]; this.adjMatrix=[];
            for (let i=0; i<this.n; i++) {
                this.adjList[i]=[]; this.reverseAdjList[i]=[]; this.adjMatrix[i]=[];
                for (let j=0; j<this.n; j++) {
                    this.adjMatrix[i][j]=[];
                }
            }

            if (isDirected!==undefined) this.isDirected=isDirected;
            this.isMulti=false; this.isWeighted=false;
            if (isTree!==undefined) this.isTree=isTree;
            else this.isTree=false;
            
            addSaveFunctionality(svgName);
            this.graphChange=graphChange;
            this.undoStack=[]; this.undoTime=0; this.redoStack=[]; this.redoTime=0;
            addUndoFunctionality(svgName,this);
        }

        this.initVertices = function (n) {
            this.n=n; this.vertices=[];
            for (let i=0; i<this.n; i++) {
                this.vertices[i]=new Vertex();
            }
        }

        function convertEdgeToList (edge) {
            return [edge.x,edge.y,edge.weight,[edge.addedCSS[0],edge.addedCSS[1]],edge.curveHeight];
        }
        this.convertSimpleEdgeList = function () {
            let edges=[];
            for (let edge of this.edgeList) {
                if (edge===undefined) {
                    edges.push(undefined);
                    continue;
                }
                edges.push(convertEdgeToList(edge));
            }
            return edges;
        }
        this.buildEdgeDataStructures = function (edges, undoType) {
            let undoObj={type: "edge-list", data: [this.n, this.convertSimpleEdgeList()]};
            if ((undoType===undefined)||(undoType==="redo")) {
                undoObj.time=this.undoTime;
                this.undoStack.push(undoObj);
                this.undoTime++;
                if (undoType===undefined) this.redoStack=[];
            }
            else {
                undoObj.time=this.redoTime;
                this.redoStack.push(undoObj);
                this.redoTime++;
            }
            
            let edgeList=this.edgeList=[];
            for (let edge of edges) {
                if (edge===undefined) {
                    edgeList.push(undefined);
                    continue;
                }
                if (edge.length===2) edgeList.push(new Edge(edge[0],edge[1]));
                else if (edge.length===3) {
                    edgeList.push(new Edge(edge[0],edge[1],edge[2]));
                    this.isWeighted=true;
                }
                else {
                    edgeList.push(new Edge(edge[0],edge[1],edge[2],edge[3],edge[4]));
                    if (edge[2]!=="") this.isWeighted=true;
                }
            }
            let max=0;
            for (let i=0; i<this.n; i++) {
                if (this.vertices[i]===undefined) continue;
                if (this.vertices[i].name===undefined) {
                    this.vertices[i]=undefined;
                    continue;
                }
                if (max<i) max=i;
            }
            for (let edge of edgeList) {
                if (edge===undefined) continue;
                if (max<edge.x) max=edge.x;
                if (max<edge.y) max=edge.y;
            }
            this.n=max+1;

            let edgeSet = new Set();
            for (let edge of edgeList) {
                if (edge===undefined) continue;
                let x=edge.x,y=edge.y;
                if ((edgeSet.has(x*this.n+y))||((this.isDirected===false)&&(edgeSet.has(y*this.n+x)))) {
                    this.isMulti=true;
                }
                else edgeSet.add(x*this.n+y);
            }

            for (let i=0; i<=max; i++) {
                this.adjMatrix[i]=[];
                for (let j=0; j<=max; j++) {
                    this.adjMatrix[i][j]=[];
                }
                this.adjList[i]=[]; this.reverseAdjList[i]=[];
            }
            for (let i=0; i<edgeList.length; i++) {
                if (edgeList[i]===undefined) continue;
                let x=edgeList[i].x,y=edgeList[i].y;
                this.adjMatrix[x][y].push(i);
                this.adjList[x].push(i);
                if ((this.isDirected===false)&&(x!==y)) {
                    this.adjMatrix[y][x].push(i);
                    this.adjList[y].push(i);
                }
                if (this.isDirected===true) this.reverseAdjList[y].push(i);
            }
        }

        this.erase = function () {
            this.s.selectAll("*").remove();
        }

        this.frameX=undefined; this.frameY=undefined; this.frameW=undefined; this.frameH=undefined; this.vertexRad=20;
        this.isDrawable=undefined; this.calcPositions=undefined;
        this.drawNewGraph = function (frameX, frameY, frameW, frameH, vertexRad, addDraw = false) {
            this.erase();

            if (frameX!==undefined) {
                this.frameX=frameX; this.frameY=frameY;
                this.frameW=frameW; this.frameH=frameH;
            }
            if (vertexRad!==undefined) this.vertexRad=vertexRad;
            this.svgVertices=[];
            for (let i=0; i<this.n; i++) {
                if (this.vertices[i]===undefined) continue;
                this.svgVertices[i]=new SvgVertex();
            }
            this.svgEdges=[];
            for (let i=0; i<this.edgeList.length; i++) {
                if (this.edgeList[i]===undefined) continue;
                this.svgEdges[i]=new SvgEdge();
            }
            this.isDrawable=addDraw;
            if (this.calcPositions===undefined) this.calcPositions=new CalcPositions(this);
            this.calcPositions.init();
            this.undoStack.pop(); this.redoStack=[];
            this.draw(addDraw);
        }

        function calcStraightEdge (st, end, isDrawn, endDist, vertexRad) {
            let edgeLen=segmentLength(st[0],st[1],end[0],end[1]);
            let quotient=((isDrawn===true)?0:vertexRad)/edgeLen;
            let diff=[end[0]-st[0],end[1]-st[1]];
            let beg=[st[0]+quotient*diff[0], st[1]+quotient*diff[1]];
            quotient=(edgeLen-((isDrawn===true)?0:vertexRad)-endDist)/edgeLen;
            let fin=[st[0]+quotient*diff[0], st[1]+quotient*diff[1]];
            return linePath(beg,fin);
        }
        this.calcCurvedEdge = function (st, end, properties, endDist) {
            let middlePoint=findPointAtDistance(st[0],st[1],end[0],end[1],properties);
            let [beg,fin]=[st,end];
            if ((st[1]>end[1])||((st[1]===end[1])&&(st[0]>end[0]))) [beg,fin]=[end,st];
            let bezierPoint=findBezierPoint(beg[0],beg[1],fin[0],fin[1],middlePoint[0],middlePoint[1]);
            let bezPath=bezierPath(beg,fin,bezierPoint);
            if (segmentLength(st[0],st[1],end[0],end[1])<2*this.vertexRad+3*endDist) return [bezPath, bezierPoint];
            let p1=Snap.path.intersection(
                bezPath,
                circlePath(beg[0],beg[1],((beg===st)?this.vertexRad:(this.vertexRad+endDist)))
            )[0];
            if (p1===undefined) return ["", bezierPoint];
            let p2=Snap.path.intersection(
                bezPath,
                circlePath(fin[0],fin[1],((fin===st)?this.vertexRad:(this.vertexRad+endDist)))
            )[0];
            if (p2===undefined) return ["", bezierPoint];
            let bezierPointFinal=findBezierPoint(p1.x,p1.y,p2.x,p2.y,middlePoint[0],middlePoint[1]);
            if (beg!==st) [p1,p2]=[p2,p1];
            return [bezierPath([p1.x,p1.y],[p2.x,p2.y],bezierPointFinal), bezierPoint];
        }
        function calculateArrowProperties (isLoop, strokeWidth, st, vertexRad, properties) {
            let arrowHeight;
            if (isLoop===false) arrowHeight=5*(strokeWidth);
            else {
                let x=st[0]+properties,y=(st[1]-vertexRad-3*properties/8);
                arrowHeight=((st[1]-Math.sqrt(vertexRad*vertexRad-(x-st[0])*(x-st[0])))-y)*2/3;
            }
            let arrowWidth=3*arrowHeight/2;
            return [arrowHeight, arrowWidth, strokeWidth/arrowHeight*arrowWidth];
        }
        function addMarkerEnd (line, isLoop, strokeWidth, st, properties) {
            let [arrowHeight, arrowWidth, arrowDist]=calculateArrowProperties(isLoop,strokeWidth,st,this.vertexRad,properties);
            let arrowEnd=[3*arrowHeight/2,arrowHeight/2];
            let arrow=this.s.polygon([0,0,arrowEnd[0],arrowEnd[1],0,arrowHeight,0,0]).attr({fill: line.attr("stroke")});
            line.markerEnd=arrow;
            let marker=arrow.marker(0,0,arrowEnd[0],arrowHeight,(isLoop===false)?arrowEnd[0]-arrowDist:0,arrowEnd[1]).attr({markerUnits: "userSpaceOnUse"});
            line.attr({"marker-end": marker});
        }
        function calcWeightPosition (weight, isVertical, isLoop, pathForWeight, properties) {
            if (isVertical===true) {
                let tempPath=this.s.path(pathForWeight).attr({
                    fill: "none",
                    stroke: "black",
                    "stroke-width": this.findStrokeWidth()
                });
                let middle=tempPath.getPointAtLength(tempPath.getTotalLength()/2);
                tempPath.remove();
                if (properties>=0) pathForWeight=linePath([middle.x-weight.width-2*5, middle.y],
                                                          [middle.x, middle.y]);
                else pathForWeight=linePath([middle.x, middle.y],
                                            [middle.x+weight.width+2*5, middle.y]);
                weight.attr({dy: weight.dyCenter});
            }
            else if ((isLoop===false)&&(properties<0)) weight.attr({dy: weight.height-2});
            else weight.attr({dy: (isLoop===false)?-7:-3});
            return pathForWeight;
        }
        this.redrawEdge = function (edge, st, end, edgeInd = -1) {
            let properties=edge.drawProperties[0];
            let isLoop=false,isDrawn=(edgeInd===-1);
            if ((isDrawn===false)&&(this.edgeList[edgeInd].x===this.edgeList[edgeInd].y)) isLoop=true;
            
            let endDist=edge.endDist;

            let pathForWeight;
            if (properties===0) {
                edge.line.attr("d",calcStraightEdge(st,end,isDrawn,endDist,this.vertexRad));
                let points=sortPoints(st,end);
                pathForWeight=linePath(points[0],points[1]);
            }
            else {
                if (isLoop===true) { /// loop
                    edge.line.attr("d",loopPath(st[0],st[1]-this.vertexRad,this.vertexRad,properties,this.isDirected));
                    pathForWeight=loopPath(st[0],st[1]-this.vertexRad,this.vertexRad,properties,false);
                }
                else { /// multiedge
                    let res=this.calcCurvedEdge(st,end,properties,endDist);
                    edge.line.attr("d",res[0]);
                    let points=sortPoints(st,end);
                    if (points[0]!==st) properties*=(-1);
                    pathForWeight=bezierPath(points[0],points[1],res[1]);
                }
            }

            if ((isDrawn===false)&&(this.isWeighted===true)) {
                pathForWeight=calcWeightPosition.call(this,edge.weight,
                                                      ((isLoop===false)&&(st[0]===end[0])),isLoop,pathForWeight,properties);
                this.s.select(edge.weight.textPath.attr("href")).attr("d",pathForWeight);
            }
            return edge;
        }
        function setStyle (obj, css) {
            obj.addClass("temp");
            let style=$(".temp").attr("style");
            $(".temp").attr("style",style+" ; "+css);
            obj.removeClass("temp");
            return style;
        }
        this.drawEdge = function (st, end, edgeInd = -1, properties = 0) {
            let strokeWidth=this.findStrokeWidth();
            let isLoop=false,isDrawn=(edgeInd===-1);
            if ((isDrawn===false)&&(this.edgeList[edgeInd].x===this.edgeList[edgeInd].y)) isLoop=true;
            
            let edge=new SvgEdge();
            edge.drawProperties=[];
            edge.drawProperties[0]=properties;

            let endDist=0;
            if (this.isDirected===true) {
                let arrowDist=calculateArrowProperties(isLoop,strokeWidth,st,this.vertexRad,properties)[2];
                endDist=strokeWidth/2+arrowDist;
            }
            edge.endDist=endDist;

            let pathForWeight;
            if (properties===0) {
                edge.line=this.s.path(calcStraightEdge(st,end,isDrawn,endDist,this.vertexRad));
                let points=sortPoints(st,end);
                pathForWeight=linePath(points[0],points[1]);
            }
            else {
                if (isLoop===true) { /// loop
                    edge.line=this.s.path(loopPath(st[0],st[1]-this.vertexRad,this.vertexRad,properties,this.isDirected));
                    pathForWeight=loopPath(st[0],st[1]-this.vertexRad,this.vertexRad,properties,false);
                }
                else { /// multiedge
                    let res=this.calcCurvedEdge(st,end,properties,endDist);
                    edge.line=this.s.path(res[0]);
                    let points=sortPoints(st,end);
                    if (points[0]!==st) properties*=(-1);
                    pathForWeight=bezierPath(points[0],points[1],res[1]);
                }
            }

            edge.line.attr({fill: "none", stroke: "black", "stroke-width": strokeWidth});
            if (this.isDirected===true) addMarkerEnd.call(this,edge.line,isLoop,strokeWidth,st,properties);
            if (isDrawn===false) this.edgeList[edgeInd].defaultCSS[0]=setStyle(edge.line,this.edgeList[edgeInd].addedCSS[0]);
            if (this.isDirected===true) edge.line.markerEnd.attr("fill",edge.line.attr("stroke"));

            if ((isDrawn===false)&&(this.isWeighted===true)) {
                edge.weight=this.s.text(0,0,this.edgeList[edgeInd].weight.toString());
                edge.weight.attr({
                    "font-size": this.vertexRad,
                    "font-family": "Arial",
                    "text-anchor": "middle",
                    class: "unselectable",
                    fill: edge.line.attr("stroke"),
                });
                edge.weight.width=edge.weight.getBBox().width;
                edge.weight.height=edge.weight.getBBox().height;
                edge.weight.dyCenter=determineDy(this.edgeList[edgeInd].weight.toString(),"Arial",this.vertexRad);
                
                pathForWeight=calcWeightPosition.call(this,edge.weight,
                                                      ((isLoop===false)&&(st[0]===end[0])),isLoop,pathForWeight,properties);
                edge.weight.attr({textpath: pathForWeight});
                edge.weight.textPath.attr({"startOffset": "50%"});
                
                this.edgeList[edgeInd].defaultCSS[1]=setStyle(edge.weight,this.edgeList[edgeInd].addedCSS[1]);
            }
            return edge;
        }

        this.drawVertexText = function (i, text) {
            let x=this.svgVertices[i].coord[0],y=this.svgVertices[i].coord[1];
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
            
            this.vertices[i].defaultCSS[1]=setStyle(this.svgVertices[i].text,this.vertices[i].addedCSS[1]);
        }
        this.drawVertex = function (i) {
            let x=this.svgVertices[i].coord[0],y=this.svgVertices[i].coord[1];
            this.svgVertices[i].circle=this.s.circle(x,y,this.vertexRad);
            this.svgVertices[i].circle.attr({fill: "white", stroke: "black", "stroke-width": this.findStrokeWidth()});
            this.svgVertices[i].circle.animate({"stroke-width": 100},500);
            this.vertices[i].defaultCSS[0]=setStyle(this.svgVertices[i].circle,this.vertices[i].addedCSS[0]);
            this.drawVertexText(i,this.vertices[i].name);
        }

        this.centerGraph = function () {
            let minX=this.frameX+this.frameW,maxX=0;
            let minY=this.frameY+this.frameH,maxY=0;
            for (let i=0; i<this.n; i++) {
                if (this.vertices[i]===undefined) continue;
                let x=this.svgVertices[i].coord[0],y=this.svgVertices[i].coord[1];
                if (minX>x) minX=x;
                if (maxX<x) maxX=x;
                if (minY>y) minY=y;
                if (maxY<y) maxY=y;
            }
            let lenX=maxX-minX,lenY=maxY-minY;
            let addX=(this.frameW-2*this.vertexRad-this.frameX-lenX)/2+this.frameX+this.vertexRad-minX;
            let addY=(this.frameH-2*this.vertexRad-this.frameY-lenY)/2+this.frameY+this.vertexRad-minY;
            for (let i=0; i<this.n; i++) {
                if (this.vertices[i]===undefined) continue;
                this.svgVertices[i].coord[0]+=addX;
                this.svgVertices[i].coord[1]+=addY;
            }
        }

        this.findFontSize = function (vertexRad = this.vertexRad) {
            return vertexRad*5/4;
        }
        this.findStrokeWidth = function (vertexRad = this.vertexRad) {
            return vertexRad/20*1.5;
        }
        this.drawableGraph=undefined;
        this.draw = function (addDraw, animateDraw = true) { /// this functions expects that coordinates are already calculated
            let oldVersCoords=[],changedVers=[],cntAnimations=0;
            let oldRad=this.vertexRad;
            let oldEdgesPaths=[],oldDy=[],oldWeightsPaths=[];
            if (animateDraw===true) {
                for (let i=0; i<this.n; i++) {
                    if ((this.svgVertices[i]!==undefined)&&(this.svgVertices[i].group!==undefined)) {
                        oldRad=parseInt(this.svgVertices[i].circle.attr("r"));
                        break;
                    }
                }
                for (let i=0; i<this.n; i++) {
                    if ((this.svgVertices[i]!==undefined)&&
                        (this.svgVertices[i].group!==undefined)&&(this.svgVertices[i].coord!==undefined)) {
                        oldVersCoords[i]=this.svgVertices[i].group.getBBox();
                        if ((oldVersCoords[i].x+oldRad!=this.svgVertices[i].coord[0])||
                            (oldVersCoords[i].y+oldRad!=this.svgVertices[i].coord[1])) {
                            changedVers[i]=true;
                        }
                        else changedVers[i]=false;
                    }
                    else changedVers[i]=false;
                }
                for (let i=0; i<this.edgeList.length; i++) {
                    if ((this.svgEdges[i]!==undefined)&&(this.svgEdges[i].line!==undefined)) {
                        oldEdgesPaths[i]=this.svgEdges[i].line.attr("d");
                        if (this.svgEdges[i].weight!==undefined) {
                            oldWeightsPaths[i]=this.s.select(this.svgEdges[i].weight.textPath.attr("href")).attr("d");
                            oldDy[i]=this.svgEdges[i].weight.attr("dy");
                        }
                    }
                    else oldEdgesPaths[i]=undefined;
                }
            }
            
            this.erase();

            let edgeMapCnt=new Map(),edgeMapCurr=new Map();
            for (let edge of this.edgeList) {
                if (edge===undefined) continue;
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
            let multiEdges=[[],
                            [0],
                            [height, -height],
                            [height, -height, 0],
                            [height, -height, 2*height, -2*height],
                            [height, -height, 2*height, -2*height, 0]];
            let loopEdges=[[],
                           [3*this.vertexRad/4],
                           [3*this.vertexRad/4, this.vertexRad/2]];
            this.svgEdges=[];
            for (let i=0; i<this.edgeList.length; i++) {
                if (this.edgeList[i]===undefined) continue;
                let x=this.edgeList[i].x,y=this.edgeList[i].y;
                let code=Math.max(x,y)*this.n+Math.min(x,y);
                let val=edgeMapCurr.get(code),cnt=edgeMapCnt.get(code);
                let drawProperties;
                if (x!==y) drawProperties=multiEdges[cnt][val++]*((x>y)?-1:1);
                else drawProperties=loopEdges[cnt][val++];
                let origProperties=drawProperties;
                if (this.edgeList[i].curveHeight!==undefined) drawProperties=this.edgeList[i].curveHeight;
                this.svgEdges[i]=this.drawEdge(this.svgVertices[x].coord,this.svgVertices[y].coord,i,drawProperties);
                this.svgEdges[i].drawProperties[1]=cnt;
                this.svgEdges[i].drawProperties[2]=origProperties;
                edgeMapCurr.set(code,val);
                
                if (animateDraw===true) {
                    if ((oldEdgesPaths[i]===undefined)&&((changedVers[x]===true)||(changedVers[y]===true))) {
                        let st=[oldVersCoords[x].x+this.vertexRad,oldVersCoords[x].y+this.vertexRad];
                        let end=[oldVersCoords[y].x+this.vertexRad,oldVersCoords[y].y+this.vertexRad];
                        this.redrawEdge(this.svgEdges[i],st,end,i);
                        oldEdgesPaths[i]=this.svgEdges[i].line.attr("d");
                        if (this.svgEdges[i].weight!==undefined) {
                            oldWeightsPaths[i]=this.s.select(this.svgEdges[i].weight.textPath.attr("href")).attr("d");
                            oldDy[i]=this.svgEdges[i].weight.attr("dy");
                        }
                        this.redrawEdge(this.svgEdges[i],this.svgVertices[x].coord,this.svgVertices[y].coord,i);
                    }
                    
                    if ((oldEdgesPaths[i]!==undefined)&&(oldEdgesPaths[i]!==this.svgEdges[i].line.attr("d"))) {
                        cntAnimations++;
                        let currPath=this.svgEdges[i].line.attr("d");
                        this.svgEdges[i].line.attr({d: oldEdgesPaths[i]});
                        this.svgEdges[i].line.animate({d: currPath},500,function (graph) {
                            this.attr({d: currPath});
                            animationsEnd.call(graph);
                        }.bind(this.svgEdges[i].line,this));
                        
                        if (this.svgEdges[i].weight!==undefined) {
                            cntAnimations++;
                            let weightPath=this.s.select(this.svgEdges[i].weight.textPath.attr("href"));
                            let currWeightPath=weightPath.attr("d");
                            weightPath.attr({d: oldWeightsPaths[i]});
                            weightPath.animate({d: currWeightPath},500,function (graph) {
                                this.attr({d: currWeightPath});
                                animationsEnd.call(graph);
                            }.bind(weightPath,this));
                            
                            let currDy=this.svgEdges[i].weight.attr("dy");
                            if (oldDy[i]!==currDy) {
                                cntAnimations++;
                                this.svgEdges[i].weight.attr({dy: oldDy[i]});
                                this.svgEdges[i].weight.animate({dy: currDy},500,animationsEnd.bind(this));
                            }
                        }
                    }
                }
            }

            for (let i=0; i<this.n; i++) {
                if (this.vertices[i]===undefined) {
                    this.svgVertices[i]=undefined;
                    continue;
                }
                this.drawVertex(i);
                
                if ((animateDraw===true)&&(changedVers[i]===true)) {
                    cntAnimations++;
                    this.svgVertices[i].group.transform("t "+
                                                        ((oldVersCoords[i].x+oldRad)-this.svgVertices[i].coord[0])+" "+((oldVersCoords[i].y+oldRad)-this.svgVertices[i].coord[1]));
                    this.svgVertices[i].group.animate({transform: "t 0 0"},500,animationsEnd.bind(this));
                }
            }
            
            if ((animateDraw===true)&&(this.vertexRad!=oldRad)) {          
                cntAnimations++;
                Snap.animate(oldRad,this.vertexRad,function (val) {
                    for (let i=0; i<this.n; i++) {
                        if (this.vertices[i]===undefined) continue;
                        this.svgVertices[i].circle.attr({r: val, "stroke-width": this.findStrokeWidth(val)});
                        let fontSize=this.findFontSize(val);
                        this.svgVertices[i].text.attr({
                            "font-size": fontSize,
                            dy: determineDy(this.vertices[i].name,"Consolas",fontSize)
                        });
                    }
                
                    for (let i=0; i<this.edgeList.length; i++) {
                        if (this.edgeList[i]===undefined) continue;
                        this.svgEdges[i].line.attr({"stroke-width": this.findStrokeWidth(val)});
                        if (this.isDirected===true) {
                            let x=this.edgeList[i].x,y=this.edgeList[i].y;
                            this.svgEdges[i].line.markerEnd.remove();
                            addMarkerEnd.call(this,this.svgEdges[i].line,(x===y),this.findStrokeWidth(val),
                                              this.svgVertices[x].coord,this.svgEdges[i].drawProperties[0]);
                        }
                        if (this.svgEdges[i].weight!==undefined) this.svgEdges[i].weight.attr({"font-size": val});
                    }
                }.bind(this),500,animationsEnd.bind(this));
            }
            
            function animationsEnd () {
                cntAnimations--;
                if (cntAnimations<=0) {
                    if (addDraw===true) {
                        if (this.drawableGraph===undefined) this.drawableGraph=new DrawableGraph(this);
                        this.drawableGraph.init();
                    }
                }
            }
            if (cntAnimations===0) animationsEnd.call(this);
        }
        
        this.addEdge = function (x, y, weight, css = ["",""], curveHeight=undefined, prevInd = undefined, undoType) {
            let ind;
            if (prevInd!==undefined) ind=prevInd;
            else {
                for (let i=0; i<=this.edgeList.length; i++) {
                    if (this.edgeList[i]===undefined) {
                        ind=i;
                        break;
                    }
                }
            }
            if ((undoType===undefined)||(undoType==="redo")) {
                this.undoStack.push({time: this.undoTime, type: "add-edge", data: [ind]});
                this.undoTime++;
                if (undoType===undefined) this.redoStack=[];
            }
            else {
                this.redoStack.push({time: this.redoTime, type: "add-edge", data: [ind]});
                this.redoTime++;
            }
            
            this.edgeList[ind]=new Edge(x,y,weight,css,curveHeight);
            this.adjList[x].push(ind);
            if ((this.isDirected===false)&&(x!==y)) this.adjList[y].push(ind);
            this.adjMatrix[x][y].push(ind);
            if ((this.isDirected===false)&&(x!==y)) this.adjMatrix[y][x].push(ind);
            if (this.isDirected===true) this.reverseAdjList[y].push(ind);
            return ind;
        }
        this.removeEdge = function (index, undoType) {
            let edge=this.edgeList[index];
            if ((undoType===undefined)||(undoType==="redo")) {
                this.undoStack.push({time: this.undoTime, type: "remove-edge", data: [index, convertEdgeToList(edge)]});
                this.undoTime++;
                if (undoType===undefined) this.redoStack=[];
            }
            else {
                this.redoStack.push({time: this.redoTime, type: "remove-edge", data: [index, convertEdgeToList(edge)]});
                this.redoTime++;
            }
            
            this.adjMatrix[edge.x][edge.y].splice(this.adjMatrix[edge.x][edge.y].indexOf(index),1);
            this.adjList[edge.x].splice(this.adjList[edge.x].indexOf(index),1);
            if (this.isDirected===false) {
                this.adjMatrix[edge.y][edge.x].splice(this.adjMatrix[edge.y][edge.x].indexOf(index),1);
                this.adjList[edge.y].splice(this.adjList[edge.y].indexOf(index),1);
            }
            if (this.isDirected===true) this.reverseAdjList[edge.y].splice(this.reverseAdjList[edge.y].indexOf(index),1);
            this.svgEdges[index].line.remove();
            if (this.svgEdges[index].weight!==undefined) this.svgEdges[index].weight.remove();
            this.svgEdges[index]=undefined;
            this.edgeList[index]=undefined;
        }
        this.addVertex = function (name, css = ["",""], prevInd = undefined, undoType) {
            let ind;
            if (prevInd!==undefined) ind=prevInd;
            else {
                for (let i=0; i<=this.n; i++) {
                    if (this.vertices[i]===undefined) {
                        ind=i;
                        break;
                    }
                }
            }
            if ((undoType===undefined)||(undoType==="redo")) {
                this.undoStack.push({time: this.undoTime, type: "add-vertex", data: [ind]});
                this.undoTime++;
                if (undoType===undefined) this.redoStack=[];
            }
            else {
                this.redoStack.push({time: this.redoTime, type: "add-vertex", data: [ind]});
                this.redoTime++;
            }
            this.vertices[ind]=new Vertex(name,css);
            if (ind===this.n) {
                this.adjList[ind]=[];
                this.reverseAdjList[ind]=[];
                this.adjMatrix[ind]=[];
                this.n++;
                for (let i=0; i<this.n; i++) {
                    this.adjMatrix[i][ind]=[];
                    this.adjMatrix[ind][i]=[];
                }
            }
            this.svgVertices[ind]=new SvgVertex();
        }
        this.removeVertex = function (x, undoType) {
            let removeEdges=[];
            for (let ind of this.adjList[x]) {
                removeEdges.push(ind);
            }
            if (this.isDirected===true) {
                for (let ind of this.reverseAdjList[x]) {
                    removeEdges.push(ind);
                }
            }
            for (let ind of removeEdges) {
                this.removeEdge(ind,undoType);
                if ((undoType===undefined)||(undoType==="redo")) this.undoTime--;
                else this.redoTime--;
            }
            
            let undoObj={
                type: "remove-vertex",
                data: [x, [this.svgVertices[x].coord[0], this.svgVertices[x].coord[1]],
                       [this.vertices[x].name, [this.vertices[x].addedCSS[0], this.vertices[x].addedCSS[1]]]]
            };
            if ((undoType===undefined)||(undoType==="redo")) {
                undoObj.time=this.undoTime;
                this.undoStack.push(undoObj);
                this.undoTime++;
                if (undoType===undefined) this.redoStack=[];
            }
            else {
                undoObj.time=this.redoTime;
                this.redoStack.push(undoObj);
                this.redoTime++;
            }
            
            
            this.svgVertices[x].group.remove();
            this.svgVertices[x]=undefined;
            this.vertices[x]=undefined;
            if (x===this.n-1) this.n--;
        }
    }

    function addSaveFunctionality (svgName) {
        let parentElement=$(svgName).parent();
        let canvas=parentElement.children(".canvas-save");
        canvas.hide();
        let svgSave=parentElement.children(".svg-save");
        svgSave.hide();

        for (let saveButton of parentElement.find(".save")) {
            $(saveButton).off("click").on("click",function () {
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
    
    function undoAction (undoType, graph) {
        let stack,otherStack;
        if (undoType==="undo") stack=graph.undoStack, otherStack=graph.redoStack;
        else stack=graph.redoStack, otherStack=graph.undoStack;
        if (stack.length===0) return ;
        function pushOther (t, d) {
            otherStack.push({
                time: ((undoType==="undo")?graph.redoTime:graph.undoTime),
                type: t,
                data: d
            });
            if (undoType==="undo") graph.redoTime++;
            else graph.undoTime++;    
        }
        
        let curr=stack[stack.length-1];
        let currTime=stack[stack.length-1].time;
        for (;;) {
            if (stack.length===0) break;
            let curr=stack[stack.length-1];
            if (curr.time!==currTime) break;
            stack.pop();
            if (curr.type==="edge-list") {
                graph.n=curr.data[0];
                graph.buildEdgeDataStructures(curr.data[1],undoType);
            }
            else if (curr.type==="new-positions") {
                let currCoords=[];
                let coords=curr.data[1];
                for (let i=0; i<graph.n; i++) {
                    if (graph.vertices[i]===undefined) continue;
                    currCoords[i]=[graph.svgVertices[i].coord[0], graph.svgVertices[i].coord[1]];
                    graph.svgVertices[i].coord=coords[i];
                }
                pushOther(curr.type,[graph.calcPositions.originalPos.slice(), currCoords]);
                graph.calcPositions.originalPos=curr.data[0];
            }
            else {
                let ind=curr.data[0];
                if (curr.type==="new-pos") {
                    pushOther(curr.type,[ind, [graph.svgVertices[ind].coord[0], graph.svgVertices[ind].coord[1]]]);
                    graph.svgVertices[ind].coord=curr.data[1];
                }
                else if (curr.type==="add-edge") graph.removeEdge(ind,undoType);
                else if (curr.type==="remove-edge") {
                    let edgeData=curr.data[1];
                    graph.addEdge(edgeData[0],edgeData[1],edgeData[2],edgeData[3],edgeData[4],ind,undoType);
                }
                else if (curr.type==="add-vertex") graph.removeVertex(ind,undoType);
                else if (curr.type==="remove-vertex") {
                    graph.addVertex(curr.data[2][0],curr.data[2][1],ind,undoType);
                    graph.svgVertices[ind].coord=curr.data[1];
                }
                else if (curr.type==="change-curve-height") {
                    pushOther(curr.type,[ind, graph.edgeList[ind].curveHeight]);
                    graph.edgeList[ind].curveHeight=curr.data[1];
                }
                else if (curr.type==="change-css-vertex") {
                    pushOther(curr.type,[ind, [graph.vertices[ind].addedCSS[0], graph.vertices[ind].addedCSS[1]]]);
                    graph.vertices[ind].addedCSS=curr.data[1];
                }
                else if (curr.type==="change-css-edge") {
                    pushOther(curr.type,[ind, [graph.edgeList[ind].addedCSS[0], graph.edgeList[ind].addedCSS[1]]]);
                    graph.edgeList[ind].addedCSS=curr.data[1];
                }
                else if (curr.type==="change-name") {
                    pushOther(curr.type,[ind, graph.vertices[ind].name]);
                    graph.vertices[ind].name=curr.data[1];
                }
                else if (curr.type==="change-weight") {
                    pushOther(curr.type,[ind, graph.edgeList[ind].weight]);
                    graph.edgeList[ind].weight=curr.data[1];
                }
            }
            
            if (undoType==="undo") graph.redoTime--;
            else graph.undoTime--;
        }
        if (undoType==="undo") graph.redoTime++;
        else graph.undoTime++;
        
        graph.graphChange();
        graph.draw(graph.isDrawable);
    }
    function addUndoFunctionality (svgName, graph) {
        let parentElement=$(svgName).parent();
        let undoButton=parentElement.find(".undo");
        $(undoButton).off("click").on("click",function () {
            undoAction("undo",graph);
        });
        let redoButton=parentElement.find(".redo");
        $(redoButton).off("click").on("click",function () {
            undoAction("redo",graph);
        });
    }
    
    
    window.Graph=Graph;
    window.segmentLength=segmentLength;
    window.circlePath=circlePath;
    window.determineDy=determineDy;
})();