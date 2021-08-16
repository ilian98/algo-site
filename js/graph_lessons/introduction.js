function displayDegree (graph) {
    let table=$(".degree");
    let tableText="";
    tableText+='<thead><tr><th>Номер на връx</th><th>Степен</th></thead><tbody>';
    for (let i=0; i<graph.n; i++) {
        tableText+='<tr><td>'+(i+1)+'</td>';
        let deg=0;
        for (let u of graph.adjList[i]) {
            if (u==i) deg+=2;
            else deg++;
        }
        tableText+='<td>'+deg+'</td></tr>';
    }
    tableText+='</tbody>';
    table.html(tableText);
}
function initExample (part) {
    if (part==2) {
        let example1 = new Graph ();
        example1.init(".graphExample1",6,true);
        example1.edgeList=[[0,1],[0,2],[0,3],[1,4],[2,4]];
        example1.fillAdjListMatrix();
        example1.drawNewGraph(1,1,299,299,25,true);

        let example2 = new Graph ();
        example2.init(".graphExample2",5,false);
        example2.edgeList=[[0,1],[0,2],[0,3],[1,4],[2,4]];
        example2.fillAdjListMatrix();
        example2.drawNewGraph(1,1,299,299,25,true);
        
        let example3= new Graph ();
        example3.init(".graphExample3",3,true);
        example3.edgeList=[[0,1],[0,1],[0,1],[0,1],[1,2],[1,2]];
        example3.fillAdjListMatrix();
        example3.drawNewGraph(1,1,299,299,50,true);
        
        let example4 = new Graph ();
        example4.init(".graphExample4",5,false,false,false,displayDegree.bind(this,example4));
        example4.edgeList=[[0,0],[0,0],[1,1],[1,2],[1,3],[2,4],[3,4]];
        example4.fillAdjListMatrix();
        example4.drawNewGraph(1,22,299,279,20,true);
        displayDegree(example4);   
    }
}