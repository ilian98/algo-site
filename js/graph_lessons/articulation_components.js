"use strict";
(function () {
    function addText (i, graph, s, position) {
        let text=graph.s.text(0,0,s),fontSize=graph.vertexRad*5/6;
        text.attr({
            "font-size": fontSize,
            "font-weight": "bold",
            "font-family": "Times New Roman",
            "text-align": "center",
            class: "unselectable",
            "text-anchor": "middle"
        });
        if (position==="up") {
            text.attr({
                fill: "blue",
                x: graph.svgVertices[i].coord[0],
                y: graph.svgVertices[i].coord[1]-graph.vertexRad-graph.findStrokeWidth()/2-2,
            });
        }
        else {
            text.attr({
                fill: "green",
                x: graph.svgVertices[i].coord[0]+graph.vertexRad+graph.findStrokeWidth()/2+text.getBBox().w/2+2,
                y: graph.svgVertices[i].coord[1],
                dy: determineDy(s,"Times New Roman",fontSize)
            });
        }
        return text;
    }
    let time;
    function dfs (vr, father, used, inTime, up, graph, animations) {
        if (father===-1) {
            animations.push({
                animFunctions: [graph.vertexAnimation(vr,"red","circle")],
                animText: "Започваме обхождането и строенето на дървото с корен "+(vr+1)+"."
            });        
        }
        else {
            animations.push({
                animFunctions: [graph.vertexAnimation(vr,"red","circle"),
                                graph.vertexAnimation(vr,"black","text")],
                animText: "Сега сме във връх "+(vr+1)+"."
            });
        }
        
        let upText;
        animations[animations.length-1].startFunction = function (time) {
            addText(vr,graph,"in="+time,"up");
            upText=addText(vr,graph,"up="+time,"down");
        }.bind(this,time);
        animations[animations.length-1].endFunction = function (time) {
             $(".graphExample3 .time").text("Време: "+time);
        }.bind(this,time+1);
        animations[animations.length-1].animText+=" Отбелязваме време на влизане "+time+" и увеличаваме времето. Слагаме минималното in-време на поддървото на текущия връх, на "+time+".";
        inTime[vr]=time++; up[vr]=inTime[vr];
        used[vr]=true;
        for (let ind of graph.adjList[vr]) {
            let to=graph.edgeList[ind].findEndPoint(vr);
            if (used[to]===false) {
                animations.push({
                    animFunctions: [graph.vertexAnimation(vr,"grey","circle"),
                                    graph.vertexAnimation(vr,"white","text"),
                                    graph.edgeAnimation(vr,to)],
                    animText: "Напускаме връх "+(vr+1)+" и отиваме към сина "+(to+1)+" в строящото се покриващо дърво."
                });

                dfs(to,vr,used,inTime,up,graph,animations);

                up[vr]=Math.min(up[vr],up[to]);
                animations.push({
                    startFunction: function (up) {
                        upText.remove();
                        upText=addText(vr,graph,"up="+up,"down");
                    }.bind(this,up[vr]),
                    animFunctions: [graph.vertexAnimation(vr,"red","circle"),
                                    graph.vertexAnimation(vr,"black","text")],
                    animText: "Връщаме се на връх "+(vr+1)+" и вземаме предвид up["+(to+1)+"]="+up[to]+" при смятането на минималното in-време на up["+(vr+1)+"]."
                });
                
                if (up[to]>=inTime[to]) {
                    animations.push({
                        animFunctions: [graph.edgeChangesAnimation(vr,to,{
                            stroke: "red", "stroke-width": graph.findStrokeWidth()*2
                        })],
                        animText: "Понеже up["+(to+1)+"]>=in["+(to+1)+"], то това ребро е мост!"
                    });
                }
            }
            else if (to===father) {
                animations.push({
                    animFunctions: [graph.edgeAnimation(vr,to)],
                    animText: "Oказва се, че този съсед се явява бащата "+(to+1)+" на текущия връх в покриващото дърво."
                });
            }
            else {
                up[vr]=Math.min(up[vr],inTime[to]);
                animations.push({
                    animFunctions: [graph.edgeAnimation(vr,to)],
                    animText: "Това ребро е обратно, затова вземаме предвид in["+(to+1)+"]="+inTime[to]+" при смятането на минималното in-време на up["+(vr+1)+"].",
                    endFunction: function (up) {
                        upText.remove();
                        upText=addText(vr,graph,"up="+up,"down");
                    }.bind(this,up[vr]),
                });
            }
        }
        animations.push({
            animFunctions: [graph.vertexAnimation(vr,"black","circle"),
                            graph.vertexAnimation(vr,"white","text")],
            animText: "Приключихме с връх "+(vr+1)+" и намерихме, че минималното in-време, което се достига от това поддърво е "+up[vr]+"."
        });
    }
    
    let timeDCC;
    function findBridges (vr, father, adjList, edgeList, used, up, inTime) {
        inTime[vr]=timeDCC++; up[vr]=inTime[vr];
        used[vr]=true;
        for (let ind of adjList[vr]) {
            let to=edgeList[ind].findEndPoint(vr);
            if (used[to]===false) {
                findBridges(to,vr,adjList,edgeList,used,up,inTime);
                up[vr]=Math.min(up[vr],up[to]);
                if (up[to]>=inTime[to]) edgeList[ind].bridge=true;
            }
            else if (to!=father) up[vr]=Math.min(up[vr],inTime[to]);
        }
    }
    function findComponent (vr, adjList, edgeList, used, comp) {
        comp.push(vr);
        used[vr]=true;
        for (let ind of adjList[vr]) {
            let to=edgeList[ind].findEndPoint(vr);
            if (edgeList[ind].hasOwnProperty("bridge")===true) continue;
            if (used[to]===false) findComponent(to,adjList,edgeList,used,comp);
        }
    }
    function findDCC (graph) {
        let used=[],up=[],inTime=[];
        for (let i=0; i<graph.n; i++) {
            used[i]=false;
        }
        timeDCC=0;
        for (let i=0; i<graph.n; i++) {
            if (graph.vertices[i]===undefined) continue;
            if (used[i]===true) continue;
            findBridges(i,-1,graph.adjList,graph.edgeList,used,up,inTime);
        }
        for (let i=0; i<graph.n; i++) {
            used[i]=false;
        }
        let comps=[];
        for (let i=0; i<graph.n; i++) {
            if (graph.vertices[i]===undefined) continue;
            if (used[i]===true) continue;
            let comp=[];
            findComponent(i,graph.adjList,graph.edgeList,used,comp);
            comps.push(comp);
        }
        for (let i=0; i<graph.edgeList.length; i++) {
            if (graph.edgeList[i]===undefined) continue;
            delete graph.edgeList[i].bridge;
        }
        return comps;
    }
    function colourDCC () {
        let graph=this;
        let colours=["#c76dbf","#99498a","#80447f","#513d66","#3653b3","#248ad4","#5fcaed","#82ebf5","#17b2e6","#306ec9",
                     "#237040","#2d801b","#52992e","#66b324","#86cc14","#b0e627","#ffff69","#f7db02","#e8c00e","#f7aa25",
                     "#ff8c00","#ff8c00","#f0690e","#f0cab6","#e8bb97","#e09e75","#c9794b","#b06838","#ad6615","#733405",
                     "#542d01","#361c01","#574d43","#786e65","#b0a79d","#c7c5c3","#f2f2f2"];
        let comps=findDCC(graph),num=comps.length;
        let jump=Math.floor(colours.length/num),colour=0;
        let versColour=[];
        for (let i=0; i<num; i++) {
            for (let j=0; j<comps[i].length; j++) {
                let v=comps[i][j];
                graph.svgVertices[v].circle.attr("fill",colours[colour]);
                versColour[v]=colours[colour];
            }
            colour+=jump;
        }
        for (let i=0; i<graph.edgeList.length; i++) {
            if (graph.edgeList[i]===undefined) continue;
            let from=graph.edgeList[i].x,to=graph.edgeList[i].y;
            if (versColour[from]===versColour[to]) graph.svgEdges[i].line.attr("stroke",versColour[from]);
            else {
                graph.svgEdges[i].line.attr("stroke","red");
                graph.svgEdges[i].line.attr("stroke-width",graph.findStrokeWidth()*2);
            }
        }
    }
    
    function initExample (part) {
        if (part===1) {
            let example1=new Graph();
            example1.init(".graphExample1",6,false);
            example1.buildEdgeDataStructures([[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]]);
            example1.edgeList[3].addedCSS[0]="stroke: red";
            example1.drawNewGraph(false,25);
            
            let example2=new Graph();
            example2.init(".graphExample2",5,false);
            example2.buildEdgeDataStructures([[0,1],[1,2],[2,0],[2,3],[3,4],[4,2]]);
            example2.vertices[2].addedCSS[0]="stroke: red";
            example2.drawNewGraph(false,25);
        }
        else if (part===2) {
            let example3=new Graph();
            let animationObj = new Animation();
            $(".graphExample3 .default").on("click", async function () {
                example3.init(".graphExample3",8,false,function () {
                    example3.calcPositions.frameY=example3.vertexRad;
                });
                example3.buildEdgeDataStructures([[0,1],[0,2],[1,2],[1,6],[2,3],[2,6],[3,4],[3,7],[4,7],[5,6]]);
                example3.drawNewGraph(true,15,false,0,15);
                example3.setSettings([false, false, true]);
                
                $(".graphExample3 .start-vertex").val("1");
                $(".graphExample3 .time").hide();
                await animationObj.init(".graphExample3",function findAnimations () {
                    let st=parseInt($(".graphExample3 .start-vertex").val()); st--;
                    let used=[],found=false;
                    for (let i=0; i<example3.n; i++) {
                        if (example3.vertices[i]===undefined) continue;
                        if (i===st) found=true;
                        used[i]=false;
                    }
                    if (found===false) {
                        alert("Невалиден номер на връх!");
                        return [];
                    }
                    
                    example3.calcPositions.calc(true,st);
                    example3.draw(false,true,true);
                    $(".graphExample3 .time").text("Време: 0");
                    
                    let animations=[];
                    let inTime=[],up=[];
                    time=0;
                    dfs(st,-1,used,inTime,up,example3,animations);
                    return animations;
                },function initialState () {
                    example3.draw(false,false,true);
                },function startFunction () {
                    $(".graphExample3 .default").parent().hide();
                    $(".graphExample3 .time").show();
                },function stopFunction () {
                    $(".graphExample3 .default").parent().show();
                    $(".graphExample3 .time").hide();
                });
                example3.graphController.hasAnimation(animationObj);
            }).click();
            $("graphExample3 .start-vertex").on("keydown",isDigit);
        }
        else if (part===3) {
            let example4=new Graph();
            example4.init(".graphExample4",5,false);
            example4.buildEdgeDataStructures([[0,1],[1,2],[2,0],[2,3],[3,4],[4,2]]);
            example4.vertices[0].addedCSS[0]="fill: magenta";
            example4.vertices[1].addedCSS[0]="fill: magenta";
            example4.vertices[2].addedCSS[0]="fill: red";
            example4.vertices[3].addedCSS[0]="fill: yellow";
            example4.vertices[4].addedCSS[0]="fill: yellow";
            example4.drawNewGraph(false,25);
            
            let example5=new Graph();
            $(".graphExample5 .default").on("click", function () {
                example5.init(".graphExample5",8,false,colourDCC.bind(example5));
                example5.buildEdgeDataStructures([[0,1],[0,2],[1,2],[1,6],[2,3],[2,6],[3,4],[3,7],[4,7],[5,6]]);
                example5.drawNewGraph(true,15,false,0,15);
                example5.setSettings([false, false, true]);
                colourDCC.call(example5);
            }).click();
        }
    }
    
    
    window.initExample = initExample;
})();