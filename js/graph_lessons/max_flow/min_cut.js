"use strict";
(function () {
    function initExample (part) {
        if (part===2) {
            let example1=new Graph();
            $(".graphExample1 .default").on("click", function () {
                example1.init(".graphExample1",5,true);
                example1.isMulti=true;
                example1.buildEdgeDataStructures([[0,1,5],[0,2,1],[1,3,5],[2,4,2],[3,2,2],[3,4,2]]);
                example1.convertToNetwork(0,4);
                example1.drawNewGraph(true,25);
                example1.setSettings([false, false, false]);
                
                $(".graphExample1 .src").val("1");
                $(".graphExample1 .sink").val("5");
            }).click();
        }
        else if (part===3) {
            
        }
    }
    
    
    window.initExample = initExample;
})();