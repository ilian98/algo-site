"use strict";
(function () {
    function dfs (vr, used, graph, animations) {
        used[vr]=true;
        for (let ind of graph.adjList[vr]) {
            let to=graph.edgeList[ind].findEndPoint(vr);
            if (used[to]===false) {
                animations.push({
                    animFunctions: [graph.vertexAnimation(vr,"grey","circle"),
                                    graph.vertexAnimation(vr,"white","text"),
                                    graph.edgeAnimation(vr,to)],
                    animText: "Напускаме връх "+(vr+1)+" и отиваме в "+(to+1)+"."
                });

                animations.push({
                    animFunctions: [graph.vertexAnimation(to,"red","circle"),
                                    graph.vertexAnimation(to,"black","text")],
                    animText: "Сега сме във връх "+(to+1)+"."
                });

                dfs(to,used,graph,animations);

                animations.push({
                    animFunctions: [graph.vertexAnimation(vr,"red","circle"),
                                    graph.vertexAnimation(vr,"black","text")],
                    animText: "Връщаме се на връх "+(vr+1)+"."
                });
            }
            else {
                animations.push({
                    animFunctions: [graph.edgeAnimation(vr,to)],
                    animText: "Oказва се, че съседът с номер "+(to+1)+" вече е обходен."
                });
            }
        }
        animations.push({
            animFunctions: [graph.vertexAnimation(vr,"black","circle"),
                            graph.vertexAnimation(vr,"white","text")],
            animText: "Вече проверихме всички съседи на връх "+(vr+1)+" и го напускаме."
        });
    }

    function defaultExample (name, graph, animationObj, vertexRad) {
        graph.init(name,5,false);
        graph.buildEdgeDataStructures([[0,1],[0,2],[0,3],[0,4],[1,2]]);
        graph.drawNewGraph(1,1,299,299,vertexRad,true);
        graph.setSettings([true, false, true]);

        $(".start-vertex").val("1");
        animationObj.init(name,function findAnimation () {
            let st=parseInt($(".start-vertex").val()); st--;
            let used=[],found=false;
            for (let i=0; i<graph.n; i++) {
                if (graph.vertices[i]===undefined) continue;
                if (i===st) found=true;
                used[i]=false;
            }
            if (found===false) {
                alert("Невалиден номер на връх!");
                return [];
            }
            let animations=[];
            animations.push({
                animFunctions: [graph.vertexAnimation(st,"red","circle")],
                animText: "Започваме обхождането от връх номер "+(st+1)+"."
            });
            dfs(st,used,graph,animations);
            return animations;
        },function initialState () {
            graph.draw(false,false,true);
        });

        animationObj.startButton.off("click.bonus").on("click.bonus", function () {
            if ($(this).html()==="Стоп") {
                $(name+" .default").parent().hide();
                $(name+" .undo-group").hide();
                $(name+" .import").hide();
                $(name+" .save-group").removeClass("text-center").addClass("text-start");
                $(name+" .dragging-mini").parent().removeClass("d-flex").addClass("d-none");
                $(name+" .settings").parent().removeClass("d-flex").addClass("d-none");
            }
            else {
                $(name+" .default").parent().show();
                $(name+" .undo-group").show();
                $(name+" .import").show();
                $(name+" .save-group").addClass("text-center").removeClass("text-start");
                $(name+" .dragging-mini").parent().removeClass("d-none").addClass("d-flex");
                $(name+" .settings").parent().removeClass("d-none").addClass("d-flex");
                graph.draw(true);
            }
        });
    }

    function initExample (part) {
        if (part==1) {
            let graph = new Graph();
            graph.init(".graphExample1",6,false);
            graph.buildEdgeDataStructures([[0,1],[0,2],[3,4]]);
            graph.n=6;
            graph.drawNewGraph(1,1,299,299,30,false);

            let graphDFS = new Graph();
            let animationObjUndirected = new Animation();
            let exampleName=".graphExample2";
            defaultExample(exampleName,graphDFS,animationObjUndirected,20);
            $(exampleName+" .default").off("click").on("click",defaultExample.bind(this,exampleName,graphDFS,animationObjUndirected,20));
        }
        else if (part==3) {
            let graph = new Graph();
            graph.init(".graphExample3",4,true);
            graph.buildEdgeDataStructures([[0,1],[0,2],[1,3],[2,3]]);
            graph.drawNewGraph(1,1,299,299,40,false);
        }
    }
    
    
    window.initExample = initExample;
})();