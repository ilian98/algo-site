"use strict";
function dfs (vr, used, graph, animations) {
    used[vr]=1;
    let text;
    for (let ind of graph.adjList[vr]) {
        let to=graph.edgeList[ind].findEndPoint(vr);
        if (used[to]==0) {
            text="Напускаме връх "+(vr+1)+" и отиваме в "+(to+1)+".";
            animations.push({
                animFunctions: [graph.vertexAnimation(vr,"grey","circle"),
                                graph.vertexAnimation(vr,"white","text"),
                                graph.edgeAnimation(vr,to)],
                animText: text
            });
            
            text="Сега сме във връх "+(to+1)+".";
            animations.push({
                animFunctions: [graph.vertexAnimation(to,"red","circle"),
                                graph.vertexAnimation(to,"black","text")],
                animText: text
            });
                
            dfs(to,used,graph,animations);
            
            text="Връщаме се на връх "+(vr+1)+".";
            animations.push({
                animFunctions: [graph.vertexAnimation(vr,"red","circle"),
                                graph.vertexAnimation(vr,"black","text")],
                animText: text
            });
        }
        else {
            text="Oказва се, че съседът с номер "+(to+1)+" вече е обходен.";
            animations.push({
                animFunctions: [graph.edgeAnimation(vr,to)],
                animText: text
            });
        }
    }
    text="Вече проверихме всички съседи на връх "+(vr+1)+" и го напускаме.";
    animations.push({
        animFunctions: [graph.vertexAnimation(vr,"black","circle"),
                        graph.vertexAnimation(vr,"white","text")],
        animText: text
    });
}

function defaultExample (name, graph, animationObj, isOriented, vertexRad) {
    graph.init(name+" .graph",5,isOriented,true);
    let edgeList;
    if (isOriented===false) edgeList=[[0,1],[0,2],[0,3],[0,4],[1,2]];
    else edgeList=[[0,1],[0,2],[0,3],[0,4],[1,2],[1,4],[2,3],[3,1]];
    graph.buildEdgeDataStructures(edgeList);
    graph.drawNewGraph(1,1,299,299,vertexRad,true);
        
    animationObj.init(name,function () {
        let animations=[];
        let used=[];
        for (let i=0; i<graph.n; i++) {
            used[i]=0;
        }
        animations.push({
            animFunctions: [graph.vertexAnimation(0,"red","circle")],
            animText: "Започваме обхождането от връх номер 1."
        });
        dfs(0,used,graph,animations);
        return animations;
    },function (flag) {
        graph.s.selectAll("*").remove();
        graph.draw(false);
    });
    
    let slider=$(name+" .range");
    let output=$(name+" .slider-value");
    slider.value=5;
    output.html(slider.value);
    slider.on("input", function() {
        animationObj.clear();
        output.html(this.value);
        graph.init(name+" .graph",parseInt(this.value),isOriented,true);
        graph.drawNewGraph(1,1,299,299,vertexRad,true);
    });
    
    animationObj.startButton.off("click.bonus").on("click.bonus", function () {
        if ($(name+" .default").is(":hidden")===false) {
            $(name+" .default").hide();
        }
        else {
            $(name+" .default").show();
            graph.draw(true);
        }
    });
}

function initExample (part) {
    if (part==1) {
        let graph = new Graph();
        graph.init(".graphExample1",6,false,false);
        graph.buildEdgeDataStructures([[0,1],[0,2],[3,4]]);
        graph.n=6;
        graph.drawNewGraph(1,1,299,299,30,false);
        
        let graphUndirected = new Graph();
        let animationObjUndirected = new Animation();
        let exampleName1=".graphExample2";
        defaultExample(exampleName1,graphUndirected,animationObjUndirected,false,20);
        $(exampleName1+" .default").off("click").on("click",defaultExample.bind(this,exampleName1,graphUndirected,animationObjUndirected,false,20));
        
        let graphDirected = new Graph();
        let animationObjDirected = new Animation();
        let exampleName2=".graphExample3";
        defaultExample(exampleName2,graphDirected,animationObjDirected,true,20);
        $(exampleName2+" .default").off("click").on("click",defaultExample.bind(this,exampleName2,graphDirected,animationObjDirected,true,20));
    }
    else if (part==3) {
        let graph = new Graph();
        graph.init(".graphExample4",4,true,false);
        graph.buildEdgeDataStructures([[0,1],[0,2],[1,3],[2,3]]);
        graph.drawNewGraph(1,1,299,299,40,false);
    }
}