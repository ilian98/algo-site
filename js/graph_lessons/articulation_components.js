"use strict";
(function () {
    function initExample (part) {
        if (part===1) {
            let example1=new Graph ();
            example1.init(".graphExample1",6,false);
            example1.buildEdgeDataStructures([[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]]);
            example1.edgeList[3].addedCSS[0]="stroke: red";
            example1.drawNewGraph(false,25);
            
            let example2=new Graph ();
            example2.init(".graphExample2",5,false);
            example2.buildEdgeDataStructures([[0,1],[1,2],[2,0],[2,3],[3,4],[4,2]]);
            example2.vertices[2].addedCSS[0]="stroke: red";
            example2.drawNewGraph(false,25);
        }
    }
    
    
    window.initExample = initExample;
})();