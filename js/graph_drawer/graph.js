"use strict";
(function () {
    function segmentLength (x1, y1, x2, y2) {
        return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    }
    function circlePath (cx, cy, r) {
        let p="M "+cx+" "+(cy-r);
        p+=" A "+r+" "+r+" 0 0 0 "+cx+" "+(cy+r);
        p+=" M "+cx+" "+(cy+r);
        p+=" A "+r+" "+r+" 0 0 0 "+cx+" "+(cy-r);
        p+=" Z";
        return p;
    }
    
    let fonts=[];
    function loadFontData () {
        return new Promise((resolve, reject) => {
            if (typeof window.font==="undefined") {
                opentype.load("/algo-site/fonts/Consolas.woff", (error, font) => {
                    fonts["Consolas"]=font;
                    opentype.load("/algo-site/fonts/Arial.woff", (error, font) => {
                        fonts["Arial"]=font;
                        opentype.load("/algo-site/fonts/TimesNewRoman.woff", (error, font) => {
                            fonts["Times New Roman"]=font;
                            resolve();
                        });
                    });
                });
            }
            else resolve();
        });
    }
    function textBBox (text, fontFamily, fontSize) {
        return fonts[fontFamily].getPath(text.toString(),0,0,fontSize).getBoundingBox();
    }
    function determineDy (text, fontFamily, fontSize) {
        if (typeof fonts[fontFamily]!=="undefined") {
            let bBox=textBBox(text,fontFamily,fontSize);
            let height=bBox.y2-bBox.y1;
            let underBaseline=bBox.y2;
            return height/2-underBaseline;
        }
        return 6*(fontSize/20);
    }
    
    function styleToObj (style) {
        let regex=/([\w-]*)\s*:\s*([^;]*)/g;
        let match,properties={};
        while (match=regex.exec(style)) {
            properties[match[1]]=match[2].trim();
        }
        return properties;
    }
    function objToStyle (obj) {
        let style="";
        for (let [attr, value] of Object.entries(obj)) {
            style+=attr+": "+value+";";
        }
        return style;
    }
    
    function Vertex (name, css=["",""]) {
        this.name=name;
        
        this.defaultCSS=["",""];
        this.addedCSS=css;
    }
    function SvgVertex () {
        this.coord=undefined;
        this.circle=undefined; this.text=undefined;
        this.group=undefined;
    }
    function Edge (x, y, weight = "", css=["",""], curveHeight=undefined) {
        this.x=x;
        this.y=y;
        this.weight=weight;
        
        this.defaultCSS=["",""];
        this.addedCSS=css;
        
        this.curveHeight=curveHeight;

        this.findEndPoint = function (vr) {
            if (this.x==vr) return this.y;
            else return this.x;
        }
    }
    function SvgEdge () {
        this.line=undefined;
        this.weight=undefined;
        this.drawProperties=undefined;
    }

    let graphs = new Map();
    async function GraphLoadData () {
        loadFontData().then(() => {
            for (let [name, graph] of graphs) {
                if (graph.svgVertices.length===0) continue;
                graph.graphDrawer.draw(graph.graphDrawer.isDynamic,false);
                graph.graphChange("font-load");
            }
        }, () => { alert("Load font data error!") });
        GraphControllerLoadData();
    }
    function Graph () {
        this.wrapperName=undefined; this.svgName=undefined; this.s=undefined;
        this.svgVertices=undefined; this.svgEdges=undefined;
        this.n=undefined;
        let vertices=undefined,edgeList=undefined;
        this.adjList=undefined; this.adjMatrix=undefined;
        this.isDirected=undefined; this.isMulti=undefined; this.isWeighted=undefined; this.isNetwork=false;
        this.graphChange=undefined; // function to be called after changing the graph, for exampe adding new edge
        this.graphDrawer=undefined; this.graphController=undefined;
        this.init = function (wrapperName, n, isDirected, graphChange = () => {}) {
            if (this.wrapperName===undefined) {
                this.wrapperName=wrapperName;
                if ($(wrapperName+" .graph").length===0) this.svgName=this.wrapperName;
                else this.svgName=this.wrapperName+" .graph";
                $(this.svgName).css({
                    "border-style": "dotted",
                    "border-color": "transparent",
                    "border-width": "2px",
                    "border-radius": "5px"
                });
                this.s=Snap(this.svgName);
            }
            this.erase();
            this.svgVertices=[]; this.svgEdges=[];
            
            dropdowns[wrapperName] = new Dropdowns();
            this.graphDrawer=new GraphDrawer(this);
            this.graphDrawer.init(SvgEdge,fonts);
            if ((typeof GraphController==="function")&&
                (($(wrapperName+" .settings-panel").length!=0)||($(wrapperName+" .save").length!==0))) {
                this.graphController = new GraphController(this);
                this.graphController.init();
            }

            if (n!==undefined) this.n=n;
            vertices=[];
            this.initVertices(this.n);
            if (this.graphController!==undefined) this.graphController.removeChange();
            for (let i=0; i<this.n; i++) {
                vertices[i].name=(i+1).toString();
            }

            edgeList=[]; this.adjList=[]; this.reverseAdjList=[]; this.adjMatrix=[];
            for (let i=0; i<this.n; i++) {
                this.adjList[i]=[]; this.reverseAdjList[i]=[]; this.adjMatrix[i]=[];
                for (let j=0; j<this.n; j++) {
                    this.adjMatrix[i][j]=[];
                }
            }
            if (isDirected!==undefined) this.isDirected=isDirected;
            this.isMulti=false; this.isWeighted=false;
            
            this.graphChange=graphChange;
            
            graphs.set(wrapperName,this);
        }

        function convertVertexToList (vertex) {
            return [vertex.name,[vertex.addedCSS[0], vertex.addedCSS[1]]];
        }
        this.convertSimpleVertexList = function () {
            let vers=[];
            for (let vertex of vertices) {
                if (vertex===undefined) {
                    vers.push(undefined);
                    continue;
                }
                vers.push(convertVertexToList(vertex));
            }
            return vers;
        }
        this.initVertices = function (n, vers) {
            if (this.graphController!==undefined) 
                this.graphController.registerAction("vertex-list",[this.n, this.convertSimpleVertexList()]);
            
            this.n=n; vertices=[];
            for (let i=0; i<this.n; i++) {
                if ((vers===undefined)||(vers.length===0)) {
                    vertices[i]=new Vertex();
                    continue;
                }
                if (vers[i]===undefined) vertices[i]=undefined;
                else vertices[i]=new Vertex(vers[i][0],vers[i][1]);
            }
        }
        this.initSvgVertex = function (x) {
            this.svgVertices[x]=new SvgVertex();
        }

        function convertEdgeToList (edge) {
            return [edge.x,edge.y,edge.weight,[edge.addedCSS[0],edge.addedCSS[1]],edge.curveHeight];
        }
        this.convertSimpleEdgeList = function () {
            let edges=[];
            for (let edge of edgeList) {
                if (edge===undefined) {
                    edges.push(undefined);
                    continue;
                }
                edges.push(convertEdgeToList(edge));
            }
            return edges;
        }
        this.buildEdgeDataStructures = function (edges) {
            if (this.graphController!==undefined) 
                this.graphController.registerAction("edge-list",this.convertSimpleEdgeList());
            
            edgeList=[];
            for (let edge of edges) {
                if (edge===undefined) {
                    edgeList.push(undefined);
                    continue;
                }
                if (edge.length===2) edgeList.push(new Edge(edge[0],edge[1]));
                else if (edge.length===3) {
                    edgeList.push(new Edge(edge[0],edge[1],edge[2]));
                    this.isWeighted=true;
                }
                else {
                    edgeList.push(new Edge(edge[0],edge[1],edge[2],edge[3],edge[4]));
                    if (edge[2]!=="") this.isWeighted=true;
                }
            }
            let max=0;
            for (let i=0; i<this.n; i++) {
                if (vertices[i]===undefined) continue;
                if (vertices[i].name===undefined) {
                    vertices[i]=undefined;
                    continue;
                }
                if (max<i) max=i;
            }
            for (let edge of edgeList) {
                if (edge===undefined) continue;
                if (max<edge.x) max=edge.x;
                if (max<edge.y) max=edge.y;
            }
            this.n=max+1;

            let edgeSet = new Set();
            for (let edge of edgeList) {
                if (edge===undefined) continue;
                let x=edge.x,y=edge.y;
                if ((edgeSet.has(x*this.n+y))||((this.isDirected===false)&&(edgeSet.has(y*this.n+x)))) {
                    this.isMulti=true;
                }
                else edgeSet.add(x*this.n+y);
            }

            for (let i=0; i<=max; i++) {
                this.adjMatrix[i]=[];
                for (let j=0; j<=max; j++) {
                    this.adjMatrix[i][j]=[];
                }
                this.adjList[i]=[]; this.reverseAdjList[i]=[];
            }
            for (let i=0; i<edgeList.length; i++) {
                if (edgeList[i]===undefined) continue;
                let x=edgeList[i].x,y=edgeList[i].y;
                this.adjMatrix[x][y].push(i);
                this.adjList[x].push(i);
                if ((this.isDirected===false)&&(x!==y)) {
                    this.adjMatrix[y][x].push(i);
                    this.adjList[y].push(i);
                }
                if (this.isDirected===true) this.reverseAdjList[y].push(i);
            }
        }
        this.getVertices = function () {
            let res=[];
            for (let i=0; i<this.n; i++) {
                if (vertices[i]===undefined) continue;
                res.push([i, vertices[i]]);
            }
            return res;
        }
        this.getIndexedVertices = function () {
            return vertices;
        }
        this.getVertex = function (ind) {
            return vertices[ind];
        }
        this.getEdges = function () {
            let res=[];
            for (let i=0; i<edgeList.length; i++) {
                if (edgeList[i]===undefined) continue;
                res.push([i, edgeList[i]]);
            }
            return res;
        }
        this.getIndexedEdges = function () {
            return edgeList;
        }
        this.clearEdges = function () {
            edgeList=[];
        }
        this.getEdge = function (ind) {
            return edgeList[ind];
        }

        this.erase = function () {
            this.s.selectAll("*").remove();
        }
        
        this.vertexRad=undefined; this.size=1;
        this.calcPositions=undefined; this.initViewBox=undefined;
        this.drawNewGraph = function (addDynamic = false, vertexRad, drawST = false, frameX, frameY, frameW, frameH) {
            this.erase();
            
            let svgObject=$(this.svgName);
            let viewBox=svgObject.prop("viewBox").baseVal;
            if (vertexRad===undefined) vertexRad=Math.floor(Math.sqrt(viewBox.width*viewBox.height/225));
            this.vertexRad=vertexRad;
            
            if (this.calcPositions===undefined) this.initViewBox=[viewBox.width, viewBox.height];
            function changeViewBox () {
                if (svgObject.is(":hidden")===true) return ;
                let viewBox=svgObject.prop("viewBox").baseVal;
                svgObject.attr("viewBox",viewBox.x+" "+viewBox.y+" "+this.initViewBox[0]+" "+this.initViewBox[1]);
                if (svgObject.outerWidth()!=svgObject.parent().width()) {
                    let w=svgObject.parent().width()/svgObject.outerWidth()*viewBox.width;
                    svgObject.attr("viewBox",viewBox.x+" "+viewBox.y+" "+w+" "+viewBox.height);
                }
                else if (svgObject.outerHeight()!=svgObject.parent().height()) {
                    let h=svgObject.parent().height()/svgObject.outerHeight()*viewBox.height;
                    svgObject.attr("viewBox",viewBox.x+" "+viewBox.y+" "+viewBox.width+" "+h);
                }
                if (this.calcPositions!==undefined) {
                    this.calcPositions.frameW=viewBox.width;
                    this.calcPositions.frameH=viewBox.height;
                    this.calcPositions.calcOriginalPos(this.calcPositions.minX,this.calcPositions.minY);
                }
            }
            changeViewBox.call(this);
            viewBox=svgObject.prop("viewBox").baseVal;
            if (frameX===undefined) frameX=viewBox.x;
            if (frameY===undefined) frameY=viewBox.y;
            if (frameW===undefined) frameW=viewBox.width;
            if (frameH===undefined) frameH=viewBox.height;
            if (this.calcPositions===undefined) {
                $(window).on("resize",changeViewBox.bind(this));
                this.calcPositions=new CalcPositions(this);
            }
            this.calcPositions.init(frameX,frameY,frameW,frameH);
            if ((drawST===false)||(drawST===true)) this.calcPositions.calc(drawST);
            else this.calcPositions.calc(true,drawST);
            
            if (this.graphController!==undefined) this.graphController.removeChanges();
            
            this.graphDrawer.draw(addDynamic,false);
        }
        
        this.addEdge = function (x, y, weight, css = ["",""], curveHeight=undefined, prevInd = undefined, isReal = true, revData = []) {
            let ind;
            if (prevInd!==undefined) ind=prevInd;
            else {
                for (let i=0; i<=edgeList.length; i++) {
                    if (edgeList[i]===undefined) {
                        ind=i;
                        break;
                    }
                }
            }
            if ((this.graphController!==undefined)&&(isReal===true))
                this.graphController.registerAction("add-edge",[ind]);
            
            edgeList[ind]=new Edge(x,y,weight,css,curveHeight);
            this.adjList[x].push(ind);
            if ((this.isDirected===false)&&(this.isNetwork===false)&&(x!==y)) this.adjList[y].push(ind);
            this.adjMatrix[x][y].push(ind);
            if ((this.isDirected===false)&&(this.isNetwork===false)&&(x!==y)) this.adjMatrix[y][x].push(ind);
            if ((this.isDirected===true)||(this.isNetwork===true)) this.reverseAdjList[y].push(ind);
            
            if ((this.isNetwork===true)&&(isReal===true)) this.addReverseEdge(ind,revData);
            return ind;
        }
        this.removeEdge = function (index) {
            let edge=edgeList[index],revData=[];
            if ((this.isNetwork===true)&&(edge.real===true)) {
                let l=convertEdgeToList(edgeList[edge.rev]);
                revData=[l[3], l[4], edge.rev];
                this.removeEdge(edge.rev);
            }
            if ((this.graphController!==undefined)&&((this.isNetwork===false)||(edge.real===true)))
                this.graphController.registerAction("remove-edge",[index, convertEdgeToList(edge), revData]);
            
            this.adjMatrix[edge.x][edge.y].splice(this.adjMatrix[edge.x][edge.y].indexOf(index),1);
            this.adjList[edge.x].splice(this.adjList[edge.x].indexOf(index),1);
            if ((this.isDirected===false)&&(this.isNetwork===false)&&(edge.x!==edge.y)) {
                this.adjMatrix[edge.y][edge.x].splice(this.adjMatrix[edge.y][edge.x].indexOf(index),1);
                this.adjList[edge.y].splice(this.adjList[edge.y].indexOf(index),1);
            }
            if ((this.isDirected===true)||(this.isNetwork===true)) 
                this.reverseAdjList[edge.y].splice(this.reverseAdjList[edge.y].indexOf(index),1);
            this.svgEdges[index].line.remove();
            if (this.svgEdges[index].weight!==undefined) this.svgEdges[index].weight.remove();
            this.svgEdges[index]=undefined;
            edgeList[index]=undefined;
        }
        this.addVertex = function (name, css = ["",""], prevInd = undefined) {
            let ind;
            if (prevInd!==undefined) ind=prevInd;
            else {
                for (let i=0; i<=this.n; i++) {
                    if (vertices[i]===undefined) {
                        ind=i;
                        break;
                    }
                }
            }
            if (this.graphController!==undefined) this.graphController.registerAction("add-vertex",[ind]);
            
            vertices[ind]=new Vertex(name,css);
            if (ind===this.n) {
                this.adjList[ind]=[];
                this.reverseAdjList[ind]=[];
                this.adjMatrix[ind]=[];
                this.n++;
                for (let i=0; i<this.n; i++) {
                    this.adjMatrix[i][ind]=[];
                    this.adjMatrix[ind][i]=[];
                }
            }
            this.svgVertices[ind]=new SvgVertex();
        }
        this.removeVertex = function (x) {
            let removeEdges=[];
            for (let ind of this.adjList[x]) {
                if ((this.isNetwork===true)&&(edgeList[ind].real===false)) continue;
                removeEdges.push(ind);
            }
            if (this.isDirected===true) {
                for (let ind of this.reverseAdjList[x]) {
                    if ((this.isNetwork===true)&&(edgeList[ind].real===false)) continue;
                    removeEdges.push(ind);
                }
            }
            if (this.graphController!==undefined) this.graphController.freezeTime();
            for (let ind of removeEdges) {
                this.removeEdge(ind);
            }
            
            if (this.graphController!==undefined) {
                this.graphController.registerAction("remove-vertex",
                                                    [x, [this.svgVertices[x].coord[0], this.svgVertices[x].coord[1]], convertVertexToList(vertices[x])]);
                this.graphController.advanceTime();
            }
            
            this.svgVertices[x].group.remove();
            this.svgVertices[x]=undefined;
            vertices[x]=undefined;
            if (x===this.n-1) {
                this.n--;
                vertices.pop();
            }
        }
        
        this.import = function (isDirected, isTree, isWeighted, isMulti, n, vers, edges, flagCoords, versCoord, posProperties) {
            let graphProperties=[this.isDirected, this.isTree, this.isWeighted, this.isMulti];
            this.isDirected=isDirected; this.isTree=isTree;
            this.isWeighted=isWeighted; this.isMulti=isMulti;
            if (this.graphController!==undefined) this.graphController.freezeTime();
            this.initVertices(n,vers);
            this.buildEdgeDataStructures(edges);
            if (this.graphController!==undefined) {
                if ((this.graphController.changeType[1]===false)&&(this.isWeighted!==isWeighted)) {
                    alert("Графът трябва да е непретеглен!");
                    this.graphController.undoAction("undo");
                    return ;
                }
                else if ((this.graphController.changeType[2]===false)&&(this.isMulti!==isMulti)) {
                    alert("Графът не трябва да е мулти!");
                    this.graphController.undoAction("undo");
                    return ;
                }
            }
            if (this.graphController!==undefined) {
                if (graphProperties[0]!=this.isDirected) 
                    this.graphController.addChange("change-property",["isDirected", graphProperties[0]],false);
                if (graphProperties[1]!=this.isTree)
                    this.graphController.addChange("change-property",["isTree", graphProperties[1]],false);
                if (graphProperties[2]!=this.isWeighted)
                    this.graphController.addChange("change-property",["isWeighted", graphProperties[2]],false);
                if (graphProperties[3]!=this.isMulti)
                    this.graphController.addChange("change-property",["isMulti", graphProperties[3]],false);
            }

            if (flagCoords===false) this.calcPositions.calc();
            else {
                this.calcPositions.changePositions([],versCoord);
                if (posProperties===undefined) this.calcPositions.calcOriginalPos();
                else this.calcPositions.calcOriginalPos(posProperties[0],posProperties[1],posProperties[2]);
            }
            if (this.graphController!==undefined) this.graphController.advanceTime();
            this.graphDrawer.draw(this.graphDrawer.isDynamic,false);
        }
        this.export = function () {
            let edges=[];
            for (let i=0; i<edgeList.length; i++) {
                if (edgeList[i]===undefined) continue;
                let info=[edgeList[i].x+1, edgeList[i].y+1];
                if (edgeList[i].weight!=="") info.push(edgeList[i].weight);
                if ((edgeList[i].addedCSS[0]!=="")||(edgeList[i].addedCSS[1]!=="")) {
                    info.push("[["+edgeList[i].addedCSS[0]+"],["+edgeList[i].addedCSS[1]+"]]");
                }
                if (edgeList[i].curveHeight!==undefined) info.push("["+edgeList[i].curveHeight+"]");
                edges.push(info);
            }
            let text=this.n+" "+edges.length+"\n";
            for (let edge of edges) {
                for (let data of edge) {
                    text+=data+" ";
                }
                text+="\n";
            }
            text+="\n";
            
            let vers=[];
            for (let i=0; i<this.n; i++) {
                if (vertices[i]===undefined) continue;
                let info=[(i+1).toString()];
                if (vertices[i].name!==info[0]) info.push(vertices[i].name);
                info.push("["+this.svgVertices[i].coord[0]+","+this.svgVertices[i].coord[1]+"]");
                if ((vertices[i].addedCSS[0]!=="")||(vertices[i].addedCSS[1]!=="")) {
                    info.push("[["+vertices[i].addedCSS[0]+"],["+vertices[i].addedCSS[1]+"]]");
                }
                vers.push(info);
            }
            text+=vers.length+"\n";
            for (let v of vers) {
                for (let data of v) {
                    text+=data+" ";
                }
                text+="\n";
            }
            text+="\n";
            
            text+="["+this.calcPositions.minX+","+this.calcPositions.minY+","+this.calcPositions.distVertices+"]\n\n";
            
            if (this.isDirected===true) text+="Directed\n";
            else text+="Undirected\n";
            if (this.isWeighted===true) text+="Weighted\n";
            if (this.isMulti===true) text+="Multigraph\n";
            if (this.isTree===true) text+="Tree\n";
            
            return text;
        }
        
        this.setSettings = function (changeType = [true, true, true], changeVers = true, changeRad = true) {
            this.graphController.setSettings(changeType,changeVers,changeRad);
        }
    }
    
    
    window.GraphLoadData=GraphLoadData;
    window.Graph=Graph;
    window.segmentLength=segmentLength;
    window.circlePath=circlePath;
    window.textBBox=textBBox;
    window.determineDy=determineDy;
    window.styleToObj=styleToObj;
    window.objToStyle=objToStyle;
})();