"use strict";
(function () {
    let graph;
    function init () {
        graph=new Graph();
        graph.init(".graph-drawer",5,false,function () {
            let cnt=graph.getVertices().length;
            let sliderVers=$(".range-vers");
            let outputVers=$(".slider-value-vers");
            sliderVers.val(cnt);
            outputVers.html(cnt);
            
            if (graph.isDirected===true) $("#directed").click();
            else $("#undirected").click();
            $("#weighted").prop("checked",graph.isWeighted);
            $("#multi").prop("checked",graph.isMulti);
            
            let sliderSize=$(".range-size");
            let outputSize=$(".slider-value-size");
            sliderSize.val(parseInt(graph.size*100));
            outputSize.html(parseInt(graph.size*100));
            
            if (graph.isWeighted===false) {
                $("#default-css-weight").parent().parent().hide();
                $("#change #set-weights").parent().hide();
                $("#change #css-weights").parent().hide();
            }
            else {
                $("#default-css-weight").parent().parent().show();
                $("#change #set-weights").parent().show();
                $("#change #css-weights").parent().show();
            }
            
            $("#default-css-vertex").val(
                'fill: '+graph.graphDrawer.findAttrValue("vertex","fill")+'; '+
                'stroke: '+graph.graphDrawer.findAttrValue("vertex","stroke")+'; '+
                'stroke-width: '+graph.graphDrawer.findStrokeWidth("vertex")+';'
            );
            $("#default-css-name").val(
                'fill: '+graph.graphDrawer.findAttrValue("vertex-name","fill")+'; '+
                'font-size: '+graph.graphDrawer.findFontSize("vertex-name")+'px; '+
                'font-family: '+graph.graphDrawer.findAttrValue("vertex-name","font-family")+';'
            );
            $("#default-css-edge").val(
                'stroke: '+graph.graphDrawer.findAttrValue("edge","stroke")+'; '+
                'stroke-width: '+graph.graphDrawer.findStrokeWidth("edge")+';'
            );
            $("#default-css-weight").val(
                'fill: '+graph.graphDrawer.findAttrValue("weight","fill")+'; '+
                'font-size: '+graph.graphDrawer.findFontSize("weight")+'px; '+
                'font-family: '+graph.graphDrawer.findAttrValue("weight","font-family")+';'
            );
        });
        graph.buildEdgeDataStructures([[0,1],[1,2],[2,3],[3,4],[4,0]]);
        graph.drawNewGraph(true);
        graph.setSettings();
        graph.graphDrawer.dynamicGraph.addSettings();
        window.checkWeightValue = function (s) {
            if (s===null) return false;
            if (s.length===0) return false;
            return true;
        }
        graph.graphChange();
        
        
        $("#add-vertices").on("click", () => {
            $("#change .make-change-all").hide();
            $("#css-text").parent().parent().hide();
            $("#weight-text").parent().parent().hide();
        });
        $("#remove-vertices").on("click", () => {
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().hide();
            $("#weight-text").parent().parent().hide();
        });
        $("#css-vertices").on("click", () => {
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().show();
            $("#weight-text").parent().parent().hide();
        });
        $("#css-vertices-name").on("click", () => {
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().show();
            $("#weight-text").parent().parent().hide();
        });
        $("#remove-edges").on("click", () => {
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().hide();
            $("#weight-text").parent().parent().hide();
        });
        $("#css-edges").on("click", () => {
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().show();
            $("#weight-text").parent().parent().hide();
        });
        $("#set-weights").on("click", () => {
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().hide();
            $("#weight-text").parent().parent().show();
        });
        $("#css-weights").on("click", () => {
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().show();
            $("#weight-text").parent().parent().hide();
        });
        $("#css-text").val("fill: red");
        $("#weight-text").val("3");
        $("#weight-text").parent().parent().hide();
        $("#change-items").val("1,2,3,4,5");
        function makeChanges (all) {
            let uniqueNums = new Set();
            let type,indType=0;
            let changes=["add-vertices", "remove-vertices", "css-vertices", "css-vertices-name",
                         "remove-edges", "css-edges", "set-weights", "css-weights"];
            for (let change of changes) {
                if ($("#change #"+change).is(":checked")===true) {
                    type=change;
                    break;
                }
                indType++;
            }
            if (all===false) {
                let [nums,error]=findItemsFromText($("#change-items").val(),(indType!==0));
                if (error!=="") {
                    alert(((language==="bg")?"Невалидни номера":"Invalid numbers")+" - "+error+"!");
                    return ;
                }
                for (let num of nums) {
                    uniqueNums.add(num);
                    let flag=false;
                    if (indType<4) {
                        if ((indType!==0)&&(graph.getVertex(num-1)===undefined)) flag=true;
                    }
                    else {
                        if (graph.getEdge(num-1)===undefined) flag=true;
                    }
                    if (flag===true) {
                        alert(((language==="bg")?"Невалиден номер":"Invalid number")+" - "+num+"!");
                        return ;
                    }
                }
            }
            else {
                if (indType<4) {
                    for (let [i, vr] of graph.getVertices()) {
                        uniqueNums.add(i+1);
                    }
                }
                else {
                    for (let [i, edge] of graph.getEdges()) {
                        uniqueNums.add(i+1);
                    }
                }
            }
            
            let cssText=$("#css-text").val();
            let weightText=$("#weight-text").val();
            graph.graphController.freezeTime();
            for (let num of uniqueNums) {
                if (type==="add-vertices") graph.graphDrawer.dynamicGraph.addNewVertex(undefined,num);
                else if (type==="remove-vertices") graph.graphDrawer.dynamicGraph.removeVertex(num-1);
                else if (type==="css-vertices") graph.graphDrawer.dynamicGraph.addCSSVertex(num-1,cssText);
                else if (type==="css-vertices-name") graph.graphDrawer.dynamicGraph.addCSSVertexName(num-1,cssText);
                else if (type==="remove-edges") graph.graphDrawer.dynamicGraph.removeEdge(num-1);
                else if (type==="css-edges") graph.graphDrawer.dynamicGraph.addCSSEdge(num-1,cssText);
                else if (type==="set-weights") graph.graphDrawer.dynamicGraph.changeEdgeWeight(num-1,weightText);
                else if (type==="css-weights") graph.graphDrawer.dynamicGraph.addCSSWeight(num-1,cssText);
            }
            graph.graphController.advanceTime();
        }
        $("#change .make-change").on("click",makeChanges.bind(this,false));
        $("#change .make-change-all").on("click",makeChanges.bind(this,true));
        
        
        $("#style .apply-default").on("click", () => {
            graph.graphDrawer.defaultCSSVertex=$("#default-css-vertex").val();
            graph.graphDrawer.defaultCSSVertexText=$("#default-css-name").val();
            graph.graphDrawer.defaultCSSEdge=$("#default-css-edge").val();
            graph.graphDrawer.defaultCSSWeight=$("default-css-weight").val();
            graph.graphDrawer.draw(true,true,false);
        });
        $("#default-bg").off("input").on("input", () => {
            graph.graphDrawer.defaultBG=$("#default-bg").val();
            graph.graphDrawer.bgElement.attr({fill: graph.graphDrawer.defaultBG});
        });
    }
    
    window.init = init;
})();