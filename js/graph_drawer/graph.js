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
    
    function getObjectForCoordinates (event) {
        if (window.isMobile==="false") return event;
        else if (event.changedTouches!==undefined) return event.changedTouches[0];
        else if (event.touches!==undefined) return event.touches[0];
        else return event;
    }
    let previousDropdown=undefined;
    function dropdownMenu (name, event) {
        let dropdown=$(name);
        if ((previousDropdown!==undefined)&&(previousDropdown!==dropdown)) previousDropdown.removeClass("show");
        previousDropdown=dropdown;
        let bodyOffsets=document.body.getBoundingClientRect();
        let obj=getObjectForCoordinates(event);
        let diffX=0,diffY=0;
        if (obj.clientY+dropdown.outerHeight()>$(window).height()) diffY=dropdown.outerHeight();
        if (obj.clientX+dropdown.outerWidth()>$(window).width()) {
            diffX=obj.clientX+dropdown.outerWidth()-$(window).width();
        }
        dropdown.css({"top": obj.pageY-diffY, "left": obj.pageX-diffX});
        dropdown.addClass("show");
        event.stopPropagation();
        event.preventDefault();
        $(window).one("click",function () {
            dropdown.removeClass("show");
        });
		return dropdown;
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
        this.wrapperName=undefined;
        this.svgName=undefined; this.s=undefined;
        this.svgVertices=undefined; this.svgEdges=undefined;
        this.n=undefined; this.vertices=undefined;
        this.edgeList=undefined; this.adjList=undefined; this.adjMatrix=undefined;
        this.isDirected=undefined; this.isMulti=undefined; this.isWeighted=undefined; this.isTree=undefined;
        this.graphChange=undefined; // function to be called after changing the graph, for exampe adding new edge
        this.undoStack=undefined; this.undoTime=undefined; this.redoStack=undefined; this.redoTime=undefined;
        this.init = function (wrapperName, n, isDirected, isTree = false, graphChange = () => {}) {
            if (this.wrapperName===undefined) {
                this.wrapperName=wrapperName;
                if ($(wrapperName+" .graph").length===0) this.svgName=this.wrapperName;
                else this.svgName=this.wrapperName+" .graph";
                $(this.svgName).css({
                    "border-style": "dotted",
                    "border-color": "transparent",
                    "border-width": "2px",
                    "border-radius": "5px"
                });
                this.s=Snap(this.svgName);
            }
            this.erase();
            this.undoStack=[]; this.undoTime=0; this.redoStack=[]; this.redoTime=0;
            this.svgVertices=[]; this.svgEdges=[];

            if (n!==undefined) this.n=n;
            this.vertices=[];
            this.initVertices(this.n);
            this.undoStack.pop();
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
            
            addSaveFunctionality(wrapperName,this);
            addImportFunctionality(wrapperName,this);
            this.graphChange=graphChange;
            addUndoFunctionality(wrapperName,this);
            $(wrapperName+" .settings").off("click.settings").on("click.settings",this.addSettings.bind(this));
        }

        function convertVertexToList (vertex) {
            return [vertex.name,[vertex.addedCSS[0], vertex.addedCSS[1]]];
        }
        this.convertSimpleVertexList = function () {
            let vers=[];
            for (let vertex of this.vertices) {
                if (vertex===undefined) {
                    vers.push(undefined);
                    continue;
                }
                vers.push(convertVertexToList(vertex));
            }
            return vers;
        }
        this.initVertices = function (n, vers, undoType) {
            let undoObj={type: "vertex-list", data: [this.n, this.convertSimpleVertexList()]};
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
            
            this.n=n; this.vertices=[];
            for (let i=0; i<this.n; i++) {
                if ((vers===undefined)||(vers.length===0)) {
                    this.vertices[i]=new Vertex();
                    continue;
                }
                if (vers[i]===undefined) this.vertices[i]=undefined;
                else this.vertices[i]=new Vertex(vers[i][0],vers[i][1]);
            }
        }
        this.initSvgVertex = function (x) {
            this.svgVertices[x]=new SvgVertex();
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
            let undoObj={type: "edge-list", data: this.convertSimpleEdgeList()};
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

        this.vertexRad=20; this.calcPositions=undefined;
        this.drawNewGraph = function (frameX, frameY, frameW, frameH, vertexRad, addDraw = false) {
            this.erase();
            if (vertexRad!==undefined) this.vertexRad=vertexRad;
            if (this.calcPositions===undefined) this.calcPositions=new CalcPositions(this);
            this.calcPositions.init(frameX,frameY,frameW,frameH);
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
        this.findFontSize = function (vertexRad = this.vertexRad) {
            return vertexRad*5/4;
        }
        this.findStrokeWidth = function (vertexRad = this.vertexRad) {
            return vertexRad/20*1.5;
        }
        this.isDrawable=undefined; this.drawableGraph=undefined; 
        this.draw = function (addDraw, animateDraw = true, isStatic = false) { /// this functions expects that coordinates are already calculated
            let oldVersCoords=[],changedVers=[],cntAnimations=0;
            let oldRad=this.vertexRad;
            let oldEdgesPaths=[],oldDy=[],oldWeightsPaths=[];
            if (animateDraw===true) {
                for (let i=0; i<this.n; i++) {
                    if ((this.svgVertices[i]!==undefined)&&(this.svgVertices[i].group!==undefined)&&
                        (this.svgVertices[i].group.removed!==true)) {
                        oldRad=parseInt(this.svgVertices[i].circle.attr("r"));
                        break;
                    }
                }
                for (let i=0; i<this.n; i++) {
                    if ((this.svgVertices[i]!==undefined)&&
                        (this.svgVertices[i].group!==undefined)&&(this.svgVertices[i].coord!==undefined)&&
                        (this.svgVertices[i].group.removed!==true)) {
                        oldVersCoords[i]=this.svgVertices[i].group.getBBox();
                        if ((oldVersCoords[i].x+oldRad!=this.svgVertices[i].coord[0])||
                            (oldVersCoords[i].y+oldRad!=this.svgVertices[i].coord[1])) {
                            changedVers[i]=true;
                        }
                        else changedVers[i]=false;
                    }
                    else oldVersCoords[i]=undefined, changedVers[i]=false;
                }
                for (let i=0; i<this.edgeList.length; i++) {
                    if ((this.svgEdges[i]!==undefined)&&(this.svgEdges[i].line!==undefined)&&
                        (this.svgEdges[i].line.removed!==true)) {
                        oldEdgesPaths[i]=this.svgEdges[i].line.attr("d");
                        if (this.svgEdges[i].weight!==undefined) {
                            oldWeightsPaths[i]=this.s.select(this.svgEdges[i].weight.textPath.attr("href")).attr("d");
                            oldDy[i]=this.svgEdges[i].weight.attr("dy");
                        }
                        else oldWeightsPaths[i]=undefined;
                    }
                    else oldEdgesPaths[i]=undefined, oldWeightsPaths[i]=undefined;
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
                    if ((oldVersCoords[x]!==undefined)&&(oldVersCoords[y]!==undefined)&&
                        ((changedVers[x]===true)||(changedVers[y]===true))) {
                        let st=[oldVersCoords[x].x+this.vertexRad,oldVersCoords[x].y+this.vertexRad];
                        let end=[oldVersCoords[y].x+this.vertexRad,oldVersCoords[y].y+this.vertexRad];
                        this.redrawEdge(this.svgEdges[i],st,end,i);
                        if (oldEdgesPaths[i]===undefined) oldEdgesPaths[i]=this.svgEdges[i].line.attr("d");
                        if ((oldWeightsPaths[i]===undefined)&&(this.svgEdges[i].weight!==undefined)) {
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
                        
                        if ((oldWeightsPaths[i]!==undefined)&&(this.svgEdges[i].weight!==undefined)) {
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
            for (let i=this.n; i<this.svgVertices.length; i++) {
                this.svgVertices[i]=undefined;
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
                    this.isDrawable=addDraw;
                    if (isStatic===false) {
                        if ((this.drawableGraph===undefined)&&(typeof DrawableGraph!=="undefined")) {
                            this.drawableGraph=new DrawableGraph(this);
                        }
                        if (this.drawableGraph!==undefined) this.drawableGraph.init();
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
            if ((this.isDirected===false)&&(edge.x!==edge.y)) {
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
                       convertVertexToList(this.vertices[x])]
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
            if (x===this.n-1) {
                this.n--;
                this.vertices.pop();
            }
        }
        
        this.export = function () {
            let edges=[];
            for (let i=0; i<this.edgeList.length; i++) {
                if (this.edgeList[i]===undefined) continue;
                let info=[this.edgeList[i].x+1, this.edgeList[i].y+1];
                if (this.edgeList[i].weight!=="") info.push(this.edgeList[i].weight);
                if ((this.edgeList[i].addedCSS[0]!=="")||(this.edgeList[i].addedCSS[1]!=="")) {
                    info.push("[["+this.edgeList[i].addedCSS[0]+"],["+this.edgeList[i].addedCSS[1]+"]]");
                }
                if (this.edgeList[i].curveHeight!==undefined) info.push("["+this.edgeList[i].curveHeight+"]");
                edges.push(info);
            }
            let text=this.n+" "+edges.length+"\n";
            for (let edge of edges) {
                for (let data of edge) {
                    text+=data+" ";
                }
                text+="\n";
            }
            text+="\n";
            
            let vers=[];
            for (let i=0; i<this.n; i++) {
                if (this.vertices[i]===undefined) continue;
                let info=[(i+1).toString()];
                if (this.vertices[i].name!==info[0]) info.push(this.vertices[i].name);
                info.push("["+this.svgVertices[i].coord[0]+","+this.svgVertices[i].coord[1]+"]");
                if ((this.vertices[i].addedCSS[0]!=="")||(this.vertices[i].addedCSS[1]!=="")) {
                    info.push("[["+this.vertices[i].addedCSS[0]+"],["+this.vertices[i].addedCSS[1]+"]]");
                }
                vers.push(info);
            }
            text+=vers.length+"\n";
            for (let v of vers) {
                for (let data of v) {
                    text+=data+" ";
                }
                text+="\n";
            }
            text+="\n";
            
            if (this.isDirected===true) text+="Directed\n";
            else text+="Undirected\n";
            if (this.isWeighted===true) text+="Weighted\n";
            if (this.isMulti===true) text+="Multigraph\n";
            if (this.isTree===true) text+="Tree\n";
            
            return text;
        }
        
        this.changeType=[true, true, true]; this.changeVers=true; this.changeRad=true;
        function showSettings (changeType, changeVers, changeRad) {
            if (changeType[0]===true) $("#undirected").parent().parent().show();
            else $("#undirected").parent().parent().hide();
            if (changeType[1]===true) $("#weighted").parent().show();
            else $("#weighted").parent().hide();
            if (changeType[2]===true) $("#multi").parent().show();
            else $("#multi").parent().hide();
            
            if (changeVers===true) $(".range-vers").parent().parent().show();
            else $(".range-vers").parent().parent().hide();
            
            if (changeRad===true) $(".range-rad").parent().parent().show();
            else $(".range-rad").parent().parent().hide();
        }
        this.setSettings = function (changeType = [true, true, true], changeVers = true, changeRad = true) {
            this.changeType=[changeType[0], changeType[1], changeType[2]];
            this.changeVers=changeVers; this.changeRad=changeRad;
            showSettings(changeType,changeVers,changeRad);
        }
        this.addSettings = function () {
            showSettings(this.changeType,this.changeVers,this.changeRad);
            
            let graph=this;
            let sliderVers=$(".range-vers");
            let outputVers=$(".slider-value-vers");
            let cnt=0;
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                cnt++;
            }
            sliderVers.val(cnt);
            outputVers.html(cnt);

            sliderVers.off("input").on("input", function() {
                let n=parseInt($(this).val());
                outputVers.html(n);
                graph.initVertices(n); graph.undoTime--;
                for (let i=0; i<n; i++) {
                    graph.vertices[i].name=(i+1).toString();
                }
                graph.buildEdgeDataStructures([]); graph.undoTime--;
                graph.calcPositions.init();
                graph.draw(graph.isDrawable,false);
                graph.graphChange();
            });

            if (graph.isDirected===false) $("#undirected").click();
            else $("#directed").click();
            function changeDirection (isDirected) {
                graph.isDirected=isDirected;
                let isWeighted=graph.isWeighted,isMulti=graph.isMulti;
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isDirected", !isDirected]});
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isWeighted", isWeighted]});
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isMulti", isMulti]});
                graph.buildEdgeDataStructures(graph.convertSimpleEdgeList()); graph.undoTime--;
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isDirected", !isDirected]});
                graph.isWeighted=isWeighted;
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isWeighted", !isWeighted]});
                graph.isMulti=isMulti;
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isMulti", !isMulti]});
                graph.undoTime++;
                graph.draw(graph.isDrawable);
                graph.graphChange();
            }
            $("#undirected").off("click").on("click",function () {
                if (graph.isDirected===true) changeDirection(false);
            });
            $("#directed").off("click").on("click",function () {
                if (graph.isDirected===false) changeDirection(true);
            });
            $("#weighted").prop("checked",graph.isWeighted);
            $("#weighted").off("change").on("change",function () {
                if ((this.checked===true)&&(graph.isWeighted===false)) {
                    graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isWeighted", false]});
                    graph.undoTime++; graph.redoStack=[];
                    graph.isWeighted=true;
                    graph.draw(graph.isDrawable);
                    graph.graphChange();
                }
                else if ((this.checked===false)&&(graph.isWeighted===true)) {
                    graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isWeighted", true]});
                    graph.undoTime++; graph.redoStack=[];
                    graph.isWeighted=false;
                    graph.draw(graph.isDrawable);
                    graph.graphChange();
                }
            });
            $("#multi").prop("checked",graph.isMulti);
            $("#multi").off("change").on("change",function () {
                if ((this.checked===true)&&(graph.isMulti===false)) {
                    graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isMulti", false]});
                    graph.undoTime++; graph.redoStack=[];
                    graph.isMulti=true;
                }
                else if ((this.checked===false)&&(graph.isMulti===true)) {
                    graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isMulti", true]});
                    graph.undoTime++; graph.redoStack=[];
                    graph.isMulti=false;
                }
            });

            let sliderRad=$(".range-rad");
            let outputRad=$(".slider-value-rad");
            sliderRad.val(graph.vertexRad);
            outputRad.html(graph.vertexRad);
            sliderRad.off("input").on("input", function() {
                let val=parseInt($(this).val());
                outputRad.html(val);
                let oldVal=graph.vertexRad;
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["radius", oldVal]});
                graph.undoTime++; graph.redoStack=[];
                graph.vertexRad=val;
                graph.draw(graph.isDrawable);
            });
        }
    }

    function addSaveFunctionality (wrapperName, graph) {
        let svg=$(graph.svgName);
        let canvas=$(wrapperName+" .canvas-save");
        let svgSave=$(wrapperName+" .svg-save");
        svgSave.attr("viewBox",svg.attr("viewBox"));
        
        let saveButton=$(wrapperName+" .save");
        $(saveButton).off("click").on("click",function (event) {
            let dropdown=dropdownMenu(".dropdown-menu.save-menu",event);
            dropdown.find(".png").off("click").one("click",function () {
                let context=canvas[0].getContext('2d');
                let svgWidth=2*svg.width(),svgHeight=2*svg.height();
                
                svgSave.attr("width",svgWidth);
                svgSave.attr("height",svgHeight);
                svgSave.html(svg.html());
                canvas.prop("width",svgWidth);
                canvas.prop("height",svgHeight);

                let svgString=(new XMLSerializer()).serializeToString(svgSave[0]);
                let image=$("<img>").prop("src","data:image/svg+xml; charset=utf8, "+encodeURIComponent(svgString));
                image.on("load", function () {
                    context.drawImage(image[0],0,0);
                    let imageURI=canvas[0].toDataURL("image/png").replace("image/png","image/octet-stream");
                    $("<a>").prop("download","graph.png")
                        .prop("href",imageURI)
                        .prop("target","_blank")[0].click();
                    svgSave.empty();
                });
            });

            dropdown.find(".svg").off("click").one("click",function () {
                $(".click-area").hide();
                svgSave.removeAttr("width").removeAttr("height");
                svgSave.html(svg.html());
                svgSave[0].setAttribute("xmlns","http://www.w3.org/2000/svg");
                let svgData=svgSave[0].outerHTML.replaceAll("cursor: pointer;","")
                    .replace("border-style: dotted","border-style: none")
                    .replace("display: none","");
                let preface='<?xml version="1.0" standalone="no"?>\r\n';
                let svgBlob=new Blob([preface, svgData], {type: "image/svg+xml;charset=utf-8"});
                let svgURL=URL.createObjectURL(svgBlob);
                $("<a>").prop("download","graph.svg")
                    .prop("href",svgURL)
                    .prop("target","_black")[0].click();
                $(".click-area").show();
                svgSave.empty();
            });

            dropdown.find(".edge-list").off("click").one("click", function () {
                let vers=0;
                for (let vertex of graph.vertices) {
                    if (vertex===undefined) continue;
                    vers++;
                }
                let edges=[];
                for (let edge of graph.edgeList) {
                    if (edge===undefined) continue;
                    if (edge.weight==="") edges.push([graph.vertices[edge.x].name,graph.vertices[edge.y].name]);
                    else edges.push([graph.vertices[edge.x].name,graph.vertices[edge.y].name,edge.weight]);
                }
                let text=vers+" "+edges.length+"\n";
                for (let edge of edges) {
                    text+=edge[0]+" "+edge[1];
                    if (edge.length===3) text+=" "+edge[2];
                    text+="\n";
                }
                $("<a>").prop("download","edge_list.txt")
                    .prop("href","data:text/plain;charset=utf-8,"+encodeURIComponent(text))
                    .prop("target","_black")[0].click();
            });

            dropdown.find(".txt").off("click").on("click", function () {
                dropdown.find(".txt").off("click");

                $("<a>").prop("download","graph.txt")
                    .prop("href","data:text/plain;charset=utf-8,"+encodeURIComponent(graph.export()))
                    .prop("target","_black")[0].click();
            });
        });
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
            if (curr.type==="vertex-list") graph.initVertices(curr.data[0],curr.data[1],undoType);
            else if (curr.type==="edge-list") graph.buildEdgeDataStructures(curr.data,undoType);
            else if (curr.type==="new-positions") graph.calcPositions.changePositions(curr.data[0],curr.data[1],undoType);
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
                else if (curr.type==="change-property") {
                    let type=curr.data[0];
                    if (type==="isDirected") {
                        pushOther(curr.type,[type, !curr.data[1]]);
                        graph.isDirected=curr.data[1];
                    }
                    else if (type==="isTree") {
                        pushOther(curr.type,[type, !curr.data[1]]);
                        graph.isTree=curr.data[0];
                    }
                    else if (type==="isWeighted") {
                        pushOther(curr.type,[type, !curr.data[1]]);
                        graph.isWeighted=curr.data[1];
                    }
                    else if (type==="isMulti") {
                        pushOther(curr.type,[type, !curr.data[1]]);
                        graph.isMulti=curr.data[1];
                    }
                    else if (type==="radius") {
                        pushOther(curr.type,[type, graph.vertexRad]);
                        graph.vertexRad=parseInt(curr.data[1]);
                    }
                }
            }
            if (undoType==="undo") graph.redoTime--;
            else graph.undoTime--;
        }
        if (undoType==="undo") graph.redoTime++;
        else graph.undoTime++;
        
        graph.draw(graph.isDrawable);
        graph.graphChange();
    }
    function addUndoFunctionality (wrapperName, graph) {
        let undoButton=$(wrapperName+" .undo");
        $(undoButton).off("click").on("click",function () {
            undoAction("undo",graph);
        });
        let redoButton=$(wrapperName+" .redo");
        $(redoButton).off("click").on("click",function () {
            undoAction("redo",graph);
        });
    }
    
    function removeEmpty (strings) {
        let res=[];
        for (let i=0; i<strings.length; i++) {
            if (strings[i].length===0) continue;
            res.push(strings[i]);
        }
        return res;
    }
    function getTokens (s) {
        s=s.split("");
        let cnt=0;
        for (let i=0; i<s.length; i++) {
            if (s[i]==='[') cnt++;
            else if (s[i]===']') cnt--;
            else if ((s[i]===' ')&&(cnt>0)) s[i]='\x00'; // escaping spaces
        }
        s=s.join("");
        let tokens=s.split(" ");
        for (let i=0; i<tokens.length; i++) {
            let token=tokens[i].split("");
            for (let j=0; j<token.length; j++) {
                if (token[j]==='\x00') token[j]=' ';
            }
            tokens[i]=token.join("");
        }
        return tokens;
    }
    function addImportFunctionality (wrapperName, graph) {
        let importButton=$(wrapperName+" .import");
        let input=$(wrapperName+" .input-file");
        input.hide();
        $(importButton).off("click").on("click",function () {
            input.click();
        });
        input.off("change").on("change",function (event) {
            if (event.target.files.length===0) return ;
            let reader=new FileReader();
            reader.onload = function (event) {
                let text=event.target.result.replaceAll("\r\n","\n");
                let lines=removeEmpty(text.split("\n"));
                let nums=removeEmpty(lines[0].split(" "));
                if (nums.length!==2) {
                    alert("Очаквани са две числа за максимален номер на връх и брой ребра при: "+lines[0]);
                    return ;
                }
                let n=parseInt(nums[0]),m=parseInt(nums[1]);
                if (n<1) {
                    alert("Очакван е положителен максимален номер на връх при: "+lines[0]);
                    return ;
                }
                let curr=1,edges=[];
                for (let i=1; i<=m; i++) {
                    if (lines.length===curr) {
                        alert("Има липсващи ребра!");
                        return ;
                    }
                    let tokens=removeEmpty(getTokens(lines[curr]));
                    if (tokens.length<2) {
                        alert("Трябват поне върхове за реброто: "+lines[curr]);
                        return ;
                    }
                    let x=parseInt(tokens[0]),y=parseInt(tokens[1]);
                    if (!((x>=1)&&(x<=n)&&(y>=1)&&(y<=n))) {
                        alert("Невалиден номер на връх за: "+lines[curr]);
                        return ;
                    }
                    let weight="",addedCSS=["",""],curveHeight=undefined;
                    if (tokens.length>=3) {
                        let ind=2;
                        if (tokens[ind][0]!=='[') weight=tokens[ind++];
                        if (tokens.length>ind) {
                            if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                                alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                                return ;
                            }
                            if (tokens[ind][1]!='[') curveHeight=parseFloat(tokens[ind].slice(1,tokens[ind].length-1));
                            else {
                                let css=removeEmpty(tokens[ind].split(","));
                                if (css.length!==2) {
                                    alert("Очаква се да има два CSS-а, разделени със запетайка при: "+lines[curr]);
                                    return ;
                                }
                                addedCSS[0]=css[0].slice(2,css[0].length-1);
                                addedCSS[1]=css[1].slice(1,css[1].length-2);
                                ind++;
                                if (tokens.length>ind) {
                                    if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                                        alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                                        return ;
                                    }
                                    curveHeight=parseFloat(tokens[ind].slice(1,tokens[ind].length-1));
                                    ind++;
                                    if (tokens.length>ind) {
                                        alert("Твърде много свойства при: "+lines[curr]);
                                        return ;
                                    }
                                }
                            }
                        }
                    }
                    edges.push([x-1,y-1,weight,addedCSS,curveHeight]);
                    curr++;
                }
                
                let vers=[],flagCoords=false,versCoord=[];
                if ((lines.length>curr)&&(lines[curr][0]>='0')&&(lines[curr][0]<='9')) {
                    let num=removeEmpty(lines[curr].split(" "));
                    if (num.length!==1) {
                        alert("Очаквано е само едно число за брой върхове при: "+lines[curr]);
                        return ;
                    }
                    curr++;
                    for (let i=1; i<=n; i++) {
                        vers.push(undefined);
                        versCoord.push(undefined);
                    }
                    flagCoords=true;
                    for (let i=1; i<=num[0]; i++) {
                        if (lines.length===curr) {
                            alert("Има липсваща информация за връх!");
                            return ;
                        }
                        let tokens=removeEmpty(getTokens(lines[curr]));
                        if (tokens.length<1) {
                            alert("Трябва поне номер на връх: "+lines[curr]);
                            return ;
                        }
                        let x=parseInt(tokens[0]);
                        if (!((x>=1)&&(x<=n))) {
                            alert("Невалиден номер на връх за: "+lines[curr]);
                            return ;
                        }
                        let name=x.toString(),coord=undefined,addedCSS=["",""];
                        if (tokens.length>=2) {
                            let ind=1;
                            if (tokens[ind][0]!=='[') name=tokens[ind++];
                            if (tokens.length>ind) {
                                if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                                    alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                                    return ;
                                }
                                if (tokens[ind][1]!='[') {
                                    let coords=removeEmpty(tokens[ind].split(","));
                                    if (coords.length!==2) {
                                        alert("Очаква се да има две координати, разделени със запетайка при: "+lines[curr]);
                                        return ;
                                    }
                                    coord=[];
                                    coord[0]=parseFloat(coords[0].slice(1,coords[0].length));
                                    coord[1]=parseFloat(coords[1].slice(0,coords[1].length-1));
                                    ind++;
                                }
                            
                                if (tokens.length>ind) {
                                    if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                                        alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                                        return ;
                                    }
                                    let css=removeEmpty(tokens[ind].split(","));
                                    if (css.length!==2) {
                                        alert("Очаква се да има два CSS-а, разделени със запетайка при: "+lines[curr]);
                                        return ;
                                    }
                                    addedCSS[0]=css[0].slice(2,css[0].length-1);
                                    addedCSS[1]=css[1].slice(1,css[1].length-2);
                                    ind++;
                                    if (tokens.length>ind) {
                                        alert("Твърде много свойства при: "+lines[curr]);
                                        return ;
                                    }
                                }
                            }
                        }
                        if (coord===undefined) flagCoords=false;
                        vers[x-1]=[name,addedCSS];
                        versCoord[x-1]=coord;
                        curr++;
                    }
                }
                else {
                    for (let i=1; i<=n; i++) {
                        vers.push([i.toString(), ["",""]]);
                    }
                }
                
                let isDirected=graph.isDirected,isWeighted=graph.isWeighted,isMulti=graph.isMulti,isTree=graph.isTree;
                for (;;) {
                    if (lines.length===curr) break;
                    let words=removeEmpty(lines[curr].split(" "));
                    if (words.length!==1) {
                        alert("Очаквано е само една дума, описващо свойство на графа, при: "+lines[curr]);
                        return ;
                    }
                    if (words[0]==="Directed") {
                        if (isDirected===false) {
                            if (graph.changeType[0]===false) {
                                alert("Графът трябва да е неориентиран!");
                                return ;
                            }
                            isDirected=true;
                        }
                    }
                    else if (words[0]==="Undirected") {
                        if (isDirected===true) {
                            if (graph.changeType[0]===false) {
                                alert("Графът трябва да е ориентиран!");
                                return ;
                            }
                            isDirected=false;
                        }
                    }
                    else if (words[0]==="Weighted") {
                        if (isWeighted===false) {
                            if (graph.changeType[1]===false) {
                                alert("Графът трябва да е непретеглен!");
                                return ;
                            }
                            isWeighted=true;
                        }
                    }
                    else if (words[0]==="Multigraph") {
                        if (isMulti===false) {
                            if (graph.changeType[2]===false) {
                                alert("Графът не трябва да е мулти!");
                                return ;
                            }
                            isMulti=true;
                        }
                    }
                    else if (words[0]==="Tree") isTree=true;
                    else {
                        alert("Неочаквано свойство на графа при: "+lines[curr]);
                        return ;
                    }
                    curr++;
                }
                
                let graphProperties=[graph.isDirected, graph.isTree, graph.isWeighted, graph.isMulti];
                graph.isDirected=isDirected; graph.isTree=isTree;
                graph.isWeighted=isWeighted; graph.isMulti=isMulti;
                graph.initVertices(n,vers); graph.undoTime--;
                graph.buildEdgeDataStructures(edges);
                if ((graph.changeType[1]===false)&&(graph.isWeighted!==isWeighted)) {
                    alert("Графът трябва да е непретеглен!");
                    undoAction("undo",graph);
                    return ;
                }
                else if ((graph.changeType[2]===false)&&(graph.isMulti!==isMulti)) {
                    alert("Графът не трябва да е мулти!");
                    undoAction("undo",graph);
                    return ;
                }
                graph.undoTime--;
                
                if (graphProperties[0]!=graph.isDirected)
                    graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isDirected", graphProperties[0]]});
                if (graphProperties[1]!=graph.isTree)
                    graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isTree", graphProperties[1]]});
                if (graphProperties[2]!=graph.isWeighted)
                    graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isWeighted", graphProperties[2]]});
                if (graphProperties[3]!=graph.isMulti)
                    graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isMulti", graphProperties[3]]});
                
                if (flagCoords===false) graph.calcPositions.init();
                else graph.calcPositions.changePositions([],versCoord);
                graph.draw(graph.isDrawable,false);
                
                graph.graphChange();
            }
            reader.readAsText(event.target.files[0]);
            $(input).val("");
        });
    }
    
    
    window.Graph=Graph;
    window.segmentLength=segmentLength;
    window.circlePath=circlePath;
    window.getObjectForCoordinates=getObjectForCoordinates;
    window.dropdownMenu=dropdownMenu;
    window.determineDy=determineDy;
})();