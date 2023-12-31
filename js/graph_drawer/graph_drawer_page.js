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
            
            let sample=graph.s.circle();
            graph.graphDrawer.setAttributes(sample,"vertex",-1,1/graph.size);
            $("#default-css-vertex").val(objToStyle(graph.graphDrawer.getAttributes(sample)));
            sample.remove();
            sample=graph.s.text();
            graph.graphDrawer.setAttributes(sample,"vertex-name",-1,1/graph.size);
            $("#default-css-name").val(objToStyle(graph.graphDrawer.getAttributes(sample)));
            sample.remove();
            sample=graph.s.line();
            graph.graphDrawer.setAttributes(sample,"edge",-1,1/graph.size);
            $("#default-css-edge").val(objToStyle(graph.graphDrawer.getAttributes(sample)));
            sample.remove();
            sample=graph.s.text();
            graph.graphDrawer.setAttributes(sample,"weight",-1,1/graph.size);
            $("#default-css-weight").val(objToStyle(graph.graphDrawer.getAttributes(sample)));
            sample.remove();
            
            let defaultBG=graph.graphDrawer.defaultBG;
            $("#default-bg").val(defaultBG[0]);
            $("#default-bg-opacity").val(defaultBG[1]);
        });
        
        function updateDefaultSettings (defaultCSSVertex, defaultCSSVertexText, defaultCSSEdge, defaultCSSWeight, defaultBG) {
            if (defaultCSSVertex!==null) graph.graphDrawer.defaultCSSVertex=styleToObj(defaultCSSVertex);
            if (defaultCSSVertexText!==null) graph.graphDrawer.defaultCSSVertexText=styleToObj(defaultCSSVertexText);
            if (defaultCSSEdge!==null) graph.graphDrawer.defaultCSSEdge=styleToObj(defaultCSSEdge);
            if (defaultCSSWeight!==null) graph.graphDrawer.defaultCSSWeight=styleToObj(defaultCSSWeight);
            if ((defaultBG[0]!==null)&&(defaultBG[1]!==null)) graph.graphDrawer.defaultBG=[defaultBG[0], parseFloat(defaultBG[1])];
        }
        updateDefaultSettings(
            localStorage.getItem("defaultCSSVertex"),
            localStorage.getItem("defaultCSSVertexText"),
            localStorage.getItem("defaultCSSEdge"),
            localStorage.getItem("defaultCSSWeight"),
            [localStorage.getItem("defaultBGColor"), localStorage.getItem("defaultBGOpacity")]
        );
        
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
            $("#add-vers").parent().parent().show();
            $("#change-ver-items").parent().parent().hide();
            $("#change-edge-items").parent().parent().hide();
            $("#change .make-change-all").hide();
            $("#css-text").parent().parent().hide();
            $("#weight-text").parent().parent().hide();
        });
        $("#remove-vertices").on("click", () => {
            $("#add-vers").parent().parent().hide();
            $("#change-ver-items").parent().parent().show();
            $("#change-edge-items").parent().parent().hide();
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().hide();
            $("#weight-text").parent().parent().hide();
        });
        $("#css-vertices").on("click", () => {
            $("#add-vers").parent().parent().hide();
            $("#change-ver-items").parent().parent().show();
            $("#change-edge-items").parent().parent().hide();
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().show();
            $("#weight-text").parent().parent().hide();
        });
        $("#css-vertices-name").on("click", () => {
            $("#add-vers").parent().parent().hide();
            $("#change-ver-items").parent().parent().show();
            $("#change-edge-items").parent().parent().hide();
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().show();
            $("#weight-text").parent().parent().hide();
        });
        $("#remove-edges").on("click", () => {
            $("#add-vers").parent().parent().hide();
            $("#change-ver-items").parent().parent().hide();
            $("#change-edge-items").parent().parent().show();
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().hide();
            $("#weight-text").parent().parent().hide();
        });
        $("#css-edges").on("click", () => {
            $("#add-vers").parent().parent().hide();
            $("#change-ver-items").parent().parent().hide();
            $("#change-edge-items").parent().parent().show();
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().show();
            $("#weight-text").parent().parent().hide();
        });
        $("#set-weights").on("click", () => {
            $("#add-vers").parent().parent().hide();
            $("#change-ver-items").parent().parent().hide();
            $("#change-edge-items").parent().parent().show();
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().hide();
            $("#weight-text").parent().parent().show();
        });
        $("#css-weights").on("click", () => {
            $("#add-vers").parent().parent().hide();
            $("#change-ver-items").parent().parent().hide();
            $("#change-edge-items").parent().parent().show();
            $("#change .make-change-all").show();
            $("#css-text").parent().parent().show();
            $("#weight-text").parent().parent().hide();
        });
        $("#css-text").val("fill: red");
        $("#weight-text").val("3");
        $("#weight-text").parent().parent().hide();
        $("#add-vers").parent().parent().hide();
        $("#add-vers").val("3");
        $("#change-ver-items").val("1,2,3,4,5");
        $("#change-edge-items").parent().parent().hide();
        $("#change-edge-items").val("1 2; 2 3; 3 4; 4 5; 5 1");
        function makeChanges (all) {
            if ($("#change #add-vertices").is(":checked")===true) {
                let num=parseInt($("#add-vers").val());
                if ((isNaN(num))||(num<1)||(num>10)) {
                    alert(((language==="bg")?"Невалиден брой, трябва да е число между 1 и 10":"Invalid number, it has to be between 1 and 10")+"!");
                    return 0;
                }
                graph.graphController.freezeTime();
                for (let i=0; ; i++) {
                    if (graph.getVertex(i)===undefined) {
                        graph.graphDrawer.dynamicGraph.addNewVertex(undefined,(i+1).toString());
                        num--;
                        if (num==0) break;
                    }
                }
                graph.graphController.advanceTime();
                return ;
            }
            
            let uniqueNums = new Set();
            let type,indType=0;
            let changes=["remove-vertices", "css-vertices", "css-vertices-name",
                         "remove-edges", "css-edges", "set-weights", "css-weights"];
            for (let change of changes) {
                if ($("#change #"+change).is(":checked")===true) {
                    type=change;
                    break;
                }
                indType++;
            }
            if (all===false) {
                let [nums, error]=findItemsFromText(
                    (indType<3)?$("#change-ver-items").val():$("#change-edge-items").val(),
                    (indType<3)?',':';',
                    (indType<3)
                );
                if (error!=="") {
                    alert(((language==="bg")?"Невалидни номера":"Invalid numbers")+" - "+error+"!");
                    return ;
                }
                for (let num of nums) {
                    if (indType<3) {
                        if ((indType!==0)&&(graph.getVertex(num-1)===undefined)) {
                            alert(((language==="bg")?"Невалиден номер":"Invalid number")+" - "+num+"!");
                            return ;
                        }
                        num--;
                        uniqueNums.add(num);
                    }
                    else {
                        let [vers, error]=findItemsFromText(num.trim(),' ');
                        if (error!=="") {
                            alert(((language==="bg")?"Невалидно ребро":"Invalid edge")+" - "+error+"!");
                            return ;
                        }
                        if (vers.length!==2) {
                            alert(((language==="bg")?"Невалидно ребро":"Invalid edge")+" - "+num+"!");
                            return ;
                        }
                        vers[0]--; vers[1]--;
                        if ((graph.getVertex(vers[0])===undefined)||(graph.getVertex(vers[1])===undefined)) {
                            alert(((language==="bg")?"Невалиден номер на връх":"Invalid vertex number")+" - "+num+"!");
                            return ;
                        }
                        if (graph.adjMatrix[vers[0]][vers[1]].length==0) {
                            alert(((language==="bg")?"Няма ребро":"No edger")+" - "+num+"!");
                        }
                        for (let num of graph.adjMatrix[vers[0]][vers[1]]) {
                            uniqueNums.add(num);
                        }
                    }
                }
            }
            else {
                if (indType<3) {
                    for (let [i, vr] of graph.getVertices()) {
                        uniqueNums.add(i);
                    }
                }
                else {
                    for (let [i, edge] of graph.getEdges()) {
                        uniqueNums.add(i);
                    }
                }
            }
            
            let cssText=$("#css-text").val();
            let weightText=$("#weight-text").val();
            graph.graphController.freezeTime();
            for (let num of uniqueNums) {
                if (type==="remove-vertices") graph.graphDrawer.dynamicGraph.removeVertex(num);
                else if (type==="css-vertices") graph.graphDrawer.dynamicGraph.addCSSVertex(num,cssText);
                else if (type==="css-vertices-name") graph.graphDrawer.dynamicGraph.addCSSVertexName(num,cssText);
                else if (type==="remove-edges") graph.graphDrawer.dynamicGraph.removeEdge(num);
                else if (type==="css-edges") graph.graphDrawer.dynamicGraph.addCSSEdge(num,cssText);
                else if (type==="set-weights") graph.graphDrawer.dynamicGraph.changeEdgeWeight(num,weightText);
                else if (type==="css-weights") graph.graphDrawer.dynamicGraph.addCSSWeight(num,cssText);
            }
            graph.graphController.advanceTime();
        }
        $("#change .make-change").on("click",makeChanges.bind(this,false));
        $("#change .make-change-all").on("click",makeChanges.bind(this,true));
        
        
        $("#style .apply-default").on("click", () => {
            let percentage=parseFloat($("#default-bg-opacity").val());
            if ((isNaN(percentage))||(percentage<0)||(percentage>100)) {
                alert(((language==="bg")?"Невалидна прозрачност - трябва да е число между 0 и 100!":"Invalid transperancy - it has to be a number between 0 and 100!"));
                return ;
            }
            graph.graphController.addChange("default-settings",[
                copyObj(graph.graphDrawer.defaultCSSVertex),
                copyObj(graph.graphDrawer.defaultCSSVertexText),
                copyObj(graph.graphDrawer.defaultCSSEdge),
                copyObj(graph.graphDrawer.defaultCSSWeight),
                [graph.graphDrawer.defaultBG[0], graph.graphDrawer.defaultBG[1]]
            ]);
            updateDefaultSettings(
                $("#default-css-vertex").val(),
                $("#default-css-name").val(),
                $("#default-css-edge").val(),
                $("#default-css-weight").val(),
                [$("#default-bg").val(), percentage]
            );
            graph.graphDrawer.draw(true,true,false);
        });
        
        $("#style .save-default").on("click", () => {
            let percentage=parseFloat($("#default-bg-opacity").val());
            if ((isNaN(percentage))||(percentage<0)||(percentage>100)) {
                alert(((language==="bg")?"Невалидна прозрачност - трябва да е число между 0 и 100!":"Invalid transperancy - it has to be a number between 0 and 100!"));
                return ;
            }
            localStorage.setItem("defaultCSSVertex",objToStyle(styleToObj($("#default-css-vertex").val())));
            localStorage.setItem("defaultCSSVertexText",objToStyle(styleToObj($("#default-css-name").val())));
            localStorage.setItem("defaultCSSEdge",objToStyle(styleToObj($("#default-css-edge").val())));
            localStorage.setItem("defaultCSSWeight",objToStyle(styleToObj($("#default-css-weight").val())));
            localStorage.setItem("defaultBGColor",$("#default-bg").val());
            localStorage.setItem("defaultBGOpacity",percentage);
            alert(((language==="bg")?"Успешно са запазани настройките по подразбиране!":"Successfully saved the default settings!"));
        });
    }
    
    window.init = init;
})();