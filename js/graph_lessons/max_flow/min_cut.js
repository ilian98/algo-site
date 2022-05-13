"use strict";
(function () {
    let dist,ind;
    function dfs (vr, min1, adjList, edgeList, sink) {
        if (vr===sink) return min1;
        for (let i=ind[vr]; i<adjList[vr].length; i++, ind[vr]++) {
            let edge=edgeList[adjList[vr][i]];
            if (edge.weight-edge.flow===0) continue;
            let to=edgeList[adjList[vr][i]].findEndPoint(vr);
            if (dist[vr]+1!=dist[to]) continue;
            let f=dfs(to,Math.min(min1,edge.weight-edge.flow),adjList,edgeList,sink);
            if (f>0) {
                edge.flow+=f;
                edgeList[edge.rev].flow-=f;
                return f;
            }
        }
        return 0;
    }
    function bfs (graph) {
        let vers=[];
        for (let i=0; i<graph.n; i++) {
            if (graph.vertices[i]===undefined) continue;
            dist[i]=0;
        }
        vers.push(graph.source);
        dist[graph.source]=1;
        while (vers.length>0) {
            let vr=vers.shift();
            if (vr===graph.sink) break;
            for (let ind of graph.adjList[vr]) {
                let edge=graph.edgeList[ind];
                if (edge.weight-edge.flow===0) continue;
                let to=graph.edgeList[ind].findEndPoint(vr);
                if (dist[to]!==0) continue;
                vers.push(to); dist[to]=dist[vr]+1;
            }
        }
    }
    let seen;
    function findCut (vr, adjList, edgeList) {
        if (seen[vr]===true) return ;
        seen[vr]=true;
        for (let ind of adjList[vr]) {
            let edge=edgeList[ind];
            if (edge.weight-edge.flow===0) continue;
            findCut(edgeList[ind].findEndPoint(vr),adjList,edgeList);
        }
    }
    function findFlowCut () {
        dist=[]; ind=[];
        for (let i=0; i<this.edgeList.length; i++) {
            if (this.edgeList[i]===undefined) continue;
            this.edgeList[i].flow=0;
        }
        let maxFlow=0;
        let count=0;
        for (;;) {
            count++; if (count>10) {
                console.log(count);
                break;
            }
            bfs(this);
            if (dist[this.sink]===0) break;
            ind=[];
            for (let i=0; i<this.n; i++) {
                if (this.vertices[i]===undefined) continue;
                ind[i]=0;
            }
            let counter=0;
            for (;;) {
                counter++;
                if (counter>10) { console.log(counter,this.sink); break; }
                let flow=dfs(this.source,1e9,this.adjList,this.edgeList,this.sink);
                maxFlow+=flow;
                if (flow===0) break;
            }
        }
        seen=[];
        findCut(this.source,this.adjList,this.edgeList);
        
        for (let i=0; i<this.n; i++) {
            if (this.vertices[i]===undefined) continue;
            if (seen[i]===true) {
                this.svgVertices[i].circle.attr("fill","green");
                if (i===this.source) this.svgVertices[i].text.attr("fill","white");
                else this.svgVertices[i].text.attr("fill","black");
            }
            else {
                this.svgVertices[i].circle.attr("fill","yellow");
                if (i===this.sink) this.svgVertices[i].text.attr("fill","#6495ED");
                else this.svgVertices[i].text.attr("fill","black");
            }
        }
        for (let i=0; i<this.edgeList.length; i++) {
            if (this.edgeList[i]===undefined) continue;
            let edge=this.edgeList[i];
            this.svgEdges[i].weight.attr("textpath").node.innerHTML=(edge.flow+"/"+edge.weight).toString();
            if (edge.real===true) {
                if ((seen[edge.x]===true)&&(seen[edge.y]!==true)) {
                    this.svgEdges[i].line.attr("stroke","red");
                    if (this.svgEdges[i].line.markerEnd!==undefined) this.svgEdges[i].line.markerEnd.attr("fill","red");
                }
                else {
                    this.svgEdges[i].line.attr("stroke","black");
                    if (this.svgEdges[i].line.markerEnd!==undefined) this.svgEdges[i].line.markerEnd.attr("fill","black");
                }
            }
        }
        this.networkView();
        return [maxFlow, seen];
    }
    function findSolution (change) {
        let text=$(".graphExample2 #inputArea").val().replaceAll("\r\n","\n");
        let lines=text.split("\n");
        let nums=[];
        for (let line of lines) {
            nums.push(line.split(" "));
        }
        let n=parseInt(nums[0][0]);
        if (n>6) {
            alert("Твърде много играчи");
            return ;
        }
        let edges=[];
        let sum=0;
        for (let i=1; i<=n; i++) {
            edges.push([0,i,parseInt(nums[1][i-1])]);
            edges.push([i,n+1,parseInt(nums[2][i-1])]);
            sum+=parseInt(nums[1][i-1])+parseInt(nums[2][i-1]);
        }
        for (let i=3; i<nums.length; i++) {
            edges.push([parseInt(nums[i][0]),parseInt(nums[i][1]),parseInt(nums[i][2])]);
        }
        if (change==="outside") {
            this.initVertices(n+2);
            for (let i=0; i<n+2; i++) {
                this.vertices[i].name=i.toString();
            }
            this.edgeList=[];
            this.graphController.undoStack=[];
            this.graphController.redoStack=[];
            this.buildEdgeDataStructures(edges);
            this.convertToNetwork(0,n+1,false);
            this.drawNewGraph(false,12);
        }
        let [flow, cut]=findFlowCut.call(this);
        $(".graphExample2 .value").text("Отговорът е \\("+sum+"-"+flow+"\\) \\(=sum-flow="+(sum-flow)+"\\). ");
        $(".graphExample2 .value").append("Той се получава със следното разпределение:<br>");
        $(".graphExample2 .value").append('Отбор на "добрите":');
        for (let i=1; i<=n; i++) {
            if (seen[i]===true) $(".graphExample2 .value").append(" "+i);
        }
        $(".graphExample2 .value").append('<br>Отбор на "лошите":');
        for (let i=1; i<=n; i++) {
            if (seen[i]!==true) $(".graphExample2 .value").append(" "+i);
        }
        if (typeof MathJax!=="undefined") MathJax.typeset([".graphExample2 .value"]);
    }
    
    function initExample (part) {
        if (part===2) {
            let example1=new Graph();
            $(".graphExample1 .default").on("click", function () {
                example1.init(".graphExample1",5,true,findFlowCut);
                example1.buildEdgeDataStructures([[0,1,5],[0,2,1],[1,3,5],[2,4,2],[3,2,2],[3,4,2]]);
                example1.convertToNetwork(0,4,false);
                example1.drawNewGraph(true,25);
                example1.setSettings([false, false, false]);
                
                $(".graphExample1 .src").val("1");
                $(".graphExample1 .src").off("input").on("input",() => {
                    let v=parseInt($(".graphExample1 .src").val());
                    if ((v<1)||(v>example1.n)) return ;
                    v--;
                    if (example1.vertices[v]===undefined) return ;
                    example1.source=v;
                    if (example1.source===example1.sink) {
                        alert("Не трябва да съвпадат източника и приемника!");
                        return ;
                    }
                    let [flow, cut]=findFlowCut.call(example1);
                    $(".graphExample1 .value").text("Максималният поток = минималният срез = "+flow);
                });
                $(".graphExample1 .sink").val("5");
                $(".graphExample1 .sink").off("input").on("input",() => {
                    let v=parseInt($(".graphExample1 .sink").val());
                    if ((v<1)||(v>example1.n)) return ;
                    v--;
                    if (example1.vertices[v]===undefined) return ;
                    example1.sink=v;
                    if (example1.source===example1.sink) {
                        alert("Не трябва да съвпадат източника и приемника!");
                        return ;
                    }
                    let [flow, cut]=findFlowCut.call(example1);
                    $(".graphExample1 .value").text("Максималният поток = минималният срез = "+flow);
                });
            }).click();
        }
        else if (part===3) {
            let example2=new Graph();
            $(".graphExample2 .default").on("click", function () {
                example2.init(".graphExample2",7,false,findSolution.bind(example2));
                example2.setSettings([false, false, false],false);
                
                $(".graphExample2 #inputArea").val(`5 4
10 15 22 20 31
10 14 10 25 31
1 4 10
2 4 10
1 3 2
4 5 10`);
                $(".graphExample2 .calc").off("click").on("click",findSolution.bind(example2,"outside")).click();
            }).click();
        }
    }
    
    
    window.initExample = initExample;
})();