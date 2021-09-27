"use strict";
(function () {
    function getObjectForCoordinates (event) {
        if (window.isMobile==="false") return event;
        else if (event.changedTouches!==undefined) return event.changedTouches[0];
        else if (event.touches!==undefined) return event.touches[0];
    }
    function checkInteger (s) {
        if (s.length===0) return false;
        for (let c of s) {
            if ((c<'0')||(c>'9')) return false;
        }
        return true;
    }
    
    function DrawableEdges (graph) {
        let globalObj=this; 
        
        let svgPoint;
        function setSvgPoint (event) {
            let obj=getObjectForCoordinates(event);
            svgPoint.x=obj.clientX;
            svgPoint.y=obj.clientY;
            svgPoint=svgPoint.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
        }
        function prompt (text, defaultValue) {
            let s=window.prompt(text,defaultValue);
            if (s===null) s="";
            return s;
        }
        
        this.addVertexDrag=false;
        let addVertexDrag,startIndex;
        let currEdgeDraw=undefined;
        let startMousePos,drawProperties;
        
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
        
        function mouseDown (type, index, event) {
            $(graph.svgName).parent().find(".dropdown-menu").removeClass("show");
            if (window.isMobile==="false") {
                if (event.button!==0) return ;
                graph.s.mousemove((type==="vertex")?trackMouseVertex:trackMouseEdge);
                graph.s.mouseup((type==="vertex")?mouseUpVertex:mouseUpEdge);
            }
            else {
                graph.s.touchmove((type==="vertex")?trackMouseVertex:trackMouseEdge);
                graph.s.touchend((type==="vertex")?mouseUpVertex:mouseUpEdge);
            }
            
            trackedMouse=false;
            startIndex=index;
            if (type==="vertex") {
                addVertexDrag=globalObj.addVertexDrag;
                if (addVertexDrag===true) {
                    setSvgPoint(event);
                    startMousePos=[svgPoint.x, svgPoint.y];
                }
            }
            else drawProperties=graph.svgEdges[index].drawProperties[0];
            
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
        }
        let trackedMouse,nearCircles=[];
        function trackMouseVertex (event) {
            event.preventDefault();
            
            if (trackedMouse===false) {
                $(graph.svgName).css({"border-color": "black"});
                if (addVertexDrag===true) {
                    let index=startIndex;
                    let oldCoords=[graph.svgVertices[index].coord[0], graph.svgVertices[index].coord[1]];
                    graph.svgVertices[index].coord=undefined;
                    let possiblePos=graph.calcPositions.calculatePossiblePos();
                    graph.svgVertices[index].coord=[oldCoords[0], oldCoords[1]];
                    for (let pos of possiblePos) {
                        let circleVertex=graph.s.circle(pos[0],pos[1],graph.vertexRad).attr({
                            stroke: "green",
                            fill: "white",
                            "fill-opacity": 0.5
                        });
                        circleVertex.attr({opacity: 0});
                        let circle=graph.s.circle(pos[0]+(startMousePos[0]-graph.svgVertices[index].coord[0]),
                                                  pos[1]+(startMousePos[1]-graph.svgVertices[index].coord[1]),15);
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
            trackedMouse=true;
            
            setSvgPoint(event);
            if (addVertexDrag===false) {
                let circleCoord=graph.svgVertices[startIndex].coord;
                if (segmentLength(circleCoord[0],circleCoord[1],svgPoint.x,svgPoint.y)>=graph.vertexRad) {
                    let end=[svgPoint.x, svgPoint.y];
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
            
            let x=graph.edgeList[startIndex].x,y=graph.edgeList[startIndex].y;
            let st=graph.svgVertices[x].coord,end=graph.svgVertices[y].coord;
            if (trackedMouse===false) {
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
            trackedMouse=true;
            setSvgPoint(event);
            let area=orientedArea(st[0],st[1],end[0],end[1],svgPoint.x,svgPoint.y)/2*(-1);
            let height=area*2/segmentLength(st[0],st[1],end[0],end[1]);
            graph.svgEdges[startIndex].drawProperties[0]=height;
            graph.redrawEdge(graph.svgEdges[startIndex],st,end,startIndex);
            
            if (Math.abs(height-graph.svgEdges[startIndex].drawProperties[2])<10) nearLine.attr({opacity: 1});
            else nearLine.attr({opacity: 0});
        }
        
        function clearClickParameters (type) {
            $(graph.svgName).css({"border-color": "transparent"});
            if (type==="vertex") {
                if (addVertexDrag===false) {
                    if (currEdgeDraw!==undefined) currEdgeDraw.line.remove();
                    currEdgeDraw=undefined;
                }
                else {
                    for (let circles of nearCircles) {
                        circles[0].remove();
                        circles[1].remove();
                    }
                    graph.svgVertices[startIndex].group.transform("t0 0");
                    redrawEdges(0,0);
                }
            }
            else {
                if (nearLine!==undefined) nearLine.remove();
                let x=graph.edgeList[startIndex].x,y=graph.edgeList[startIndex].y;
                let st=graph.svgVertices[x].coord,end=graph.svgVertices[y].coord;
                graph.svgEdges[startIndex].drawProperties[0]=drawProperties;
                graph.redrawEdge(graph.svgEdges[startIndex],st,end,startIndex);
            }
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
            clearClickParameters("vertex");
            if (trackedMouse===false) { // click event
                vertexClick(startIndex,event);
                return ;
            }
            
            if (addVertexDrag===false) {
                for (let i=0; i<graph.n; i++) {
                    if (graph.vertices[i]===undefined) continue;
                    if ((svgPoint.x>=graph.svgVertices[i].group.getBBox().x)&&
                        (svgPoint.x<=graph.svgVertices[i].group.getBBox().x2)&&
                        (svgPoint.y>=graph.svgVertices[i].group.getBBox().y)&&
                        (svgPoint.y<=graph.svgVertices[i].group.getBBox().y2)) {
                        if (startIndex===i) return ;
                        if ((graph.isMulti===false)&&(graph.adjMatrix[startIndex][i]===1)) return ;
                        if (graph.isMulti===true) {
                            let maxEdges=(graph.isWeighted===true)?2:5;
                            if ((graph.isDirected===false)&&(graph.adjMatrix[startIndex][i]==maxEdges)) return ;
                            if ((graph.isDirected===true)&&
                                (graph.adjMatrix[startIndex][i]+graph.adjMatrix[i][startIndex]==maxEdges)) return ;
                        }

                        let weight="";
                        if (graph.isWeighted===true) {
                            weight=prompt("Въведете тегло на реброто","1");
                            if (checkInteger(weight)===false) return ;
                            weight=parseInt(weight);
                            if (weight===0) return ;
                        }
                        graph.addEdge(startIndex,i,weight);
                        if (graph.calcPositions.checkEdge(startIndex,i)===false) {
                            graph.svgVertices[i].coord=undefined;
                            graph.calcPositions.calculatePossiblePos();
                            if (graph.calcPositions.placeVertex(i,false)===false) graph.calcPositions.init();
                        }
                        graph.graphChange();
                        graph.draw(true);
                    }
                }
            }
            else {
                let ind=startIndex;
                let dx=svgPoint.x-startMousePos[0],dy=svgPoint.y-startMousePos[1];
                let oldCoords=[graph.svgVertices[ind].coord[0], graph.svgVertices[ind].coord[1]];
                graph.svgVertices[ind].coord=undefined;
                let possiblePos=graph.calcPositions.calculatePossiblePos();
                graph.svgVertices[ind].coord=[oldCoords[0]+dx, oldCoords[1]+dy];
                for (let pos of possiblePos) {
                    if (segmentLength(graph.svgVertices[ind].coord[0],graph.svgVertices[ind].coord[1],pos[0],pos[1])<15) {
                        graph.svgVertices[ind].coord=[pos[0],pos[1]];
                        break;
                    }
                }
                graph.draw(true,false);
            }
        }
        function mouseUpEdge (event) {
            let height=graph.svgEdges[startIndex].drawProperties[0];
            clearClickParameters("edge");
            if (trackedMouse===false) { // click event
                edgeClick(startIndex,event);
                return ;
            }
            
            if (Math.abs(height-graph.svgEdges[startIndex].drawProperties[2])<10) height=undefined;
            graph.edgeList[startIndex].curveHeight=height;
            graph.draw(true,false);
        }
        
        function addCSS (obj, defaultCSS, newCSS) {
            obj.addClass("temp");
            $(".temp").attr("style",defaultCSS+" ; "+newCSS);
            obj.removeClass("temp");
        }
        function vertexClick (index, event) {
            let dropdown=$(graph.svgName).parent().find(".dropdown-menu.vertex");
            let bodyOffsets=document.body.getBoundingClientRect();
            let obj=getObjectForCoordinates(event);
            dropdown.css({"top": obj.pageY, "left": obj.pageX-bodyOffsets.left});
            dropdown.addClass("show");
            let clicks=0;
            $(window).off("click.remove-vertex-menu").on("click.remove-vertex-menu",function () {
                clicks++;
                if (clicks===1) return ;
                $(window).off("click.remove-vertex-menu");
                dropdown.removeClass("show");
            });
            
            dropdown.find(".remove-vertex").off("click").on("click",function () {
                dropdown.find(".remove-vertex").off("click");
                for (let ind of graph.adjList[index]) {
                    edgeClickAreas[ind].remove();
                }
                for (let ind of graph.reverseAdjList[index]) {
                    edgeClickAreas[ind].remove();
                }
                graph.removeVertex(index);
                graph.graphChange();
                dropdown.removeClass("show");
            });
            
            dropdown.find(".change-name").off("click").on("click",function () {
                dropdown.find(".change-name").off("click");
                let name=prompt("Въведете ново име на върха",graph.vertices[index].name);
                graph.vertices[index].name=name;
                graph.drawVertexText(index,name);
                addVertexEvents(index);
                graph.graphChange();
                dropdown.removeClass("show");
            });
            
            dropdown.find(".add-css").off("click").on("click",function () {
                dropdown.find(".add-css").off("click");
                let css=prompt(
                    "Въведете CSS стил за върха"+
                    ((graph.vertices[index].addedCSS[0]==="")?" (например за червен цвят fill: red)":""),
                    graph.vertices[index].addedCSS[0]
                );
                addCSS(graph.svgVertices[index].circle,graph.vertices[index].defaultCSS[0],css);
                graph.vertices[index].addedCSS[0]=css;
                dropdown.removeClass("show");
            });
            
            dropdown.find(".add-css-name").off("click").on("click",function () {
                dropdown.find(".add-css-name").off("click");
                let css=prompt(
                    "Въведете CSS стил за името на върха"+
                    ((graph.vertices[index].addedCSS[1]==="")?" (например за червен цвят fill: red)":""),
                    graph.vertices[index].addedCSS[1]
                );
                addCSS(graph.svgVertices[index].text,graph.vertices[index].defaultCSS[1],css);
                graph.vertices[index].addedCSS[1]=css;
                dropdown.removeClass("show");
            });
        }
        function addNewVertex (event) {
            let ind;
            for (let i=0; i<=graph.n; i++) {
                if (graph.vertices[i]===undefined) {
                    ind=i;
                    break;
                }
            }
            let name=prompt("Въведете име на новия връх",ind+1);
            if (name==="") return ;
            graph.addVertex(name);
            setSvgPoint(event);
            graph.svgVertices[ind].coord=[svgPoint.x, svgPoint.y];
            graph.drawVertex(ind);
            addVertexEvents(ind);
            graph.graphChange();
        }
        function changeEdgeWeight (index) {
            let weight=prompt("Въведете ново тегло на реброто",graph.edgeList[index].weight);
            if (checkInteger(weight)===false) return ;
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
        function edgeClick (index, event) {
            let dropdown=$(graph.svgName).parent().find(".dropdown-menu.edge");
            if (graph.isWeighted===true) dropdown.find(".change-weight").show();
            else dropdown.find(".change-weight").hide();
            
            let bodyOffsets=document.body.getBoundingClientRect();
            let obj=getObjectForCoordinates(event);
            dropdown.css({"top": obj.pageY, "left": obj.pageX-bodyOffsets.left});
            dropdown.addClass("show");
            let clicks=0;
            $(window).off("click.remove-edge-menu").on("click.remove-edge-menu",function () {
                clicks++;
                if (clicks===1) return ;
                $(window).off("click.remove-edge-menu");
                dropdown.removeClass("show");
            });
            
            dropdown.find(".remove-edge").off("click").on("click",function () {
                dropdown.find(".remove-edge").off("click");
                graph.removeEdge(index);
                graph.graphChange();
                dropdown.removeClass("show");
                edgeClickAreas[index].remove();
            });
            
            if (graph.isWeighted===true) {
                dropdown.find(".change-weight").off("click").on("click",function () {
                    dropdown.find(".change-weight").off("click");
                    changeEdgeWeight(index);
                    graph.graphChange();
                    dropdown.removeClass("show");
                });
            }
            
            dropdown.find(".add-css").off("click").on("click",function () {
                dropdown.find(".add-css").off("click");
                let css=prompt(
                    "Въведете CSS стил за реброто"+
                    ((graph.edgeList[index].addedCSS[0]==="")?" (например за червен цвят stroke: red)":""),
                    graph.edgeList[index].addedCSS[0]
                );
                let edge=graph.svgEdges[index];
                addCSS(edge.line,graph.edgeList[index].defaultCSS[0],css);
                graph.edgeList[index].addedCSS[0]=css;
                if (graph.isDirected===true) {
                    let marker=edge.line.markerEnd;
                    marker.attr("fill",graph.svgEdges[index].line.attr("stroke"));
                }
                if (graph.isWeighted===true) {
                    if (graph.edgeList[index].addedCSS[1].indexOf("fill")===-1) {
                        graph.svgEdges[index].weight.attr("fill",graph.svgEdges[index].line.attr("stroke"));
                    }
                }
                dropdown.removeClass("show");
            });
        }
        
        function weightClick (index, event) {
            let dropdown=$(graph.svgName).parent().find(".dropdown-menu.weight");
            let bodyOffsets=document.body.getBoundingClientRect();
            let obj=getObjectForCoordinates(event);
            dropdown.css({"top": obj.pageY, "left": obj.pageX-bodyOffsets.left});
            dropdown.addClass("show");
            let clicks=0;
            $(window).off("click.remove-weight-menu").on("click.remove-weight-menu",function () {
                clicks++;
                if (clicks===1) return ;
                $(window).off("click.remove-weight-menu");
                dropdown.removeClass("show");
            });
            
            dropdown.find(".change-weight").off("click").on("click",function () {
                dropdown.find(".change-weight").off("click");
                changeEdgeWeight(index);
                graph.graphChange();
                dropdown.removeClass("show");
            });
            
            dropdown.find(".add-css").off("click").on("click",function () {
                dropdown.find(".add-css").off("click");
                let css=prompt(
                    "Въведете CSS стил за теглото"+
                    ((graph.edgeList[index].addedCSS[1]==="")?" (например за червен цвят fill: red)":""),
                    graph.edgeList[index].addedCSS[1]
                );
                let weight=graph.svgEdges[index].weight;
                addCSS(weight,graph.edgeList[index].defaultCSS[1],css);
                if (css.indexOf("fill")===-1) {
                    weight.attr("fill",graph.svgEdges[index].line.attr("stroke"));
                }
                graph.edgeList[index].addedCSS[1]=css;
                dropdown.removeClass("show");
            });
        }

        function addVertexEvents (ind) {
            graph.svgVertices[ind].group.attr({cursor: "pointer"});
            if (window.isMobile==="false") graph.svgVertices[ind].group.mousedown(mouseDown.bind(this,"vertex",ind));
            else graph.svgVertices[ind].group.touchstart(mouseDown.bind(this,"vertex",ind));
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
            edgeClickAreas[ind]=clickArea;
            clickArea.prependTo(graph.s);
            if (window.isMobile==="false") {
                clickArea.mousedown(mouseDown.bind(this,"edge",ind));
                graph.svgEdges[ind].line.mousedown(mouseDown.bind(this,"edge",ind));
            }
            else {
                clickArea.touchstart(mouseDown.bind(this,"edge",ind));
                graph.svgEdges[ind].line.touchstart(mouseDown.bind(this,"edge",ind));
            }
            if (graph.svgEdges[ind].weight!==undefined) {
                graph.svgEdges[ind].weight.attr({cursor: "pointer"});
                graph.edgeList[ind].defaultCSS[1]+=" ; cursor: pointer";
                if (window.isMobile==="false") graph.svgEdges[ind].weight.click(weightClick.bind(graph.svgEdges[ind],ind));
                else graph.svgEdges[ind].weight.touchstart(weightClick.bind(graph.svgEdges[ind],ind));
            }
        }
        this.init = function () {
            let svgElement=$(graph.svgName);
            if (window.isMobile==="true") {
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
            
            svgPoint=graph.s.paper.node.createSVGPoint();
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                addVertexEvents(i);
            }
            
            for (let i=0; i<graph.edgeList.length; i++) {
                if (graph.edgeList[i]===undefined) continue;
                addEdgeEvents(i);
            }
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
        }
    }
    
    
    window.DrawableEdges = DrawableEdges;
})();