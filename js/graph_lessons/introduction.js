function displayDegree (graph) {
    let table=$(".degree");
    let tableText="";
    tableText+='<thead><tr><th>Номер на връx</th><th>Степен</th></thead><tbody>';
    for (let i=0; i<graph.n; i++) {
        tableText+='<tr><td>'+(i+1)+'</td>';
        let deg=0;
        for (let ind of graph.adjList[i]) {
            let u=graph.edgeList[ind].findEndPoint(i);
            if (u==i) deg+=2;
            else deg++;
        }
        tableText+='<td>'+deg+'</td></tr>';
    }
    tableText+='</tbody>';
    table.html(tableText);
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
    paths.text("");
    paths.append("Прост път: "+"\\("+BFS(graph.n,beg,end,graph.adjList,graph.edgeList,[-1,-1]).join(",")+"\\)<br>");
    let minPath=[];
    for (let ind of graph.adjList[beg]) {
        let v=graph.edgeList[ind].findEndPoint(beg);
        let path=BFS(graph.n,beg,v,graph.adjList,graph.edgeList,[beg,v]);
        if (path.length===0) continue;
        if ((minPath.length===0)||(minPath.length>path.length)) minPath=path;
    }
    if (minPath.length===0) paths.append("Няма прост цикъл започващ в началния връх.");
    else paths.append("Прост цикъл: "+"\\("+minPath.join(",")+","+(beg+1)+"\\)<br>");
    if (typeof MathJax!=="undefined") MathJax.typeset([".graphExample5 .paths"]);
}
function displayMatrix (graph) {
    let table=$(".matrix");
    let tableText="";
    tableText+='<thead><tr style="background-color: grey"><th>\\(A\\)</th>';
    for (let i=1; i<=graph.n; i++) {
        tableText+='<th>\\('+i+'\\)</th>';
    }
    tableText+='</thead><tbody>';
    for (let i=0; i<graph.n; i++) {
        tableText+='<tr><td style="background-color: grey">\\('+(i+1)+'\\)</td>';
        for (let j=0; j<graph.n; j++) {
            tableText+='<td>'+graph.adjMatrix[i][j]+'</td>';
        }
        tableText+='</tr>';
    }
    tableText+='</tbody>';
    table.html(tableText);
    if (typeof MathJax!=="undefined") MathJax.typeset([".matrix"]);
}
function displayAdjacencyList (graph) {
    let table=$(".adjacency-list");
    let tableText="";
    tableText+='<thead><tr style="background-color: grey"><th>Връх</th><th>Списък</th>';
    tableText+='</thead><tbody>';
    for (let i=0; i<graph.n; i++) {
        tableText+='<tr><td style="background-color: grey">\\('+(i+1)+'\\)</td><td>';
        for (let ind of graph.adjList[i]) {
            let v=graph.edgeList[ind].findEndPoint(i);
            tableText+='('+(v+1)+', '+graph.edgeList[ind].weight+') ';
        }
        tableText+='</td></tr>';
    }
    tableText+='</tbody>';
    table.html(tableText);
    if (typeof MathJax!=="undefined") MathJax.typeset([".adjacency-list"]);
}
function displayEdgeList (graph) {
    let table=$(".edge-list");
    let tableText="";
    tableText='<thead><tr style="background-color: grey"><th>Индекс</th><th>Ребро</th><th>\\(prev\\)</th>';
    tableText+='</thead><tbody>';
    let last=new Array(graph.n);
    for (let i=0; i<graph.n; i++) {
        last[i]=-1;
    }
    for (let i=0; i<graph.edgeList.length; i++) {
        tableText+='<tr><td style="background-color: grey">\\('+i+'\\)</td>';
        tableText+='<td>('+(graph.edgeList[i].x+1)+', '+(graph.edgeList[i].y+1)+')</td>';
        tableText+='<td>'+last[graph.edgeList[i].x]+'</td></tr>';
        last[graph.edgeList[i].x]=i;
    }
    tableText+='</tbody>';
    table.html(tableText);
    if (typeof MathJax!=="undefined") MathJax.typeset([".edge-list"]);
    
    table=$(".last");
    tableText='<thead><tr style="background-color: grey"><th>Връх</th><th>\\(last\\)</th>';
    tableText+='</thead><tbody>';
    for (let i=0; i<graph.n; i++) {
        tableText+='<tr><td style="background-color: grey">\\('+(i+1)+'\\)</td>';
        tableText+='<td>'+last[i]+'</td></tr>';
    }
    tableText+='</tbody>';
    table.html(tableText);
    if (typeof MathJax!=="undefined") MathJax.typeset([".last"]);
}

