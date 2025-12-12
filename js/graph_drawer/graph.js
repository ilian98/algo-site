(function () {
    "use strict";
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
                    fonts.Consolas=font;
                    opentype.load("/algo-site/fonts/Arial.woff", (error, font) => {
                        fonts.Arial=font;
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
        while (true) {
            match=regex.exec(style);
            if (!match) break;
            properties[match[1]]=match[2].trim();
        }
        return properties;
    }
    function objToStyle (obj) {
        let style="";
        let keys=Object.keys(obj);
        keys.sort();
        for (let attr of keys) {
            style+=attr+": "+obj[attr]+"; ";
        }
        return style;
    }
    function copyObj (obj) {
        let copy={};
        for (let [attr, value] of Object.entries(obj)) {
            copy[attr]=value;
        }
        return copy;
    }
    
    function getGraphStorageName (svgName) {
        return document.URL.replace(/#.*$/, "")+"/"+svgName+"/graph";
    }
    
    function Vertex (name, userCSS=[{},{}], addedCSS=[{},{}]) {
        this.name=name;
        
        this.defaultCSS=[{},{}];
        this.addedCSS=addedCSS;
        this.userCSS=userCSS;
    }
    function SvgVertex () {
        this.coord=undefined;
        this.circle=undefined; this.text=undefined;
        this.group=undefined;
    }
    function Edge (x, y, weight="", userCSS=[{},{}], curveHeight=undefined, addedCSS=[{},{}], weightTranslate=[0, 0], weightRotation=0) {
        this.x=x;
        this.y=y;
        this.weight=weight;
        
        this.defaultCSS=[{},{}];
        this.addedCSS=addedCSS;
        this.userCSS=userCSS;
        
        this.curveHeight=curveHeight;
        this.weightTranslate=weightTranslate;
        this.weightRotation=weightRotation;

        this.findEndPoint = function (vr) {
            if (this.x==vr) return this.y;
            else return this.x;
        };
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
        }, () => { alert("Load font data error!"); });
        GraphControllerLoadData();
    }
    function Graph () {
        this.wrapperName=undefined; this.svgName=undefined; this.s=undefined;
        this.svgVertices=undefined; this.svgEdges=undefined;
        this.n=undefined;
        let vertices,edgeList;
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
            else { /// not first init
                sessionStorage.removeItem(getGraphStorageName(this.svgName));
            }
            this.erase();
            this.svgVertices=[]; this.svgEdges=[];
            
            dropdowns[wrapperName] = new Dropdowns();
            this.graphDrawer=new GraphDrawer(this);
            this.graphDrawer.init(SvgEdge,fonts);
            if (typeof GraphController==="function") {
                this.graphController=new GraphController(this);
                this.graphController.init();
            }
            this.calcPositions=new CalcPositions(this);
            this.initViewBox=undefined;

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
            
            this.graphChange=(...args) => {
                if (this.isNetwork===true) sessionStorage.removeItem(getGraphStorageName(this.svgName));
                else sessionStorage.setItem(getGraphStorageName(this.svgName),this.export());
                return graphChange.call(this,...args);
            };
            
            graphs.set(wrapperName,this);
        };
        this.isVisualChange = function (name) {
            if (name===undefined) return false;
            if ((name==="draw")||(name==="font-load")||(name==="new-positions")||(name==="new-pos")||((name.startsWith("change"))&&(name!=="change-weight")&&(name!=="change-property"))) return true;
            return false;
        };

        function convertVertexToList (vertex) {
            return [
                vertex.name,
                [copyObj(vertex.userCSS[0]), copyObj(vertex.userCSS[1])],
                [copyObj(vertex.addedCSS[0]), copyObj(vertex.addedCSS[1])]
            ];
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
        };
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
                else vertices[i]=new Vertex(...vers[i]);
            }
        };
        this.initSvgVertex = function (x) {
            this.svgVertices[x]=new SvgVertex();
        };

        function convertEdgeToList (edge) {
            return [
                edge.x,edge.y,edge.weight,
                [copyObj(edge.userCSS[0]),copyObj(edge.userCSS[1])],
                edge.curveHeight,
                [copyObj(edge.addedCSS[0]),copyObj(edge.addedCSS[1])],
                [edge.weightTranslate[0], edge.weightTranslate[1]],
                edge.weightRotation
            ];
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
        };
        this.buildEdgeDataStructures = function (edges) {
            if (this.graphController!==undefined) 
                this.graphController.registerAction("edge-list",this.convertSimpleEdgeList());
            
            edgeList=[];
            for (let edge of edges) {
                if (edge===undefined) {
                    edgeList.push(undefined);
                    continue;
                }
                edgeList.push(new Edge(...edge));
                if ((edge.length===3)||((edge.length>=3)&&(edge[2]!==""))) this.isWeighted=true;
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
        };
        this.getVertices = function () {
            let res=[];
            for (let i=0; i<this.n; i++) {
                if (vertices[i]===undefined) continue;
                res.push([i, vertices[i]]);
            }
            return res;
        };
        this.getIndexedVertices = function () {
            return vertices;
        };
        this.getVertex = function (ind) {
            return vertices[ind];
        };
        this.getEdges = function () {
            let res=[];
            for (let i=0; i<edgeList.length; i++) {
                if (edgeList[i]===undefined) continue;
                res.push([i, edgeList[i]]);
            }
            return res;
        };
        this.getIndexedEdges = function () {
            return edgeList;
        };
        this.clearEdges = function () {
            edgeList=[];
        };
        this.getEdge = function (ind) {
            return edgeList[ind];
        };

        this.erase = function () {
            this.s.selectAll("*").remove();
        };
        
        this.size=undefined;
        this.calcPositions=undefined; this.initViewBox=undefined;
        this.drawNewGraph = function (addDynamic, size, drawST, frameX, frameY, frameW, frameH) {
            addDynamic = (addDynamic === undefined) ? false : addDynamic;
            drawST = (drawST === undefined) ? false : drawST;
            
            this.erase();
            
            let svgObject=$(this.svgName);
            let viewBox=svgObject.prop("viewBox").baseVal;
            if (size===undefined) size=parseInt(Math.sqrt(viewBox.width*viewBox.height)/300);
            this.size=size;
            
            let firstTime=(this.initViewBox===undefined);
            
            if (firstTime===true) this.initViewBox=[viewBox.width, viewBox.height];
            let windowWidth=-1,windowsHeight=-1;
            const self=this;
            function changeViewBox () {
                if (svgObject.is(":hidden")===true) return ;
				if ((windowWidth==$(window).width())&&(windowsHeight==$(window).height())) return ;
				windowWidth=$(window).width(); windowsHeight=$(window).height();
                let viewBox=svgObject.prop("viewBox").baseVal;
                svgObject.attr("viewBox",viewBox.x+" "+viewBox.y+" "+self.initViewBox[0]+" "+self.initViewBox[1]);
                if (svgObject.outerWidth()!=svgObject.parent().width()) {
                    let w=svgObject.parent().width()/svgObject.outerWidth()*viewBox.width;
                    svgObject.attr("viewBox",viewBox.x+" "+viewBox.y+" "+w+" "+viewBox.height);
                }
                else if (svgObject.outerHeight()!=svgObject.parent().height()) {
                    let h=svgObject.parent().height()/svgObject.outerHeight()*viewBox.height;
                    svgObject.attr("viewBox",viewBox.x+" "+viewBox.y+" "+viewBox.width+" "+h);
                }
                if (firstTime===false) {
                    self.calcPositions.frameW=viewBox.width;
                    self.calcPositions.frameH=viewBox.height;
                    self.calcPositions.calcOriginalPos(self.calcPositions.minX,self.calcPositions.minY);
                }
            }
            changeViewBox();
            viewBox=svgObject.prop("viewBox").baseVal;
            if (frameX===undefined) frameX=viewBox.x;
            if (frameY===undefined) frameY=viewBox.y;
            if (frameW===undefined) frameW=viewBox.width;
            if (frameH===undefined) frameH=viewBox.height;
            if (firstTime===true) $(window).on("resize",changeViewBox);
            this.calcPositions.init(frameX,frameY,frameW,frameH);
            if ((drawST===false)||(drawST===true)) this.calcPositions.calc(drawST);
            else this.calcPositions.calc(true,drawST);
            
            if (this.graphController!==undefined) this.graphController.removeChanges();
            
            let importData=null;
            if ((firstTime===true)&&(this.isNetwork===false)&&(this.graphController!==undefined)) {
                importData=sessionStorage.getItem(getGraphStorageName(this.svgName));
            }   
            
            this.graphDrawer.draw(addDynamic,false);
            
            if (importData!==null) {
                this.graphController.importGraph(importData);
                this.graphController.undoStack=[];
            }
        };
        
        this.weightValue = function (edge) {
            if (this.isNetwork===false) return edge.weight.toString();
            return (edge.flow+"/"+edge.weight).toString();
        };
        this.translateWeight = function (ind, tx, ty) {
            this.svgEdges[ind].weight.transform("t"+tx+" "+ty+"r"+edgeList[ind].weightRotation);
        };
        this.rotateWeight = function (ind, deg) {
            this.svgEdges[ind].weight.transform("t"+edgeList[ind].weightTranslate[0]+" "+edgeList[ind].weightTranslate[1]+"r"+deg);
        };
        
        this.addEdge = function (x, y, weight, userCSS = [{},{}], curveHeight=undefined, addedCSS=[{},{}], weightTranslate=[0, 0], weightRotation=0, prevInd = undefined, isReal = true, revData = []) {
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
            
            edgeList[ind]=new Edge(x,y,weight,userCSS,curveHeight,addedCSS,weightTranslate,weightRotation);
            this.adjList[x].push(ind);
            if ((this.isDirected===false)&&(this.isNetwork===false)&&(x!==y)) this.adjList[y].push(ind);
            this.adjMatrix[x][y].push(ind);
            if ((this.isDirected===false)&&(this.isNetwork===false)&&(x!==y)) this.adjMatrix[y][x].push(ind);
            if ((this.isDirected===true)||(this.isNetwork===true)) this.reverseAdjList[y].push(ind);
            
            if ((this.isNetwork===true)&&(isReal===true)) this.addReverseEdge(ind,revData);
            return ind;
        };
        this.removeEdge = function (index) {
            let edge=edgeList[index],revData=[];
            if ((this.isNetwork===true)&&(edge.real===true)) {
                let l=convertEdgeToList(edgeList[edge.rev]);
                revData=[l[3], l[4], l[5], l[6], l[7], edge.rev];
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
            if (this.svgEdges[index]!==undefined) {
                this.svgEdges[index].line.remove();
                if (this.svgEdges[index].weight!==undefined) this.svgEdges[index].weight.remove();
            }
            this.svgEdges[index]=undefined;
            edgeList[index]=undefined;
        };
        this.addVertex = function (name, userCSS = [{},{}], addedCSS = [{},{}], prevInd = undefined) {
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
            
            vertices[ind]=new Vertex(name,userCSS,addedCSS);
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
        };
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
        };
        
        this.import = function (graphTypes, size, n, vers, edges, flagCoords, versCoord, posProperties, defaultSettings) {
            let oldGraphTypes=[this.isDirected, this.isTree, this.isWeighted, this.isMulti];
            this.isDirected=graphTypes[0]; this.isTree=graphTypes[1];
            this.isWeighted=graphTypes[2]; this.isMulti=graphTypes[3];
            
            if (this.graphController!==undefined) this.graphController.freezeTime();
            this.initVertices(n,vers);
            this.buildEdgeDataStructures(edges);
            if (this.graphController!==undefined) {
                if ((this.graphController.changeType[1]===false)&&(this.isWeighted!==graphTypes[2])) {
                    alert("Графът трябва да е непретеглен!");
                    this.graphController.undoAction("undo");
                    return false;
                }
                else if ((this.graphController.changeType[2]===false)&&(this.isMulti!==graphTypes[3])) {
                    alert("Графът не трябва да е мулти!");
                    this.graphController.undoAction("undo");
                    return false;
                }
            }
            if (this.graphController!==undefined) {
                if (oldGraphTypes[0]!==this.isDirected) 
                    this.graphController.addChange("change-property",["isDirected", oldGraphTypes[0]]);
                if (oldGraphTypes[1]!==this.isTree)
                    this.graphController.addChange("change-property",["isTree", oldGraphTypes[1]]);
                if (oldGraphTypes[2]!==this.isWeighted)
                    this.graphController.addChange("change-property",["isWeighted", oldGraphTypes[2]]);
                if (oldGraphTypes[3]!==this.isMulti)
                    this.graphController.addChange("change-property",["isMulti", oldGraphTypes[3]]);
                if (size!==this.size) {
                    this.graphController.addChange("change-property",["size", this.size]);
                    this.size=size;
                }
            }

            if (flagCoords===false) this.calcPositions.calc();
            else {
                this.calcPositions.changePositions([],versCoord);
                if (posProperties===undefined) this.calcPositions.calcOriginalPos();
                else this.calcPositions.calcOriginalPos(posProperties[0],posProperties[1],posProperties[2]);
            }
            if (this.graphController!==undefined) this.graphController.advanceTime();
            
            if (defaultSettings!==undefined) {
                this.graphDrawer.defaultCSSVertex=defaultSettings[0];
                this.graphDrawer.defaultCSSVertexText=defaultSettings[1];
                this.graphDrawer.defaultCSSEdge=defaultSettings[2];
                this.graphDrawer.defaultCSSWeight=defaultSettings[3];
                this.graphDrawer.defaultBG=defaultSettings[4];
            }
            
            if (this.isNetwork===true) this.convertToNetwork(this.source,this.sink,false);
            this.graphDrawer.draw(this.graphDrawer.isDynamic,false);
            this.graphChange("import");
            if ((this.isNetwork===true)&&(this.graphController!==undefined)) this.graphController.undoStack=[];
            return true;
        };
        this.export = function () {
            let edges=[];
            for (let i=0; i<edgeList.length; i++) {
                if (edgeList[i]===undefined) continue;
                if ((this.isNetwork===true)&&(edgeList[i].real===false)) continue;
                let info=[edgeList[i].x+1, edgeList[i].y+1];
                if (edgeList[i].weight!=="") info.push(this.weightValue(edgeList[i]));
                if ((Object.keys(edgeList[i].userCSS[0]).length>0)||(Object.keys(edgeList[i].userCSS[1]).length>0)) {
                    info.push("[["+objToStyle(edgeList[i].userCSS[0])+"],["+objToStyle(edgeList[i].userCSS[1])+"]]");
                }
                if (edgeList[i].curveHeight!==undefined) info.push("["+edgeList[i].curveHeight+"]");
                if ((Object.keys(edgeList[i].addedCSS[0]).length>0)||(Object.keys(edgeList[i].addedCSS[1]).length>0)) {
                    info.push("{{"+objToStyle(edgeList[i].addedCSS[0])+"},{"+objToStyle(edgeList[i].addedCSS[1])+"}}");
                }
                if (edgeList[i].weight!=="") {
                    if ((edgeList[i].weightTranslate[0]!=0)||(edgeList[i].weightTranslate[1]!=0)) {
                        info.push("{"+edgeList[i].weightTranslate[0]+","+edgeList[i].weightTranslate[1]+"}");
                    }
                    if (edgeList[i].weightRotation!=0) {
                        info.push("{"+edgeList[i].weightRotation+"}");
                    }
                }
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
                if ((Object.keys(vertices[i].userCSS[0]).length>0)||(Object.keys(vertices[i].userCSS[1]).length>0)) {
                    info.push("[["+objToStyle(vertices[i].userCSS[0])+"],["+objToStyle(vertices[i].userCSS[1])+"]]");
                }
                if ((Object.keys(vertices[i].addedCSS[0]).length>0)||(Object.keys(vertices[i].addedCSS[1]).length>0)) {
                    info.push("{{"+objToStyle(vertices[i].addedCSS[0])+"},{"+objToStyle(vertices[i].addedCSS[1])+"}}");
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
            
            text+="[["+objToStyle(this.graphDrawer.defaultCSSVertex)+"],["+
                objToStyle(this.graphDrawer.defaultCSSVertexText)+"],["+
                objToStyle(this.graphDrawer.defaultCSSEdge)+"],["+
                objToStyle(this.graphDrawer.defaultCSSWeight)+"],["+
                this.graphDrawer.defaultBG[0]+"],["+
                this.graphDrawer.defaultBG[1]+"]]\n\n";
            
            text+="{"+this.size+"}\n\n";
            if (this.isDirected===true) text+="Directed\n";
            else text+="Undirected\n";
            if (this.isWeighted===true) text+="Weighted\n";
            if (this.isMulti===true) text+="Multigraph\n";
            if (this.isTree===true) text+="Tree\n";
            
            return text;
        };
        
        this.setSettings = function (changeType = [true, true, true], changeVers = true, changeSize = true, importGraph = true) {
            this.graphController.setSettings(changeType,changeVers,changeSize,importGraph);
        };
    }
    
    
    window.GraphLoadData=GraphLoadData;
    window.Graph=Graph;
    window.segmentLength=segmentLength;
    window.circlePath=circlePath;
    window.textBBox=textBBox;
    window.determineDy=determineDy;
    window.styleToObj=styleToObj;
    window.objToStyle=objToStyle;
    window.copyObj=copyObj;
})();