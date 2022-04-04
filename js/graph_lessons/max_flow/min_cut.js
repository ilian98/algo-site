"use strict";
(function () {
    let dist,ind;
    function dfs (vr, min1, adjList, edgeList, sink) {
        if (vr===sink) return min1;
        for (let i=ind[vr]; i<adjList[vr].length; i++, ind[vr]++) {
            let edge=edgeList[adjList[vr][i]];
            if (edge.weight-edge.flow===0) continue;
            let to=edgeList[adjList[vr][i]].findEndPoint(vr);
            if (dist[vr]+1!=dist[to]) continue;
            let f=dfs(to,Math.min(min1,edge.weight-edge.flow),adjList,edgeList,sink);
            if (f>0) {
                edge.flow+=f;
                edgeList[edge.rev].flow-=f;
                return f;
            }
        }
        return 0;
    }
    function bfs (graph) {
        let vers=[];
        for (let i=0; i<graph.n; i++) {
            if (graph.vertices[i]===undefined) continue;
            dist[i]=0;
        }
        vers.push(graph.source);
        dist[graph.source]=1;
        while (vers.length>0) {
            let vr=vers.shift();
            if (vr===graph.sink) break;
            for (let ind of graph.adjList[vr]) {
                let edge=graph.edgeList[ind];
                if (edge.weight-edge.flow===0) continue;
                let to=graph.edgeList[ind].findEndPoint(vr);
                if (dist[to]!==0) continue;
                vers.push(to); dist[to]=dist[vr]+1;
            }
        }
    }
    let seen;
    function findCut (vr, adjList, edgeList) {
        if (seen[vr]===true) return ;
        seen[vr]=true;
        for (let ind of adjList[vr]) {
            let edge=edgeList[ind];
            if (edge.weight-edge.flow===0) continue;
            findCut(edgeList[ind].findEndPoint(vr),adjList,edgeList);
        }
    }
    function findFlowCut () {
        dist=[]; ind=[];
        for (let i=0; i<this.edgeList.length; i++) {
            if (this.edgeList[i]===undefined) continue;
            this.edgeList[i].flow=0;
        }
        let maxFlow=0;
        for (;;) {
            bfs(this);
            if (dist[this.sink]===0) break;
            ind=[];
            for (let i=0; i<this.n; i++) {
                if (this.vertices[i]===undefined) continue;
                ind[i]=0;
            }
            for (;;) {
                let flow=dfs(this.source,1e9,this.adjList,this.edgeList,this.sink);
                maxFlow+=flow;
                if (flow===0) break;
            }
        }
        seen=[];
        findCut(this.source,this.adjList,this.edgeList);
        
        for (let i=0; i<this.n; i++) {
            if (this.vertices[i]===undefined) continue;
            if (seen[i]===true) this.svgVertices[i].circle.attr("fill","green");
            else this.svgVertices[i].circle.attr("fill","yellow");
        }
        for (let i=0; i<this.edgeList.length; i++) {
            if (this.edgeList[i]===undefined) continue;
            let edge=this.edgeList[i];
            this.svgEdges[i].weight.attr("textpath").node.innerHTML=(edge.flow+"/"+edge.weight).toString();
            if (edge.real===true) {
                if (seen[edge.x]!==seen[edge.y]) {
                    this.svgEdges[i].line.attr("stroke","red");
                    this.svgEdges[i].line.markerEnd.attr("fill","red");
                }
                else {
                    this.svgEdges[i].line.attr("stroke","black");
                    this.svgEdges[i].line.markerEnd.attr("fill","black");
                }
            }
        }
        $(".graphExample1 .value").text("Максималният поток = минималният срез = "+maxFlow);
    }
    
    function initExample (part) {
        if (part===2) {
            let example1=new Graph();
            $(".graphExample1 .default").on("click", function () {
                example1.init(".graphExample1",5,true,findFlowCut);
                example1.buildEdgeDataStructures([[0,1,5],[0,2,1],[1,3,5],[2,4,2],[3,2,2],[3,4,2]]);
                example1.vertexRad=25;
                example1.convertToNetwork(0,4,false);
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