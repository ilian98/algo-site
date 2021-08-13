function initExample (part) {
    if (part==2) {
        let example1 = new Graph ();
        example1.init(".graphExample1",6,true);
        example1.edgeList=[[0,1],[0,2],[0,3],[1,4],[2,4]];
        example1.fillAdjListMatrix();
        example1.drawNewGraph(1,1,299,299,30,true);

        let example2 = new Graph ();
        example2.init(".graphExample2",5,false);
        example2.edgeList=[[0,1],[0,2],[0,3],[1,4],[2,4]];
        example2.fillAdjListMatrix();
        example2.drawNewGraph(1,1,299,299,30,true);
        
        let example3= new Graph ();
        example3.init(".graphExample3",3,true);
        example3.edgeList=[[0,1],[0,1],[0,1],[0,1],[1,2],[1,2]];
        example3.fillAdjListMatrix();
        example3.drawNewGraph(1,1,299,299,50,true);
    }
}