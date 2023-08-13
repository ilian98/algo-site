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
    function translatePoint (p, t) {
        return [p[0]+t[0], p[1]+t[1]];
    }
    function rotatePoint (p, sin, cos) {
        return [cos*p[0]-sin*p[1], sin*p[0]+cos*p[1]];
    }
    function findBezierProperties (x1, y1, x2, y2, x3, y3) { // (x3, y3) is the vertex of the parabola
        let t=[-x1, -y1];
        [x1, y1]=[0, 0];
        [x2, y2]=translatePoint([x2, y2],t);
        [x3, y3]=translatePoint([x3, y3],t);
        let sin=y2/segmentLength(0,0,x2,y2),cos=-x2/segmentLength(0,0,x2,y2);
        [x2, y2]=rotatePoint([x2, y2],sin,cos);
        [x3, y3]=rotatePoint([x3, y3],sin,cos);
        // y=a*x^2+b*x
        let a=(y2*x3-y3*x2)/(x2*x2*x3-x3*x3*x2);
        let b=(y2-a*x2*x2)/x2;
        return [t, [sin, cos], [a, b]];
    }
    function findBezierPoint (x1, y1, x2, y2, tr, ang, par) {
        let [sin, cos]=ang;
        let [a, b]=par;
        [x1, y1]=rotatePoint(translatePoint([x1, y1],tr),sin,cos);
        [x2, y2]=rotatePoint(translatePoint([x2, y2],tr),sin,cos);
        let k1=2*a*x1+b,m1=y1-k1*x1; // y=k1*x+m1
        let k2=2*a*x2+b,m2=y2-k2*x2; // y=k2*x+m2
        let x=(m2-m1)/(k1-k2);
        let y=k1*x+m1;
        return translatePoint(rotatePoint([x, y],-sin,cos),[-tr[0], -tr[1]]);
    }
    function findPointAtDistance (x1, y1, x2, y2, d) {
        let r=Math.sqrt(((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))/4+d*d);
        return circlesIntersection(x1,y1,r,x2,y2,r)[(d>0)?0:1];
    }
    function bezierPath (st, end, q) {
        return "M"+st[0]+","+st[1]+" Q"+q[0]+","+q[1]+" "+end[0]+","+end[1];
    }
    function linePath (st, end) {
        return "M"+st[0]+","+st[1]+" L"+end[0]+","+end[1];
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
        this.findFontSize = function (type, ind = -1, coef = 1) {
            if (type==="vertex-name") coef*=5/4;
            else coef*=1;
            let sampleText=snap.text();
            let css=(type==="vertex-name")?this.defaultCSSVertexText:this.defaultCSSWeight;
            if (ind!==-1) {
                let obj;
                if (type==="vertex-name") obj=graph.getVertex(ind);
                else obj=graph.getEdge(ind);
                css+=";"+objToStyle(obj.addedCSS[1])+";"+obj.userCSS[1];
            }
            setStyle(sampleText,"font-size: "+(coef*graph.size*20)+"px;"+css);
            let fontSize=parseFloat(sampleText.attr("font-size"));
            sampleText.remove();
            return fontSize;
        }
        this.findStrokeWidth = function (type, ind = -1, coef = 1) {
            coef*=1.5/20;
            let sampleStroke=snap.circle();
            let css=(type==="vertex")?this.defaultCSSVertex:this.defaultCSSEdge;
            if (ind!==-1) {
                let obj;
                if (type==="vertex") obj=graph.getVertex(ind);
                else obj=graph.getEdge(ind);
                css+=";"+objToStyle(obj.addedCSS[0])+";"+obj.userCSS[0];
            }
            setStyle(sampleStroke,"stroke-width: "+(coef*graph.size*20)+";"+css);
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
                if (type==="vertex") css+=";"+objToStyle(graph.getVertex(ind).addedCSS[0])+";"+graph.getVertex(ind).userCSS[0];
                else if (type==="vertex-name") css+=";"+objToStyle(graph.getVertex(ind).addedCSS[1])+";"+graph.getVertex(ind).userCSS[1];
                else if (type==="edge") css+=";"+objToStyle(graph.getEdge(ind).addedCSS[0])+";"+graph.getEdge(ind).userCSS[0];
                else css+=";"+objToStyle(graph.getEdge(ind).addedCSS[1])+";"+graph.getEdge(ind).userCSS[1];
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
            let [tr, ang, par]=findBezierProperties(beg[0],beg[1],fin[0],fin[1],middlePoint[0],middlePoint[1]);
            let bezierPoint=findBezierPoint(beg[0],beg[1],fin[0],fin[1],tr,ang,par);
            let bezPath=bezierPath(beg,fin,bezierPoint);
            let vertexRad=graph.getRadius();
            if (Snap.path.getTotalLength(bezPath)<2*vertexRad+2*endDist) return [bezPath, bezierPoint];
            let p1=Snap.path.intersection(
                bezPath,
                circlePath(beg[0],beg[1],((beg===st)?vertexRad:(vertexRad+endDist)))
            )[0];
            if (p1===undefined) return ["", [(st[0]+end[0])/2, (st[1]+end[1])/2]];
            let p2=Snap.path.intersection(
                bezPath,
                circlePath(fin[0],fin[1],((fin===st)?vertexRad:(vertexRad+endDist)))
            )[0];
            if (p2===undefined) return ["", [(st[0]+end[0])/2, (st[1]+end[1])/2]];
            let bezierPointFinal=findBezierPoint(p1.x,p1.y,p2.x,p2.y,tr,ang,par);
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
            return [arrowHeight, arrowWidth, arrowWidth];
        }
        this.addMarkerEnd = function (line, isLoop, strokeWidth, st, properties) {
            let [arrowHeight, arrowWidth, arrowDist]=calculateArrowProperties(isLoop,strokeWidth,st,graph.getRadius(),properties);
            let arrowEnd=[3*arrowHeight/2,arrowHeight/2];
            if (line.markerEnd!==undefined) line.markerEnd.remove();
            line.markerEnd=snap.polygon([0,0,arrowEnd[0],arrowEnd[1],0,arrowHeight,0,0]);
            let marker=line.markerEnd.marker(0,0,arrowEnd[0],arrowHeight,
                                             (isLoop===false)?arrowEnd[0]-arrowDist:0,arrowEnd[1]).attr({
                markerUnits: "userSpaceOnUse"
            });
            line.attr({"marker-end": marker});
            return arrowDist;
        }
        function calcWeightPosition (weight, dx, isLoop, pathForWeight, properties) {
            let isVertical=false;
            if (Math.abs(dx)<=2*graph.getRadius()) isVertical=true;
            if (isVertical===true) {
                let middle=Snap.path.getPointAtLength(pathForWeight,Snap.path.getTotalLength(pathForWeight)/2);
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
            let vertexRad=graph.getRadius();

            let pathForWeight;
            if (properties===0) {
                svgEdge.line.attr("d",calcStraightEdge(st,end,isDrawn,endDist,vertexRad));
                let points=sortPoints(st,end);
                pathForWeight=linePath(points[0],points[1]);
            }
            else {
                if (isLoop===true) { /// loop
                    svgEdge.line.attr("d",loopPath(st[0],st[1]-vertexRad,vertexRad,properties,graph.isDirected||graph.isNetwork));
                    pathForWeight=loopPath(st[0],st[1]-vertexRad,vertexRad,properties,false);
                }
                else { /// curved edge
                    let res=this.calcCurvedEdge(st,end,properties,endDist);
                    svgEdge.line.attr("d",res[0]);
                    let points=sortPoints(st,end);
                    if (points[0]!==st) properties*=(-1);
                    pathForWeight=bezierPath(points[0],points[1],res[1]);
                }
            }

            if ((isDrawn===false)&&(graph.isWeighted===true)&&(svgEdge.weight!==undefined)) {
                pathForWeight=calcWeightPosition.call(this,svgEdge.weight,st[0]-end[0],isLoop,pathForWeight,properties);
                snap.select(svgEdge.weight.textPath.attr("href")).attr("d",pathForWeight);
            }
            return svgEdge;
        }
        
        this.recalcAttrWeight = function (svgEdge, edge) {
            svgEdge.weight.attr("fill",svgEdge.line.attr("stroke"));
            setStyle(svgEdge.weight,edge.defaultCSS[1]+";"+objToStyle(edge.addedCSS[1])+";"+edge.userCSS[1]);
        }
        this.recalcAttrEdge = function (svgEdge, edgeInd = -1) {
            let edge;
            let oldStrokeWidth=parseFloat(svgEdge.line.attr("stroke-width"));
            if (edgeInd!==-1) {
                edge=graph.getEdge(edgeInd);
                setStyle(svgEdge.line,edge.defaultCSS[0]+";"+objToStyle(edge.addedCSS[0])+";"+edge.userCSS[0]);
                if ((svgEdge.line.markerEnd!==undefined)&&(svgEdge.line.markerEnd.removed!==true)) {
                    let currStrokeWidth=parseFloat(svgEdge.line.attr("stroke-width"));
                    if (oldStrokeWidth!==currStrokeWidth) {
                        let x=edge.x,y=edge.y;
                        let st=graph.svgVertices[x].coord,end=graph.svgVertices[y].coord;
                        svgEdge.endDist=this.addMarkerEnd(svgEdge.line,false,currStrokeWidth,st,end,svgEdge.drawProperties[0]);
                        if (edgeInd!==-1) svgEdge.endDist+=this.findStrokeWidth("vertex",graph.getEdge(edgeInd).y)/2;
                        let styleObj=styleToObj(edge.defaultCSS[0]);
                        styleObj["marker-end"]=styleToObj(svgEdge.line.attr("style"))["marker-end"];
                        edge.defaultCSS[0]=objToStyle(styleObj);
                        this.redrawEdge(svgEdge,st,end,edgeInd);
                    }
                    svgEdge.line.markerEnd.attr("fill",svgEdge.line.attr("stroke"));
                    svgEdge.line.markerEnd.attr("opacity",svgEdge.line.attr("stroke-opacity"));
                }
            }
            if ((graph.isWeighted===true)&&(svgEdge.weight!==undefined)) this.recalcAttrWeight(svgEdge,edge);
        }
        this.defaultCSSEdge="";
        this.defaultCSSWeight="";
        this.drawEdge = function (st, end, edgeInd = -1, drawProperties = [0, 1, 0]) {
            let isLoop=false,isDrawn=(edgeInd===-1),isDirected=graph.isDirected||graph.isNetwork;
            let strokeWidth=this.findStrokeWidth("edge",edgeInd);
            let edge;
            if (isDrawn===false) {
                edge=graph.getEdge(edgeInd);
                if (edge.x===edge.y) isLoop=true;
                if ((graph.isNetwork===true)&&(edge.flow===0)) isDirected=false;
            }
            
            let vertexRad=graph.getRadius();
            
            let svgEdge=new SvgEdge();
            svgEdge.drawProperties=drawProperties;
            let properties=drawProperties[0];

            let endDist=0;
            if (isDirected===true) {
                let arrowDist=calculateArrowProperties(isLoop,strokeWidth,st,vertexRad,properties)[2];
                endDist=((isDrawn===true)?0:this.findStrokeWidth("vertex",graph.getEdge(edgeInd).y)/2)+arrowDist;
                if ((isDrawn===false)&&(properties===0)&&(endDist>segmentLength(st[0],st[1],end[0],end[1])-2*graph.getRadius())) endDist=0;
            }
            svgEdge.endDist=endDist;

            let pathForWeight;
            if (properties===0) {
                svgEdge.line=snap.path(calcStraightEdge(st,end,isDrawn,endDist,vertexRad));
                let points=sortPoints(st,end);
                pathForWeight=linePath(points[0],points[1]);
            }
            else {
                if (isLoop===true) { /// loop
                    svgEdge.line=snap.path(loopPath(st[0],st[1]-vertexRad,vertexRad,properties,isDirected));
                    pathForWeight=loopPath(st[0],st[1]-vertexRad,vertexRad,properties,false);
                }
                else { /// curved edge
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
            if (isDrawn===false) edge.defaultCSS[0]=svgEdge.line.attr("style");
            this.recalcAttrEdge(svgEdge,edgeInd);

            if ((isDrawn===false)&&(graph.isWeighted===true)) {
                svgEdge.weight=snap.text(0,0,weightName(edge,graph.isNetwork));
                let fontSize=this.findFontSize("weight",edgeInd);
                svgEdge.weight.attr({
                    "font-size": fontSize,
                    "font-family": "Arial",
                    "text-anchor": "middle",
                    class: "unselectable",
                    fill: "black",
                });
                concatStyle(svgEdge.weight,this.defaultCSSWeight);
                let font=svgEdge.weight.attr("font-family");
                if (typeof fonts[font]!=="undefined") {
                    let bBox=textBBox(svgEdge.weight.attr("text"),font,fontSize);
                    svgEdge.weight.width=bBox.x2-bBox.x1;
                    svgEdge.weight.height=bBox.y2-bBox.y1;
                }
                else {
                    svgEdge.weight.width=svgEdge.weight.getBBox().width;
                    svgEdge.weight.height=svgEdge.weight.getBBox().height;
                }
                svgEdge.weight.dyCenter=determineDy(edge.weight.toString(),font,fontSize);
                
                pathForWeight=calcWeightPosition.call(this,svgEdge.weight,st[0]-end[0],isLoop,pathForWeight,properties);
                svgEdge.weight.attr({textpath: pathForWeight});
                svgEdge.weight.textPath.attr({"startOffset": "50%"});
                
                edge.defaultCSS[1]=svgEdge.weight.attr("style");
                this.recalcAttrWeight(svgEdge,edge);
                svgEdge.weight.transform("t"+edge.weightTranslate[0]+" "+edge.weightTranslate[1]+"r"+edge.weightRotation);
            }
            return svgEdge;
        }

        this.recalcAttrVertexText = function (svgVertex, ind) {
            let v=graph.getVertex(ind);
            if (!((v.name.startsWith("$"))&&(v.name.endsWith("$")))) {
                let fontSize=this.findFontSize("vertex-name",ind);
                svgVertex.text.attr({dy: determineDy(
                    v.name,
                    svgVertex.text.attr("font-family"),
                    fontSize
                )});
                setStyle(svgVertex.text,v.defaultCSS[1]+";"+objToStyle(v.addedCSS[1])+";"+v.userCSS[1]); 
            }
        }
        this.recalcAttrVertex = function (svgVertex, ind) {
            let v=graph.getVertex(ind);
            setStyle(svgVertex.circle,v.defaultCSS[0]+";"+objToStyle(v.addedCSS[0])+";"+v.userCSS[0]);
        }
        this.defaultCSSVertexText="";
        this.drawVertexText = function (i, text) {
            let x=graph.svgVertices[i].coord[0],y=graph.svgVertices[i].coord[1];
            let v=graph.getVertex(i);
            v.name=text;
            let fontSize=this.findFontSize("vertex-name",i),removed=false;
            if ((text.startsWith("$"))&&(text.endsWith("$"))&&(typeof MathJax!=="undefined")&&(MathJax.tex2svg!==undefined)) {
                if (graph.svgVertices[i].text!==undefined) {
                    removed=true;
                    graph.svgVertices[i].text.remove();
                }
                let math=$(MathJax.tex2svg(text.substr(1,text.length-2))).children().children();
                let html="";
                for (let elem of math) {
                    html+=elem.outerHTML;
                }
                graph.svgVertices[i].text=snap.group().append(Snap.parse(html));
                let scale=0.025*(fontSize/25);
                graph.svgVertices[i].text.transform("s"+scale);
                let bBox=graph.svgVertices[i].text.getBBox();
                let dx=x-bBox.w/2-bBox.x,dy=y-bBox.h/2-bBox.y;
                graph.svgVertices[i].text.transform("t"+dx+","+dy+" s"+scale);
            }
            else {
                if (graph.svgVertices[i].text!==undefined) {
                    if (graph.svgVertices[i].text.type!=="text") {
                        removed=true;
                        graph.svgVertices[i].text.remove();
                    }
                }
                if ((graph.svgVertices[i].text===undefined)||(graph.svgVertices[i].text.removed===true))
                    graph.svgVertices[i].text=snap.text();
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
                v.defaultCSS[1]=graph.svgVertices[i].text.attr("style");
            }
            this.recalcAttrVertexText(graph.svgVertices[i],i);
            if (removed===true) graph.svgVertices[i].group=snap.group(graph.svgVertices[i].circle,graph.svgVertices[i].text);
        }
        this.defaultCSSVertex="";
        this.drawVertex = function (i) {
            let x=graph.svgVertices[i].coord[0],y=graph.svgVertices[i].coord[1];
            graph.svgVertices[i].circle=snap.circle(x,y,graph.getRadius());
            graph.svgVertices[i].circle.attr({
                fill: "white",
                stroke: "black",
                "stroke-width": this.findStrokeWidth("vertex",i)
            });
            concatStyle(graph.svgVertices[i].circle,this.defaultCSSVertex);
            let v=graph.getVertex(i);
            v.defaultCSS[0]=graph.svgVertices[i].circle.attr("style");
            this.recalcAttrVertex(graph.svgVertices[i],i);
            this.drawVertexText(i,v.name);
            graph.svgVertices[i].group=snap.group(graph.svgVertices[i].circle,graph.svgVertices[i].text);
        }
        this.findLoopEdgeProperties = function (vertexRad = graph.getRadius()) {
            return [3*vertexRad/4, vertexRad/2];
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
            let oldRad=graph.getRadius(),vertexRad=graph.getRadius();
            let oldEdgesPaths=[],oldDy=[],oldWeightsPaths=[];
            let oldWeightsTransform=[];
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
                            oldWeightsTransform[i]=graph.svgEdges[i].weight.transform().string;
                        }
                        else oldWeightsPaths[i]=undefined;
                    }
                    else oldEdgesPaths[i]=undefined, oldWeightsPaths[i]=undefined;
                }
            }
            if (graph.isNetwork===true) graph.networkView();
            
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
            let height=6*graph.size;
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
                let drawProperties=[];
                if (x!==y) drawProperties[2]=multiEdges[cnt][val++]*((x>y)?-1:1);
                else drawProperties[2]=loopEdges[cnt][val++];
                drawProperties[0]=drawProperties[2];
                if (edge.curveHeight!==undefined) drawProperties[0]=edge.curveHeight;
                drawProperties[1]=cnt;
                graph.svgEdges[i]=this.drawEdge(graph.svgVertices[x].coord,graph.svgVertices[y].coord,i,drawProperties);
                edgeMapCurr.set(code,val);
                
                if (animateDraw===true) {
                    if ((oldVersCoords[x]!==undefined)&&(oldVersCoords[y]!==undefined)&&
                        ((changedVers[x]===true)||(changedVers[y]===true))) {
                        let st=[oldVersCoords[x].x+vertexRad,oldVersCoords[x].y+vertexRad];
                        let end=[oldVersCoords[y].x+vertexRad,oldVersCoords[y].y+vertexRad];
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
                    if ((oldWeightsTransform[i]!==undefined)&&(graph.svgEdges[i].weight!==undefined)) {
                        function transformParameters (s) {
                            let tx=0,ty=0,r=0;
                            let pos=s.search("r");
                            let nums=s.substring(1,pos).split(' ');
                            if (nums.length>0) tx=parseFloat(nums[0]), ty=parseFloat(nums[1]);
                            if (pos<s.length) r=parseFloat(s.substring(pos+1));
                            return [tx, ty, r];
                        }
                        let currTransform=graph.svgEdges[i].weight.transform().string;
                        if (oldWeightsTransform[i]!==currTransform) {
                            let oldParams=transformParameters(oldWeightsTransform[i]);
                            let currParams=transformParameters(currTransform);
                            cntAnimations++;
                            Snap.animate(0,1,function (progress) {
                                let tx=oldParams[0]+(currParams[0]-oldParams[0])*progress;
                                let ty=oldParams[1]+(currParams[1]-oldParams[1])*progress;
                                let r=oldParams[2]+(currParams[2]-oldParams[2])*progress;
                                this.transform("t"+tx+" "+ty+"r"+r);
                            }.bind(graph.svgEdges[i].weight),500,animationsEnd.bind(this));
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
            for (let i=graph.n; i<graph.svgVertices.length; i++) {
                graph.svgVertices[i]=undefined;
            }
            
            graph.graphChange("draw");
            
            if ((animateDraw===true)&&(vertexRad!=oldRad)) {          
                cntAnimations++;
                Snap.animate(oldRad,vertexRad,function (rad) {
                    let coef=rad/vertexRad;
                    for (let [i, v] of graph.getVertices()) {
                        let strokeWidth=this.findStrokeWidth("vertex",i,coef);
                        let fontSize=this.findFontSize("vertex-name",i,coef);
                        graph.svgVertices[i].circle.attr({r: rad, "stroke-width": strokeWidth});
                        graph.svgVertices[i].text.attr({
                            "font-size": fontSize,
                            dy: determineDy(v.name,graph.svgVertices[i].text.attr("font-family"),fontSize)
                        });
                    }
                
                    for (let [i, edge] of graph.getEdges()) {
                        let strokeWidth=this.findStrokeWidth("edge",i,coef);
                        graph.svgEdges[i].line.attr({"stroke-width": strokeWidth});
                        if (graph.isDirected===true) {
                            let x=edge.x,y=edge.y;
                            graph.svgEdges[i].line.markerEnd.remove();
                            this.addMarkerEnd(graph.svgEdges[i].line,(x===y),strokeWidth,
                                              graph.svgVertices[x].coord,graph.svgEdges[i].drawProperties[0]);
                        }
                        if (graph.svgEdges[i].weight!==undefined) {
                            let fontSize=this.findFontSize("weight",i,coef);
                            graph.svgEdges[i].weight.attr({"font-size": fontSize});
                        }
                    }
                }.bind(this),500,animationsEnd.bind(this));
            }
            
            function animationsEnd () {
                cntAnimations--;
                if (cntAnimations<=0) {
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