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
        
        function setStyle (obj, style) {
            for (let [attr, value] of Object.entries(style)) {
                if (attr==="marker-end") obj.attr("style",obj.attr("style")+"; marker-end:"+value);
                obj.attr(attr,value);
            }
        }
        this.defaultCSSVertex={};
        this.defaultCSSVertexText={};
        this.defaultCSSEdge={};
        this.defaultCSSWeight={};
        this.findAttrValue = function (type, attr, ind = -1) {
            let res=undefined;
            if (type==="vertex") {
                if (attr==="fill") res="white";
                else if (attr==="stroke") res="black";
                else if (attr==="r") res=20;
                else if (attr==="stroke-width") res=1.5;
                if (this.defaultCSSVertex[attr]!==undefined) res=this.defaultCSSVertex[attr];
                if (ind!==-1) {
                    let v=graph.getVertex(ind);
                    if (v.addedCSS[0][attr]!==undefined) res=v.addedCSS[0][attr];
                    if (v.userCSS[0][attr]!==undefined) res=v.userCSS[0][attr];
                }
            }
            else if (type==="vertex-name") {
                if (attr==="fill") res="black";
                else if (attr==="font-family") res="Consolas";
                else if (attr==="text-anchor") res="middle";
                else if (attr==="font-size") res=25;
                if (this.defaultCSSVertexText[attr]!==undefined) res=this.defaultCSSVertexText[attr];
                if (ind!==-1) {
                    let v=graph.getVertex(ind);
                    if (v.addedCSS[1][attr]!==undefined) res=v.addedCSS[1][attr];
                    if (v.userCSS[1][attr]!==undefined) res=v.userCSS[1][attr];
                }
            }
            else if (type==="edge") {
                if (attr==="fill") res="white";
                else if (attr==="fill-opacity") res=0;
                else if (attr==="stroke") res="black";
                else if (attr==="stroke-width") res=1.5;
                if (this.defaultCSSEdge[attr]!==undefined) res=this.defaultCSSEdge[attr];
                if (ind!==-1) {
                    let e=graph.getEdge(ind);
                    if (e.addedCSS[0][attr]!==undefined) res=e.addedCSS[0][attr];
                    if (e.userCSS[0][attr]!==undefined) res=e.userCSS[0][attr];
                }
            }
            else {
                if (attr==="fill") res="black";
                else if (attr==="font-family") res="Arial";
                else if (attr==="text-anchor") res="middle";
                else if (attr==="font-size") res=20;
                if (this.defaultCSSWeight[attr]!==undefined) res=this.defaultCSSWeight[attr];
                if (ind!==-1) {
                    let e=graph.getEdge(ind);
                    if (e.addedCSS[1][attr]!==undefined) res=e.addedCSS[1][attr];
                    if (e.userCSS[1][attr]!==undefined) res=e.userCSS[1][attr];
                }
            }
            if ((attr==="r")||(attr==="stroke-width")||(attr==="font-size")) res=parseFloat(res)*graph.size;
            return res;
        }
        this.setAttributes = function (obj, type, ind = -1, coef = 1) {
            for (let [attr, value] of Object.entries(obj.attr())) {
                obj.attr(attr,"");
            }
            if (type==="vertex") setStyle(obj,this.defaultCSSVertex);
            else if (type==="vertex-name") setStyle(obj,this.defaultCSSVertexText);
            else if (type==="edge") setStyle(obj,this.defaultCSSEdge);
            else if (type==="weight") setStyle(obj,this.defaultCSSWeight);
            if (ind!==-1) {
                let defaultCSS,addedCSS,userCSS;
                if ((type==="vertex")||(type==="vertex-name")) {
                    let v=graph.getVertex(ind);
                    if (type==="vertex") {
                        defaultCSS=v.defaultCSS[0];
                        addedCSS=v.addedCSS[0];
                        userCSS=v.userCSS[0];
                    }
                    else {
                        defaultCSS=v.defaultCSS[1];
                        addedCSS=v.addedCSS[1];
                        userCSS=v.userCSS[1];
                    }
                }
                else if ((type==="edge")||(type==="weight")) {
                    let e=graph.getEdge(ind);
                    if (type==="edge") {
                        defaultCSS=e.defaultCSS[0];
                        addedCSS=e.addedCSS[0];
                        userCSS=e.userCSS[0];
                    }
                    else {
                        defaultCSS=e.defaultCSS[1];
                        addedCSS=e.addedCSS[1];
                        userCSS=e.userCSS[1];
                    }
                }
                setStyle(obj,defaultCSS);
                setStyle(obj,addedCSS);
                setStyle(obj,userCSS);
            }
            if ((type==="vertex")||(type==="edge")) {
                obj.attr("fill",this.findAttrValue(type,"fill",ind));
                if (type==="edge") obj.attr("fill-opacity",this.findAttrValue(type,"fill-opacity",ind));
                obj.attr("stroke",this.findAttrValue(type,"stroke",ind));
                if (type==="vertex") obj.attr("r",this.findAttrValue(type,"r",ind)*coef);
                obj.attr("stroke-width",this.findAttrValue(type,"stroke-width",ind)*coef+"px");
            }
            else if ((type==="vertex-name")||(type==="weight")) {
                obj.attr("fill",this.findAttrValue(type,"fill",ind));
                obj.attr("font-family",this.findAttrValue(type,"font-family",ind));
                obj.attr("text-anchor",this.findAttrValue(type,"text-anchor",ind));
                obj.attr("font-size",this.findAttrValue(type,"font-size",ind)*coef+"px");
            }
        }
        this.getAttributes = function (obj) {
            let res={};
            for (let [attr, value] of Object.entries(obj.attr())) {
                if (attr==="style") continue;
                res[attr]=value;
            }
            for (let [attr, value] of Object.entries(styleToObj(obj.attr("style")))) {
                res[attr]=value;
            }
            return res;
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
            let vertexRad=graph.graphDrawer.findAttrValue("vertex","r");
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
            let [arrowHeight, arrowWidth, arrowDist]=calculateArrowProperties(isLoop,strokeWidth,st,graph.graphDrawer.findAttrValue("vertex","r"),properties);
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
            if (Math.abs(dx)<=2*graph.graphDrawer.findAttrValue("vertex","r")) isVertical=true;
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
            let vertexRad=graph.graphDrawer.findAttrValue("vertex","r");

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
                pathForWeight=calcWeightPosition(svgEdge.weight,st[0]-end[0],isLoop,pathForWeight,properties);
                let edge=graph.getEdge(edgeInd);
                edge.defaultCSS[1]["dy"]=svgEdge.weight.attr("dy");
                snap.select(svgEdge.weight.textPath.attr("href")).attr("d",pathForWeight);
                svgEdge.weight.transform("t"+edge.weightTranslate[0]+" "+edge.weightTranslate[1]+"r"+edge.weightRotation);
            }
            return svgEdge;
        }
        
        this.recalcAttrWeight = function (svgEdge, edgeInd) {
            svgEdge.weight.attr("fill",svgEdge.line.attr("stroke"));
            let edge=graph.getEdge(edgeInd);
            this.setAttributes(svgEdge.weight,"weight",edgeInd);
        }
        this.recalcAttrEdge = function (svgEdge, edgeInd = -1) {
            let edge;
            let oldStrokeWidth=parseFloat(svgEdge.line.attr("stroke-width"));
            if (edgeInd!==-1) {
                edge=graph.getEdge(edgeInd);
                this.setAttributes(svgEdge.line,"edge",edgeInd);
                if ((svgEdge.line.markerEnd!==undefined)&&(svgEdge.line.markerEnd.removed!==true)) {
                    let currStrokeWidth=parseFloat(svgEdge.line.attr("stroke-width"));
                    if (oldStrokeWidth!==currStrokeWidth) {
                        let x=edge.x,y=edge.y;
                        let st=graph.svgVertices[x].coord,end=graph.svgVertices[y].coord;
                        svgEdge.endDist=this.addMarkerEnd(svgEdge.line,false,currStrokeWidth,st,end,svgEdge.drawProperties[0]);
                        if (edgeInd!==-1) svgEdge.endDist+=this.findAttrValue("vertex","stroke-width",graph.getEdge(edgeInd).y)/2;
                        edge.defaultCSS[0]["marker-end"]=styleToObj(svgEdge.line.attr("style"))["marker-end"];
                        this.redrawEdge(svgEdge,st,end,edgeInd);
                    }
                    svgEdge.line.markerEnd.attr("fill",svgEdge.line.attr("stroke"));
                    svgEdge.line.markerEnd.attr("opacity",svgEdge.line.attr("stroke-opacity"));
                }
            }
            if ((graph.isWeighted===true)&&(svgEdge.weight!==undefined)) this.recalcAttrWeight(svgEdge,edgeInd);
        }
        this.drawEdge = function (st, end, edgeInd = -1, drawProperties = [0, 1, 0]) {
            let isLoop=false,isDrawn=(edgeInd===-1),isDirected=graph.isDirected||graph.isNetwork;
            let strokeWidth=this.findAttrValue("edge","stroke-width",edgeInd);
            let edge;
            if (isDrawn===false) {
                edge=graph.getEdge(edgeInd);
                if (edge.x===edge.y) isLoop=true;
                if ((graph.isNetwork===true)&&(edge.flow===0)) isDirected=false;
            }
            
            let vertexRad=graph.graphDrawer.findAttrValue("vertex","r");
            
            let svgEdge=new SvgEdge();
            svgEdge.drawProperties=drawProperties;
            let properties=drawProperties[0];

            let endDist=0;
            if (isDirected===true) {
                let arrowDist=calculateArrowProperties(isLoop,strokeWidth,st,vertexRad,properties)[2];
                endDist=((isDrawn===true)?0:this.findAttrValue("vertex","stroke-width",graph.getEdge(edgeInd).y)/2)+arrowDist;
                if ((isDrawn===false)&&(properties===0)&&(endDist>segmentLength(st[0],st[1],end[0],end[1])-2*graph.graphDrawer.findAttrValue("vertex","r"))) endDist=0;
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

            
            if (isDirected===true) this.addMarkerEnd(svgEdge.line,isLoop,strokeWidth,st,properties);
            if (isDrawn===false) edge.defaultCSS[0]=this.getAttributes(svgEdge.line);
            this.setAttributes(svgEdge.line,"edge",edgeInd);
            this.recalcAttrEdge(svgEdge,edgeInd);

            if ((isDrawn===false)&&(graph.isWeighted===true)) {
                svgEdge.weight=snap.text(0,0,weightName(edge,graph.isNetwork));
                svgEdge.weight.attr("class","unselectable");
                edge.defaultCSS[1]=this.getAttributes(svgEdge.weight);
                this.setAttributes(svgEdge.weight,"weight",edgeInd);
                let font=svgEdge.weight.attr("font-family"),fontSize=parseFloat(svgEdge.weight.attr("font-size"));
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
                
                pathForWeight=calcWeightPosition(svgEdge.weight,st[0]-end[0],isLoop,pathForWeight,properties);
                edge.defaultCSS[1]["dy"]=svgEdge.weight.attr("dy");
                svgEdge.weight.attr({textpath: pathForWeight});
                svgEdge.weight.textPath.attr({"startOffset": "50%"});
                
                this.recalcAttrWeight(svgEdge,edgeInd);
                svgEdge.weight.transform("t"+edge.weightTranslate[0]+" "+edge.weightTranslate[1]+"r"+edge.weightRotation);
            }
            return svgEdge;
        }

        this.recalcAttrVertexText = function (svgVertex, ind) {
            let v=graph.getVertex(ind);
            if (!((v.name.startsWith("$"))&&(v.name.endsWith("$")))) {
                v.defaultCSS[1]["dy"]=determineDy(
                    v.name,
                    this.findAttrValue("vertex-name","font-family",ind),
                    parseFloat(this.findAttrValue("vertex-name","font-size",ind))
                );
                this.setAttributes(svgVertex.text,"vertex-name",ind);
            }
        }
        this.recalcAttrVertex = function (svgVertex, ind) {
            let v=graph.getVertex(ind);
            this.setAttributes(svgVertex.circle,"vertex",ind);
        }
        this.drawVertexText = function (i, text) {
            let x=graph.svgVertices[i].coord[0],y=graph.svgVertices[i].coord[1];
            let v=graph.getVertex(i);
            v.name=text;
            let fontSize=this.findAttrValue("vertex-name","font-size",i),removed=false;
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
                    class: "unselectable"
                });
                v.defaultCSS[1]=this.getAttributes(graph.svgVertices[i].text);
                this.setAttributes(graph.svgVertices[i].text,"vertex-name",i);
            }
            this.recalcAttrVertexText(graph.svgVertices[i],i);
            if (removed===true) graph.svgVertices[i].group=snap.group(graph.svgVertices[i].circle,graph.svgVertices[i].text);
        }
        this.drawVertex = function (i) {
            let x=graph.svgVertices[i].coord[0],y=graph.svgVertices[i].coord[1];
            graph.svgVertices[i].circle=snap.circle(x,y,graph.graphDrawer.findAttrValue("vertex","r"));
            let v=graph.getVertex(i);
            v.defaultCSS[0]=this.getAttributes(graph.svgVertices[i].circle);
            this.setAttributes(graph.svgVertices[i].circle,"vertex",i);
            this.recalcAttrVertex(graph.svgVertices[i],i);
            this.drawVertexText(i,v.name);
            graph.svgVertices[i].group=snap.group(graph.svgVertices[i].circle,graph.svgVertices[i].text);
        }
        this.findLoopEdgeProperties = function (vertexRad = graph.graphDrawer.findAttrValue("vertex","r")) {
            return [3*vertexRad/4, vertexRad/2];
        }
        this.isDynamic=undefined; this.dynamicGraph=undefined;
        this.isStatic=false;
        this.defaultBG=["#ffffff", 100];
        this.bgElement=undefined;
        this.draw = function (addDynamic, animateDraw = true, isStatic = undefined) { /// this functions expects that coordinates are already calculated
            if ((this.dynamicGraph!==undefined)&&(addDynamic===false)) this.dynamicGraph.clear();
            
            if (isStatic===undefined) isStatic=this.isStatic;
            else this.isStatic=isStatic;
            
            let oldVertexAttr=[],oldVertexNameAttr=[];
            let oldEdgeAttr=[],oldWeightAttr=[],oldWeightPathAttr=[];
            let m=graph.getIndexedEdges().length;
            if (animateDraw===true) {
                for (let i=0; i<graph.n; i++) {
                    if ((graph.svgVertices[i]!==undefined)&&(graph.svgVertices[i].group!==undefined)&&
                        (graph.svgVertices[i].group.removed!==true)) {
                        oldVertexAttr[i]=this.getAttributes(graph.svgVertices[i].circle);
                        oldVertexNameAttr[i]=this.getAttributes(graph.svgVertices[i].text);
                    }
                }
                for (let i=0; i<m; i++) {
                    if ((graph.svgEdges[i]!==undefined)&&(graph.svgEdges[i].line!==undefined)&&
                        (graph.svgEdges[i].line.removed!==true)) {
                        oldEdgeAttr[i]=this.getAttributes(graph.svgEdges[i].line);
                        if (graph.svgEdges[i].weight!==undefined) {
                            oldWeightAttr[i]=this.getAttributes(graph.svgEdges[i].weight);
                            oldWeightPathAttr[i]=this.getAttributes(snap.select(graph.svgEdges[i].weight.textPath.attr("href")));
                        }
                    }
                }
            }
            if (graph.isNetwork===true) graph.networkView();
            
            graph.erase();
            if (this.bgElement!==undefined) this.bgElement.remove();
            this.bgElement=snap.circle(0,0,1e5);
            this.bgElement.attr({fill: this.defaultBG[0], opacity: (1-this.defaultBG[1]/100)});
            
            function addAttr (obj, curr, old) {
                if (old===undefined) return ;
                for (let [attr, value] of Object.entries(old)) {
                    if ((curr[attr]===undefined)&&(obj.attr(attr)!==null)) curr[attr]=obj.attr(attr);
                }
            }
            function removeAttr (obj, list) {
                if (obj===undefined) return ;
                for (let attr of list) {
                    delete obj[attr];
                }
            }
            function equalAttr (obj1, obj2) {
                if ((obj1===undefined)||(obj2===undefined)) return true;
                for (let [attr, value] of Object.entries(obj1)) {
                    if (obj2[attr]!==obj1[attr]) return false;
                }
                for (let [attr, value] of Object.entries(obj2)) {
                    if (obj1[attr]!==obj2[attr]) return false;
                }
                return true;
            }
            let animations=[];

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
                if ((graph.isNetwork===true)&&(graph.isDirected===false)&&(edge.real===false)) continue;
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
                    let currEdgeAttr=this.getAttributes(graph.svgEdges[i].line);
                    addAttr(graph.svgEdges[i].line,currEdgeAttr,oldEdgeAttr[i]);
                    removeAttr(oldEdgeAttr[i],["marker-end", "cursor"]);
                    removeAttr(currEdgeAttr,["marker-end", "cursor"]);
                    if (!equalAttr(oldEdgeAttr[i],currEdgeAttr)) {
                        graph.svgEdges[i].line.attr(oldEdgeAttr[i]);
                        animations.push(["edge",i,graph.svgEdges[i].line,currEdgeAttr]);
                    }
                    
                    if (graph.svgEdges[i].weight!==undefined) {
                        let currWeightAttr=this.getAttributes(graph.svgEdges[i].weight);
                        addAttr(graph.svgEdges[i].weight,currWeightAttr,oldWeightAttr[i]);
                        removeAttr(oldWeightAttr[i],["class", "font-family", "text-anchor", "cursor"]);
                        removeAttr(currWeightAttr,["class", "font-family", "text-anchor", "cursor"]);
                        if (!equalAttr(oldWeightAttr[i],currWeightAttr)) {
                            graph.svgEdges[i].weight.attr(oldWeightAttr[i]);
                            animations.push(["weight",i,graph.svgEdges[i].weight,currWeightAttr]);
                        }

                        let weightPath=snap.select(graph.svgEdges[i].weight.textPath.attr("href"));
                        let currWeightPathAttr=this.getAttributes(weightPath);
                        addAttr(weightPath,currWeightPathAttr,oldWeightPathAttr[i]);
                        removeAttr(oldWeightPathAttr[i],["id"]);
                        removeAttr(currWeightPathAttr,["id"]);
                        if (!equalAttr(oldWeightPathAttr[i],currWeightPathAttr)) {
                            weightPath.attr(oldWeightPathAttr[i]);
                            animations.push(["weightPath",i,weightPath,currWeightPathAttr]);
                        }
                    }
                }
            }

            for (let i=0; i<graph.n; i++) {
                if (graph.getVertex(i)===undefined) graph.svgVertices[i]=undefined;
            }
            for (let [i, v] of graph.getVertices()) {
                this.drawVertex(i);
                if (animateDraw===true) {
                    let currVertexAttr=this.getAttributes(graph.svgVertices[i].circle);
                    addAttr(graph.svgVertices[i].circle,currVertexAttr,oldVertexAttr[i]);
                    if (!equalAttr(oldVertexAttr[i],currVertexAttr)) {
                        graph.svgVertices[i].circle.attr(oldVertexAttr[i]);
                        animations.push(["vertex",i,graph.svgVertices[i].circle,currVertexAttr]);
                    }
                    let currVertexNameAttr=this.getAttributes(graph.svgVertices[i].text);
                    addAttr(graph.svgVertices[i].text,currVertexNameAttr,oldVertexNameAttr[i]);
                    removeAttr(oldVertexNameAttr[i],["class", "font-family", "text-anchor"]);
                    removeAttr(currVertexNameAttr,["class", "font-family", "text-anchor"]);
                    if (!equalAttr(oldVertexNameAttr[i],currVertexNameAttr)) {  
                        graph.svgVertices[i].text.attr(oldVertexNameAttr[i]);
                        animations.push(["vertex-name",i,graph.svgVertices[i].text,currVertexNameAttr]);
                    }
                }
            }
            for (let i=graph.n; i<graph.svgVertices.length; i++) {
                graph.svgVertices[i]=undefined;
            }
            
            graph.graphChange("draw");
            
            let cntAnimations=animations.length;
            function animationsEnd () {
                cntAnimations--;
                if (cntAnimations<=0) {
                    if (graph.isDirected===true) {
                        for (let [type, ind, obj, attr] of animations) {
                            if (type!=="edge") continue;
                            let x=graph.getEdge(ind).x,y=graph.getEdge(ind).y;
                            if (x!==y) continue;
                            this.redrawEdge(graph.svgEdges[ind],graph.svgVertices[x].coord,graph.svgVertices[y].coord,ind);
                        }
                    }
                    this.isDynamic=addDynamic;
                    if (isStatic===false) {
                        if ((this.dynamicGraph===undefined)&&(typeof DynamicGraph!=="undefined")) {
                            this.dynamicGraph=new DynamicGraph(graph);
                        }
                        if (this.dynamicGraph!==undefined) this.dynamicGraph.init();
                    }
                }
            }
            for (let [type, ind, obj, attr] of animations) {
                obj.animate(attr,500,animationsEnd.bind(this));
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