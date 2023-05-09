"use strict";
(function () {
    Graph.prototype = {
        addReverseEdge: function (ind, data = []) {
            let edge=this.getEdge(ind);
            let x=edge.x,y=edge.y,t=edge.weight;
            let css=["",""];
            let curveHeight=undefined,prevInd=undefined;
            if (data.length==3) {
                css=data[0];
                curveHeight=data[1];
                prevInd=data[2];
            }
            let rev=this.addEdge(y,x,(this.isDirected===true)?0:t,css,curveHeight,prevInd,false);
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
        },
        networkView : function () {
            let max=1;
            let edges=this.getEdges();
            for (let [i, edge] of edges) {
                max=Math.max(max,edge.flow);
            }
            
            for (let [i, edge] of edges) {
                edge.addedCSS[0]["stroke-width"]="";
                let strokeWidth=this.graphDrawer.findStrokeWidth("edge",i);
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
                    if ((edge.flow<0)||((edge.flow==0)&&(edge.real===false))) {
                        edge.addedCSS[0]["opacity"]=0;
                        edge.addedCSS[1]["opacity"]=0;
                    }
                    if (edge.curveHeight===undefined) edge.curveHeight=0;
                    if (edge.flow===0) { console.log("tuk");
                        this.svgEdges[i].endDist=0;
                        this.svgEdges[i].line.markerEnd.remove();
                        let x=edge.x,y=edge.y;
                        let st=this.svgVertices[x].coord,end=this.svgVertices[y].coord;        
                        this.graphDrawer.redrawEdge(this.svgEdges[i],st,end,i);
                    }
                }
                this.graphDrawer.recalcAttrEdge(this.svgEdges[i],i);
            }
        }
    }
})();