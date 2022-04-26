"use strict";
(function () {
    Graph.prototype = {
        addReverseEdge: function (ind, data = []) {
            let x=this.edgeList[ind].x,y=this.edgeList[ind].y,t=this.edgeList[ind].weight;
            let css=[";stroke-dasharray: "+(this.vertexRad/2)+"; opacity: 0.5;", "; opacity: 0.5;"];
            let curveHeight=undefined,prevInd=undefined;
            if (data.length==3) {
                css=data[0];
                curveHeight=data[1];
                prevInd=data[2];
            }
            let rev=this.addEdge(y,x,0,css,curveHeight,prevInd,false);
            this.edgeList[ind].flow=0; this.edgeList[ind].rev=rev; this.edgeList[ind].real=true;
            this.edgeList[rev].flow=0; this.edgeList[rev].rev=ind; this.edgeList[rev].real=false;
        },
        convertToNetwork: function (source, sink, separateChange = true) {
            if (this.graphController!==undefined) {
                if (separateChange===false) this.graphController.undoTime--;
                this.graphController.addChange("network-conversion",
                                               [this.isNetwork, this.source, this.sink],true);
            }
            
            this.isNetwork=true;
            this.source=source;
            this.sink=sink;
            let edges=[];
            for (let i=0; i<this.edgeList.length; i++) {
                if (this.edgeList[i]!==undefined) edges.push(i);
            }
            for (let ind of edges) {
                this.addReverseEdge(ind);
            }
        },
        edgeNetworkView : function () {
            let max=1;
            for (let i=0; i<this.edgeList.length; i++) {
                if (this.edgeList[i]===undefined) continue;
                max=Math.max(max,this.edgeList[i].flow);
            }
            for (let i=0; i<this.edgeList.length; i++) {
                if (this.edgeList[i]===undefined) continue;
                let strokeWidth=this.findStrokeWidth();
                let curr=strokeWidth/2+(Math.abs(this.edgeList[i].flow)/max)*(1.5*strokeWidth);
                this.svgEdges[i].line.attr({"stroke-width": curr});
                this.addMarkerEnd(this.svgEdges[i].line,false,curr,
                                  this.svgVertices[this.edgeList[i].x].coord,this.svgEdges[i].drawProperties[0]);
            }
        }
    }
})();