(function () {
    "use strict";
    
    function eulerCycle (vr, used, graph, animations, pathText, cycleText) {
        for (let ind of graph.adjList[vr]) {
            let to=graph.getEdge(ind).findEndPoint(vr);
            if (used[ind]===false) {
                used[ind]=true;
                animations.push({
                    animFunctions: [attrChangesAnimation(graph.svgVertices[vr].circle,{fill: "grey"}),
                                    attrChangesAnimation(graph.svgVertices[vr].text,{fill: "white"}),
                                    graph.edgeAnimation(vr,to,ind)],
                    animText: "Напускаме връх "+graph.getVertex(vr).name+" и отиваме в "+graph.getVertex(to).name+"."
                });
                
                animations.push({
                    animFunctions: [attrChangesAnimation(graph.svgEdges[ind].line,{strokeDasharray: (10*graph.size)})],
                    animText: "Маркираме реброто между върховете "+graph.getVertex(vr).name+" и "+graph.getVertex(to).name+" за обходено."
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

                eulerCycle(to,used,graph,animations,pathText,cycleText);

                animations.push({
                    animFunctions: [attrChangesAnimation(graph.svgVertices[vr].circle,{fill: "red"}),
                                    attrChangesAnimation(graph.svgVertices[vr].text,{fill: "black"})],
                    animText: "Връщаме се на връх "+graph.getVertex(vr).name+".",
                });
            }
            else {
                animations.push({
                    animFunctions: [graph.edgeAnimation(vr,to,ind)],
                    animText: "Oказва се, че реброто между върховете "+graph.getVertex(vr).name+" и "+graph.getVertex(to).name+" вече е обходено."
                });
            }
        }
        animations.push({
            animFunctions: [attrChangesAnimation(graph.svgVertices[vr].circle,{fill: "black"}),
                            attrChangesAnimation(graph.svgVertices[vr].text,{fill: "white"})],
            animText: "Вече минахме през всички ребра на връх "+graph.getVertex(vr).name+", напускаме го и го добавяме към Ойлеровия цикъл.",
            endFunction: function (vr) {
                const origPathText=pathText.text();
                let tmp=origPathText.slice(0,origPathText.length-(vr.length+1));
                if (tmp.endsWith(",")) tmp=tmp.slice(0,tmp.length-1);
                pathText.text(tmp);
                const origCycleText=cycleText.text();
                if (origCycleText.charAt(origCycleText.length-1)===':') cycleText.text(origCycleText+" "+vr);
                else cycleText.text(origCycleText+", "+vr);
                return () => {
                    pathText.text(origPathText);
                    cycleText.text(origCycleText);
                };
            }.bind(null,graph.getVertex(vr).name),
        });
    }
    
    function initAnimations (graph, startVertex, pathText, cycleText) {
        let st=-1;
        for (const [i, vr] of graph.getVertices()) {
            if (vr.name===startVertex) {
                st=i;
                break;
            }
        }
        if (st===-1) {
            alert("Невалиден начален връх!");
            return [];
        }
        const used=[];
        for (const [i, e] of graph.getEdges()) {
            used[i]=false;
        }
        const animations=[];
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
        eulerCycle(st,used,graph,animations,pathText,cycleText);
        return animations;
    }
    
    function defaultEulerGraph (name, graph, animationObj) {
        graph.init(name,6,false);
        graph.buildEdgeDataStructures([[0,1],[0,2],[1,3],[1,2],[1,5],[2,3],[2,4],[4,5]]);
        graph.drawNewGraph(true);
        graph.setSettings([false, false, true]);

        let startVertex="1";
        $("#start-vertex").val(startVertex);
        const cycleText=$(name+" .cycle");
        const pathText=$(name+" .path");
        animationObj.init(name,() => {
            startVertex=$("#start-vertex").val();
            return initAnimations(graph,startVertex,pathText,cycleText);
        },() => {
            cycleText.text("Ойлеров цикъл:");
            pathText.text("Текущ път:");
        },() => {
            cycleText.text("");
            pathText.text("");
        },() => {
            const animations=initAnimations(graph,startVertex,pathText,cycleText);
            cycleText.text("Ойлеров цикъл:");
            for (const animation of animations) {
                if (animation.hasOwnProperty("endFunction")) animation.endFunction();
            }
        }).then(
            () => { graph.graphController.hasAnimation(animationObj); },
            () => { alert("Failed loading animation data!"); });
    }
    
    function initExample (part) {
        if (part===1) {
            const example1=new Graph();
            example1.init(".graphExample1",5,false);
            example1.buildEdgeDataStructures([[0,1],[0,1],[1,2],[2,3],[3,4],[4,1]]);
            example1.drawNewGraph(false);
            
            const example2=new Graph();
            example2.init(".graphExample2",5,false);
            example2.buildEdgeDataStructures([[0,1],[0,1],[1,2],[2,3],[3,4],[4,1],[1,3]]);
            example2.drawNewGraph(false);
        }
        if (part===2) {
            const example=new Graph();
            example.init(".graphExample3",5,false);
            example.buildEdgeDataStructures([[0,2],[2,1],[1,0],[2,3],[3,4],[4,2]]);
            example.drawNewGraph(false);
            
            const graphEuler=new Graph();
            const animationObj=new Animation();
            const exampleName=".graphExample4";
            $(exampleName+" .default").off("click").on("click",defaultEulerGraph.bind(null,exampleName,graphEuler,animationObj)).click();
            $("#start-vertex").on("keydown",isDigit);
        }
    }
    
    
    window.initExample = initExample;
})();