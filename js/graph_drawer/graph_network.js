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
                let strokeWidth=this.graphDrawer.findStrokeWidth("edge",i);
                let curr=strokeWidth/2+(Math.abs(edge.flow)/max)*(1.5*strokeWidth);
                let edgeStyleObj=styleToObj(edge.defaultCSS[0]);
                edgeStyleObj["stroke-width"]=curr;
                
                if (this.isDirected===true) {
                    if (edge.real===false) {
                        edgeStyleObj["stroke-dasharray"]=this.vertexRad/2;
                        edgeStyleObj["opacity"]=0.5;
                        
                        let weightStyleObj=styleToObj(edge.defaultCSS[1]);
                        weightStyleObj["opacity"]=0.5;
                        let weightStyle=objToStyle(weightStyleObj);
                        this.svgEdges[i].weight.attr("style",weightStyle+" ; "+edge.addedCSS[1]);
                        edge.defaultCSS[1]=weightStyle;
                    }
                }
                else {
                    if ((edge.flow<0)||((edge.flow==0)&&(edge.real===false))) {
                        edgeStyleObj["opacity"]=0;
                        
                        let weightStyleObj=styleToObj(edge.defaultCSS[1]);
                        weightStyleObj["opacity"]=0;
                        let weightStyle=objToStyle(weightStyleObj);
                        this.svgEdges[i].weight.attr("style",weightStyle+" ; "+edge.addedCSS[1]);
                        edge.defaultCSS[1]=weightStyle;
                    }
                    else if (edge.curveHeight===undefined) {
                        if (edge.flow===0) this.svgEdges[i].endDist=0;
                    }
                }
                if ((this.isDirected===true)||(edge.flow!=0)) {
                    this.svgEdges[i].endDist=this.graphDrawer.addMarkerEnd(this.svgEdges[i].line,false,curr,
                                  this.svgVertices[edge.x].coord,this.svgEdges[i].drawProperties[0]);
                    edgeStyleObj["marker-end"]=styleToObj(this.svgEdges[i].line.attr("style"))["marker-end"];
                }
                else delete edgeStyleObj["marker-end"];
                let edgeStyle=objToStyle(edgeStyleObj);
                this.svgEdges[i].line.attr("style",edgeStyle+" ; "+edge.addedCSS[0]);
                edge.defaultCSS[0]=edgeStyle;
                let x=edge.x,y=edge.y;
                let st=this.svgVertices[x].coord,end=this.svgVertices[y].coord;        
                this.graphDrawer.redrawEdge(this.svgEdges[i],st,end,i);
            }
        }
    }
})();