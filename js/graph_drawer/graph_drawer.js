"use strict";
(function () {
    function getObjectForCoordinates (event) {
        if (window.isMobile==="false") return event;
        else if (event.changedTouches!==undefined) return event.changedTouches[0];
        else if (event.touches!==undefined) return event.touches[0];
    }
    function checkInteger (s) {
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
            let st=[circleCoord[0]+graph.vertexRad,circleCoord[1]+graph.vertexRad];
            if (segmentLength(st[0],st[1],svgPoint.x,svgPoint.y)>=graph.vertexRad) {
                let end=[svgPoint.x, svgPoint.y];
                currEdgeDraw=graph.drawEdge(st,end,-1,0).line;
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
                        if (checkInteger(weight.toString())===false) return ;
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