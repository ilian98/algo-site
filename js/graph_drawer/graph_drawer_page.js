"use strict";
(function () {
    let graph;
    function init () {
        graph=new Graph();
        graph.init(".graph-drawer",5,false,function () {
            let cnt=0;
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                cnt++;
            }
            let sliderVers=$(".range-vers");
            let outputVers=$(".slider-value-vers");
            sliderVers.val(cnt);
            outputVers.html(cnt);
            
            if (graph.isDirected===true) $("#directed").click();
            else $("#undirected").click();
            $("#weighted").prop("checked",graph.isWeighted);
            $("#multi").prop("checked",graph.isMulti);
            
            let sliderRad=$(".range-rad");
            let outputRad=$(".slider-value-rad");
            sliderRad.val(graph.vertexRad);
            outputRad.html(graph.vertexRad);
        });
        graph.buildEdgeDataStructures([[0,1],[1,2],[2,3],[3,4],[4,0]]);
        graph.drawNewGraph(true);
        graph.setSettings();
        graph.drawableGraph.addSettings();
        window.checkWeightValue = function (s) {
            if (s===null) return false;
            if (s.length===0) return false;
            return true;
        }
        graph.graphChange();
    }
    
    window.init = init;
})();