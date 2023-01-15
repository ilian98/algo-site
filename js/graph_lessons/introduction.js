"use strict";
(function () {
    function displayDegree (graph) {
        let table=[];
        table.push(["Име на връx","Степен"]);
        for (let [i, vr] of graph.getVertices()) {
            let row=[];
            row.push(vr.name);
            let deg=0;
            for (let ind of graph.adjList[i]) {
                let u=graph.getEdge(ind).findEndPoint(i);
                if (u==i) deg+=2;
                else deg++;
            }
            row.push(deg);
            table.push(row);
        }
        $(".degree").html(tableHTML(table,true,false));
    }
    function BFS (n, beg, end, adjList, edgeList, removedEdge) {
        let [x,y]=removedEdge;
        let prev=new Array(n),used=new Array(n);
        let bfs=[];
        bfs.push(beg); used[beg]=true;
        while (bfs.length>0) {
            let curr=bfs.shift();
            if (curr===end) break;
            for (let ind of adjList[curr]) {
                let v=edgeList[ind].findEndPoint(curr);
                if (used[v]===true) continue;
                if (((curr==x)&&(v==y))||((curr==y)&&(v==x))) continue;
                used[v]=true; prev[v]=curr;
                bfs.push(v);
            }
        }
        if (used[end]!==true) return [];
        let path=[];
        let curr=end;
        path.push(curr+1);
        while (curr!==beg) {
            curr=prev[curr];
            path.push(curr+1);
        }
        return path.reverse();
    }
    function findPaths (graph) {
        let beg=$(".graphExample5 .beg").val(),end=$(".graphExample5 .end").val();
        if ((beg<1)||(beg>graph.n)) {
            alert("Невалиден номер на начален връх!");
            return ;
        }
        if ((end<1)||(end>graph.n)) {
            alert("Невалиден номер на краен връх!");
            return ;
        }
        beg--; end--;
        let paths=$(".graphExample5 .paths");
        let path=BFS(graph.n,beg,end,graph.adjList,graph.getIndexedEdges(),[-1,-1]);
        paths.text("");
        if (path.length===0) paths.append("Няма прост път, започващ в началния връх.<br>");
        else paths.append("Прост път: $"+BFS(graph.n,beg,end,graph.adjList,graph.getIndexedEdges(),[-1,-1]).join(",")+"$<br>");
        
        let minPath=[];
        for (let ind of graph.adjList[beg]) {
            let v=graph.getEdge(ind).findEndPoint(beg);
            path=BFS(graph.n,beg,v,graph.adjList,graph.getIndexedEdges(),[beg,v]);
            if (path.length===0) continue;
            if ((minPath.length===0)||(minPath.length>path.length)) minPath=path;
        }
        if (minPath.length===0) paths.append("Няма прост цикъл, започващ в началния връх.");
        else paths.append("Прост цикъл: "+"$"+minPath.join(",")+","+(beg+1)+"$<br>");
        if (typeof MathJax!=="undefined") MathJax.typeset([".graphExample5 .paths"]);
    }
    function displayMatrix (graph) {
        let table=[],row=[];
        row.push("$A$");
        let vers=graph.getVertices();
        for (let [i, vr] of vers) {
            row.push("$"+vr.name+"$");
        }
        table.push(row);
        for (let [i, vr] of vers) {
            row=[];
            row.push("$"+vr.name+"$");
            for (let [j, vr2] of vers) {
                row.push(graph.adjMatrix[i][j].length);
            }
            table.push(row);
        }
        $(".matrix").html(tableHTML(table,true,true));
        if (typeof MathJax!=="undefined") MathJax.typeset([".matrix"]);
    }
    function displayAdjacencyList (graph) {
        let table=[];
        table.push(["Връх","Списък"]);
        for (let [i, vr] of graph.getVertices()) {
            let row=[];
            row.push("$"+vr.name+"$");
            row.push("");
            for (let ind of graph.adjList[i]) {
                let edge=graph.getEdge(ind);
                let v=graph.getVertex(edge.findEndPoint(i));
                if (graph.isWeighted===true) row[1]+="("+v.name+", "+edge.weight+") ";
                else {
                    if (row[1]!=="") row[1]+=", ";
                    row[1]+=v.name;
                }
            }
            table.push(row);
        }
        $(".adjacency-list").html(tableHTML(table,true,true));
        if (typeof MathJax!=="undefined") MathJax.typeset([".adjacency-list"]);
    }
    function displayEdgeList (graph) {
        let table=[];
        table.push(["Индекс","Ребро","$prev$"]);
        let last=new Array(graph.n);
        let vers=graph.getVertices();
        for (let [i, vr] of vers) {
            last[i]=-1;
        }
        for (let [i, edge] of graph.getEdges()) {
            let row=[];
            row.push("$"+i+"$");
            row.push("("+graph.getVertex(edge.x).name+", "+graph.getVertex(edge.y).name+")");
            row.push(last[edge.x]);
            table.push(row);
            last[edge.x]=i;
        }
        $(".graphExample9 .edge-list").html(tableHTML(table,true,true));
        if (typeof MathJax!=="undefined") MathJax.typeset([".graphExample9 .edge-list"]);

        table=[];
        table.push(["Връх","$last$"]);
        for (let [i, vr] of vers) {
            table.push(["$"+vr.name+"$",last[i]]);
        }
        $(".last").html(tableHTML(table,true,true));
        if (typeof MathJax!=="undefined") MathJax.typeset([".last"]);
    }

    function initExample (part) {
        if (part===2) {
            let example1=new Graph ();
            example1.init(".graphExample1",5,true);
            example1.buildEdgeDataStructures([[0,1],[0,2],[0,3],[1,4],[2,4]]);
            example1.drawNewGraph(false,25);

            let example2=new Graph ();
            example2.init(".graphExample2",5,false);
            example2.buildEdgeDataStructures([[0,1],[0,2],[0,3],[1,4],[2,4]]);
            example2.drawNewGraph(false,25);

            let example3=new Graph ();
            example3.init(".graphExample3",3,true);
            example3.buildEdgeDataStructures([[0,1],[0,1],[0,1],[0,1],[1,2],[1,2]]);
            example3.drawNewGraph(false,50);

            let example4=new Graph ();
            $(".graphExample4 .default").on("click", function () {
                example4.init(".graphExample4",5,false,displayDegree.bind(this,example4));
                example4.buildEdgeDataStructures([[0,0],[0,0],[1,1],[1,2],[1,3],[2,4],[3,4]]);
                example4.drawNewGraph(true,20);
                example4.setSettings([false, false, true]);
                displayDegree(example4); 
            }).click(); 

            let example5=new Graph ();
            $(".graphExample5 .default").on("click", function () {
                example5.init(".graphExample5",8,false);
                example5.buildEdgeDataStructures([[0,1],[1,2],[2,3],[3,0],[2,4],[4,5],[5,6],[6,7],[7,4]]);
                example5.drawNewGraph(true,20);
                example5.setSettings([false, false, false]);
                $(".graphExample5 .find").off("click").on("click",findPaths.bind(this,example5));
                $(".graphExample5 .beg").val("1");
                $(".graphExample5 .end").val("2"); 
                findPaths(example5);
            }).click();

            let example6=new Graph ();
            example6.init(".graphExample6",5,false);
            example6.buildEdgeDataStructures([[0,1,1],[0,2,2],[0,3,3],[1,4,1],[2,4,2]]);
            example6.drawNewGraph(false,23);
        }
        else if (part===3) {
            let example7=new Graph ();
            $(".graphExample7 .default").on("click", function () {
                example7.init(".graphExample7",5,true,displayMatrix.bind(this,example7));
                example7.isMulti=true;
                example7.buildEdgeDataStructures([[0,0],[1,2],[1,3],[1,4],[2,3]]);
                example7.drawNewGraph(true,20);
                example7.setSettings([true, false, true]);
                displayMatrix(example7);
            }).click();

            let example8=new Graph ();
            $(".graphExample8 .default").on("click", function () {
                example8.init(".graphExample8",5,false,displayAdjacencyList.bind(this,example8));
                example8.buildEdgeDataStructures([[0,1,8],[0,1,9],[1,2,6],[1,3,7],[2,4,10],[3,4,11]]);
                example8.drawNewGraph(true,20);
                displayAdjacencyList(example8);
            }).click();

            let example9=new Graph ();
            $(".graphExample9 .default").on("click", function () {
                example9.init(".graphExample9",4,true,displayEdgeList.bind(this,example9));
                example9.buildEdgeDataStructures([[0,1],[0,2],[1,2],[1,3],[2,1],[2,3]]);
                example9.drawNewGraph(true,20);
                example9.setSettings([false, false, true]);
                displayEdgeList(example9);
            }).click();
        }
    }
    
    
    window.initExample = initExample;
})();