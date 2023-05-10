"use strict";
(function () {
    let graphs = new Map();
    let settingsPanel;
    async function GraphControllerLoadData () {
        return new Promise ((resolve, reject) => {
            $.get("/algo-site/pages/settings_panel.html", function (data) {
                settingsPanel=data;
                for (let [name, graph] of graphs) {
                    addSettingsPanel(name,graph,graph.graphController);
                    if ($(name+" .graph-settings").length===0) addSettingsModal();
                    if ($(name+" .information").length!==0) addInfoModal(name,graph.graphController,graph);
                }
            }).then(resolve, () => { alert("Load data error!") });
        });
    }
    
    function addSettings (graph, graphController) {
        let sliderVers=$(".range-vers");
        let outputVers=$(".slider-value-vers");
        sliderVers.off("input").on("input", function() {
            let n=parseInt($(this).val());
            outputVers.html(n);
            graph.initVertices(n); graphController.undoTime--;
            for (let [i, vr] of graph.getVertices()) {
                vr.name=(i+1).toString();
            }
            graph.buildEdgeDataStructures([]); graphController.undoTime--;
            graph.calcPositions.calc();
            graph.graphDrawer.draw(graph.graphDrawer.isDynamic,false);
            graph.graphChange("slider");
        });

        $("#undirected").off("click");
        $("#directed").off("click");
        if (graph.isDirected===false) $("#undirected").click();
        else $("#directed").click();
        function changeDirection (isDirected) {
            graph.isDirected=isDirected;
            let isWeighted=graph.isWeighted,isMulti=graph.isMulti;
            graphController.addChanges([["change-property", ["isDirected", !isDirected]],
                                        ["change-property", ["isWeighted", isWeighted]],
                                        ["change-property", ["isMulti", isMulti]]],false,"undo");
            graph.buildEdgeDataStructures(graph.convertSimpleEdgeList()); graphController.undoTime--;
            graphController.addChanges([["change-property", ["isDirected", !isDirected]],
                                        ["change-property", ["isWeighted", !isWeighted]],
                                        ["change-property", ["isMulti", !isMulti]]],true,"undo");
            graph.isWeighted=isWeighted;
            graph.isMulti=isMulti;
            graph.graphDrawer.draw(graph.graphDrawer.isDynamic);
            graph.graphChange("toggle-direction");
        }
        $("#undirected").off("click").on("click",function () {
            if (graph.isDirected===true) changeDirection(false);
        });
        $("#directed").off("click").on("click",function () {
            if (graph.isDirected===false) changeDirection(true);
        });
        $("#weighted").prop("checked",graph.isWeighted);
        $("#weighted").off("change").on("change",function () {
            if ((this.checked===true)&&(graph.isWeighted===false)) {
                graphController.addChange("change-property", ["isWeighted", false]);
                graph.isWeighted=true;
                graph.graphDrawer.draw(graph.graphDrawer.isDynamic);
                graph.graphChange("toggle-weighted");
            }
            else if ((this.checked===false)&&(graph.isWeighted===true)) {
                graphController.addChange("change-property", ["isWeighted", true]);
                graph.isWeighted=false;
                graph.graphDrawer.draw(graph.graphDrawer.isDynamic);
                graph.graphChange("toggle-weighted");
            }
        });
        $("#multi").prop("checked",graph.isMulti);
        $("#multi").off("change").on("change",function () {
            if ((this.checked===true)&&(graph.isMulti===false)) {
                graphController.addChange("change-property", ["isMulti", false]);
                graph.isMulti=true;
            }
            else if ((this.checked===false)&&(graph.isMulti===true)) {
                graphController.addChange("change-property", ["isMulti", true]);
                graph.isMulti=false;
            }
        });

        let sliderSize=$(".range-size");
        let outputSize=$(".slider-value-size");
        sliderSize.val(parseInt(graph.size*100));
        outputSize.html(parseInt(graph.size*100));
        sliderSize.off("input").on("input", function() {
            let val=parseInt($(this).val())/100;
            outputSize.html(parseInt(val*100));
            let oldVal=graph.size;
            graphController.addChange("change-property", ["size", oldVal]);
            graph.size=val;
            graph.graphDrawer.draw(graph.graphDrawer.isDynamic);
        });
    }
    function showSettings (graphController) {
        let graph=this;
        addSettings(graph,graphController);
        let sliderVers=$(".range-vers");
        let outputVers=$(".slider-value-vers");
        let cnt=graph.getVertices().length;
        sliderVers.val(cnt);
        outputVers.html(cnt);

        if (graphController.changeType[0]===true) $("#undirected").parent().parent().show();
        else $("#undirected").parent().parent().hide();
        if (graphController.changeType[1]===true) $("#weighted").parent().show();
        else $("#weighted").parent().hide();
        if (graphController.changeType[2]===true) $("#multi").parent().show();
        else $("#multi").parent().hide();

        if (graphController.changeVers===true) $(".range-vers").parent().parent().show();
        else $(".range-vers").parent().parent().hide();

        if (graphController.changeSize===true) $(".range-size").parent().parent().show();
        else $(".range-size").parent().parent().hide();
    }
    function addSettingsPanel (wrapperName, graph, graphController) {
        if ($(wrapperName+" .settings-panel").length!==0) $(wrapperName+" .settings-panel").html(settingsPanel);
        addSaveFunctionality(graph);
        addImportFunctionality(wrapperName,graph);
        addUndoFunctionality(wrapperName,graph,graphController);
        $(wrapperName+" .settings").off("click.settings").on("click.settings",showSettings.bind(graph,graphController));
    }
    function addSettingsModal () {
        if ($("#settingsModal").length!==0) return ;
        $.get("/algo-site/pages/settings_modal.html", function (data) {
            if ($("#settingsModal").length!==0) return ;
            $("body").append(data);
        });
    }
    function addInfoModal (wrapperName, graphController, graph) {
        $(wrapperName+" .information").off("click").on("click", function () {
            let text="";
            if (($(wrapperName+" .dragging-mini").length!==0)&&($(wrapperName+" .dragging-mini").is(":hidden")===false)) {
                text+=((language==="bg")?
                      "Суича в лентата за графа управлява действието, което се изпълнява при влачене на връх. Когато е изключен, се започва чертаене на ребро, а когато е включен се премества върха.<br>Използвайте бутона за настройките, за да отворите прозорец за управление на графа. Следващите инструкции се отнасят за този прозорец.<br>":
                      "The switch in the graph control panel is for the action to be performed when a vertex is dragged. When it is off, an edge is started to be drawn and when it is on, the vertex is being moved.<br><br>Use the button for the settings to open a window for controlling the graph. The folloing instructions are for that window.<br>");
            }
            
            if (graphController.changeVers===true) {
                text+=((language==="bg")?
                       "Има плъзгач за определяне на броя върхове в графа - от 1 до 10. При такава промяна графът се изтрива и се появяват указаният брой върхове на произволни места.<br>":
                       "There is a slider for changing the number of vertices in the graph - from 1 to 10. When this happens, the graph is erased and the specified number of new vertices are placed at random.<br>");
            }
            if (graphController.changeSize===true) {
                text+=((language==="bg")?
                       "Има  плъзгач за промяна на големината на графа, като той сам променя останалите характеристики в зависимост от тази  стойност.<br>":
                       "There is a slider for changing the size of the vertices and the graph adjusts its characteristics according to that size.<br>");
            }
            
            if (graph.graphDrawer.isDynamic===true) {
                text+=((language==="bg")?
                       "Нов връх на графа се добавя с двойно натискане на празно място. Всеки връх може да се натисне, с което да се появят различни опции за работа с него. При влачене на връх, се появяват опорни позиции. Връх, който е пуснат близо до опорна позиция се придвижва автоматично там. Всяко ребро с изключение на примките, може да се персонализира с влачене. По този начин се променя кривината на реброто. При натискане на ребро също се появяват различни опции за него. Това става и при натискане на тегло (при претеглени графи).<br><br>":
                       "A new vertex is added with a double click at an empty place. Every vertex can be clicked to open a menu with different options for it. When a vertex is moved, supporting positions appear. A vertex that is left near a supporting position, automatically goes to that position. Every edge, excluding the loops, can be personalized by dragging it. In this way, the curve of the edge is changed. When an edge is clicked, different options appear for it. This happens when a weight (for weighted graphs) is clicked.<br><br>");
            }
            text+=((language==="bg")?
                   "Всички компоненти на графа като цвят, големина и т.н., могат да се персонализират чрез написване на съответeн CSS код след избиране на опция за добавяне на CSS стил. Отделно се поддържа възможност за връщане на всяка промяна, както и изпълняването ѝ отново чрез бутоните със стрелки. Има бутон за качване на текстов файл, в който е описан граф, както и за изтегляне на направения граф в различни формати.<br>":
                   "All components of the graph as colour, size and so on can be personalized with writing corresponding CSS code after choosing the option for adding CSS style. Also, there is a functionality for undo and redo with the arrow buttons. There is a button for uploading a text file with description of a graph and for downloading the drawned graph in different formats.<br>");
            $("#infoModal .modal-body").html(text);
        });
        if ($("#infoModal").length!==0) return ;
        let modal=`
        <div class="modal fade" id="infoModal" tabindex="-1" aria-labelledby="infoModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content" style="max-height: 100%; overflow-y: auto">
                    <div class="modal-header">
                        <h5 class="modal-title" id="infoModalLabel">`+((language==="bg")?"Информация":"Information")+`</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="text-align: justify"></div>
                </div>
            </div>
        </div>`;
        $("body").append($(modal));
    }
    
    function GraphController (graph) {
        this.undoStack=undefined; this.undoTime=undefined;
        this.redoStack=undefined; this.redoTime=undefined;
        this.init = function () {
            this.undoStack=[]; this.undoTime=0; this.redoStack=[]; this.redoTime=0;
            if (typeof settingsPanel!=="undefined") {
                addSettingsPanel(graph.wrapperName,graph,this);
                if ($(graph.wrapperName+" .graph-settings").length===0) addSettingsModal();
                if ($(graph.wrapperName+" .information").length!==0) addInfoModal(graph.wrapperName,this,graph);
            }
            else graphs.set(graph.wrapperName,graph);
        }
        this.undoType="default"; this.increaseTime=true;
        this.addChange = function (type, data, increaseTime = true) {
            if (this.increaseTime===false) increaseTime=false;
            this.undoStack.push({
                time: this.undoTime, 
                type: type, 
                data: data
            });
            if (increaseTime===true) this.undoTime++;
            if (this.undoType==="default") this.redoStack=[];
        }
        this.addChanges = function (changes, increaseTime = true) {
            if (this.increaseTime===false) increaseTime=false;
            for (let [type, data] of changes) {
                this.addChange(type,data,false);
            }
            if (increaseTime===true) this.undoTime++;
        }
        this.redoChange = function (type, data) {
            this.redoStack.push({
                time: this.redoTime, 
                type: type,
                data: data
            });
            if (this.increaseTime===true) this.redoTime++;
        }
        this.removeChange = function () {
            this.undoStack.pop();
        }
        this.removeChanges = function () {
            if (this.undoStack.length===0) return ;
            let time=this.undoStack[this.undoStack.length-1].time;
            for (;;) {
                if (this.undoStack.length===0) break;
                if (this.undoStack[this.undoStack.length-1].time!=time) break;
                this.removeChange();
            }
            if (this.undoStack.length>0) this.undoTime=this.undoStack[this.undoStack.length-1].time+1;
            else this.undoTime=0;
        }
        this.registerAction = function (type, data) {
            if ((this.undoType==="default")||(this.undoType==="redo")) this.addChange(type,data,true);
            else this.redoChange(type,data);
        }
        this.freezes=0;
        this.freezeTime = function () {
            this.freezes++;
            this.increaseTime=false;
        }
        this.advanceTime = function () {
            this.freezes--;
            if (this.freezes==0) {
                this.increaseTime=true;
                if ((this.undoType==="default")||(this.undoType==="redo")) this.undoTime++;
                else this.redoTime++;
            }
            else if (this.freezes<0) this.freezes=0;
        }
        
        this.changeType=[true, true, true]; this.changeVers=true; this.changeSize=true;
        this.setSettings = function (changeType = [true, true, true], changeVers = true, changeSize = true) {
            this.changeType=[changeType[0], changeType[1], changeType[2]];
            this.changeVers=changeVers; this.changeSize=changeSize;
            if ($(this.wrapperName+" .settings-panel").length===0) addSettings(graph,this);
        }
        
        this.undoAction = function (undoType) {
            this.undoType=undoType;
            this.increaseTime=true;
            
            let stack,otherStack;
            if (undoType==="undo") stack=this.undoStack, otherStack=this.redoStack;
            else stack=this.redoStack, otherStack=this.undoStack;
            if (stack.length===0) return ;
            
            let graphController=this;
            function pushOther (t, d) {
                otherStack.push({
                    time: ((undoType==="undo")?graphController.redoTime:graphController.undoTime),
                    type: t,
                    data: d
                });
                if (undoType==="undo") graphController.redoTime++;
                else graphController.undoTime++;    
            }

            let curr=stack[stack.length-1];
            let currTime=stack[stack.length-1].time;
            let types=new Set();
            for (;;) {
                if (stack.length===0) break;
                let curr=stack[stack.length-1];
                if (curr.time!==currTime) break;
                stack.pop();
                if (curr.type==="vertex-list") graph.initVertices(curr.data[0],curr.data[1]);
                else if (curr.type==="edge-list") graph.buildEdgeDataStructures(curr.data);
                else if (curr.type==="new-positions") graph.calcPositions.changePositions(curr.data[0],curr.data[1]);
                else if (curr.type==="network-conversion") {
                    if (graph.isNetwork===false) graph.convertToNetwork(curr.data[1],curr.data[2],true);
                    else {
                        pushOther(curr.type, [graph.isNetwork, graph.source, graph.sink]);
                        for (let [i, edge] of graph.getEdges()) {
                            if (edge.real===false) graph.removeEdge(i);
                        }
                        graph.isNetwork=false;
                        types.add("remove-edge");
                    }
                }
                else {
                    let ind=curr.data[0];
                    if (curr.type==="add-edge") graph.removeEdge(ind), types.add("remove-edge");
                    else if (curr.type==="remove-edge") {
                        let edgeData=curr.data[1];
                        graph.addEdge(edgeData[0],edgeData[1],edgeData[2],edgeData[3],edgeData[4],ind,true,curr.data[2]);
                        types.add("add-edge");
                    }
                    else if (curr.type==="add-vertex") graph.removeVertex(ind), types.add("remove-vertex");
                    else if (curr.type==="remove-vertex") {
                        graph.addVertex(curr.data[2][0],curr.data[2][1],ind);
                        graph.svgVertices[ind].coord=curr.data[1];
                        types.add("add-vertex");
                    }
                    else {
                        if (curr.type==="new-pos") {
                            pushOther(curr.type,[ind, [graph.svgVertices[ind].coord[0], graph.svgVertices[ind].coord[1]]]);
                            graph.svgVertices[ind].coord=curr.data[1];
                            types.add("new-pos");
                        }
                        else if (curr.type==="change-curve-height") {
                            let edge=graph.getEdge(ind);
                            pushOther(curr.type,[ind, edge.curveHeight]);
                            edge.curveHeight=curr.data[1];
                        }
                        else if (curr.type==="change-weight-translate") {
                            let edge=graph.getEdge(ind);
                            pushOther(curr.type,[ind, edge.weightTranslate[0], edge.weightTranslate[1]]);
                            edge.weightTranslate=curr.data[1];
                        }
                        else if (curr.type==="change-css-vertex") {
                            let vr=graph.getVertex(ind);
                            pushOther(curr.type,[ind, [vr.userCSS[0]]]);
                            vr.userCSS[0]=curr.data[1];
                        }
                        else if (curr.type==="change-css-vertex-name") {
                            let vr=graph.getVertex(ind);
                            pushOther(curr.type,[ind, [vr.userCSS[1]]]);
                            vr.userCSS[1]=curr.data[1];
                        }
                        else if (curr.type==="change-css-edge") {
                            let edge=graph.getEdge(ind);
                            pushOther(curr.type,[ind, [edge.userCSS[0]]]);
                            edge.userCSS[0]=curr.data[1];
                        }
                        else if (curr.type==="change-css-weight") {
                            let edge=graph.getEdge(ind);
                            pushOther(curr.type,[ind, [edge.userCSS[1]]]);
                            edge.userCSS[1]=curr.data[1];
                        }
                        else if (curr.type==="change-name") {
                            let vr=graph.getVertex(ind);
                            pushOther(curr.type,[ind, vr.name]);
                            vr.name=curr.data[1];
                        }
                        else if (curr.type==="change-weight") {
                            let edge=graph.getEdge(ind);
                            pushOther(curr.type,[ind, edge.weight]);
                            edge.weight=curr.data[1];
                        }
                        else if (curr.type==="change-property") {
                            let type=curr.data[0];
                            if (type==="isDirected") {
                                pushOther(curr.type,[type, !curr.data[1]]);
                                graph.isDirected=curr.data[1];
                            }
                            else if (type==="isTree") {
                                pushOther(curr.type,[type, !curr.data[1]]);
                                graph.isTree=curr.data[0];
                            }
                            else if (type==="isWeighted") {
                                pushOther(curr.type,[type, !curr.data[1]]);
                                graph.isWeighted=curr.data[1];
                            }
                            else if (type==="isMulti") {
                                pushOther(curr.type,[type, !curr.data[1]]);
                                graph.isMulti=curr.data[1];
                            }
                            else if (type==="size") {
                                pushOther(curr.type,[type, graph.size]);
                                graph.size=curr.data[1];
                            }
                        }
                        types.add(curr.type);
                    }
                }
                if (undoType==="undo") this.redoTime--;
                else this.undoTime--;
            }
            if (undoType==="undo") this.redoTime++;
            else this.undoTime++;
            this.undoType="default";
            graph.graphDrawer.draw(graph.graphDrawer.isDynamic);
            for (let type of types) {
                graph.graphChange(type);
            }
        }
    
        let isDynamic,isStatic;
        this.hasAnimation = function (animationObj) {
            let wrapperName=graph.wrapperName+" .settings-panel";
            let oldStart=animationObj.startFunc;
            animationObj.startFunc = function () {
                $(wrapperName+" .undo-group").hide();
                $(wrapperName+" .import").hide();
                $(wrapperName+" .save-group").removeClass("text-center").addClass("text-start");
                $(wrapperName+" .dragging-mini").parent().removeClass("d-flex").addClass("d-none");
                $(wrapperName+" .settings").parent().removeClass("d-flex").addClass("d-none");
                isDynamic=graph.graphDrawer.isDynamic; isStatic=graph.graphDrawer.isStatic;
                graph.graphDrawer.draw(false,false,true);
                
                if (dropdowns[graph.wrapperName].menus["save-menu"]!==undefined) {
                    dropdowns[graph.wrapperName].menus["save-menu"].find(".txt").hide();
                    dropdowns[graph.wrapperName].menus["save-menu"].find(".edge-list").hide();
                }
                
                oldStart();
            };
            let oldStop=animationObj.stopFunc;
            animationObj.stopFunc = function () {
                $(wrapperName+" .undo-group").show();
                $(wrapperName+" .import").show();
                $(wrapperName+" .save-group").addClass("text-center").removeClass("text-start");
                $(wrapperName+" .dragging-mini").parent().removeClass("d-none").addClass("d-flex");
                $(wrapperName+" .settings").parent().removeClass("d-none").addClass("d-flex");
                graph.graphDrawer.draw(isDynamic,false,isStatic);
                
                if (dropdowns[graph.wrapperName].menus["save-menu"]!==undefined) {
                    dropdowns[graph.wrapperName].menus["save-menu"].find(".txt").show();
                    dropdowns[graph.wrapperName].menus["save-menu"].find(".edge-list").show();
                }
                
                oldStop();
            }
        }
    }
    
    function calcBBox (graph) {
        let minX=graph.calcPositions.frameX+graph.calcPositions.frameW,maxX=0;
        let minY=graph.calcPositions.frameY+graph.calcPositions.frameH,maxY=0;
        graph.s.selectAll("*").forEach((elem) => {
            if (elem===graph.graphDrawer.bgElement) return ;
            if (elem.hasClass("click-area")===true) return ;
            if ((elem.type==="marker")||(elem.type==="polygon")) return ;
            if (elem.type==="defs") return ;
            let bBox=elem.getBBox();
            if ((bBox.x2-bBox.x===0)||(bBox.y2-bBox.y===0)) return ;
            minX=Math.min(minX,bBox.x);
            maxX=Math.max(maxX,bBox.x2);
            minY=Math.min(minY,bBox.y);
            maxY=Math.max(maxY,bBox.y2);
        });
        for (let [i, vr] of graph.getVertices()) {
            let bBox=graph.svgVertices[i].circle.getBBox();
            minX=Math.min(minX,bBox.x-graph.graphDrawer.findStrokeWidth("vertex",i));
            maxX=Math.max(maxX,bBox.x2+graph.graphDrawer.findStrokeWidth("vertex",i));
            minY=Math.min(minY,bBox.y-graph.graphDrawer.findStrokeWidth("vertex",i));
            maxY=Math.max(maxY,bBox.y2+graph.graphDrawer.findStrokeWidth("vertex",i));
        }
        return [minX, maxX, minY, maxY];
    }
    function savePng (graph) {
        let svg=$(graph.svgName);
        let canvas=$(graph.wrapperName+" .canvas-save");
        let svgSave=$(graph.wrapperName+" .svg-save");
        let context=canvas[0].getContext('2d');
        let svgWidth=2*svg.width(),svgHeight=2*svg.height();
        let [minX, maxX, minY, maxY]=calcBBox(graph);
        let viewBox=graph.s.attr("viewBox");
        svgSave.attr("viewBox",minX+" "+minY+" "+viewBox.w+" "+viewBox.h);
        svgSave.attr("width",svgWidth);
        svgSave.attr("height",svgHeight);
        svgSave.html(svg.html());
        canvas.prop("width",(maxX-minX)/viewBox.w*svgWidth);
        canvas.prop("height",(maxY-minY)/viewBox.h*svgHeight);

        svgSave.show();
        let svgString=(new XMLSerializer()).serializeToString(svgSave[0]);
        svgSave.hide();
        let image=$("<img>").prop("src","data:image/svg+xml; charset=utf8, "+encodeURIComponent(svgString));
        image.on("load", function () {
            context.drawImage(image[0],0,0);
            let imageURI=canvas[0].toDataURL("image/png").replace("image/png","image/octet-stream");
            $("<a>").prop("download","graph.png")
                .prop("href",imageURI)
                .prop("target","_blank")[0].click();
            svgSave.empty();
        });
    }
    function saveSvg (graph) {
        let svg=$(graph.svgName);
        let svgSave=$(graph.wrapperName+" .svg-save");
        
        $(".click-area").hide();
        graph.graphDrawer.bgElement.attr("style","display: none");
        let [minX, maxX, minY, maxY]=calcBBox(graph);
        svgSave.attr("viewBox",minX+" "+minY+" "+graph.s.attr("viewBox").w+" "+graph.s.attr("viewBox").h);
        svgSave.removeAttr("width").removeAttr("height");
        svgSave.html(svg.html());
        svgSave[0].setAttribute("xmlns","http://www.w3.org/2000/svg");
        svgSave[0].setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink");
        let svgData=svgSave[0].outerHTML.replaceAll("cursor: pointer;","")
            .replace("border-style: dotted","border-style: none")
            .replace("display: none","");
        let preface='<?xml version="1.0" standalone="no"?>\r\n';
        let svgBlob=new Blob([preface, svgData], {type: "image/svg+xml;charset=utf-8"});
        let svgURL=URL.createObjectURL(svgBlob);
        $("<a>").prop("download","graph.svg")
            .prop("href",svgURL)
            .prop("target","_black")[0].click();
        graph.graphDrawer.bgElement.attr("style","");
        $(".click-area").show();
        svgSave.empty();
    }
    function saveEdgeList (graph) {
        let edges=[];
        for (let [i, edge] of graph.getEdges()) {
            if (edge===undefined) continue;
            if (edge.weight==="") edges.push([graph.getVertex(edge.x).name,graph.getVertex(edge.y).name]);
            else edges.push([graph.getVertex(edge.x).name,graph.getVertex(edge.y).name,edge.weight]);
        }
        let text=graph.getVertices().length+" "+edges.length+"\n";
        for (let edge of edges) {
            text+=edge[0]+" "+edge[1];
            if (edge.length===3) text+=" "+edge[2];
            text+="\n";
        }
        $("<a>").prop("download","edge_list.txt")
            .prop("href","data:text/plain;charset=utf-8,"+encodeURIComponent(text))
            .prop("target","_black")[0].click();
    }
    function saveTxt (graph) {
        $("<a>").prop("download","graph.txt")
                .prop("href","data:text/plain;charset=utf-8,"+encodeURIComponent(graph.export()))
                .prop("target","_black")[0].click();
    }
    function addSaveFunctionality (graph) {
        dropdowns[graph.wrapperName].addNewDropdown("save-menu",[
            ["txt", ((language==="bg")?"Изтегли като txt":"Download as txt"), saveTxt],
            ["edge-list", ((language==="bg")?"Изтегли като сп. от ребрата":"Download as edge list"), saveEdgeList],
            ["svg", ((language==="bg")?"Изтегли като svg":"Download as svg"), saveSvg],
            ["png", ((language==="bg")?"Изтегли като png":"Download as png"), savePng]
        ]);
        $(graph.wrapperName+" .save").off("click").on("click",function (event) {
            dropdowns[graph.wrapperName].showDropdown("save-menu",event,graph);
        });
    }
    
    function removeEmpty (strings) {
        let res=[];
        for (let i=0; i<strings.length; i++) {
            if (strings[i].length===0) continue;
            res.push(strings[i]);
        }
        return res;
    }
    function getTokens (s, type) {
        s=s.split("");
        let cnt=0,cntSpaces=0;
        for (let i=0; i<s.length; i++) {
            if (s[i]==='[') cnt++;
            else if (s[i]===']') cnt--;
            else if ((s[i]===' ')&&(cnt>0)) s[i]='\x00'; // escaping spaces
            if (s[i]===' ') {
                cntSpaces++;
                if (((type==="vers")&&(cntSpaces>1)&&(i+1<s.length)&&(s[i+1]!=='['))||
                    ((type==="edges")&&(cntSpaces>2)&&(i+1<s.length)&&(s[i+1]!=='[')))
                    s[i]='\x00';
            }
        }
        s=s.join("");
        let tokens=s.split(" ");
        for (let i=0; i<tokens.length; i++) {
            let token=tokens[i].split("");
            for (let j=0; j<token.length; j++) {
                if (token[j]==='\x00') token[j]=' ';
            }
            tokens[i]=token.join("");
        }
        return tokens;
    }
    function importGraph (text, graph) {
        let lines=removeEmpty(text.split("\n"));
        let nums=removeEmpty(lines[0].split(" "));
        if (nums.length!==2) {
            alert("Очаквани са две числа за максимален номер на връх и брой ребра при: "+lines[0]);
            return false;
        }
        let n=parseInt(nums[0]),m=parseInt(nums[1]);
        if (n<1) {
            alert("Очакван е положителен максимален номер на връх при: "+lines[0]);
            return false;
        }
        let curr=1,edges=[];
        for (let i=1; i<=m; i++) {
            if (lines.length===curr) {
                alert("Има липсващи ребра!");
                return false;
            }
            let tokens=removeEmpty(getTokens(lines[curr],"edges"));
            if (tokens.length<2) {
                alert("Трябват поне върхове за реброто: "+lines[curr]);
                return false;
            }
            let x=parseInt(tokens[0]),y=parseInt(tokens[1]);
            if (!((x>=1)&&(x<=n)&&(y>=1)&&(y<=n))) {
                alert("Невалиден номер на връх за: "+lines[curr]);
                return false;
            }
            let weight="",userCSS=["",""],curveHeight=undefined;
            if (tokens.length>=3) {
                let ind=2;
                if (tokens[ind][0]!=='[') weight=tokens[ind++];
                if (tokens.length>ind) {
                    if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                        alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                        return false;
                    }
                    if (tokens[ind][1]!='[') curveHeight=parseFloat(tokens[ind].slice(1,tokens[ind].length-1));
                    else {
                        let css=removeEmpty(tokens[ind].split(","));
                        if (css.length!==2) {
                            alert("Очаква се да има два CSS-а, разделени със запетайка при: "+lines[curr]);
                            return false;
                        }
                        userCSS[0]=css[0].slice(2,css[0].length-1);
                        userCSS[1]=css[1].slice(1,css[1].length-2);
                        ind++;
                        if (tokens.length>ind) {
                            if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                                alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                                return false;
                            }
                            curveHeight=parseFloat(tokens[ind].slice(1,tokens[ind].length-1));
                            ind++;
                            if (tokens.length>ind) {
                                alert("Твърде много свойства при: "+lines[curr]);
                                return false;
                            }
                        }
                    }
                }
            }
            edges.push([x-1,y-1,weight,userCSS,curveHeight]);
            curr++;
        }

        let vers=[],flagCoords=false,versCoord=[];
        if ((lines.length>curr)&&(lines[curr][0]>='0')&&(lines[curr][0]<='9')) {
            let num=removeEmpty(lines[curr].split(" "));
            if (num.length!==1) {
                alert("Очаквано е само едно число за брой върхове при: "+lines[curr]);
                return false;
            }
            curr++;
            for (let i=1; i<=n; i++) {
                vers.push(undefined);
                versCoord.push(undefined);
            }
            flagCoords=true;
            for (let i=1; i<=num[0]; i++) {
                if (lines.length===curr) {
                    alert("Има липсваща информация за връх!");
                    return false;
                }
                let tokens=removeEmpty(getTokens(lines[curr],"vers"));
                if (tokens.length<1) {
                    alert("Трябва поне номер на връх: "+lines[curr]);
                    return false;
                }
                let x=parseInt(tokens[0]);
                if (!((x>=1)&&(x<=n))) {
                    alert("Невалиден номер на връх за: "+lines[curr]);
                    return false;
                }
                let name=x.toString(),coord=undefined,userCSS=["",""];
                if (tokens.length>=2) {
                    let ind=1;
                    if (tokens[ind][0]!=='[') name=tokens[ind++];
                    if (tokens.length>ind) {
                        if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                            alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                            return false;
                        }
                        if (tokens[ind][1]!='[') {
                            let coords=removeEmpty(tokens[ind].split(","));
                            if (coords.length!==2) {
                                alert("Очаква се да има две координати, разделени със запетайка при: "+lines[curr]);
                                return false;
                            }
                            coord=[];
                            coord[0]=parseFloat(coords[0].slice(1,coords[0].length));
                            coord[1]=parseFloat(coords[1].slice(0,coords[1].length-1));
                            ind++;
                        }

                        if (tokens.length>ind) {
                            if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                                alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                                return false;
                            }
                            let css=removeEmpty(tokens[ind].split(","));
                            if (css.length!==2) {
                                alert("Очаква се да има два CSS-а, разделени със запетайка при: "+lines[curr]);
                                return false;
                            }
                            userCSS[0]=css[0].slice(2,css[0].length-1);
                            userCSS[1]=css[1].slice(1,css[1].length-2);
                            ind++;
                            if (tokens.length>ind) {
                                alert("Твърде много свойства при: "+lines[curr]);
                                return false;
                            }
                        }
                    }
                }
                if (coord===undefined) flagCoords=false;
                vers[x-1]=[name,userCSS];
                versCoord[x-1]=coord;
                curr++;
            }
        }
        else {
            for (let i=1; i<=n; i++) {
                vers.push([i.toString(), ["",""]]);
            }
        }

        let posProperties=undefined;
        if (curr<lines.length) {
            let words=removeEmpty(lines[curr].split(" "));
            if ((words.length===1)&&(words[0].length>2)&&(words[0][0]=='[')&&(words[0][words[0].length-1]==']')) {
                let tokens=words[0].slice(1,words[0].length-1).split(",");
                if (tokens.length===3) {
                    posProperties=[parseFloat(tokens[0]), parseFloat(tokens[1]), parseFloat(tokens[2])];
                    if ((isNaN(posProperties[0])===true)||
                        (isNaN(posProperties[1])===true)||
                        (isNaN(posProperties[2])===true)) posProperties=undefined;
                    else curr++;
                }
            }
        }

        let isDirected=graph.isDirected,isWeighted=false,isMulti=false,isTree=false;
        let flagWords=false;
        for (;;) {
            if (lines.length===curr) break;
            let words=removeEmpty(lines[curr].split(" "));
            if (words.length!==1) {
                alert("Очаквано е само една дума, описващо свойство на графа, при: "+lines[curr]);
                return false;
            }
            flagWords=true;
            if (words[0]==="Directed") {
                if (isDirected===false) {
                    if (graph.graphController.changeType[0]===false) {
                        alert("Графът трябва да е неориентиран!");
                        return false;
                    }
                    isDirected=true;
                }
            }
            else if (words[0]==="Undirected") {
                if (isDirected===true) {
                    if (graph.graphController.changeType[0]===false) {
                        alert("Графът трябва да е ориентиран!");
                        return false;
                    }
                    isDirected=false;
                }
            }
            else if (words[0]==="Weighted") {
                if (isWeighted===false) {
                    if (graph.graphController.changeType[1]===false) {
                        alert("Графът трябва да е непретеглен!");
                        return false;
                    }
                    isWeighted=true;
                }
            }
            else if (words[0]==="Multigraph") {
                if (isMulti===false) {
                    if (graph.graphController.changeType[2]===false) {
                        alert("Графът не трябва да е мулти!");
                        return false;
                    }
                    isMulti=true;
                }
            }
            else if (words[0]==="Tree") isTree=true;
            else {
                alert("Неочаквано свойство на графа при: "+lines[curr]);
                return false;
            }
            curr++;
        }
        if (flagWords===false) isWeighted=graph.isWeighted, isMulti=graph.isMulti, isTree=graph.isTree;

        return graph.import(isDirected,isTree,isWeighted,isMulti,n,vers,edges,flagCoords,versCoord,posProperties);
    }
    function addImportFunctionality (wrapperName, graph) {
        let input=$(wrapperName+" .input-file");
        input.hide();
        input.off("change").on("change",function (event) {
            if (event.target.files.length===0) return ;
            let reader=new FileReader();
            reader.onload = function (event) {
                let text=event.target.result.replaceAll("\r\n","\n");
                importGraph(text,graph);
            }
            reader.readAsText(event.target.files[0]);
            $(input).val("");
        });
        if ($("#importModal").length===0) {
            let modal=`
            <div class="modal fade" id="importModal" tabindex="-1" aria-labelledby="importModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="importModalLabel">`+((language==="bg")?"Зареди или промени графа":"Import or change the graph")+`</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form>
                                <div class="form-group">
                                    <label for="message-text" class="col-form-label">`+((language==="bg")?"Текст":"Text")+`:</label>
                                    <textarea class="form-control" id="import-message-text" rows="11"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary import">`+((language==="bg")?"Зареди":"Import")+`</button>
                        </div>
                    </div>
                </div>
            </div>`;
            $("body").append($(modal));
        }
        
        dropdowns[graph.wrapperName].addNewDropdown("import-menu",[
            ["file", ((language==="bg")?"Зареди от файл":"Import from file"), () => { input.click() }],
            ["text", ((language==="bg")?"Зареди от текстово поле":"Import from text field"), () => {
                let graphText=graph.export();
                $("#import-message-text").val(graphText);
                $("#importModal .import").off("click").on("click",function () {
                    let text=$("#import-message-text").val().replaceAll("\r\n","\n");
                    if (graphText!==text) {
                        if (importGraph(text,graph)==true) $("#importModal").modal("toggle");
                    }
                });
                $("#importModal").modal("toggle");
            }]]);
        $(graph.wrapperName+" .import").off("click").on("click",function (event) {
            dropdowns[graph.wrapperName].showDropdown("import-menu",event,graph);
        });
    }
          
    function addUndoFunctionality (wrapperName, graph, graphController) {
        let undoButton=$(wrapperName+" .undo");
        $(undoButton).off("click").on("click",function () {
            graphController.undoAction("undo");
        });
        let redoButton=$(wrapperName+" .redo");
        $(redoButton).off("click").on("click",function () {
            graphController.undoAction("redo");
        });
    }
    

    window.GraphController = GraphController;
    window.GraphControllerLoadData = GraphControllerLoadData;
})();