"use strict";
(function () {
    function circlesIntersection (x1, y1, r1, x2, y2, r2) {
        x2-=x1; y2-=y1;
        let flag=false;
        if (y2===0) {
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
        D=r1^2+v^2*r1^2-u^2 */
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

    function GraphDrawer (graph) {
        let snap;
        let SvgEdge;
        let fonts;
        
        function concatStyle (obj, css) {
            let style=obj.attr("style");
            obj.attr("style",style+" ; "+css);
            return style;
        }
        function setStyle (obj, css) {
            obj.attr("style",css);
        }
        this.findFontSize = function (type, ind = -1, coef = 1, vertexRad = undefined) {
            if (vertexRad===undefined) vertexRad=graph.vertexRad;
            if (type==="vertex-name") coef*=5/4;
            else coef*=1;
            let sampleText=snap.text();
            let css=(type==="vertex-name")?this.defaultCSSVertexText:this.defaultCSSWeight;
            if (ind!==-1) {
                if (type==="vertex-name") css+=";"+graph.getVertex(ind).addedCSS[1];
                else css+=";"+graph.getEdge(ind).addedCSS[1];
            }
            setStyle(sampleText,"font-size: "+(coef*graph.size*vertexRad)+"px;"+css);
            let fontSize=parseFloat(sampleText.attr("font-size"));
            sampleText.remove();
            return fontSize;
        }
        this.findStrokeWidth = function (type, ind = -1, coef = 1, vertexRad = undefined) {
            if (vertexRad===undefined) vertexRad=graph.vertexRad;
            coef*=1.5/20;
            let sampleStroke=snap.circle();
            let css=(type==="vertex")?this.defaultCSSVertex:this.defaultCSSEdge;
            if (ind!==-1) {
                if (type==="vertex") css+=";"+graph.getVertex(ind).addedCSS[0];
                else css+=";"+graph.getEdge(ind).addedCSS[0];
            }
            setStyle(sampleStroke,"stroke-width: "+(coef*graph.size*vertexRad)+";"+css);
            let strokeWidth=parseFloat(sampleStroke.attr("stroke-width"));
            sampleStroke.remove();
            return strokeWidth;
        }
        this.findAttrValue = function (type, attr, ind = -1) {
            let sample,css;
            if (type==="vertex") {
                sample=snap.circle();
                css="fill: white; stroke: black; "+this.defaultCSSVertex;
            }
            else if (type==="vertex-name") {
                sample=snap.text();
                css="fill: black; font-family: Consolas; "+this.defaultCSSVertexText;
            }
            else if (type==="edge") {
                sample=snap.path();
                css="stroke: black; "+this.defaultCSSEdge;
            }
            else {
                sample=snap.text();
                css="fill: black; font-family: Arial; "+this.defaultCSSWeight;
            }
            if (ind!==-1) {
                if (type==="vertex") css+=";"+graph.getVertex(ind).addedCSS[0];
                else if (type==="vertex-name") css+=";"+graph.getVertex(ind).addedCSS[1];
                else if (type==="edge") css+=";"+graph.getEdge(ind).addedCSS[0];
                else css+=";"+graph.getEdge(ind).addedCSS[1];
            }
            setStyle(sample,css);
            let val=sample.attr(attr);
            sample.remove();
            return val;
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
            if (segmentLength(st[0],st[1],end[0],end[1])<2*graph.vertexRad+3*endDist) return [bezPath, bezierPoint];
            let p1=Snap.path.intersection(
                bezPath,
                circlePath(beg[0],beg[1],((beg===st)?graph.vertexRad:(graph.vertexRad+endDist)))
            )[0];
            if (p1===undefined) return ["", [(st[0]+end[0])/2, (st[1]+end[1])/2]];
            let p2=Snap.path.intersection(
                bezPath,
                circlePath(fin[0],fin[1],((fin===st)?graph.vertexRad:(graph.vertexRad+endDist)))
            )[0];
            if (p2===undefined) return ["", [(st[0]+end[0])/2, (st[1]+end[1])/2]];
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
        this.addMarkerEnd = function (line, isLoop, strokeWidth, st, properties) {
            let [arrowHeight, arrowWidth, arrowDist]=calculateArrowProperties(isLoop,strokeWidth,st,graph.vertexRad,properties);
            let arrowEnd=[3*arrowHeight/2,arrowHeight/2];
            let arrow=snap.polygon([0,0,arrowEnd[0],arrowEnd[1],0,arrowHeight,0,0]).attr({fill: line.attr("stroke")});
            line.markerEnd=arrow;
            let marker=arrow.marker(0,0,arrowEnd[0],arrowHeight,(isLoop===false)?arrowEnd[0]-arrowDist:0,arrowEnd[1]).attr({markerUnits: "userSpaceOnUse"});
            line.attr({"marker-end": marker});
        }
        function calcWeightPosition (weight, dx, isLoop, pathForWeight, properties) {
            let isVertical=false;
            if (Math.abs(dx)<=2*graph.vertexRad) isVertical=true;
            if (isVertical===true) {
                let tempPath=snap.path(pathForWeight);
                let middle=tempPath.getPointAtLength(tempPath.getTotalLength()/2);
                tempPath.remove();
                if (properties>=0) pathForWeight=linePath([middle.x-weight.width-2*5, middle.y],
                                                          [middle.x, middle.y]);
                else pathForWeight=linePath([middle.x, middle.y],
                                            [middle.x+weight.width+2*5, middle.y]);
                weight.attr({dy: weight.dyCenter});
            }
            else if ((isLoop===false)&&(properties<0)) weight.attr({dy: weight.height+7});
            else weight.attr({dy: (isLoop===false)?-7:-3});
            return pathForWeight;
        }
        function weightName (edge, isNetwork) {
            if (isNetwork===false) return edge.weight.toString();
            return (edge.flow+"/"+edge.weight).toString();
        }
        this.redrawEdge = function (svgEdge, st, end, edgeInd = -1) {
            let properties=svgEdge.drawProperties[0];
            let isLoop=false,isDrawn=(edgeInd===-1);
            if ((isDrawn===false)&&(graph.getEdge(edgeInd).x===graph.getEdge(edgeInd).y)) isLoop=true;
            
            let endDist=svgEdge.endDist;

            let pathForWeight;
            if (properties===0) {
                svgEdge.line.attr("d",calcStraightEdge(st,end,isDrawn,endDist,graph.vertexRad));
                let points=sortPoints(st,end);
                pathForWeight=linePath(points[0],points[1]);
            }
            else {
                if (isLoop===true) { /// loop
                    svgEdge.line.attr("d",loopPath(st[0],st[1]-graph.vertexRad,graph.vertexRad,properties,graph.isDirected||graph.isNetwork));
                    pathForWeight=loopPath(st[0],st[1]-graph.vertexRad,graph.vertexRad,properties,false);
                }
                else { /// curved edge
                    let res=this.calcCurvedEdge(st,end,properties,endDist);
                    svgEdge.line.attr("d",res[0]);
                    let points=sortPoints(st,end);
                    if (points[0]!==st) properties*=(-1);
                    pathForWeight=bezierPath(points[0],points[1],res[1]);
                }
            }

            if ((isDrawn===false)&&(graph.isWeighted===true)) {
                pathForWeight=calcWeightPosition.call(this,svgEdge.weight,st[0]-end[0],isLoop,pathForWeight,properties);
                snap.select(svgEdge.weight.textPath.attr("href")).attr("d",pathForWeight);
            }
            return svgEdge;
        }
        
        this.defaultCSSEdge="";
        this.defaultCSSWeight="";
        this.drawEdge = function (st, end, edgeInd = -1, properties = 0) {
            let isLoop=false,isDrawn=(edgeInd===-1),isDirected=graph.isDirected||graph.isNetwork;
            let strokeWidth=this.findStrokeWidth("edge",edgeInd);
            let edge;
            if (isDrawn===false) {
                edge=graph.getEdge(edgeInd);
                if (edge.x===edge.y) isLoop=true;
            }
            
            let svgEdge=new SvgEdge();
            svgEdge.drawProperties=[];
            svgEdge.drawProperties[0]=properties;

            let endDist=0;
            if (isDirected===true) {
                let arrowDist=calculateArrowProperties(isLoop,strokeWidth,st,graph.vertexRad,properties)[2];
                endDist=strokeWidth/2+arrowDist;
            }
            svgEdge.endDist=endDist;

            let pathForWeight;
            if (properties===0) {
                svgEdge.line=snap.path(calcStraightEdge(st,end,isDrawn,endDist,graph.vertexRad));
                let points=sortPoints(st,end);
                pathForWeight=linePath(points[0],points[1]);
            }
            else {
                if (isLoop===true) { /// loop
                    svgEdge.line=snap.path(loopPath(st[0],st[1]-graph.vertexRad,graph.vertexRad,properties,isDirected));
                    pathForWeight=loopPath(st[0],st[1]-graph.vertexRad,graph.vertexRad,properties,false);
                }
                else { /// multiedge
                    let res=this.calcCurvedEdge(st,end,properties,endDist);
                    svgEdge.line=snap.path(res[0]);
                    let points=sortPoints(st,end);
                    if (points[0]!==st) properties*=(-1);
                    pathForWeight=bezierPath(points[0],points[1],res[1]);
                }
            }

            svgEdge.line.attr({fill: "none", stroke: "black", "stroke-width": strokeWidth});
            concatStyle(svgEdge.line,this.defaultCSSEdge);
            if (isDirected===true) this.addMarkerEnd(svgEdge.line,isLoop,strokeWidth,st,properties);
            if (isDrawn===false) edge.defaultCSS[0]=concatStyle(svgEdge.line,edge.addedCSS[0]);
            if (isDirected===true) svgEdge.line.markerEnd.attr("fill",svgEdge.line.attr("stroke"));

            if ((isDrawn===false)&&(graph.isWeighted===true)) {
                svgEdge.weight=snap.text(0,0,weightName(edge,graph.isNetwork));
                let fontSize=this.findFontSize("weight",edgeInd);
                svgEdge.weight.attr({
                    "font-size": fontSize,
                    "font-family": "Arial",
                    "text-anchor": "middle",
                    class: "unselectable",
                    fill: svgEdge.line.attr("stroke"),
                });
                concatStyle(svgEdge.weight,this.defaultCSSWeight);
                svgEdge.weight.width=svgEdge.weight.getBBox().width;
                let font=svgEdge.weight.attr("font-family");
                if (typeof fonts[font]!=="undefined") {
                    let bBox=textBBox(svgEdge.weight.attr("text"),font,fontSize);
                    svgEdge.weight.height=bBox.y2-bBox.y1;
                }
                else svgEdge.weight.height=svgEdge.weight.getBBox().height;
                svgEdge.weight.dyCenter=determineDy(edge.weight.toString(),font,fontSize);
                
                pathForWeight=calcWeightPosition.call(this,svgEdge.weight,st[0]-end[0],isLoop,pathForWeight,properties);
                svgEdge.weight.attr({textpath: pathForWeight});
                svgEdge.weight.textPath.attr({"startOffset": "50%"});
                
                edge.defaultCSS[1]=concatStyle(svgEdge.weight,edge.addedCSS[1]);
            }
            return svgEdge;
        }

        this.defaultCSSVertexText="";
        this.drawVertexText = function (i, text) {
            let x=graph.svgVertices[i].coord[0],y=graph.svgVertices[i].coord[1];
            if ((graph.svgVertices[i].text===undefined)||
                (graph.svgVertices[i].text.removed===true)) graph.svgVertices[i].text=snap.text();
            let v=graph.getVertex(i);
            v.name=text;
            let fontSize=this.findFontSize("vertex-name",i);
            graph.svgVertices[i].text.attr({
                x: x,
                y: y,
                text: text,
                fill: "black",
                "font-size": fontSize, 
                "font-family": "Consolas",
                "text-anchor": "middle", 
                class: "unselectable"
            });
            concatStyle(graph.svgVertices[i].text,this.defaultCSSVertexText);
            graph.svgVertices[i].text.attr({dy: determineDy(
                v.name,
                graph.svgVertices[i].text.attr("font-family"),
                fontSize
            )});
            v.defaultCSS[1]=concatStyle(graph.svgVertices[i].text,v.addedCSS[1]); 
        }
        this.defaultCSSVertex="";
        this.drawVertex = function (i) {
            let x=graph.svgVertices[i].coord[0],y=graph.svgVertices[i].coord[1];
            graph.svgVertices[i].circle=snap.circle(x,y,graph.vertexRad);
            graph.svgVertices[i].circle.attr({
                fill: "white",
                stroke: "black",
                "stroke-width": this.findStrokeWidth("vertex",i)
            });
            concatStyle(graph.svgVertices[i].circle,this.defaultCSSVertex);
            let v=graph.getVertex(i);
            v.defaultCSS[0]=concatStyle(graph.svgVertices[i].circle,v.addedCSS[0]);
            this.drawVertexText(i,v.name);
            graph.svgVertices[i].group=snap.group(graph.svgVertices[i].circle,graph.svgVertices[i].text);
        }
        this.findLoopEdgeProperties = function (vertexRad = graph.vertexRad) {
            return [3*graph.vertexRad/4, graph.vertexRad/2];
        }
        this.isDynamic=undefined; this.dynamicGraph=undefined;
        this.isStatic=false;
        this.defaultBG="none";
        this.bgElement=undefined;
        this.draw = function (addDynamic, animateDraw = true, isStatic = undefined) { /// this functions expects that coordinates are already calculated
            if ((this.dynamicGraph!==undefined)&&(addDynamic===false)) this.dynamicGraph.clear();
            
            if (isStatic===undefined) isStatic=this.isStatic;
            else this.isStatic=isStatic;
            
            let oldVersCoords=[],changedVers=[],cntAnimations=0;
            let oldRad=graph.vertexRad;
            let oldEdgesPaths=[],oldDy=[],oldWeightsPaths=[];
            let m=graph.getIndexedEdges().length;
            if (animateDraw===true) {
                for (let i=0; i<graph.n; i++) {
                    if ((graph.svgVertices[i]!==undefined)&&(graph.svgVertices[i].group!==undefined)&&
                        (graph.svgVertices[i].group.removed!==true)) {
                        oldRad=parseFloat(graph.svgVertices[i].circle.attr("r"));
                        break;
                    }
                }
                for (let i=0; i<graph.n; i++) {
                    if ((graph.svgVertices[i]!==undefined)&&
                        (graph.svgVertices[i].group!==undefined)&&(graph.svgVertices[i].coord!==undefined)&&
                        (graph.svgVertices[i].group.removed!==true)) {
                        oldVersCoords[i]=graph.svgVertices[i].group.getBBox();
                        if ((Math.abs(oldVersCoords[i].x+oldRad-graph.svgVertices[i].coord[0])>0.0001)||
                            (Math.abs(oldVersCoords[i].y+oldRad-graph.svgVertices[i].coord[1])>0.0001)) {
                            changedVers[i]=true;
                        }
                        else changedVers[i]=false;
                    }
                    else oldVersCoords[i]=undefined, changedVers[i]=false;
                }
                for (let i=0; i<m; i++) {
                    if ((graph.svgEdges[i]!==undefined)&&(graph.svgEdges[i].line!==undefined)&&
                        (graph.svgEdges[i].line.removed!==true)) {
                        oldEdgesPaths[i]=graph.svgEdges[i].line.attr("d");
                        if (graph.svgEdges[i].weight!==undefined) {
                            oldWeightsPaths[i]=snap.select(graph.svgEdges[i].weight.textPath.attr("href")).attr("d");
                            oldDy[i]=graph.svgEdges[i].weight.attr("dy");
                        }
                        else oldWeightsPaths[i]=undefined;
                    }
                    else oldEdgesPaths[i]=undefined, oldWeightsPaths[i]=undefined;
                }
            }
            
            graph.erase();
            this.bgElement=snap.circle(0,0,1e5);
            this.bgElement.attr({fill: this.defaultBG});

            let edgeMapCnt=new Map(),edgeMapCurr=new Map();
            for (let [i, edge] of graph.getEdges()) {
                let x=edge.x,y=edge.y;
                let code=Math.max(x,y)*graph.n+Math.min(x,y);
                if (edgeMapCnt.has(code)) {
                    let val=edgeMapCnt.get(code);
                    edgeMapCnt.set(code,val+1);
                }
                else {
                    edgeMapCnt.set(code,1);
                    edgeMapCurr.set(code,0);
                }
            }
            let height=graph.vertexRad*3/10;
            let multiEdges=[[],
                            [0],
                            [height, -height],
                            [height, -height, 0],
                            [height, -height, 2*height, -2*height],
                            [height, -height, 2*height, -2*height, 0]];
            let loopEdges=[[],
                           [this.findLoopEdgeProperties()[0]],
                           this.findLoopEdgeProperties()];
            graph.svgEdges=[];
            for (let i=0; i<m; i++) {
                graph.svgEdges[i]=undefined;
            }
            for (let [i, edge] of graph.getEdges()) {
                let x=edge.x,y=edge.y;
                let code=Math.max(x,y)*graph.n+Math.min(x,y);
                let val=edgeMapCurr.get(code),cnt=edgeMapCnt.get(code);
                let drawProperties;
                if (x!==y) drawProperties=multiEdges[cnt][val++]*((x>y)?-1:1);
                else drawProperties=loopEdges[cnt][val++];
                let origProperties=drawProperties;
                if (edge.curveHeight!==undefined) drawProperties=edge.curveHeight;
                graph.svgEdges[i]=this.drawEdge(graph.svgVertices[x].coord,graph.svgVertices[y].coord,i,drawProperties);
                graph.svgEdges[i].drawProperties[1]=cnt;
                graph.svgEdges[i].drawProperties[2]=origProperties;
                edgeMapCurr.set(code,val);
                
                if (animateDraw===true) {
                    if ((oldVersCoords[x]!==undefined)&&(oldVersCoords[y]!==undefined)&&
                        ((changedVers[x]===true)||(changedVers[y]===true))) {
                        let st=[oldVersCoords[x].x+graph.vertexRad,oldVersCoords[x].y+graph.vertexRad];
                        let end=[oldVersCoords[y].x+graph.vertexRad,oldVersCoords[y].y+graph.vertexRad];
                        this.redrawEdge(graph.svgEdges[i],st,end,i);
                        if (oldEdgesPaths[i]===undefined) oldEdgesPaths[i]=graph.svgEdges[i].line.attr("d");
                        if ((oldWeightsPaths[i]===undefined)&&(graph.svgEdges[i].weight!==undefined)) {
                            oldWeightsPaths[i]=snap.select(graph.svgEdges[i].weight.textPath.attr("href")).attr("d");
                            oldDy[i]=graph.svgEdges[i].weight.attr("dy");
                        }
                        this.redrawEdge(graph.svgEdges[i],graph.svgVertices[x].coord,graph.svgVertices[y].coord,i);
                    }
                    
                    if ((oldEdgesPaths[i]!==undefined)&&(oldEdgesPaths[i]!==graph.svgEdges[i].line.attr("d"))) {
                        cntAnimations++;
                        let currPath=graph.svgEdges[i].line.attr("d");
                        graph.svgEdges[i].line.attr({d: oldEdgesPaths[i]});
                        graph.svgEdges[i].line.animate({d: currPath},500,function (graph) {
                            this.attr({d: currPath});
                            animationsEnd.call(graph);
                        }.bind(graph.svgEdges[i].line,this));
                        
                        if ((oldWeightsPaths[i]!==undefined)&&(graph.svgEdges[i].weight!==undefined)) {
                            cntAnimations++;
                            let weightPath=snap.select(graph.svgEdges[i].weight.textPath.attr("href"));
                            let currWeightPath=weightPath.attr("d");
                            weightPath.attr({d: oldWeightsPaths[i]});
                            weightPath.animate({d: currWeightPath},500,function (graph) {
                                this.attr({d: currWeightPath});
                                animationsEnd.call(graph);
                            }.bind(weightPath,this));
                            
                            let currDy=graph.svgEdges[i].weight.attr("dy");
                            if (oldDy[i]!==currDy) {
                                cntAnimations++;
                                graph.svgEdges[i].weight.attr({dy: oldDy[i]});
                                graph.svgEdges[i].weight.animate({dy: currDy},500,animationsEnd.bind(this));
                            }
                        }
                    }
                }
            }

            for (let i=0; i<graph.n; i++) {
                if (graph.getVertex(i)===undefined) graph.svgVertices[i]=undefined;
            }
            for (let [i, v] of graph.getVertices()) {
                this.drawVertex(i);
                
                if ((animateDraw===true)&&(changedVers[i]===true)) {
                    cntAnimations++;
                    graph.svgVertices[i].group.transform("t "+
                                                        ((oldVersCoords[i].x+oldRad)-graph.svgVertices[i].coord[0])+" "+((oldVersCoords[i].y+oldRad)-graph.svgVertices[i].coord[1]));
                    graph.svgVertices[i].group.animate({transform: "t 0 0"},500,animationsEnd.bind(this));
                }
            }
            graph.graphChange("draw");
            for (let i=graph.n; i<graph.svgVertices.length; i++) {
                graph.svgVertices[i]=undefined;
            }
            /*for (let i=m; i<graph.svgEdges.length; i++) {
                graph.svgEdges[i]=undefined;
            }*/
            
            if ((animateDraw===true)&&(graph.vertexRad!=oldRad)) {          
                cntAnimations++;
                Snap.animate(oldRad/graph.vertexRad,1,function (val) {
                    for (let [i, v] of graph.getVertices()) {
                        let strokeWidth=this.findStrokeWidth("vertex",i,val);
                        let fontSize=this.findFontSize("vertex-name",i,val);
                        graph.svgVertices[i].circle.attr({r: val*(graph.vertexRad/graph.size), "stroke-width": strokeWidth});
                        graph.svgVertices[i].text.attr({
                            "font-size": fontSize,
                            dy: determineDy(v.name,graph.svgVertices[i].text.attr("font-family"),fontSize)
                        });
                    }
                
                    for (let [i, edge] of graph.getEdges()) {
                        let strokeWidth=this.findStrokeWidth("edge",i,val);
                        graph.svgEdges[i].line.attr({"stroke-width": strokeWidth});
                        if (graph.isDirected===true) {
                            let x=edge.x,y=edge.y;
                            graph.svgEdges[i].line.markerEnd.remove();
                            this.addMarkerEnd(graph.svgEdges[i].line,(x===y),strokeWidth,
                                              graph.svgVertices[x].coord,graph.svgEdges[i].drawProperties[0]);
                        }
                        if (graph.svgEdges[i].weight!==undefined) {
                            let fontSize=this.findFontSize("weight",i,val);
                            graph.svgEdges[i].weight.attr({"font-size": fontSize});
                        }
                    }
                }.bind(this),500,animationsEnd.bind(this));
            }
            
            function animationsEnd () {
                cntAnimations--;
                if (cntAnimations<=0) {
                    if (graph.isNetwork===true) graph.networkView();
                    this.isDynamic=addDynamic;
                    if (isStatic===false) {
                        if ((this.dynamicGraph===undefined)&&(typeof DynamicGraph!=="undefined")) {
                            this.dynamicGraph=new DynamicGraph(graph);
                        }
                        if (this.dynamicGraph!==undefined) this.dynamicGraph.init();
                    }
                }
            }
            if (cntAnimations===0) animationsEnd.call(this);
        }
        this.setBack = function (obj) {
            obj.prependTo(snap);
            this.bgElement.prependTo(snap);
        }
        
        this.init = function (svgEdge, f) {
            snap=graph.s;
            SvgEdge = svgEdge;
            fonts = f;
        }
    }
    
    
    window.GraphDrawer=GraphDrawer;
})();