"use strict";
(function () {
    let graph;
    function init () {
        graph=new Graph();
        graph.init(".graph",5,false,false,calcGraphProperties);
        graph.buildEdgeDataStructures([[0,1],[1,2],[2,3],[3,4],[4,0]]);
        graph.drawNewGraph(22,22,278,278,20,true);
        
        let sliderVers=$(".range-vers");
        let outputVers=$(".slider-value-vers");
        sliderVers.val(5);
        outputVers.html(5);
        sliderVers.on("input", function() {
            let n=parseInt($(this).val());
            outputVers.html(n);
            graph.initVertices(n); graph.undoTime--;
            for (let i=0; i<n; i++) {
                graph.vertices[i].name=(i+1).toString();
            }
            graph.buildEdgeDataStructures([]); graph.undoTime--;
            graph.calcPositions.init();
            graph.draw(true,false);
        });
        function calcGraphProperties () {
            let cnt=0;
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                cnt++;
            }
            sliderVers.val(cnt);
            outputVers.html(cnt);
            
            isDirected=graph.isDirected;
            if (isDirected===true) $("#directed").click();
            else $("#undirected").click();
            if (isWeighted!==graph.isWeighted) {
                isWeighted=graph.isWeighted;
                $("#weighted").click();
            }
            if (isMulti!==graph.isMulti) {
                isMulti=graph.isMulti;
                $("#multi").click();
            }
            
            sliderRad.val(graph.vertexRad);
            outputRad.html(graph.vertexRad);
        }
        
        let isDirected=false;
        $("#undirected").on("click",function () {
            if (graph.isDirected===true) {
                graph.isDirected=false; isDirected=false;
                graph.buildEdgeDataStructures(graph.convertSimpleEdgeList()); graph.undoTime--;
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isDirected", true]});
                graph.undoTime++;
                graph.draw(true);
            }
        });
        $("#directed").on("click",function () {
            if (graph.isDirected===false) {
                graph.isDirected=true; isDirected=true;
                graph.buildEdgeDataStructures(graph.convertSimpleEdgeList()); graph.undoTime--;
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isDirected", false]});
                graph.undoTime++;
                graph.draw(true);
            }
        });
        let isWeighted=false;
        $("#weighted").change(function () {
            if ((this.checked===true)&&(graph.isWeighted===false)) {
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isWeighted", false]});
                graph.undoTime++; graph.redoStack=[];
                graph.isWeighted=true; isWeighted=true;
                graph.draw(true);
            }
            else if ((this.checked===false)&&(graph.isWeighted===true)) {
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isWeighted", true]});
                graph.undoTime++; graph.redoStack=[];
                graph.isWeighted=false; isWeighted=false;
                graph.draw(true);
            }
        });
        let isMulti=false;
        $("#multi").change(function () {
            if ((this.checked===true)&&(graph.isMulti===false)) {
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isMulti", false]});
                graph.undoTime++; graph.redoStack=[];
                graph.isMulti=true; isMulti=true;
            }
            else if ((this.checked===false)&&(graph.isMulti===true)) {
                graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["isMulti", true]});
                graph.undoTime++; graph.redoStack=[];
                graph.isMulti=false; isMulti=false;
            }
        });
        
        let sliderRad=$(".range-rad");
        let outputRad=$(".slider-value-rad");
        sliderRad.val(20);
        outputRad.html(20);
        sliderRad.on("input", function() {
            let val=parseInt($(this).val());
            outputRad.html(val);
            let oldVal=graph.vertexRad;
            graph.undoStack.push({time: graph.undoTime, type: "change-property", data: ["radius", oldVal]});
            graph.undoTime++; graph.redoStack=[];
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