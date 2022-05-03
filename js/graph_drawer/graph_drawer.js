"use strict";
(function () {
    function checkInteger (s) {
        if (s===null) return false;
        if (s.length===0) return false;
        for (let c of s) {
            if ((c<'0')||(c>'9')) return false;
        }
        return true;
    }
    function getObjectForCoordinates (event) {
        if (window.isMobile==="false") return event;
        else if (event.changedTouches!==undefined) return event.changedTouches[0];
        else if (event.touches!==undefined) return event.touches[0];
        else return event;
    }
    
    function DrawableGraph (graph) {
        let svgPoint;
        function setSvgPoint (event) {
            let obj=getObjectForCoordinates(event);
            svgPoint.x=obj.clientX;
            svgPoint.y=obj.clientY;
            svgPoint=svgPoint.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
        }
        function prompt (text, defaultValue) {
            let s=window.prompt(text,defaultValue);
            return s;
        }
        
        let addVertexDrag=false,startIndex=undefined;
        let currEdgeDraw=undefined;
        let startMousePos;
        let drawProperties=undefined;
        
        function redrawEdges (dx, dy) {
            let coords=[graph.svgVertices[startIndex].coord[0]+dx,
                        graph.svgVertices[startIndex].coord[1]+dy];
            function redrawEdge (ind) {
                let otherEnd=graph.edgeList[ind].findEndPoint(startIndex);
                let otherCoords=[graph.svgVertices[otherEnd].coord[0], graph.svgVertices[otherEnd].coord[1]];
                if (graph.edgeList[ind].x===startIndex) 
                    graph.redrawEdge(graph.svgEdges[ind],[coords[0], coords[1]],otherCoords,ind);
                else graph.redrawEdge(graph.svgEdges[ind],otherCoords,[coords[0], coords[1]],ind);
            }
            for (let ind of graph.adjList[startIndex]) {
                redrawEdge(ind);
            }
            for (let ind of graph.reverseAdjList[startIndex]) {
                redrawEdge(ind);
            }
        }
        
        function mouseDown (event) {
            let type=this.type,index=this.index;
            
            event.preventDefault();
            dropdowns[graph.wrapperName].closeDropdowns();
            
            trackedMouse=false;
            startIndex=index;
            setSvgPoint(event);
            startMousePos=[svgPoint.x, svgPoint.y];
            
            if (type==="edge") drawProperties=graph.svgEdges[index].drawProperties[0];
            let mouseOut = function (event) {
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
                    clearClickParameters(type);
                }
            };
            if (window.isMobile==="false") $(window).off("mousemove.mouse-out").on("mousemove.mouse-out",mouseOut);
            else $(window).off("touchmove.mouse-out").on("touchmove.mouse-out",mouseOut);
            
            if (window.isMobile==="false") {
                if (event.button!==0) return ;
                graph.s.mousemove((type==="vertex")?trackMouseVertex:trackMouseEdge);
                graph.s.mouseup((type==="vertex")?mouseUpVertex:mouseUpEdge);
            }
            else {
                graph.s.touchmove((type==="vertex")?trackMouseVertex:trackMouseEdge);
                graph.s.touchend((type==="vertex")?mouseUpVertex:mouseUpEdge);
            }
        }
        let trackedMouse,nearCircles=[];
        function trackMouseVertex (event) {
            event.preventDefault();
            
            setSvgPoint(event);
            if (trackedMouse===false) {
                if (segmentLength(svgPoint.x,svgPoint.y,startMousePos[0],startMousePos[1])<2) return ;
                trackedMouse=true;
                $(graph.svgName).css({"border-color": "black"});
                if (addVertexDrag===true) {
                    let index=startIndex;
                    let oldCoords=[graph.svgVertices[index].coord[0], graph.svgVertices[index].coord[1]];
                    graph.svgVertices[index].coord=undefined;
                    let possiblePos=graph.calcPositions.calculatePossiblePos(false);
                    graph.svgVertices[index].coord=[oldCoords[0], oldCoords[1]];
                    for (let pos of possiblePos) {
                        let circleVertex=graph.s.circle(pos[0],pos[1],graph.vertexRad).attr({
                            stroke: "green",
                            "stroke-width": graph.findStrokeWidth(),
                            fill: "white",
                            "fill-opacity": 0.5
                        });
                        circleVertex.attr({opacity: 0});
                        let circle=graph.s.circle(pos[0]+(startMousePos[0]-graph.svgVertices[index].coord[0]),
                                                  pos[1]+(startMousePos[1]-graph.svgVertices[index].coord[1]),graph.vertexRad/2);
                        circle.attr({opacity: 0});
                        circle.mouseover(function () {
                            circleVertex.attr({opacity: 1});
                        });
                        circle.mouseout(function () {
                            circleVertex.attr({opacity: 0});
                        });
                        nearCircles.push([circleVertex,circle]);
                    }
                }
            }
            if (addVertexDrag===false) {
                let circleCoord=graph.svgVertices[startIndex].coord;
                let end=[svgPoint.x, svgPoint.y];
                if (segmentLength(circleCoord[0],circleCoord[1],svgPoint.x,svgPoint.y)>=graph.vertexRad) {
                    if (currEdgeDraw===undefined) {
                        currEdgeDraw=graph.drawEdge(circleCoord,end,-1,0);
                        currEdgeDraw.line.prependTo(graph.s);
                    }
                    else graph.redrawEdge(currEdgeDraw,circleCoord,end,-1);
                }
            }
            else {
                let dx=svgPoint.x-startMousePos[0],dy=svgPoint.y-startMousePos[1];
                graph.svgVertices[startIndex].group.transform("t"+dx+" "+dy);
                redrawEdges(dx,dy);
            }
        }
        let nearLine;
        function trackMouseEdge (event) {
            event.preventDefault();
            
            setSvgPoint(event);
            if ((trackedMouse===false)&&(segmentLength(svgPoint.x,svgPoint.y,startMousePos[0],startMousePos[1])<2)) return ;
            
            let x=graph.edgeList[startIndex].x,y=graph.edgeList[startIndex].y;
            if (x===y) {
                trackedMouse=true;
                return ;
            }
            let st=graph.svgVertices[x].coord,end=graph.svgVertices[y].coord;
            if (trackedMouse===false) {
                trackedMouse=true;
                $(graph.svgName).css({"border-color": "black"});
                graph.svgEdges[startIndex].drawProperties[0]=graph.svgEdges[startIndex].drawProperties[2];
                let endDist=graph.svgEdges[startIndex].endDist;
                graph.svgEdges[startIndex].endDist=0;
                graph.redrawEdge(graph.svgEdges[startIndex],st,end,startIndex);
                graph.svgEdges[startIndex].endDist=endDist;
                nearLine=graph.svgEdges[startIndex].line.clone();
                nearLine.attr({stroke: "green", "stroke-opacity": 0.5}).attr({opacity: 0});
                nearLine.attr({"marker-end": ""});
            }
            
            let area=orientedArea(st[0],st[1],end[0],end[1],svgPoint.x,svgPoint.y)/2*(-1);
            let height=area*2/segmentLength(st[0],st[1],end[0],end[1]);
            graph.svgEdges[startIndex].drawProperties[0]=height;
            graph.redrawEdge(graph.svgEdges[startIndex],st,end,startIndex);
            
            if (Math.abs(height-graph.svgEdges[startIndex].drawProperties[2])<graph.vertexRad/4) nearLine.attr({opacity: 1});
            else nearLine.attr({opacity: 0});
        }
        
        function clearVertexParameters () {
            if (addVertexDrag===false) {
                if (currEdgeDraw!==undefined) currEdgeDraw.line.remove();
                currEdgeDraw=undefined;
            }
            else {
                for (let circles of nearCircles) {
                    circles[0].remove();
                    circles[1].remove();
                }
                if ((drawProperties===undefined)&&(startIndex!==undefined)) {
                    graph.svgVertices[startIndex].group.transform("t0 0");
                    redrawEdges(0,0);
                }
            }
            nearCircles=[];
        }
        function clearEdgeParameters () {
            if (nearLine!==undefined) nearLine.remove();
            if ((drawProperties!==undefined)&&(startIndex!==undefined)) {
                let x=graph.edgeList[startIndex].x,y=graph.edgeList[startIndex].y;
                let st=graph.svgVertices[x].coord,end=graph.svgVertices[y].coord;
                graph.svgEdges[startIndex].drawProperties[0]=drawProperties;
                graph.redrawEdge(graph.svgEdges[startIndex],st,end,startIndex);
            }
        }
        function clearClickParameters (type) {
            if (type==="vertex") clearVertexParameters();
            else if (type==="edge") clearEdgeParameters();
            
            $(graph.svgName).css({"border-color": "transparent"});
            drawProperties=undefined; startIndex=undefined;
            trackedMouse=false;
            $(window).off("mousemove.mouse-out").off("touchmove.mouse-out");
            if (window.isMobile==="false") {
                graph.s.unmousemove((type==="vertex")?trackMouseVertex:trackMouseEdge);
                graph.s.unmouseup((type==="vertex")?mouseUpVertex:mouseUpEdge);
            }
            else {
                graph.s.untouchmove((type==="vertex")?trackMouseVertex:trackMouseEdge);
                graph.s.untouchend((type==="vertex")?mouseUpVertex:mouseUpEdge);
            }
        }
        
        function mouseUpVertex (event) {
            let index=startIndex;
            if (trackedMouse===false) { // click event
                clearClickParameters("vertex");
                if ((window.isMobile==="true")&&(graph.isDrawable===true)) 
                    vertexClick.call(graph.svgVertices[index].group,event);
                return ;
            }
            clearClickParameters("vertex");
            
            if (addVertexDrag===false) {
                for (let i=0; i<graph.n; i++) {
                    if (graph.vertices[i]===undefined) continue;
                    if (segmentLength(svgPoint.x,svgPoint.y,
                                      graph.svgVertices[i].coord[0],
                                      graph.svgVertices[i].coord[1])<graph.vertexRad) {
                        if ((index===i)&&
                            (segmentLength(svgPoint.x,svgPoint.y,startMousePos[0],startMousePos[1])<graph.vertexRad/2)) return ;
                        if ((graph.isMulti===false)&&(graph.adjMatrix[index][i].length>=1)) return ;
                        
                        if (graph.isMulti===true) {
                            if (index!==i) {
                                let maxEdges=(graph.isWeighted===true)?2:5;
                                if ((graph.isDirected===false)&&(graph.adjMatrix[index][i].length===maxEdges)) return ;
                                if ((graph.isDirected===true)&&
                                    (graph.adjMatrix[index][i].length+graph.adjMatrix[i][index].length===maxEdges)) 
                                    return ;
                            }
                            else {
                                if (graph.adjMatrix[index][i].length===2) return ;
                            }
                        }

                        let weight="";
                        if (graph.isWeighted===true) {
                            weight=prompt("Въведете тегло на реброто","1");
                            if (checkInteger(weight)===false) return ;
                            weight=parseInt(weight);
                            if (weight===0) return ;
                        }
                        let ind=graph.addEdge(index,i,weight);
                        if (graph.calcPositions.checkEdge(index,i,ind)===false) {
                            let oldCoords=[graph.svgVertices[i].coord[0], graph.svgVertices[i].coord[1]];
                            if (graph.graphController!==undefined) 
                                graph.graphController.addChange("new-pos",[i, oldCoords],false);
                            
                            graph.svgVertices[i].coord=undefined;
                            graph.calcPositions.calculatePossiblePos(true);
                            if (graph.calcPositions.placeVertex(i,false)===false) {
                                graph.svgVertices[i].coord=[oldCoords[0], oldCoords[1]];
                                graph.calcPositions.calc();
                            }
                            else if (graph.graphController!==undefined) graph.graphController.undoTime++;
                        }
                        graph.draw(graph.isDrawable);
                        break;
                    }
                }
            }
            else {
                let ind=index;
                let dx=svgPoint.x-startMousePos[0],dy=svgPoint.y-startMousePos[1];
                let oldCoords=[graph.svgVertices[ind].coord[0], graph.svgVertices[ind].coord[1]];
                graph.svgVertices[ind].coord=undefined;
                let possiblePos=graph.calcPositions.calculatePossiblePos(false);
                graph.svgVertices[ind].coord=[oldCoords[0]+dx, oldCoords[1]+dy];
                for (let pos of possiblePos) {
                    if (segmentLength(graph.svgVertices[ind].coord[0],graph.svgVertices[ind].coord[1],pos[0],pos[1])<graph.vertexRad/2) {
                        graph.svgVertices[ind].coord=[pos[0],pos[1]];
                        break;
                    }
                }
                if ((oldCoords[0]!=graph.svgVertices[ind].coord[0])||(oldCoords[1]!=graph.svgVertices[ind].coord[1])) {
                    if (graph.graphController!==undefined) 
                        graph.graphController.addChange("new-pos",[ind, [oldCoords[0], oldCoords[1]]]);
                }
                graph.draw(graph.isDrawable,false);
            }
        }
        function mouseUpEdge (event) {
            let index=startIndex;
            let height=graph.svgEdges[index].drawProperties[0];
            if (trackedMouse===false) { // click event
                clearClickParameters("edge");
                if ((window.isMobile==="true")&&(graph.isDrawable===true)) edgeClick.call(graph.svgEdges[index].line,event);
                return ;
            }
            clearClickParameters("edge");
            
            if (Math.abs(height-graph.svgEdges[index].drawProperties[2])<graph.vertexRad/4) height=undefined;
            let oldCurveHeight=graph.edgeList[index].curveHeight;
            if (oldCurveHeight!==height) {
                if (graph.graphController!==undefined)
                    graph.graphController.addChange("change-curve-height",[index, oldCurveHeight]);
            }
            
            graph.edgeList[index].curveHeight=height;
            graph.draw(graph.isDrawable,false);
        }
        
        function addCSS (obj, defaultCSS, newCSS, typeName, ind) {
            let oldCSS;
            if (typeName==="vertex") oldCSS=[graph.vertices[ind].addedCSS[0], graph.vertices[ind].addedCSS[1]];
            else oldCSS=[graph.edgeList[ind].addedCSS[0], graph.edgeList[ind].addedCSS[1]];
            if (graph.graphController!==undefined)
                graph.graphController.addChange("change-css-"+typeName,[ind, oldCSS]);
            obj.attr("style",defaultCSS+" ; "+newCSS);
        }
        function removeVertex (index) {
            for (let ind of graph.adjList[index]) {
                edgeClickAreas[ind].remove();
            }
            for (let ind of graph.reverseAdjList[index]) {
                edgeClickAreas[ind].remove();
            }
            graph.removeVertex(index);
            graph.graphChange("remove-vertex");
        }
        function changeVertexName (index) {
            let name=prompt((language==="bg")?"Въведете ново име на върха":"Input new name of the vertex"
                            ,graph.vertices[index].name);
            if (name===null) return ;
            if (graph.vertices[index].name!==name) {
                if (graph.graphController!==undefined)
                    graph.graphController.addChange("change-name",[index, graph.vertices[index].name]);

                graph.vertices[index].name=name;
                graph.drawVertexText(index,name);
                addVertexEvents(index);
                graph.graphChange("change-vertex-name");
            }
        }
        function addCSSVertex (index) {
            let css=prompt(
                ((language==="bg")?"Въведете CSS стил за върха":"Input CSS style for the vertex")+
                ((graph.vertices[index].addedCSS[0]==="")?
                 ((language==="bg")?" (например за червен цвят fill: red)":" (for example for red colour - fill: red)"):""),
                graph.vertices[index].addedCSS[0]
            );
            if (css===null) return ;
            css=objToStyle(styleToObj(css));
            if (graph.vertices[index].addedCSS[0]!==css)
                addCSS(graph.svgVertices[index].circle,graph.vertices[index].defaultCSS[0],css,"vertex",index);
            graph.vertices[index].addedCSS[0]=css;
        }
        function addCSSVertexName (index) {
            let css=prompt(
                ((language==="bg")?"Въведете CSS стил за името на върха":"Input CSS style for the name of the vertex")+
                ((graph.vertices[index].addedCSS[1]==="")?
                 ((language==="bg")?" (например за червен цвят fill: red)":" (for example for red colour - fill: red)"):""),
                graph.vertices[index].addedCSS[1]
            );
            if (css===null) return ;
            css=objToStyle(styleToObj(css));
            if (graph.vertices[index].addedCSS[1]!==css)
                addCSS(graph.svgVertices[index].text,graph.vertices[index].defaultCSS[1],css,"vertex",index);
            graph.vertices[index].addedCSS[1]=css;
        }
        function vertexClick (event) {
            if (trackedMouse===true) return ;
            if (graph.isDrawable===true) dropdowns[graph.wrapperName].menus["vertex"].find(".remove-vertex").show();
            else dropdowns[graph.wrapperName].menus["vertex"].find(".remove-vertex").hide();
            dropdowns[graph.wrapperName].showDropdown("vertex",event,this.index);
        }
                               
        function addNewVertex (event) {
            let ind;
            for (let i=0; i<=graph.n; i++) {
                if (graph.vertices[i]===undefined) {
                    ind=i;
                    break;
                }
            }
            let name=prompt((language==="bg")?"Въведете име на новия връх":"Input name of the new vertex",ind+1);
            if (name===null) return ;
            graph.addVertex(name);
            setSvgPoint(event);
            graph.svgVertices[ind].coord=[svgPoint.x, svgPoint.y];
            graph.drawVertex(ind);
            addVertexEvents(ind);
            graph.graphChange("add-vertex");
        }
        
        function removeEdge (index) {
            graph.removeEdge(index);
            graph.graphChange("remove-edge");
            edgeClickAreas[index].remove();
        }
        function changeEdgeWeight (index) {
            let weight=prompt((language==="bg")?"Въведете ново тегло на реброто":"Input new weight for the edge"
                              ,graph.edgeList[index].weight);
            if (checkInteger(weight)===false) return ;
            if (graph.edgeList[index].weight!==weight) {
                if (graph.graphController!==undefined)
                    graph.graphController.addChange("change-weight",[index, graph.edgeList[index].weight]);
                
                graph.edgeList[index].weight=weight;
                graph.svgEdges[index].line.remove();
                graph.svgEdges[index].weight.remove();
                let x=graph.edgeList[index].x,y=graph.edgeList[index].y;
                graph.svgEdges[index]=graph.drawEdge(graph.svgVertices[x].coord,graph.svgVertices[y].coord,index,
                                                     graph.svgEdges[index].drawProperties[0]);
                graph.svgEdges[index].line.prependTo(graph.s);
                graph.svgEdges[index].weight.prependTo(graph.s);
                addEdgeEvents(index);
            }
            graph.graphChange("change-weight");
        }
        function addCSSEdge (index) {
            let css=prompt(
                ((language==="bg")?"Въведете CSS стил за реброто":"Input CSS style for the edge")+
                ((graph.edgeList[index].addedCSS[0]==="")?
                 ((language==="bg")?" (например за червен цвят stroke: red)":" (for example for red colour - stroke: red)"):""),
                graph.edgeList[index].addedCSS[0]
            );
            if (css===null) return ;
            css=objToStyle(styleToObj(css));
            let edge=graph.svgEdges[index];
            if (graph.edgeList[index].addedCSS[0]!==css)
                addCSS(edge.line,graph.edgeList[index].defaultCSS[0],css,"edge",index);
            graph.edgeList[index].addedCSS[0]=css;
            if ((graph.isDirected===true)||(graph.isNetwork===true)) {
                let marker=edge.line.markerEnd;
                marker.attr("fill",graph.svgEdges[index].line.attr("stroke"));
            }
            if (graph.isWeighted===true) {
                if (graph.edgeList[index].addedCSS[1].indexOf("fill")===-1) {
                    graph.svgEdges[index].weight.attr("fill",graph.svgEdges[index].line.attr("stroke"));
                }
            }
        }
        function edgeClick (event) {
            if (trackedMouse===true) return ;
            let ind=this.index;
            if ((graph.isWeighted===true)&&(graph.isDrawable===true)) 
                dropdowns[graph.wrapperName].menus["edge"].find(".change-weight").show();
            else dropdowns[graph.wrapperName].menus["edge"].find(".change-weight").hide();
            if (graph.isNetwork===true) {
                if ((graph.edgeList[ind].real===true)&&(graph.isDrawable===true)) {
                    dropdowns[graph.wrapperName].menus["edge"].find(".remove-edge").show();
                    dropdowns[graph.wrapperName].menus["edge"].find(".change-weight").show();
                }
                else {
                    dropdowns[graph.wrapperName].menus["edge"].find(".remove-edge").hide();
                    dropdowns[graph.wrapperName].menus["edge"].find(".change-weight").hide();
                }
            }
            dropdowns[graph.wrapperName].showDropdown("edge",event,ind);
        }
        
        function addCSSWeight (index) {
            let css=prompt(
                ((language==="bg")?"Въведете CSS стил за теглото":"Input CSS style for the weight")+
                ((graph.edgeList[index].addedCSS[1]==="")?
                 ((language==="bg")?" (например за червен цвят fill: red)":" (for example for red colour - fill: red)"):""),
                graph.edgeList[index].addedCSS[1]
            );
            if (css===null) return ;
            css=objToStyle(styleToObj(css));
            let weight=graph.svgEdges[index].weight;
            if (graph.edgeList[index].addedCSS[1]!==css)
                addCSS(weight,graph.edgeList[index].defaultCSS[1],css,"edge",index);
            if (css.indexOf("fill")===-1) {
                weight.attr("fill",graph.svgEdges[index].line.attr("stroke"));
            }
            graph.edgeList[index].addedCSS[1]=css;
        }
        function weightClick (event) {
            if (trackedMouse===true) return ;
            let ind=this.index;
            if (graph.isNetwork===true) {
                if ((graph.edgeList[ind].real===true)&&(graph.isDrawable===true)) 
                    dropdowns[graph.wrapperName].menus["weight"].find(".change-weight").show();
                else dropdowns[graph.wrapperName].menus["weight"].find(".change-weight").hide();
            }
            dropdowns[graph.wrapperName].showDropdown("weight",event,ind);
        }

        function addVertexEvents (ind) {
            graph.svgVertices[ind].group.attr({cursor: "pointer"});
            graph.svgVertices[ind].group.type="vertex";
            graph.svgVertices[ind].group.index=ind;
            if (window.isMobile==="false") graph.svgVertices[ind].group.mousedown(mouseDown);
            else graph.svgVertices[ind].group.touchstart(mouseDown);
            graph.svgVertices[ind].group.click(vertexClick);
        }
        let edgeClickAreas=[];
        function addEdgeEvents (ind) {
            graph.svgEdges[ind].line.attr({cursor: "pointer"});
            graph.edgeList[ind].defaultCSS[0]+=" ; cursor: pointer";
            if (edgeClickAreas[ind]!==undefined) edgeClickAreas[ind].remove();
            let strokeWidth;
            if (graph.svgEdges[ind].drawProperties[1]===1) strokeWidth=20;
            else {
                if (graph.svgEdges[ind].drawProperties[0]===0) strokeWidth=graph.vertexRad*3/10;
                else strokeWidth=graph.vertexRad*3/10-2;
            }
            let clickArea=graph.s.path(graph.svgEdges[ind].line.attr("d")).attr({
                cursor: "pointer",
                "stroke-width": strokeWidth,
                "fill": "none",
                "stroke": "black",
                "stroke-opacity": 0
            });
            clickArea.addClass("click-area");
            edgeClickAreas[ind]=clickArea;
            clickArea.prependTo(graph.s);
            
            clickArea.type="edge";
            clickArea.index=ind;
            graph.svgEdges[ind].line.type="edge";
            graph.svgEdges[ind].line.index=ind;
            if (window.isMobile==="false") {
                clickArea.mousedown(mouseDown);
                graph.svgEdges[ind].line.mousedown(mouseDown);
            }
            else {
                clickArea.touchstart(mouseDown);
                graph.svgEdges[ind].line.touchstart(mouseDown);
            }
            clickArea.click(edgeClick);
            graph.svgEdges[ind].line.click(edgeClick);
            
            graph.svgEdges[ind].weight.index=ind;
            graph.svgEdges[ind].weight.attr({cursor: "pointer"});
            graph.edgeList[ind].defaultCSS[1]+=" ; cursor: pointer";
            graph.svgEdges[ind].weight.click(weightClick);
        }
        
        this.init = function () {
            this.clear();
            svgPoint=graph.s.paper.node.createSVGPoint();
            
            let menus=dropdowns[graph.wrapperName];
            menus.addNewDropdown("vertex",[
                ["remove-vertex", ((language==="bg")?"Изтрий върха":"Remove the vertex"), removeVertex],
                ["change-name", ((language==="bg")?"Промени името":"Change the name"), changeVertexName],
                ["add-css", ((language==="bg")?"Сложи CSS стил":"Add CSS style"), addCSSVertex],
                ["add-css-name", ((language==="bg")?"Сложи CSS стил на името":"Add CSS style for the name"), addCSSVertexName]
            ]);
            menus.addNewDropdown("edge",[
                ["remove-edge", ((language==="bg")?"Изтрий реброто":"Remove the edge"),removeEdge],
                ["change-weight", ((language==="bg")?"Промени теглото":"Change the weight"), changeEdgeWeight],
                ["add-css", ((language==="bg")?"Сложи CSS стил":"Add CSS style"), addCSSEdge]
            ]);
            menus.addNewDropdown("weight",[
                ["change-weight", ((language==="bg")?"Промени теглото":"Change the weight"), changeEdgeWeight],
                ["add-css", ((language==="bg")?"Сложи CSS стил":"Add CSS style"), addCSSWeight]
            ]);
            
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                addVertexEvents(i);
            }
            for (let i=0; i<graph.edgeList.length; i++) {
                if (graph.edgeList[i]===undefined) continue;
                addEdgeEvents(i);
            }
            let svgElement=$(graph.svgName);
            if (graph.isDrawable===true) {
                if (window.isMobile==="false") svgElement.off("dblclick").on("dblclick",addNewVertex);
                else {
                    let tapped=false;
                    svgElement.off("touchstart.add-vertex").on("touchstart.add-vertex",function (event) {
                        if (tapped===false) {
                            tapped=true;
                            setTimeout(() => {tapped = false},300);
                        }
                        else {
                            tapped=false;
                            addNewVertex(event);
                        }
                    });
                }
                if ($(graph.wrapperName+" .dragging-mini").length!==0) {
                    let dragSwitch=$(graph.wrapperName+" .dragging-mini");
                    dragSwitch.show();
                    if ((addVertexDrag===true)&&(dragSwitch.val()==="off")) {
                        dragSwitch.val("on");
                        dragSwitch.parent().prop("title",(language==="bg")?"Чертаене на ребра":"Drawing edges");
                    }
                    else if ((addVertexDrag===false)&&(dragSwitch.val()==="on")) {
                        dragSwitch.val("off");
                        dragSwitch.parent().prop("title",(language==="bg")?"Преместване на върховете":"Moving the vertices");
                    }
                    $(graph.wrapperName+" .dragging-mini").off("click").on("click",function () {
                        if (addVertexDrag===true) {
                            addVertexDrag=false;
                            dragSwitch.parent().prop("title",(language==="bg")?"Преместване на върховете":"Moving the vertices");
                        }
                        else {
                            addVertexDrag=true;
                            dragSwitch.parent().prop("title",(language==="bg")?"Чертаене на ребра":"Drawing edges");
                        }
                    }.bind(this));
                }
                else {
                    $(graph.wrapperName+" .settings").off("click.draw-settings").on("click.draw-settings",this.addSettings.bind(this));
                }
            }
            else {
                addVertexDrag=true;
                $(graph.wrapperName+" .dragging-mini").hide();
            }
        }
        this.clear = function () {
            let svgElement=$(graph.svgName);
            svgElement.off("dblclick");
            svgElement.off("touchstart.add-vertex");
            if ($(graph.wrapperName+" .dragging-mini").length!==0) $(graph.wrapperName+" .dragging-mini").off("click");
            else $(graph.wrapperName+" .settings").off("click.draw-settings");
            
            clearVertexParameters();
            clearEdgeParameters();
            clearClickParameters("vertex&edge");
            
            for (let i=0; i<graph.n; i++) {
                if ((graph.vertices[i]===undefined)||(graph.svgVertices[i]===undefined)||(graph.svgVertices[i].group===undefined))
                    continue;
                graph.svgVertices[i].group.attr({cursor: "auto"});
                delete graph.svgVertices[i].group.type;
                delete graph.svgVertices[i].group.index;
                if (window.isMobile==="false") graph.svgVertices[i].group.unmousedown(mouseDown);
                else graph.svgVertices[i].group.untouchstart(mouseDown);
                graph.svgVertices[i].group.unclick(vertexClick);
            }
            for (let i=0; i<graph.edgeList.length; i++) {
                if (edgeClickAreas[i]!==undefined) edgeClickAreas[i].remove();
                if ((graph.edgeList[i]===undefined)||(graph.svgEdges[i]===undefined)) continue;
                
                graph.svgEdges[i].line.attr({cursor: "auto"});
                delete graph.svgEdges[i].line.type;
                delete graph.svgEdges[i].line.index;
                if (window.isMobile==="false") graph.svgEdges[i].line.unmousedown(mouseDown);
                else graph.svgEdges[i].line.untouchstart(mouseDown);
                graph.svgEdges[i].line.unclick(edgeClick);
                if (graph.svgEdges[i].weight!==undefined) {
                    delete graph.svgEdges[i].weight.index;
                    graph.svgEdges[i].weight.attr({cursor: "auto"});
                    graph.svgEdges[i].weight.unclick(weightClick);
                }
            }
            $(".click-area").remove();
            edgeClickAreas=[];
        }
        
        this.addSettings = function () {
            if (addVertexDrag===false) $("#edgeDraw").click();
            else $("#vertexMove").click();
            $("#edgeDraw").off("click").on("click",function () {
                addVertexDrag=false;
            }.bind(this));
            $("#vertexMove").off("click").on("click",function () {
                addVertexDrag=true;
            }.bind(this));
        }
    }
    
    
    window.DrawableGraph = DrawableGraph;
})();