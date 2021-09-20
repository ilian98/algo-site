"use strict";
(function () {
    let graph;
    function init () {
        graph=new Graph();
        graph.init(".graph",5,false,true,false);
        graph.buildEdgeDataStructures([[0,1],[1,2],[2,3],[3,4],[4,0]]);
        graph.drawNewGraph(22,22,278,278,20,true);
        
        let sliderVers=$(".range-vers");
        let outputVers=$(".slider-value-vers");
        sliderVers.val(5);
        outputVers.html(5);
        sliderVers.on("input", function() {
            outputVers.html($(this).val());
            graph.init(".graph",parseInt($(this).val()),graph.isDirected,true);
            graph.drawNewGraph(22,22,278,278,graph.vertexRad,true);
        });
        
        $("#undirected").on("click",function () {
            if (graph.isDirected===true) {
                graph.isDirected=false;
                graph.buildEdgeDataStructures(graph.convertSimpleEdgeList());
                graph.draw(true);
            }
        });
        $("#directed").on("click",function () {
            if (graph.isDirected===false) {
                graph.isDirected=true;
                graph.buildEdgeDataStructures(graph.convertSimpleEdgeList());
                graph.draw(true);
            }
        });
        $("#weighted").change(function () {
            if (this.checked===true) {
                graph.isWeighted=true;
                graph.draw(true);
            }
            else {
                graph.isWeighted=false;
                graph.draw(true);
            }
        });
        $("#multi").change(function () {
            if (this.checked===true) graph.isMulti=true;
            else graph.isMulti=false;
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
    }
    
    window.init = init;
})();