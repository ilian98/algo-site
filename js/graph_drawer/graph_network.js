"use strict";
(function () {
    Graph.prototype = {
        addReverseEdge: function (ind, data = []) {
            let x=this.edgeList[ind].x,y=this.edgeList[ind].y,t=this.edgeList[ind].weight;
            let css=["",""];
            let curveHeight=undefined,prevInd=undefined;
            if (data.length==3) {
                css=data[0];
                curveHeight=data[1];
                prevInd=data[2];
            }
            let rev=this.addEdge(y,x,(this.isDirected===true)?0:t,css,curveHeight,prevInd,false);
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
            if (this.isDirected===false) {
                for (let i=0; i<this.edgeList.length; i++) {
                    if (this.edgeList[i]===undefined) continue;
                    let edge=this.edgeList[i];
                    this.adjMatrix[edge.y][edge.x].splice(this.adjMatrix[edge.y][edge.x].indexOf(i),1);
                    this.adjList[edge.y].splice(this.adjList[edge.y].indexOf(i),1);
                    this.reverseAdjList[edge.y].push(i);
                }
            }
            for (let ind of edges) {
                this.addReverseEdge(ind);
            }
        },
        networkView : function () {
            let max=1;
            for (let i=0; i<this.edgeList.length; i++) {
                if (this.edgeList[i]===undefined) continue;
                max=Math.max(max,this.edgeList[i].flow);
            }
            
            for (let i=0; i<this.edgeList.length; i++) {
                if (this.edgeList[i]===undefined) continue;
                
                let strokeWidth=this.findStrokeWidth();
                let curr=strokeWidth/2+(Math.abs(this.edgeList[i].flow)/max)*(1.5*strokeWidth);
                let edgeStyleObj=styleToObj(this.edgeList[i].defaultCSS[0]);
                edgeStyleObj["stroke-width"]=curr;
                
                if (this.isDirected===true) {
                    if (this.edgeList[i].real===false) {
                        edgeStyleObj["stroke-dasharray"]=this.vertexRad/2;
                        edgeStyleObj["opacity"]=0.5;
                        
                        let weightStyleObj=styleToObj(this.edgeList[i].defaultCSS[1]);
                        weightStyleObj["opacity"]=0.5;
                        let weightStyle=objToStyle(weightStyleObj);
                        this.svgEdges[i].weight.attr("style",weightStyle+" ; "+this.edgeList[i].addedCSS[1]);
                        this.edgeList[i].defaultCSS[1]=weightStyle;
                    }
                }
                else {
                    if ((this.edgeList[i].flow<0)||((this.edgeList[i].flow==0)&&(this.edgeList[i].real===false))) {
                        edgeStyleObj["opacity"]=0;
                        
                        let weightStyleObj=styleToObj(this.edgeList[i].defaultCSS[1]);
                        weightStyleObj["opacity"]=0;
                        let weightStyle=objToStyle(weightStyleObj);
                        this.svgEdges[i].weight.attr("style",weightStyle+" ; "+this.edgeList[i].addedCSS[1]);
                        this.edgeList[i].defaultCSS[1]=weightStyle;
                    }
                    else if (this.edgeList[i].curveHeight===undefined) {
                        let x=this.edgeList[i].x,y=this.edgeList[i].y;
                        let st=this.svgVertices[x].coord,end=this.svgVertices[y].coord;
                        this.svgEdges[i].drawProperties[0]=0; this.edgeList[i].curveHeight=0;
                        if (this.edgeList[i].flow===0) this.svgEdges[i].endDist=0;
                        this.redrawEdge(this.svgEdges[i],st,end,i);
                    }
                }
                if ((this.isDirected===true)||(this.edgeList[i].flow!=0)) {
                    this.addMarkerEnd(this.svgEdges[i].line,false,curr,
                                  this.svgVertices[this.edgeList[i].x].coord,this.svgEdges[i].drawProperties[0]);
                    edgeStyleObj["marker-end"]=styleToObj(this.svgEdges[i].line.attr("style"))["marker-end"];
                }
                else delete edgeStyleObj["marker-end"];
                let edgeStyle=objToStyle(edgeStyleObj);
                this.svgEdges[i].line.attr("style",edgeStyle+" ; "+this.edgeList[i].addedCSS[0]);
                this.edgeList[i].defaultCSS[0]=edgeStyle;
                
            }
        }
    }
})();