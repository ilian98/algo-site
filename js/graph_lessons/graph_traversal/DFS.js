'use strict';
function vertexAnimation (graph, vr, colour, type) {
    return function(callback, speed) {
        let obj;
        if (type==="circle") obj=graph.svgVertices[vr].circle;
        else obj=graph.svgVertices[vr].text;
        if (speed>0) {
            obj.animate({fill: colour},speed,callback);
            return obj.inAnim()[0].mina;
        }
        obj.attr({fill: colour});
    }
}
function edgeAnimation (graph, vr1, vr2) {
    return function(callback, speed) {
        if (speed>0) {
            let obj1=graph.svgVertices[vr1];
            let obj2=graph.svgVertices[vr2];
            let stx=obj1.coord[0]+graph.vertexRad;
            let sty=obj1.coord[1]+graph.vertexRad;
            let endx=obj2.coord[0]+graph.vertexRad;
            let endy=obj2.coord[1]+graph.vertexRad;

            let lineDraw=graph.s.line(stx,sty,stx,sty);
            lineDraw.attr({stroke: "red", "stroke-width": graph.vertexRad/20*4});
            graph.s.append(obj1.group);
            graph.s.append(obj2.group);
            lineDraw.animate({x1: stx, y1:sty, x2: endx, y2: endy},speed,function () {
                callback();
                lineDraw.remove();
            });
            return lineDraw.inAnim()[0].mina;
        }
    }
}
function dfs (vr, used, graph, animations) {
    used[vr]=1;
    let text;
    for (let to of graph.adjList[vr]) {
        if (used[to]==0) {
            text="Напускаме връх "+(vr+1)+" и отиваме в "+(to+1)+".";
            animations.push({
                animFunctions: [vertexAnimation(graph,vr,"grey","circle"),
                                vertexAnimation(graph,vr,"white","text"),
                                edgeAnimation(graph,vr,to)],
                animText: text
            });
            
            text="Сега сме във връх "+(to+1)+".";
            animations.push({
                animFunctions: [vertexAnimation(graph,to,"red","circle"),
                                vertexAnimation(graph,to,"black","text")],
                animText: text
            });
                
            dfs(to,used,graph,animations);
            
            text="Връщаме се на връх "+(vr+1)+".";
            animations.push({
                animFunctions: [vertexAnimation(graph,vr,"red","circle"),
                                vertexAnimation(graph,vr,"black","text")],
                animText: text
            });
        }
        else {
            text="Oказва се, че съседът с номер "+(to+1)+" вече е обходен.";
            animations.push({
                animFunctions: [edgeAnimation(graph,vr,to)],
                animText: text
            });
        }
    }
    text="Вече проверихме всички съседи на връх "+(vr+1)+" и го напускаме.";
    animations.push({
        animFunctions: [vertexAnimation(graph,vr,"black","circle"),
                        vertexAnimation(graph,vr,"white","text")],
        animText: text
    });
}

function graphExample (name, isOriented, vertexRad) {
    let graph = new Graph();
    graph.init(name+" .graph",5,isOriented,true);
    if (isOriented==false) graph.edgeList=[[0,1],[0,2],[0,3],[0,4],[1,2]];
    else graph.edgeList=[[0,1],[1,0],[0,2],[2,0],[0,3],[3,0],[0,4],[4,0],[1,2],[2,1]];
    graph.fillAdjListMatrix();
    graph.drawNewGraph(1,1,299,299,vertexRad,true);
        
    let animationObj = new Animation();
    animationObj.init(name,function () {
        let animations=[];
        let used=[];
        for (let i=0; i<graph.n; i++) {
            used[i]=0;
        }
        animations.push({
            animFunctions: [vertexAnimation(graph,0,"red","circle")],
            animText: "Започваме обхождането от връх номер 1."
        });
        dfs(0,used,graph,animations);
        return animations;
    },function (flag) {
        graph.s.selectAll("*").remove();
        graph.draw(flag);
    });
    
    let svgElement = document.querySelector(name+" .graph");
    svgElement.blockScroll=false;
    svgElement.ontouchstart = function (event) {
        this.blockScroll=true;
    };
    svgElement.ontouchend = function () {
        this.blockScroll=false;
    };
    svgElement.ontouchmove = function (event) {
        if (this.blockScroll==true) event.preventDefault();
    };
    
    let slider=document.querySelector(name+" .range");
    let output=document.querySelector(name+" .slider-value");
    slider.value=5;
    output.innerHTML=slider.value;
    slider.oninput = function() {
        animationObj.clear();
        output.innerHTML=this.value;
        graph.init(name+" .graph",this.value,isOriented,true);
        graph.drawNewGraph(1,1,299,299,vertexRad,true);
    }
}