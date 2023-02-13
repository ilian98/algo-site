"use strict";
(function () {
    function dfs (vr, used, graph, animations) {
        used[vr]=true;
        for (let ind of graph.adjList[vr]) {
            let to=graph.getEdge(ind).findEndPoint(vr);
            if (used[to]===false) {
                animations.push({
                    animFunctions: [attrChangesAnimation(graph.svgVertices[vr].circle,{fill: "grey"}),
                                    attrChangesAnimation(graph.svgVertices[vr].text,{fill: "white"}),
                                    graph.edgeAnimation(vr,to,ind)],
                    animText: "Напускаме връх "+(vr+1)+" и отиваме в "+(to+1)+"."
                });

                animations.push({
                    animFunctions: [attrChangesAnimation(graph.svgVertices[to].circle,{fill: "red"}),
                                    attrChangesAnimation(graph.svgVertices[to].text,{fill: "black"})],
                    animText: "Сега сме във връх "+(to+1)+"."
                });

                dfs(to,used,graph,animations);

                animations.push({
                    animFunctions: [attrChangesAnimation(graph.svgVertices[vr].circle,{fill: "red"}),
                                    attrChangesAnimation(graph.svgVertices[vr].text,{fill: "black"})],
                    animText: "Връщаме се на връх "+(vr+1)+"."
                });
            }
            else {
                animations.push({
                    animFunctions: [graph.edgeAnimation(vr,to,ind)],
                    animText: "Oказва се, че съседът с номер "+(to+1)+" вече е обходен."
                });
            }
        }
        animations.push({
            animFunctions: [attrChangesAnimation(graph.svgVertices[vr].circle,{fill: "black"}),
                            attrChangesAnimation(graph.svgVertices[vr].text,{fill: "white"})],
            animText: "Вече проверихме всички съседи на връх "+(vr+1)+" и го напускаме."
        });
    }

    function defaultExample (name, graph, animationObj, vertexRad) {
        graph.init(name,5,false);
        graph.buildEdgeDataStructures([[0,1],[0,2],[0,3],[0,4],[1,2]]);
        graph.drawNewGraph(true,vertexRad);
        graph.setSettings([true, false, true]);

        $(name+" .start-vertex").val("1");
        animationObj.init(name,function findAnimations () {
            let st=parseInt($(name+" .start-vertex").val()); st--;
            let used=[],found=false;
            for (let [i, vr] of graph.getVertices()) {
                if (i===st) found=true;
                used[i]=false;
            }
            if (found===false) {
                alert("Невалиден номер на връх!");
                return [];
            }
            let animations=[];
            animations.push({
                animFunctions: [attrChangesAnimation(graph.svgVertices[st].circle,{fill: "red"})],
                animText: "Започваме обхождането от връх номер "+(st+1)+"."
            });
            dfs(st,used,graph,animations);
            return animations;
        }).then(
            () => { graph.graphController.hasAnimation(animationObj) },
            () => { alert("Failed loading animation data!") });
    }

    function initExample (part) {
        if (part==1) {
            let graph = new Graph();
            graph.init(".graphExample1",6,false);
            graph.buildEdgeDataStructures([[0,1],[0,2],[3,4]]);
            graph.n=6;
            graph.drawNewGraph(false,30);

            let graphDFS = new Graph();
            let animationObj = new Animation();
            let exampleName=".graphExample2";
            $(exampleName+" .default").off("click").on("click",defaultExample.bind(this,exampleName,graphDFS,animationObj,20)).click();
            $(exampleName+" .start-vertex").on("keydown",isDigit);
        }
        else if (part==3) {
            let graph = new Graph();
            graph.init(".graphExample3",4,true);
            graph.buildEdgeDataStructures([[0,1],[0,2],[1,3],[2,3]]);
            graph.drawNewGraph(false,40);
        }
    }
    
    
    window.initExample = initExample;
})();