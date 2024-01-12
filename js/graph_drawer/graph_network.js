"use strict";
(function () {
    Graph.prototype = {
        addReverseEdge: function (ind, data = []) {
            let edge=this.getEdge(ind);
            let x=edge.x,y=edge.y,t=edge.weight;
            let userCSS=[{},{}];
            let curveHeight=undefined;
            let addedCSS=[{},{}];
            let weightTranslate=[0,0],weightRotation=0;
            let prevInd=undefined;
            if (data.length===6) {
                userCSS=data[0];
                curveHeight=data[1];
                addedCSS=data[2];
                weightTranslate=data[3];
                weightRotation=data[4];
                prevInd=data[5];
            }
            let rev=this.addEdge(y,x,(this.isDirected===true)?0:t,userCSS,curveHeight,addedCSS,weightTranslate,weightRotation,prevInd,false);
            edge.flow=0; edge.rev=rev; edge.real=true;
            let revEdge=this.getEdge(rev);
            revEdge.flow=0; revEdge.rev=ind; revEdge.real=false;
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
            let edges=this.getEdges();
            if (this.isDirected===false) {
                for (let [i, edge] of edges) {
                    this.adjMatrix[edge.y][edge.x].splice(this.adjMatrix[edge.y][edge.x].indexOf(i),1);
                    this.adjList[edge.y].splice(this.adjList[edge.y].indexOf(i),1);
                    this.reverseAdjList[edge.y].push(i);
                }
            }
            for (let [ind, edge] of edges) {
                this.addReverseEdge(ind);
            }
            this.graphDrawer.draw(this.graphDrawer.isDynamic,false);
            this.graphChange("network-conversion");
        },
        networkView : function () {
            let max=1;
            let edges=this.getEdges();
            for (let [i, edge] of edges) {
                if (edge.flow!==undefined) max=Math.max(max,edge.flow);
            }
            
            for (let [i, edge] of edges) {
                if (edge.flow===undefined) continue;
                delete edge.addedCSS[0]["stroke-width"];
                let strokeWidth=this.graphDrawer.findAttrValue("edge","stroke-width",i);
                let curr=strokeWidth/2+(Math.abs(edge.flow)/max)*(1.5*strokeWidth);
                edge.addedCSS[0]["stroke-width"]=curr;
                
                if (this.isDirected===true) {
                    if (edge.real===false) {
                        edge.addedCSS[0]["stroke-dasharray"]=10*this.size;
                        edge.addedCSS[0]["opacity"]=0.5;
                        edge.addedCSS[1]["opacity"]=0.5;
                    }
                }
                else {
                    if (edge.curveHeight===undefined) edge.curveHeight=0;
                }
            }
        }
    }
})();