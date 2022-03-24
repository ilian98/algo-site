"use strict";
(function () {
    Graph.prototype = {
        addReverseEdge: function (ind) {
            let x=this.edgeList[ind].x,y=this.edgeList[ind].y,t=this.edgeList[ind].weight;
            let rev=this.addEdge(y,x,0,[";stroke-dasharray: "+10+"; opacity: 0.5", "; opacity: 0.5"]);
            this.graphController.undoTime--;
            this.edgeList[ind].flow=0; this.edgeList[ind].rev=rev; this.edgeList[ind].real=true;
            this.edgeList[rev].flow=0; this.edgeList[rev].rev=ind; this.edgeList[rev].real=false;
        },
        convertToNetwork: function (source, sink) {
            this.isNetwork=true;
            this.source=source;
            this.sink=sink;
            let len=this.edgeList.length;
            for (let i=0; i<len; i++) {
                if (this.edgeList[i]===undefined) continue;
                this.addReverseEdge(i);
            }
        }
    }
})();