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
        let flagDraw,startX,startY;
        let stVerDraw,currEdgeDraw=undefined,svgPoint;
        
        function setSvgPoint (event) {
            let obj=getObjectForCoordinates(event);
            svgPoint.x=obj.clientX;
            svgPoint.y=obj.clientY;
            svgPoint=svgPoint.matrixTransform(graph.s.paper.node.getScreenCTM().inverse());
        }
        function vertexClick (index, event) {
            setSvgPoint(event);
            startX=svgPoint.x; startY=svgPoint.y;
            flagDraw=true;
            stVerDraw=index;

            let lineOut = function (event) {
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
            $(window).off("mousemove.line-out").on("mousemove.line-out",lineOut);
            $(window).off("touchmove.line-out").on("touchmove.line-out",lineOut);
        }
        function trackMouse (event) {
            if (flagDraw===false) return ;
            event.preventDefault();
            if (currEdgeDraw!==undefined) currEdgeDraw.remove();
            setSvgPoint(event);
            let circleCoord=graph.svgVertices[stVerDraw].coord;
            if (segmentLength(circleCoord[0],circleCoord[1],svgPoint.x,svgPoint.y)>=graph.vertexRad) {
                let end=[svgPoint.x, svgPoint.y];
                currEdgeDraw=graph.drawEdge(circleCoord,end,-1,0).line;
                currEdgeDraw.prependTo(graph.s);
            }
        }
        function clearDrawParameters () {
            flagDraw=false;
            if (currEdgeDraw!==undefined) currEdgeDraw.remove();
            $(window).off("mousemove.line-out").off("touchmove.line-out");
        }
        function edgeDrawEnd (event) {
            if (flagDraw===false) return ;
            clearDrawParameters();

            for (let i=0; i<graph.n; i++) {
                if ((svgPoint.x>=graph.svgVertices[i].group.getBBox().x)&&(svgPoint.x<=graph.svgVertices[i].group.getBBox().x2)&&
                    (svgPoint.y>=graph.svgVertices[i].group.getBBox().y)&&(svgPoint.y<=graph.svgVertices[i].group.getBBox().y2)) {
                    if (stVerDraw===i) return ;
                    if ((graph.isMulti===false)&&(graph.adjMatrix[stVerDraw][i]===1)) return ;
                    if (graph.isMulti===true) {
                        let maxEdges=(graph.isWeighted===true)?2:5;
                        if ((graph.isDirected===false)&&(graph.adjMatrix[stVerDraw][i]==maxEdges)) return ;
                        if ((graph.isDirected===true)&&
                            (graph.adjMatrix[stVerDraw][i]+graph.adjMatrix[i][stVerDraw]==maxEdges)) return ;
                    }

                    let weight="";
                    if (graph.isWeighted===true) {
                        weight=window.prompt("Въведете тегло на реброто","1");
                        if (checkInteger(weight)===false) return ;
                        weight=parseInt(weight);
                        if (weight===0) return ;
                    }
                    graph.addEdge(stVerDraw,i,weight);
                    if (graph.calcPositions.checkEdge(stVerDraw,i)===false) {
                        graph.svgVertices[i].coord=undefined;
                        graph.calcPositions.calculatePossiblePos();
                        if (graph.calcPositions.placeVertex(i,false)===false) graph.calcPositions.init();
                    }
                    graph.graphChange();
                    graph.draw(true);
                }
            }
        }
        
        function changeEdgeWeight (index) {
            let weight=window.prompt("Въведете ново тегло на реброто",graph.edgeList[index].weight);
            if (checkInteger(weight)===false) return ;
            graph.edgeList[index].weight=weight;
            graph.draw(true);
        }
        function edgeClick (index, event) {
            let parent=$(graph.svgName).parent();
            if (graph.isWeighted===true) parent.find(".change-weight").show();
            else parent.find(".change-weight").hide();
            
            let dropdown=parent.find(".dropdown-menu.edge");
            let bodyOffsets=document.body.getBoundingClientRect();
            dropdown.css({"top": event.pageY, "left": event.pageX-bodyOffsets.left});
            dropdown.addClass("show");
            let clicks=0;
            $(window).off("click.remove-edge-menu").on("click.remove-edge-menu",function () {
                clicks++;
                if (clicks===1) return ;
                $(window).off("click.remove-edge-menu");
                dropdown.removeClass("show");
            });
            
            parent.find(".remove-edge").off("click").on("click",function () {
                parent.find(".remove-edge").off("click");
                graph.removeEdge(index);
                graph.graphChange();
                this.remove();
            }.bind(this));
            
            if (graph.isWeighted===true) {
                parent.find(".change-weight").off("click").on("click",function () {
                    parent.find(".change-weight").off("click");
                    changeEdgeWeight(index);
                    graph.graphChange();
                });
            }
            
            parent.find(".add-css").off("click").on("click",function () {
                parent.find(".add-css").off("click");
                let css=window.prompt("Въведете CSS стил за реброто","");
                let edge=graph.svgEdges[index];
                edge.line.addClass("temp");
                $(".temp").attr("style",graph.edgeList[index].defaultCSS+" ; "+css);
                edge.line.removeClass("temp");
                graph.edgeList[index].addedCSS=css;
                if (graph.isDirected===true) {
                    let marker=edge.line.marker;
                    marker.attr("fill",graph.svgEdges[index].line.attr("stroke"));
                }
            });
        }

        this.init = function () {
            for (let i=0; i<graph.n; i++) {
                if (graph.svgVertices[i].group===undefined) continue;
                graph.svgVertices[i].group.attr({cursor: "pointer"});
            }
            for (let i=0; i<graph.edgeList.length; i++) {
                if (graph.svgEdges[i]===undefined) continue;
                graph.svgEdges[i].line.attr({cursor: "pointer"});
                graph.edgeList[i].defaultCSS+=" ; cursor: pointer";
                let clickArea=graph.s.path(graph.svgEdges[i].line.attr("d")).attr({
                    cursor: "pointer",
                    "stroke-width": 20,
                    "fill": "none",
                    "stroke": "black",
                    "stroke-opacity": 0
                });
                clickArea.prependTo(graph.s);
                if (window.isMobile==="false") {
                    clickArea.mousedown(edgeClick.bind(clickArea,i));
                    graph.svgEdges[i].line.mousedown(edgeClick.bind(clickArea,i));
                }
                else {
                    clickArea.touchstart(edgeClick.bind(graph.svgEdges[i],i));
                    graph.svgEdges[i].line.mousedown(edgeClick.bind(clickArea,i));
                }
                if (graph.svgEdges[i].weight!==undefined) {
                    graph.svgEdges[i].weight.attr({cursor: "pointer"});
                    if (window.isMobile==="false") graph.svgEdges[i].weight.mousedown(changeEdgeWeight.bind(this,i));
                    else graph.svgEdges[i].weight.touchstart(changeEdgeWeight.bind(this,i));
                }
            }
                    
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

            flagDraw=false;
            svgPoint=graph.s.paper.node.createSVGPoint();
            for (let i=0; i<graph.n; i++) {
                if (graph.svgVertices[i].group===undefined) continue;
                if (window.isMobile==="false") {
                    graph.svgVertices[i].group.unmousedown(vertexClick);
                    graph.svgVertices[i].group.mousedown(vertexClick.bind(graph.svgVertices[i],i));
                }
                else {
                    graph.svgVertices[i].group.untouchstart(vertexClick);
                    graph.svgVertices[i].group.touchstart(vertexClick.bind(graph.svgVertices[i],i));
                }
            }

            if (window.isMobile==="false") {
                graph.s.unmousemove(trackMouse);
                graph.s.mousemove(trackMouse);
                graph.s.unmouseup(edgeDrawEnd);
                graph.s.mouseup(edgeDrawEnd);
            }
            else {
                graph.s.untouchmove(trackMouse);
                graph.s.touchmove(trackMouse);
                graph.s.untouchend(edgeDrawEnd);
                graph.s.touchend(edgeDrawEnd);
            }
        }
    }
    
    
    window.DrawableEdges = DrawableEdges;
})();