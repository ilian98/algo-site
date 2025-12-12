(function () {
    "use strict";
    function checkInteger (s) {
        if (s===null) return false;
        if (s.length===0) return false;
        for (let c of s) {
            if ((c<'0')||(c>'9')) return false;
        }
        return true;
    }
    window.checkWeightValue = checkInteger;
    function isMobile (event) {
        return (event.type==="touchstart")||(event.type==="touchmove")||(event.type==="touchend");
    }
    function getObjectForCoordinates (event) {
        if (isMobile(event)===false) return event;
        else if (event.changedTouches!==undefined) return event.changedTouches[0];
        else if (event.touches!==undefined) return event.touches[0];
        else return event;
    }
    
    function DynamicGraph (graph) {
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
        
        let addVertexDrag=false,startIndex;
        let currEdgeDraw;
        let startMousePos;
        let drawProperties;
        
        function redrawEdges (dx, dy) {
            let coords=[graph.svgVertices[startIndex].coord[0]+dx,
                        graph.svgVertices[startIndex].coord[1]+dy];
            function redrawEdge (ind) {
                let edge=graph.getEdge(ind);
                let otherEnd=edge.findEndPoint(startIndex);
                let otherCoords=[graph.svgVertices[otherEnd].coord[0], graph.svgVertices[otherEnd].coord[1]];
                if (edge.x===startIndex) 
                    graph.graphDrawer.redrawEdge(graph.svgEdges[ind],[coords[0], coords[1]],otherCoords,ind);
                else graph.graphDrawer.redrawEdge(graph.svgEdges[ind],otherCoords,[coords[0], coords[1]],ind);
            }
            for (let ind of graph.adjList[startIndex]) {
                if (graph.svgEdges[ind]!==undefined) redrawEdge(ind);
            }
            for (let ind of graph.reverseAdjList[startIndex]) {
                if (graph.svgEdges[ind]!==undefined) redrawEdge(ind);
            }
        }
        
        let trackedMouse;
        function mouseDown (obj, event) {
            let type=obj.objType,index=obj.index;
            
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
            if (isMobile(event)===false) $(window).off("mousemove.mouse-out").on("mousemove.mouse-out",mouseOut);
            else $(window).off("touchmove.mouse-out").on("touchmove.mouse-out",mouseOut);
            
            if (isMobile(event)===false) {
                if (event.button!==0) return ;
                if (type==="vertex") {
                    graph.s.mousemove(trackMouseVertex);
                    graph.s.mouseup(mouseUpVertex);
                }
                else if (type==="edge") {
                    graph.s.mousemove(trackMouseEdge);
                    graph.s.mouseup(mouseUpEdge);
                }
                else {
                    graph.s.mousemove(trackMouseWeight);
                    graph.s.mouseup(mouseUpWeight);
                }
            }
            else {
                if (type==="vertex") {
                    graph.s.touchmove(trackMouseVertex);
                    graph.s.touchend(mouseUpVertex);
                }
                else if (type==="edge") {
                    graph.s.touchmove(trackMouseEdge);
                    graph.s.touchend(mouseUpEdge);
                }
                else {
                    graph.s.touchmove(trackMouseWeight);
                    graph.s.touchend(mouseUpWeight);
                }
            }
        }
        let nearCircles=[];
        function trackMouseVertex (event) {
            event.preventDefault();
            
            setSvgPoint(event);
            let vertexRad=graph.graphDrawer.findAttrValue("vertex","r",startIndex);
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
                        let circleVertex=graph.s.circle(pos[0],pos[1],vertexRad).attr({
                            stroke: "green",
                            "stroke-width": graph.graphDrawer.findAttrValue("vertex","stroke-width"),
                            fill: "white"
                        });
                        circleVertex.attr({opacity: 0.2});
                        let circle=graph.s.circle(pos[0]+(startMousePos[0]-graph.svgVertices[index].coord[0]),
                                                  pos[1]+(startMousePos[1]-graph.svgVertices[index].coord[1]),vertexRad/2);
                        circle.attr({opacity: 0});
                        circle.mouseover(function (circleVertex) {
                            circleVertex.attr({opacity: 0.9});
                        }.bind(null,circleVertex));
                        circle.mouseout(function (circleVertex) {
                            circleVertex.attr({opacity: 0.2});
                        }.bind(null,circleVertex));
                        nearCircles.push([circleVertex,circle]);
                    }
                }
            }
            if (addVertexDrag===false) {
                let circleCoord=graph.svgVertices[startIndex].coord;
                let end=[svgPoint.x, svgPoint.y];
                if (segmentLength(circleCoord[0],circleCoord[1],svgPoint.x,svgPoint.y)>=vertexRad) {
                    if (currEdgeDraw===undefined) {
                        currEdgeDraw=graph.graphDrawer.drawEdge(circleCoord,end);
                        graph.graphDrawer.setBack(currEdgeDraw.line);
                    }
                    else graph.graphDrawer.redrawEdge(currEdgeDraw,circleCoord,end,-1);
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
            
            let edge=graph.getEdge(startIndex);
            let x=edge.x,y=edge.y;
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
                graph.graphDrawer.redrawEdge(graph.svgEdges[startIndex],st,end,startIndex);
                graph.svgEdges[startIndex].endDist=endDist;
                nearLine=graph.svgEdges[startIndex].line.clone();
                nearLine.attr({stroke: "green", opacity: 0.2, "marker-end": ""});
            }
            
            let area=orientedArea(st[0],st[1],end[0],end[1],svgPoint.x,svgPoint.y)/2*(-1);
            let height=area*2/segmentLength(st[0],st[1],end[0],end[1]);
            graph.svgEdges[startIndex].drawProperties[0]=height;
            graph.graphDrawer.redrawEdge(graph.svgEdges[startIndex],st,end,startIndex);
            
            if (Math.abs(height-graph.svgEdges[startIndex].drawProperties[2])<5*graph.size) nearLine.attr({opacity: 0.9});
            else nearLine.attr({opacity: 0.2});
        }
        let oldWeight;
        function trackMouseWeight (event) {
            event.preventDefault();
            
            let edge=graph.getEdge(startIndex);
            setSvgPoint(event);
            if (trackedMouse===false) {
                trackedMouse=true;
                $(graph.svgName).css({"border-color": "black"});
                oldWeight=graph.svgEdges[startIndex].weight.clone();
                oldWeight.attr({fill: "green", opacity: 0.2});
                oldWeight.transform("t0 0r"+edge.weightRotation);
            }
            let dx=edge.weightTranslate[0]+svgPoint.x-startMousePos[0],dy=edge.weightTranslate[1]+svgPoint.y-startMousePos[1];
            graph.translateWeight(startIndex,dx,dy);
            if (Math.sqrt(dx*dx+dy*dy)<5*graph.size) oldWeight.attr({opacity: 0.9});
            else oldWeight.attr({opacity: 0.2});
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
                let edge=graph.getEdge(startIndex);
                let x=edge.x,y=edge.y;
                let st=graph.svgVertices[x].coord,end=graph.svgVertices[y].coord;
                graph.svgEdges[startIndex].drawProperties[0]=drawProperties;
                graph.graphDrawer.redrawEdge(graph.svgEdges[startIndex],st,end,startIndex);
            }
        }
        function clearWeightParameters () {
            if (oldWeight!==undefined) oldWeight.remove();
            if (startIndex!==undefined) {
                let edge=graph.getEdge(startIndex);
                graph.translateWeight(startIndex,edge.weightTranslate[0],edge.weightTranslate[1]);
            }
        }
        function clearClickParameters (type) {
            if (type==="vertex") clearVertexParameters();
            else if (type==="edge") clearEdgeParameters();
            else if (type==="weight") clearWeightParameters();
            
            $(graph.svgName).css({"border-color": "transparent"});
            drawProperties=undefined; startIndex=undefined;
            $(window).off("mousemove.mouse-out").off("touchmove.mouse-out");
            if (type==="vertex") {
                graph.s.unmousemove(trackMouseVertex);
                graph.s.unmouseup(mouseUpVertex);
                graph.s.untouchmove(trackMouseVertex);
                graph.s.untouchend(mouseUpVertex);
            }
            else if (type==="edge") {
                graph.s.unmousemove(trackMouseEdge);
                graph.s.unmouseup(mouseUpEdge);
                graph.s.untouchmove(trackMouseEdge);
                graph.s.untouchend(mouseUpEdge);
            }
            else {
                graph.s.unmousemove(trackMouseWeight);
                graph.s.unmouseup(mouseUpWeight);
                graph.s.untouchmove(trackMouseWeight);
                graph.s.untouchend(mouseUpWeight);
            }
        }
        
        function mouseUpVertex (event) {
            let index=startIndex;
            if (trackedMouse===false) { // click event
                clearClickParameters("vertex");
                if ((isMobile(event)===true)&&(graph.graphDrawer.isDynamic===true)) 
                    vertexClick(graph.svgVertices[index].group,event);
                return ;
            }
            clearClickParameters("vertex");
            
            if (addVertexDrag===false) {
                let vertexRad=graph.graphDrawer.findAttrValue("vertex","r",index);
                for (let [i, vr] of graph.getVertices()) {
                    if (segmentLength(svgPoint.x,svgPoint.y,
                                      graph.svgVertices[i].coord[0],
                                      graph.svgVertices[i].coord[1])<vertexRad) {
                        if ((index===i)&&
                            (segmentLength(svgPoint.x,svgPoint.y,startMousePos[0],startMousePos[1])<vertexRad/2)) return ;
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
                            if (checkWeightValue(weight)===false) return ;
                            if (checkWeightValue===checkInteger) weight=parseInt(weight);
                            if (weight===0) return ;
                        }
                        let ind=graph.addEdge(index,i,weight);
                        graph.graphDrawer.draw(graph.graphDrawer.isDynamic);
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
                        graph.graphDrawer.draw(graph.graphDrawer.isDynamic);
                        graph.graphChange("add-edge");
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
                    if (segmentLength(graph.svgVertices[ind].coord[0],graph.svgVertices[ind].coord[1],pos[0],pos[1])<10*graph.size) {
                        graph.svgVertices[ind].coord=[pos[0],pos[1]];
                        break;
                    }
                }
                if ((oldCoords[0]!=graph.svgVertices[ind].coord[0])||(oldCoords[1]!=graph.svgVertices[ind].coord[1])) {
                    if (graph.graphController!==undefined) 
                        graph.graphController.addChange("new-pos",[ind, [oldCoords[0], oldCoords[1]]]);
                    graph.graphChange("new-pos");
                }
                graph.graphDrawer.draw(graph.graphDrawer.isDynamic,false);
            }
        }
        function mouseUpEdge (event) {
            let index=startIndex;
            let height=graph.svgEdges[index].drawProperties[0];
            if (trackedMouse===false) { // click event
                clearClickParameters("edge");
                if ((isMobile(event)===true)&&(graph.graphDrawer.isDynamic===true)) edgeClick(graph.svgEdges[index].line,event);
                return ;
            }
            clearClickParameters("edge");
            
            if (Math.abs(height-graph.svgEdges[index].drawProperties[2])<5*graph.size) height=undefined;
            let edge=graph.getEdge(index);
            let oldCurveHeight=edge.curveHeight;
            if (oldCurveHeight!==height) {
                if (graph.graphController!==undefined)
                    graph.graphController.addChange("change-curve-height",[index, oldCurveHeight]);
            }
            
            edge.curveHeight=height;
            graph.graphDrawer.draw(graph.graphDrawer.isDynamic,false);
        }
        function mouseUpWeight (event) {
            event.preventDefault();
            
            let index=startIndex;
            let edge=graph.getEdge(index);
            let weightTranslate=edge.weightTranslate;
            if (trackedMouse===false) { // click event
                clearClickParameters("weight");
                if ((isMobile(event)===true)&&(graph.graphDrawer.isDynamic===true)) weightClick(graph.svgEdges[index].weight,event);
                return ;
            }
            let dx=weightTranslate[0]+svgPoint.x-startMousePos[0],dy=weightTranslate[1]+svgPoint.y-startMousePos[1];
            clearClickParameters("weight");
            
            if (Math.sqrt(dx*dx+dy*dy)<5*graph.size) {
                graph.translateWeight(index,0,0);
                dx=dy=0;
            }
            let oldWeightTranslate=edge.weightTranslate;
            if ((oldWeightTranslate[0]!==dx)||(oldWeightTranslate[1]!==dy)) {
                if (graph.graphController!==undefined) 
                        graph.graphController.addChange("change-weight-translate",[index, [oldWeightTranslate[0], oldWeightTranslate[1]]]);
                graph.getEdge(index).weightTranslate=[dx, dy];
                graph.translateWeight(index,dx,dy);
                graph.graphChange("change-weight-translate");
            }
        }
        
        function addCSS (obj, newCSS, typeName, ind) {
            let oldCSS;
            if ((typeName==="vertex")||(typeName==="edge")) oldCSS=obj.userCSS[0];
            else oldCSS=obj.userCSS[1];
            if (graph.graphController!==undefined) graph.graphController.addChange("change-css-"+typeName,[ind, oldCSS]);
            if (typeName==="vertex") obj.userCSS[0]=styleToObj(newCSS);
            else if (typeName==="vertex-name") obj.userCSS[1]=styleToObj(newCSS);
            else if (typeName==="edge") obj.userCSS[0]=styleToObj(newCSS);
            else if (typeName==="weight") obj.userCSS[1]=styleToObj(newCSS);
            graph.graphDrawer.draw(graph.graphDrawer.isDynamic);
        }
        this.removeVertex = function (index) {
            for (let ind of graph.adjList[index]) {
                edgeClickAreas[ind].remove();
            }
            for (let ind of graph.reverseAdjList[index]) {
                edgeClickAreas[ind].remove();
            }
            graph.removeVertex(index);
            graph.graphChange("remove-vertex");
        };
        function changeVertexName (index) {
            let vr=graph.getVertex(index);
            let name=prompt((language==="bg")?"Въведете ново име на върха":"Input new name of the vertex",vr.name);
            if (name===null) return ;
            if (vr.name!==name) {
                if (graph.graphController!==undefined)
                    graph.graphController.addChange("change-name",[index, vr.name]);

                vr.name=name;
                graph.graphDrawer.drawVertexText(index,name);
                addVertexEvents(index);
                graph.graphChange("change-vertex-name");
            }
        }
        this.addCSSVertex = function (index, css) {
            let vr=graph.getVertex(index);
            if (css===undefined)
                css=prompt(
                    ((language==="bg")?"Въведете CSS стил за върха":"Input CSS style for the vertex")+
                    ((Object.keys(vr.userCSS[0]).length===0)?
                     ((language==="bg")?" (например за червен цвят fill: red)":" (for example for red colour - fill: red)"):""),
                    objToStyle(vr.userCSS[0])
                );
            else css=vr.userCSS[0]+" ; "+css;
            if (css===null) return ;
            if (vr.userCSS[0]!==css) addCSS(vr,css,"vertex",index);
        };
        this.addCSSVertexName = function (index, css) {
            let vr=graph.getVertex(index);
            if (css===undefined) 
                css=prompt(
                    ((language==="bg")?"Въведете CSS стил за името на върха":"Input CSS style for the name of the vertex")+
                    ((Object.keys(vr.userCSS[1]).length===0)?
                     ((language==="bg")?" (например за червен цвят fill: red)":" (for example for red colour - fill: red)"):""),
                    objToStyle(vr.userCSS[1])
                );
            else css=vr.userCSS[1]+" ; "+css;
            if (css===null) return ;
            if (vr.userCSS[1]!==css) addCSS(vr,css,"vertex-name",index);
        };
        function vertexClick (obj, event) {
            if (trackedMouse===true) return ;
            if (graph.graphDrawer.isDynamic===true) {
                dropdowns[graph.wrapperName].menus.vertex.find(".remove-vertex").show();
                dropdowns[graph.wrapperName].menus.vertex.find(".change-name").show();
            }
            else {
                dropdowns[graph.wrapperName].menus.vertex.find(".remove-vertex").hide();
                dropdowns[graph.wrapperName].menus.vertex.find(".change-name").hide();
            }
            dropdowns[graph.wrapperName].showDropdown("vertex",event,obj.index);
        }
                               
        this.addNewVertex = function (event, name) {
            let ind;
            for (let i=0; ; i++) {
                if (graph.getVertex(i)===undefined) {
                    ind=i;
                    break;
                }
            }
            let flag=false;
            if (name===undefined) {
                name=prompt((language==="bg")?"Въведете име на новия връх":"Input name of the new vertex",ind+1);
                flag=true;
            }
            if (name===null) return ;
            graph.addVertex(name);
            if (flag===true) {
                setSvgPoint(event);
                graph.svgVertices[ind].coord=[svgPoint.x, svgPoint.y];
                graph.graphDrawer.drawVertex(ind);
                addVertexEvents(ind);
            }
            else {
                graph.calcPositions.calculatePossiblePos(true);
                if (graph.calcPositions.placeVertex(ind,false)===false) {
                    graph.svgVertices[ind].coord=[0, 0];
                    graph.calcPositions.calc();
                    graph.graphDrawer.draw(graph.graphDrawer.isDynamic);
                }
                else {
                    graph.graphDrawer.drawVertex(ind);
                    addVertexEvents(ind);
                }
            }
            graph.graphChange("add-vertex");
        };
        
        this.removeEdge = function (index) {
            graph.removeEdge(index);
            edgeClickAreas[index].remove();
            graph.graphChange("remove-edge");
        };
        this.changeEdgeWeight = function (index, weight) {
            let edge=graph.getEdge(index);
            if (weight===undefined) 
                weight=prompt((language==="bg")?"Въведете ново тегло на реброто":"Input new weight for the edge",edge.weight);
            if (checkWeightValue(weight)===false) return ;
            if (edge.weight!==weight) {
                if (graph.graphController!==undefined)
                    graph.graphController.addChange("change-weight",[index, edge.weight]);
                
                edge.weight=weight;
                graph.svgEdges[index].line.remove();
                graph.svgEdges[index].weight.remove();
                let x=edge.x,y=edge.y;
                graph.svgEdges[index]=graph.graphDrawer.drawEdge(graph.svgVertices[x].coord,graph.svgVertices[y].coord,index,
                                                     graph.svgEdges[index].drawProperties);
                graph.graphDrawer.setBack(graph.svgEdges[index].line);
                graph.graphDrawer.setBack(graph.svgEdges[index].weight);
                addEdgeEvents(index);
            }
            graph.graphChange("change-weight");
        };
        this.addCSSEdge = function (index, css) {
            let edge=graph.getEdge(index);
            if (css===undefined)
                css=prompt(
                    ((language==="bg")?"Въведете CSS стил за реброто":"Input CSS style for the edge")+
                    ((Object.keys(edge.userCSS[0]).length===0)?
                     ((language==="bg")?" (например за червен цвят stroke: red)":" (for example for red colour - stroke: red)"):""),
                    objToStyle(edge.userCSS[0])
                );
            else css=edge.userCSS[0]+" ; "+css;
            if (css===null) return ;
            let svgEdge=graph.svgEdges[index];
            if (edge.userCSS[0]!==css) addCSS(edge,css,"edge",index);
        };
        function edgeClick (obj, event) {
            if (trackedMouse===true) return ;
            let ind=obj.index;
            if (graph.isNetwork===true) {
                if ((graph.getEdge(ind).real===true)&&(graph.graphDrawer.isDynamic===true)) {
                    dropdowns[graph.wrapperName].menus.edge.find(".remove-edge").show();
                    dropdowns[graph.wrapperName].menus.edge.find(".change-weight").show();
                }
                else {
                    dropdowns[graph.wrapperName].menus.edge.find(".remove-edge").hide();
                    dropdowns[graph.wrapperName].menus.edge.find(".change-weight").hide();
                }
            }
            else {
                if ((graph.isWeighted===true)&&(graph.graphDrawer.isDynamic===true)) 
                    dropdowns[graph.wrapperName].menus.edge.find(".change-weight").show();
                else dropdowns[graph.wrapperName].menus.edge.find(".change-weight").hide();
                if (graph.graphDrawer.isDynamic===true) dropdowns[graph.wrapperName].menus.edge.find(".remove-edge").show();
                else dropdowns[graph.wrapperName].menus.edge.find(".remove-edge").hide();
            }
            dropdowns[graph.wrapperName].showDropdown("edge",event,ind);
        }
        
        this.changeRotationWeight = function (index, rotation) {
            let edge=graph.getEdge(index);
            if (rotation===undefined)
                rotation=prompt(
                    ((language==="bg")?"Въведете число от 0 до 360 градуса за ъгъла на ротацията или използвайте стрелките при натиснато ребро":"Input number from 0 to 360 degrees for the rotation or use keyboards arrows when the weight is clicked"),
                    edge.weightRotation
                );
            if (rotation===null) return ;
            if (graph.graphController!==undefined) graph.graphController.addChange("change-weight-rotation",[index, edge.weightRotation]);
            rotation=parseInt(rotation);
            if ((rotation<0)||(rotation>360)) return ;
            graph.rotateWeight(index,rotation);
            edge.weightRotation=rotation;
            graph.graphChange("change-weight-rotation");
        };
        this.addCSSWeight = function (index, css) {
            let edge=graph.getEdge(index);
            if (css===undefined)
                css=prompt(
                    ((language==="bg")?"Въведете CSS стил за теглото":"Input CSS style for the weight")+
                    ((Object.keys(edge.userCSS[1]).length===0)?
                     ((language==="bg")?" (например за червен цвят fill: red)":" (for example for red colour - fill: red)"):""),
                    objToStyle(edge.userCSS[1])
                );
            else css=edge.userCSS[1]+" ; "+css;
            if (css===null) return ;
            let weight=graph.svgEdges[index].weight;
            if (edge.userCSS[1]!==css) addCSS(edge,css,"weight",index);
        };
        function weightClick (obj, event) {
            if (trackedMouse===true) return ;
            let ind=obj.index;
            if (((graph.isNetwork===true)&&(graph.getEdge(ind).real===true)&&(graph.graphDrawer.isDynamic===true))||
                ((graph.isNetwork===false)&&(graph.graphDrawer.isDynamic===true))) {
                dropdowns[graph.wrapperName].menus.weight.find(".change-weight").show();
            }
            else dropdowns[graph.wrapperName].menus.weight.find(".change-weight").hide();
            let flag=false;
            $(document).off("keydown.w").on("keydown.w",(e) => {
                if (dropdowns[graph.wrapperName].menus.weight.is(":hidden")) return ;
                if (e.keyCode===37) {
                    let edge=graph.getEdge(ind);
                    if ((flag===false)&&(graph.graphController!==undefined)) {
                        flag=true;
                        graph.graphController.addChange("change-weight-rotation",[ind, edge.weightRotation]);    
                    }
                    edge.weightRotation++;
                    graph.rotateWeight(ind,edge.weightRotation);
                    graph.graphChange("change-weight-rotation");
                }
                else if (e.keyCode===39) {
                    let edge=graph.getEdge(ind);
                    if ((flag===false)&&(graph.graphController!==undefined)) {
                        flag=true;
                        graph.graphController.addChange("change-weight-rotation",[ind, edge.weightRotation]);
                    }
                    edge.weightRotation--;
                    graph.rotateWeight(ind,edge.weightRotation);
                    graph.graphChange("change-weight-rotation");
                }
            });
            dropdowns[graph.wrapperName].showDropdown("weight",event,ind);
        }

        function addVertexEvents (ind) {
            graph.svgVertices[ind].group.attr({cursor: "pointer"});
            graph.svgVertices[ind].group.objType="vertex";
            graph.svgVertices[ind].group.index=ind;
            graph.svgVertices[ind].group.mousedown(mouseDown.bind(null,graph.svgVertices[ind].group));
            graph.svgVertices[ind].group.touchstart(mouseDown.bind(null,graph.svgVertices[ind].group));
            graph.svgVertices[ind].group.click(vertexClick.bind(null,graph.svgVertices[ind].group));
        }
        let edgeClickAreas=[];
        function addEdgeEvents (ind) {
            graph.svgEdges[ind].line.attr({cursor: "pointer"});
            if (edgeClickAreas[ind]!==undefined) edgeClickAreas[ind].remove();
            let strokeWidth=graph.graphDrawer.findAttrValue("edge","stroke-width",ind);
            if (graph.svgEdges[ind].drawProperties[1]===1) strokeWidth*=10;
            else {
                if (graph.svgEdges[ind].drawProperties[0]===0) strokeWidth*=10;
                else strokeWidth*=5;
            }
            let clickArea=graph.s.path(graph.svgEdges[ind].line.attr("d")).attr({
                cursor: "pointer",
                "stroke-width": strokeWidth,
                "fill": "none",
                "stroke": "black",
                "opacity": 0
            });
            clickArea.addClass("click-area");
            edgeClickAreas[ind]=clickArea;
            graph.graphDrawer.setBack(clickArea);
            
            clickArea.objType="edge";
            clickArea.index=ind;
            graph.svgEdges[ind].line.objType="edge";
            graph.svgEdges[ind].line.index=ind;
            clickArea.mousedown(mouseDown.bind(null,clickArea));
            clickArea.touchstart(mouseDown.bind(null,clickArea));
            graph.svgEdges[ind].line.mousedown(mouseDown.bind(null,graph.svgEdges[ind].line));
            graph.svgEdges[ind].line.touchstart(mouseDown.bind(null,graph.svgEdges[ind].line));
            clickArea.click(edgeClick.bind(null,clickArea));
            graph.svgEdges[ind].line.click(edgeClick.bind(null,graph.svgEdges[ind].line));
            
            if (graph.svgEdges[ind].weight!==undefined) {
                graph.svgEdges[ind].weight.attr({cursor: "pointer"});
                graph.svgEdges[ind].weight.objType="weight";
                graph.svgEdges[ind].weight.index=ind;
                graph.svgEdges[ind].weight.mousedown(mouseDown.bind(null,graph.svgEdges[ind].weight));
                graph.svgEdges[ind].weight.touchstart(mouseDown.bind(null,graph.svgEdges[ind].weight));
                graph.svgEdges[ind].weight.click(weightClick.bind(null,graph.svgEdges[ind].weight));
            }
        }
        
        this.init = function () {
            this.clear();
            svgPoint=graph.s.paper.node.createSVGPoint();
            
            let menus=dropdowns[graph.wrapperName];
            menus.addNewDropdown("vertex",[
                ["remove-vertex", ((language==="bg")?"Изтрий върха":"Remove the vertex"), this.removeVertex],
                ["change-name", ((language==="bg")?"Промени името":"Change the name"), changeVertexName],
                ["add-css", ((language==="bg")?"Сложи CSS стил":"Add CSS style"), this.addCSSVertex],
                ["add-css-name", ((language==="bg")?"Сложи CSS стил на името":"Add CSS style for the name"), this.addCSSVertexName]
            ]);
            menus.addNewDropdown("edge",[
                ["remove-edge", ((language==="bg")?"Изтрий реброто":"Remove the edge"), this.removeEdge],
                ["change-weight", ((language==="bg")?"Промени теглото":"Change the weight"), this.changeEdgeWeight],
                ["add-css", ((language==="bg")?"Сложи CSS стил":"Add CSS style"), this.addCSSEdge]
            ]);
            menus.addNewDropdown("weight",[
                ["change-weight", ((language==="bg")?"Промени теглото":"Change the weight"), this.changeEdgeWeight],
                ["change-rotation", ((language==="bg")?"Промени ротацията":"Change rotation"), this.changeRotationWeight],
                ["add-css", ((language==="bg")?"Сложи CSS стил":"Add CSS style"), this.addCSSWeight]
            ]);
            
            for (let [i, vr] of graph.getVertices()) {
                addVertexEvents(i);
            }
            for (let [i, edge] of graph.getEdges()) {
                if (graph.svgEdges[i]!==undefined) addEdgeEvents(i);
            }
            let svgElement=$(graph.svgName);
            if (graph.graphDrawer.isDynamic===true) {
                let addNewVertex=this.addNewVertex;
                const tapped=[false, false],coords=[[], []];
                svgElement.off("mousedown.add-vertex touchstart.add-vertex").on("mousedown.add-vertex touchstart.add-vertex",function (event) {
                    const type=+isMobile(event);
                    const touch=getObjectForCoordinates(event);
                    if (tapped[type]===false) {
                        tapped[type]=true;
                        coords[type]=[touch.clientX, touch.clientY];
                        setTimeout(() => {tapped[type] = false;},300);
                    }
                    else {
                        tapped[type]=false;
                        if (tapped[1-type]===false) {
                            if (segmentLength(coords[type][0],coords[type][1],touch.clientX,touch.clientY)<20) addNewVertex.call(this,event);
                        }
                    }
                });
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
                    });
                }
                else {
                    $(graph.wrapperName+" .settings").off("click.draw-settings").on("click.draw-settings",this.addSettings);
                }
            }
            else {
                addVertexDrag=true;
                $(graph.wrapperName+" .dragging-mini").hide();
            }
        };
        this.clear = function () {
            let svgElement=$(graph.svgName);
            svgElement.off("mousedown.add-vertex touchstart.add-vertex");
            if ($(graph.wrapperName+" .dragging-mini").length!==0) $(graph.wrapperName+" .dragging-mini").off("click");
            else $(graph.wrapperName+" .settings").off("click.draw-settings");
            
            clearVertexParameters();
            clearEdgeParameters();
            clearClickParameters("vertex&edge");
            
            for (let [i, vr] of graph.getVertices()) {
                if ((graph.svgVertices[i]===undefined)||(graph.svgVertices[i].group===undefined)) continue;
                graph.svgVertices[i].group.attr({cursor: "auto"});
                delete graph.svgVertices[i].group.objType;
                delete graph.svgVertices[i].group.index;
                graph.svgVertices[i].group.unmousedown(mouseDown);
                graph.svgVertices[i].group.untouchstart(mouseDown);
                graph.svgVertices[i].group.unclick(vertexClick);
            }
            for (let [i, edge] of graph.getEdges()) {
                if (edgeClickAreas[i]!==undefined) edgeClickAreas[i].remove();
                if (graph.svgEdges[i]===undefined) continue;
                
                graph.svgEdges[i].line.attr({cursor: "auto"});
                delete graph.svgEdges[i].line.objType;
                delete graph.svgEdges[i].line.index;
                graph.svgEdges[i].line.unmousedown(mouseDown);
                graph.svgEdges[i].line.untouchstart(mouseDown);
                graph.svgEdges[i].line.unclick(edgeClick);
                if (graph.svgEdges[i].weight!==undefined) {
                    delete graph.svgEdges[i].weight.index;
                    graph.svgEdges[i].weight.attr({cursor: "auto"});
                    graph.svgEdges[i].weight.unmousedown(mouseDown);
                    graph.svgEdges[i].weight.untouchstart(mouseDown);
                    graph.svgEdges[i].weight.unclick(weightClick);
                }
            }
            $(graph.svgName+" .click-area").remove();
            edgeClickAreas=[];
        };
        
        this.addSettings = function () {
            if (addVertexDrag===false) $("#edgeDraw").click();
            else $("#vertexMove").click();
            $("#edgeDraw").off("click").on("click",function () {
                addVertexDrag=false;
            });
            $("#vertexMove").off("click").on("click",function () {
                addVertexDrag=true;
            });
        };
    }
    
    
    window.DynamicGraph = DynamicGraph;
})();