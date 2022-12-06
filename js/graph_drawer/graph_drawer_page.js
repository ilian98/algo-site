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
            
            if (graph.isWeighted===false) $("#change #weights").parent().hide();
            else $("#change #weights").parent().show();
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
        
        $("#change .css-text").val("fill: red");
        $("#change .css-items").val("1,2,3,4,5");
        function makeChanges (all) {
            let uniqueNums = new Set();
            let type,maxNum;
            if ($("#change #vertices").is(":checked")===true) type="vertex", maxNum=graph.n;
            else if ($("#change #vertices-name").is(":checked")===true) type="vertex-name", maxNum=graph.n;
            else if ($("#change #edges").is(":checked")===true) type="edge", maxNum=graph.edgeList.length;
            else if ($("#change #weights").is(":checked")===true) type="weight", maxNum=graph.edgeList.length;
            if (all===false) {
                let [nums,error]=findNumbersFromText($("#change .css-items").val());
                if (error!=="") {
                    alert("Невалидни номера - "+error+"!");
                    return ;
                }
                for (let num of nums) {
                    uniqueNums.add(num);
                    if ((num<1)||(num>maxNum)) {
                        alert("Невалиден номер - "+num+"!");
                        return ;
                    }
                }
            }
            else {
                for (let i=1; i<=maxNum; i++) {
                    uniqueNums.add(i);
                }
            }
            
            let cssText=$("#change .css-text").val();
            graph.graphController.freezeTime();
            for (let num of uniqueNums) {
                if (type==="vertex") graph.drawableGraph.addCSSVertex(num-1,cssText);
                else if (type==="vertex-name") graph.drawableGraph.addCSSVertexName(num-1,cssText);
                else if (type==="edge") graph.drawableGraph.addCSSEdge(num-1,cssText);
                else if (type==="weight") graph.drawableGraph.addCSSWeight(num-1,cssText);
            }
            graph.graphController.advanceTime();
        }
        $("#change .make-change").on("click",makeChanges.bind(this,false));
        $("#change .make-change-all").on("click",makeChanges.bind(this,true));
    }
    
    window.init = init;
})();