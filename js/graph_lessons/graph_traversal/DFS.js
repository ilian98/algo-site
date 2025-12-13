(function () {
    "use strict";
    function dfs (vr, used, graph, animations, pathText) {
        used[vr]=true;
        for (let ind of graph.adjList[vr]) {
            let to=graph.getEdge(ind).findEndPoint(vr);
            if (used[to]===false) {
                animations.push({
                    animFunctions: [attrChangesAnimation(graph.svgVertices[vr].circle,{fill: "grey"}),
                                    attrChangesAnimation(graph.svgVertices[vr].text,{fill: "white"}),
                                    graph.edgeAnimation(vr,to,ind)],
                    animText: "Напускаме връх "+graph.getVertex(vr).name+" и отиваме в "+graph.getVertex(to).name+"."
                });

                animations.push({
                    startFunction: function (pathText, graph, vr) {
                        const origText=pathText.text();
                        pathText.text(origText+", "+vr);
                        return () => {
                            pathText.text(origText);
                        };
                    }.bind(null,pathText,graph,graph.getVertex(to).name),
                    animFunctions: [attrChangesAnimation(graph.svgVertices[to].circle,{fill: "red"}),
                                    attrChangesAnimation(graph.svgVertices[to].text,{fill: "black"})],
                    animText: "Сега сме във връх "+graph.getVertex(to).name+"."
                });

                dfs(to,used,graph,animations,pathText);

                animations.push({
                    animFunctions: [attrChangesAnimation(graph.svgVertices[vr].circle,{fill: "red"}),
                                    attrChangesAnimation(graph.svgVertices[vr].text,{fill: "black"})],
                    animText: "Връщаме се на връх "+graph.getVertex(vr).name+"."
                });
            }
            else {
                animations.push({
                    animFunctions: [graph.edgeAnimation(vr,to,ind)],
                    animText: "Oказва се, че съседът с номер "+graph.getVertex(to).name+" вече е обходен."
                });
            }
        }
        animations.push({
            animFunctions: [attrChangesAnimation(graph.svgVertices[vr].circle,{fill: "black"}),
                            attrChangesAnimation(graph.svgVertices[vr].text,{fill: "white"})],
            animText: "Вече проверихме всички съседи на връх "+graph.getVertex(vr).name+" и го напускаме.",
            endFunction: function (vr) {
                const origPathText=pathText.text();
                let tmp=origPathText.slice(0,origPathText.length-(vr.length+1));
                if (tmp.endsWith(",")) tmp=tmp.slice(0,tmp.length-1);
                pathText.text(tmp);
                return () => {
                    pathText.text(origPathText);
                };
            }.bind(null,graph.getVertex(vr).name),
        });
    }

    function defaultExample (name, graph, animationObj, size) {
        graph.init(name,5,false);
        graph.buildEdgeDataStructures([[0,1],[0,2],[0,3],[0,4],[1,2]]);
        graph.drawNewGraph(true,size);
        graph.setSettings([true, false, true]);

        let startVertex="1";
        $("#start-vertex").val(startVertex);
        const pathText=$(name+" .path");
        animationObj.init(name,function findAnimations () {
            startVertex=$("#start-vertex").val();
            let st=-1; 
            const used=[];
            for (let [i, vr] of graph.getVertices()) {
                if (vr.name===startVertex) st=i;
                used[i]=false;
            }
            if (st===-1) {
                alert("Невалиден начален връх!");
                return [];
            }
            let animations=[];
            animations.push({
                startFunction: () => {
                    const origText=pathText.text();
                    pathText.text(origText+" "+graph.getVertex(st).name);
                    return () => {
                        pathText.text(origText);
                    };
                },
                animFunctions: [attrChangesAnimation(graph.svgVertices[st].circle,{fill: "red"})],
                animText: "Започваме обхождането от връх номер "+graph.getVertex(st).name+"."
            });
            dfs(st,used,graph,animations,pathText);
            return animations;
        },() => {
            pathText.text("Текущ път:");
        },() => {
            pathText.text("");
        }).then(
            () => { graph.graphController.hasAnimation(animationObj); },
            () => { alert("Failed loading animation data!"); });
    }

    function initExample (part) {
        if (part==1) {
            let graph = new Graph();
            graph.init(".graphExample1",6,false);
            graph.buildEdgeDataStructures([[0,1],[0,2],[3,4]]);
            graph.n=6;
            graph.drawNewGraph(false,1.5);

            let graphDFS = new Graph();
            let animationObj = new Animation();
            let exampleName=".graphExample2";
            $(exampleName+" .default").off("click").on("click",defaultExample.bind(null,exampleName,graphDFS,animationObj,1)).click();
            $(exampleName+" .start-vertex").on("keydown",isDigit);
        }
        else if (part==3) {
            let graph = new Graph();
            graph.init(".graphExample3",4,true);
            graph.buildEdgeDataStructures([[0,1],[0,2],[1,3],[2,3]]);
            graph.drawNewGraph(false,2);
        }
    }
    
    
    window.initExample = initExample;
})();