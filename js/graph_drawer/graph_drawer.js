"use strict";
(function () {
    function getObjectForCoordinates (event) {
        if (window.isMobile==="false") return event;
        else if (event.changedTouches!==undefined) return event.changedTouches[0];
        else if (event.touches!==undefined) return event.touches[0];
    }
    function checkInteger (s) {
        if ((s===null)||(s===undefined)) return false;
        if (s.length===0) return false;
        for (let c of s) {
            if ((c<'0')||(c>'9')) return false;
        }
        return true;
    }
    function segmentLength (x1, y1, x2, y2) {
        return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    }
    
    function DrawableEdges (graph) {
        let svgPoint;
        function setSvgPoint (event) {
            let obj=getObjectForCoordinates(event);
            svgPoint.x=obj.clientX;
            svgPoint.y=obj.clientY;
            svgPoint=svgPoint.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
        }
        
        this.addVertexDrag=false;
        let addVertexDrag,startVertexDrag;
        let currEdgeDraw=undefined;
        let startMousePos;
        
        let cnt=0;
        function redrawEdges (dx, dy) {
            let coords=[graph.svgVertices[startVertexDrag].coord[0]+dx,
                        graph.svgVertices[startVertexDrag].coord[1]+dy];
            function redrawEdge (ind) {
                let otherEnd=graph.edgeList[ind].findEndPoint(startVertexDrag);
                let otherCoords=[graph.svgVertices[otherEnd].coord[0], graph.svgVertices[otherEnd].coord[1]];
                if (graph.edgeList[ind].x===startVertexDrag) 
                    graph.redrawEdge(graph.svgEdges[ind],[coords[0], coords[1]],otherCoords,ind);
                else graph.redrawEdge(graph.svgEdges[ind],otherCoords,[coords[0], coords[1]],ind);
            }
            for (let ind of graph.adjList[startVertexDrag]) {
                redrawEdge(ind);
                
            }
            for (let ind of graph.reverseAdjList[startVertexDrag]) {
                redrawEdge(ind);
            }
        }
        
        function vertexClick (index, event) {
            if (window.isMobile==="false") {
                graph.s.mousemove(trackMouse);
                graph.s.mouseup(edgeDrawEnd);
            }
            else {
                graph.s.touchmove(trackMouse);
                graph.s.touchend(edgeDrawEnd);
            }
            
            addVertexDrag=this.addVertexDrag;
            startVertexDrag=index;
            if (this.addVertexDrag===true) {
                setSvgPoint(event);
                startMousePos=[svgPoint.x, svgPoint.y];
            }
            
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
                    clearDrawParameters();
                }
            };
            if (window.isMobile==="false") $(window).off("mousemove.mouse-out").on("mousemove.mouse-out",mouseOut);
            else $(window).off("touchmove.mouse-out").on("touchmove.mouse-out",mouseOut);
        }
        function trackMouse (event) {
            event.preventDefault();
            setSvgPoint(event);
            if (addVertexDrag===false) {
                let circleCoord=graph.svgVertices[startVertexDrag].coord;
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
                graph.svgVertices[startVertexDrag].group.transform("t"+dx+" "+dy);
                redrawEdges(dx,dy);
            }
        }
        function clearDrawParameters () {
            if (addVertexDrag===false) {
                if (currEdgeDraw!==undefined) currEdgeDraw.line.remove();
                currEdgeDraw=undefined;
            }
            else {
                graph.svgVertices[startVertexDrag].group.transform("t0 0");
                redrawEdges(0,0);
            }
            $(window).off("mousemove.mouse-out").off("touchmove.mouse-out");
            if (window.isMobile==="false") {
                graph.s.unmousemove(trackMouse);
                graph.s.unmouseup(edgeDrawEnd);
            }
            else {
                graph.s.untouchmove(trackMouse);
                graph.s.untouchend(edgeDrawEnd);
            }
        }
        function edgeDrawEnd (event) {
            clearDrawParameters();

            if (addVertexDrag===false) {
                for (let i=0; i<graph.n; i++) {
                    if ((svgPoint.x>=graph.svgVertices[i].group.getBBox().x)&&(svgPoint.x<=graph.svgVertices[i].group.getBBox().x2)&&
                        (svgPoint.y>=graph.svgVertices[i].group.getBBox().y)&&(svgPoint.y<=graph.svgVertices[i].group.getBBox().y2)) {
                        if (startVertexDrag===i) return ;
                        if ((graph.isMulti===false)&&(graph.adjMatrix[startVertexDrag][i]===1)) return ;
                        if (graph.isMulti===true) {
                            let maxEdges=(graph.isWeighted===true)?2:5;
                            if ((graph.isDirected===false)&&(graph.adjMatrix[startVertexDrag][i]==maxEdges)) return ;
                            if ((graph.isDirected===true)&&
                                (graph.adjMatrix[startVertexDrag][i]+graph.adjMatrix[i][startVertexDrag]==maxEdges)) return ;
                        }

                        let weight="";
                        if (graph.isWeighted===true) {
                            weight=window.prompt("Въведете тегло на реброто","1");
                            if (checkInteger(weight)===false) return ;
                            weight=parseInt(weight);
                            if (weight===0) return ;
                        }
                        graph.addEdge(startVertexDrag,i,weight);
                        if (graph.calcPositions.checkEdge(startVertexDrag,i)===false) {
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
                let ind=startVertexDrag;
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
        
        function changeEdgeWeight (index) {
            let weight=window.prompt("Въведете ново тегло на реброто",graph.edgeList[index].weight);
            if (checkInteger(weight)===false) return ;
            graph.edgeList[index].weight=weight;
            graph.svgEdges[index].line.remove();
            graph.svgEdges[index].weight.remove();
            let x=graph.edgeList[index].x,y=graph.edgeList[index].y;
            graph.svgEdges[index]=graph.drawEdge(graph.svgVertices[x].coord,graph.svgVertices[y].coord,index,
                                                 graph.svgEdges[index].drawProperties);
            graph.svgEdges[index].line.prependTo(graph.s);
            graph.svgEdges[index].weight.prependTo(graph.s);
            
            addEdgeMenus(index);
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
                this.remove();
            }.bind(this));
            
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
                let css=window.prompt("Въведете CSS стил за реброто","");
                let edge=graph.svgEdges[index];
                edge.line.addClass("temp");
                $(".temp").attr("style",graph.edgeList[index].defaultCSS[0]+" ; "+css);
                edge.line.removeClass("temp");
                graph.edgeList[index].addedCSS[0]=css;
                if (graph.isDirected===true) {
                    let marker=edge.line.marker;
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
                let css=window.prompt("Въведете CSS стил за реброто","");
                let weight=graph.svgEdges[index].weight;
                weight.addClass("temp");
                $(".temp").attr("style",graph.edgeList[index].defaultCSS[1]+" ; "+css);
                weight.removeClass("temp");
                if (css.indexOf("fill")===-1) {
                    weight.attr("fill",graph.svgEdges[index].line.attr("stroke"));
                }
                graph.edgeList[index].addedCSS[1]=css;
                dropdown.removeClass("show");
            });
        }

        let edgeClickAreas=[];
        function addEdgeMenus (ind) {
            graph.svgEdges[ind].line.attr({cursor: "pointer"});
            graph.edgeList[ind].defaultCSS[0]+=" ; cursor: pointer";
            if (edgeClickAreas[ind]!==undefined) edgeClickAreas[ind].remove();
            let clickArea=graph.s.path(graph.svgEdges[ind].line.attr("d")).attr({
                cursor: "pointer",
                "stroke-width": 20,
                "fill": "none",
                "stroke": "black",
                "stroke-opacity": 0
            });
            edgeClickAreas[ind]=clickArea;
            clickArea.prependTo(graph.s);
            if (window.isMobile==="false") {
                clickArea.click(edgeClick.bind(clickArea,ind));
                graph.svgEdges[ind].line.click(edgeClick.bind(clickArea,ind));
            }
            else {
                clickArea.touchstart(edgeClick.bind(graph.svgEdges[ind],ind));
                graph.svgEdges[ind].line.touchstart(edgeClick.bind(clickArea,ind));
            }
            if (graph.svgEdges[ind].weight!==undefined) {
                graph.svgEdges[ind].weight.attr({cursor: "pointer"});
                graph.edgeList[ind].defaultCSS[1]+=" ; cursor: pointer";
                if (window.isMobile==="false") graph.svgEdges[ind].weight.click(weightClick.bind(graph.svgEdges[ind],ind));
                else graph.svgEdges[ind].weight.touchstart(weightClick.bind(graph.svgEdges[ind],ind));
            }
        }
        this.init = function () {
            if (window.isMobile==="true") {
                let svgElement=$(graph.svgName);
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
                if (graph.svgVertices[i].group===undefined) continue;
                graph.svgVertices[i].group.attr({cursor: "pointer"});
                if (window.isMobile==="false") graph.svgVertices[i].group.mousedown(vertexClick.bind(this,i));
                else graph.svgVertices[i].group.touchstart(vertexClick.bind(this,i));
            }
            
            for (let i=0; i<graph.edgeList.length; i++) {
                if (graph.svgEdges[i]===undefined) continue;
                addEdgeMenus(i);
            }
        }
    }
    
    
    window.DrawableEdges = DrawableEdges;
})();