function initExample (part) {
    if (part===2) {
        let example1 = new Graph ();
        example1.init(".graphExample1",6,true);
        example1.buildEdgeDataStructures([[0,1],[0,2],[0,3],[1,4],[2,4]]);
        example1.drawNewGraph(1,1,299,299,25,true);

        let example2 = new Graph ();
        example2.init(".graphExample2",5,false);
        example2.buildEdgeDataStructures([[0,1],[0,2],[0,3],[1,4],[2,4]]);
        example2.drawNewGraph(1,1,299,299,25,true);
        
        let example3= new Graph ();
        example3.init(".graphExample3",3,true);
        example3.buildEdgeDataStructures([[0,1],[0,1],[0,1],[0,1],[1,2],[1,2]]);
        example3.drawNewGraph(1,1,299,299,50,true);
        
        let example4 = new Graph ();
        example4.init(".graphExample4",5,false,false,false,displayDegree.bind(this,example4));
        example4.buildEdgeDataStructures([[0,0],[0,0],[1,1],[1,2],[1,3],[2,4],[3,4]]);
        example4.drawNewGraph(1,22,299,278,20,true);
        displayDegree(example4);  
        
        let example5 = new Graph ();
        example5.init(".graphExample5 .graph",8,false);
        example5.buildEdgeDataStructures([[0,1],[1,2],[2,3],[3,0],[2,4],[4,5],[5,6],[6,7],[7,4]]);
        example5.drawNewGraph(1,1,299,299,20,true);
        $(".graphExample5 .find").off("click").on("click",findPaths.bind(this,example5));
        $(".graphExample5 .beg").val("1");
        $(".graphExample5 .end").val("2"); 
        findPaths(example5);
        
        let example6 = new Graph ();
        example6.init(".graphExample6",5,false);
        example6.buildEdgeDataStructures([[0,1,1],[0,2,2],[0,3,3],[1,4,1],[2,4,2]]);
        example6.drawNewGraph(11,11,289,289,23,true);
    }
    else if (part===3) {
        let example7 = new Graph ();
        example7.init(".graphExample7",5,false,false,false,displayMatrix.bind(this,example7));
        example7.isMulti=true;
        example7.buildEdgeDataStructures([[0,0],[1,2],[1,3],[1,4],[2,3]]);
        example7.drawNewGraph(1,22,299,278,20,true);
        displayMatrix(example7);
        
        let example8 = new Graph ();
        example8.init(".graphExample8",5,false,false,false,displayAdjacencyList.bind(this,example8));
        example8.buildEdgeDataStructures([[0,1,8],[0,1,9],[1,2,6],[1,3,7],[2,4,10],[3,4,11]]);
        example8.drawNewGraph(11,11,289,289,20,true);
        displayAdjacencyList(example8);
        
        let example9 = new Graph ();
        example9.init(".graphExample9",4,true,false,false,displayEdgeList.bind(this,example9));
        example9.buildEdgeDataStructures([[0,1],[0,2],[1,2],[1,3],[2,1],[2,3]]);
        example9.drawNewGraph(1,1,299,299,20,true);
        displayEdgeList(example9);
    }
}