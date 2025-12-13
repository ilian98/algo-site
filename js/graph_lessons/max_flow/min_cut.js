(function () {
    "use strict";
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
        for (let [i, vr] of graph.getVertices()) {
            dist[i]=0;
        }
        vers.push(graph.source);
        dist[graph.source]=1;
        while (vers.length>0) {
            let vr=vers.shift();
            if (vr===graph.sink) break;
            for (let ind of graph.adjList[vr]) {
                let edge=graph.getEdge(ind);
                if (edge.weight-edge.flow===0) continue;
                let to=edge.findEndPoint(vr);
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
    function findFlowCut (graph, change) {
        if (graph.isVisualChange(change)===true) return ;
        dist=[]; ind=[];
        let vers=graph.getVertices(),edges=graph.getEdges();
        for (let [i, edge] of edges) {
            edge.flow=0;
        }
        let maxFlow=0;
        for (let cnt=0; cnt<graph.n*(graph.getEdges().length/2); cnt++) {
            bfs(graph);
            if (dist[graph.sink]===0) break;
            ind=[];
            for (let [i, vr] of vers) {
                ind[i]=0;
            }
            for (let cnt=0; cnt<graph.n; cnt++) {
                let flow=dfs(graph.source,1e9,graph.adjList,graph.getIndexedEdges(),graph.sink);
                maxFlow+=flow;
                if (flow===0) break;
            }
        }
        seen=[];
        findCut(graph.source,graph.adjList,graph.getIndexedEdges());
        
        for (let [i, vr] of vers) {
            if (seen[i]===true) {
                vr.addedCSS[0].fill="green";
                if (i===graph.source) vr.addedCSS[1].fill="white";
                else vr.addedCSS[1].fill="black";
            }
            else {
                vr.addedCSS[0].fill="yellow";
                if (i===graph.sink) vr.addedCSS[1].fill="#6495ED";
                else vr.addedCSS[1].fill="black";
            }
        }
        for (let [i, edge] of edges) {
            if (edge.real===true) {
                if ((seen[edge.x]===true)&&(seen[edge.y]!==true)) edge.addedCSS[0].stroke="red";
                else edge.addedCSS[0].stroke="black";
            }
        }
        graph.networkView();
        graph.graphDrawer.draw(graph.graphDrawer.isDynamic,(change!=="network-conversion"));
        if (graph.wrapperName===".graphExample1") 
            $(".graphExample1 .value").text("Максималният поток = минималният срез = "+maxFlow);
        return [maxFlow, seen];
    }
    function findSolution (graph, change) {
        if (graph.isVisualChange(change)===true) return ;
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
            graph.initVertices(n+2);
            for (let [i, vr] of graph.getVertices()) {
                vr.name=i.toString();
            }
            graph.clearEdges();
            graph.graphController.undoStack=[];
            graph.graphController.redoStack=[];
            graph.buildEdgeDataStructures(edges);
            graph.isNetwork=true; graph.source=0; graph.sink=n+1;
            graph.drawNewGraph(false,0.6);
            graph.convertToNetwork(0,n+1,false);
        }
        let [flow, cut]=findFlowCut(graph,change);
        $(".graphExample2 .value").text("Отговорът е $"+sum+"-"+flow+"=sum-flow="+(sum-flow)+"$. ");
        $(".graphExample2 .value").append("Той се получава със следното разпределение:<br>");
        $(".graphExample2 .value").append('Отбор на "добрите":');
        for (let i=1; i<=n; i++) {
            if (seen[i]===true) $(".graphExample2 .value").append(" "+i);
        }
        $(".graphExample2 .value").append('<br>Отбор на "лошите":');
        for (let i=1; i<=n; i++) {
            if (seen[i]!==true) $(".graphExample2 .value").append(" "+i);
        }
        if ((typeof MathJax!=="undefined")&&(MathJax.typeset!==undefined)) MathJax.typeset([".graphExample2 .value"]);
    }
    
    function initExample (part) {
        if (part===2) {
            let example1=new Graph();
            $(".graphExample1 .default").on("click", function () {
                example1.init(".graphExample1",5,true,findFlowCut.bind(null,example1));
                example1.buildEdgeDataStructures([[0,1,5],[0,2,1],[1,3,5],[2,4,2],[3,2,2],[3,4,2]]);
                example1.isNetwork=true; example1.source=0; example1.sink=4;
                example1.drawNewGraph(true,5/4);
                example1.convertToNetwork(0,4,false);
                example1.setSettings([false, false, false]);
                
                $("#src").val("1");
                $("#src").off("input").on("input",() => {
                    let v=parseInt($("#src").val());
                    if ((v<1)||(v>example1.n)) return ;
                    v--;
                    if (example1.getVertex(v)===undefined) return ;
                    example1.source=v;
                    if (example1.source===example1.sink) {
                        alert("Не трябва да съвпадат източника и приемника!");
                        return ;
                    }
                    let [flow, cut]=findFlowCut(example1,"outside");
                });
                $("#sink").val("5");
                $("#sink").off("input").on("input",() => {
                    let v=parseInt($("#sink").val());
                    if ((v<1)||(v>example1.n)) return ;
                    v--;
                    if (example1.getVertex(v)===undefined) return ;
                    example1.sink=v;
                    if (example1.source===example1.sink) {
                        alert("Не трябва да съвпадат източника и приемника!");
                        return ;
                    }
                    let [flow, cut]=findFlowCut(example1,"outside");
                });
            }).click();
        }
        else if (part===3) {
            let example2=new Graph();
            $(".graphExample2 .default").on("click", function () {
                example2.init(".graphExample2",7,false,findSolution.bind(null,example2));
                example2.setSettings([false, false, false],false,true,false);
                
                $(".graphExample2 #inputArea").val(`5 4
10 15 22 20 31
10 14 10 25 31
1 4 10
2 4 10
1 3 2
4 5 10`);
                $(".graphExample2 .calc").off("click").on("click",findSolution.bind(null,example2,"outside")).click();
            }).click();
        }
    }
    
    
    window.initExample = initExample;
})();