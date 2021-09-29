"use strict";
(function () {
    let graph;
    function init () {
        graph=new Graph();
        graph.init(".graph",5,false,false,calcVertexCount);
        graph.buildEdgeDataStructures([[0,1],[1,2],[2,3],[3,4],[4,0]]);
        graph.drawNewGraph(22,22,278,278,20,true);
        
        function setGraphProperties () {
            graph.isDirected=isDirected;
            graph.isWeighted=isWeighted;
            graph.isMulti=isMulti;
        }
        
        let sliderVers=$(".range-vers");
        let outputVers=$(".slider-value-vers");
        sliderVers.val(5);
        outputVers.html(5);
        sliderVers.on("input", function() {
            outputVers.html($(this).val());
            graph.init(".graph",parseInt($(this).val()),graph.isDirected,false,calcVertexCount);
            setGraphProperties();
            graph.drawNewGraph(22,22,278,278,graph.vertexRad,true);
        });
        function calcVertexCount () {
            let cnt=0;
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                cnt++;
            }
            sliderVers.val(cnt);
            outputVers.html(cnt);
        }
        
        let isDirected=false;
        $("#undirected").on("click",function () {
            if (isDirected===true) {
                graph.isDirected=false; isDirected=false;
                graph.buildEdgeDataStructures(graph.convertSimpleEdgeList());
                graph.undoStack.pop();
                setGraphProperties();
                graph.draw(true);
            }
        });
        $("#directed").on("click",function () {
            if (graph.isDirected===false) {
                graph.isDirected=true; isDirected=true;
                graph.buildEdgeDataStructures(graph.convertSimpleEdgeList());
                graph.undoStack.pop();
                setGraphProperties();
                graph.draw(true);
            }
        });
        let isWeighted=false;
        $("#weighted").change(function () {
            if (this.checked===true) {
                graph.isWeighted=true; isWeighted=true;
                graph.draw(true);
            }
            else {
                graph.isWeighted=false; isWeighted=false;
                graph.draw(true);
            }
        });
        let isMulti=false;
        $("#multi").change(function () {
            if (this.checked===true) graph.isMulti=true, isMulti=true;
            else graph.isMulti=false, isMulti=false;
        });
        
        let sliderRad=$(".range-rad");
        let outputRad=$(".slider-value-rad");
        sliderRad.val(20);
        outputRad.html(20);
        sliderRad.on("input", function() {
            let val=parseInt($(this).val());
            outputRad.html(val);
            let oldVal=graph.vertexRad;
            graph.vertexRad=val;
            graph.draw(true);
        });
        
        $("#edgeDraw").on("click",function () {
            graph.drawableGraph.addVertexDrag=false;
        });
        $("#vertexMove").on("click",function () {
            graph.drawableGraph.addVertexDrag=true;
        });
    }
    
    window.init = init;
})();