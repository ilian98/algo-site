"use strict";
(function () {
    let settingsPanel;
    async function GraphControllerLoadData () {
        return new Promise ((resolve, reject) => {
            $.get("/algo-site/pages/settings_panel.html", function (data) {
                settingsPanel=data;
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
            for (let i=0; i<n; i++) {
                graph.vertices[i].name=(i+1).toString();
            }
            graph.buildEdgeDataStructures([]); graphController.undoTime--;
            graph.calcPositions.calc();
            graph.draw(graph.isDrawable,false);
            graph.graphChange();
        });

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
            graph.draw(graph.isDrawable);
            graph.graphChange();
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
                graph.draw(graph.isDrawable);
                graph.graphChange();
            }
            else if ((this.checked===false)&&(graph.isWeighted===true)) {
                graphController.addChange("change-property", ["isWeighted", true]);
                graph.isWeighted=false;
                graph.draw(graph.isDrawable);
                graph.graphChange();
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

        let sliderRad=$(".range-rad");
        let outputRad=$(".slider-value-rad");
        sliderRad.val(graph.vertexRad);
        outputRad.html(graph.vertexRad);
        sliderRad.attr("min",parseInt(3*graph.vertexRad/4));
        sliderRad.attr("max",parseInt(3*graph.vertexRad/2));
        sliderRad.off("input").on("input", function() {
            let val=parseInt($(this).val());
            outputRad.html(val);
            let oldVal=graph.vertexRad;
            graphController.addChange("change-property", ["radius", oldVal]);
            graph.vertexRad=val;
            graph.draw(graph.isDrawable);
        });
    }
    function showSettings (graphController) {
        let graph=this;
        addSettings(graph,graphController);
        let sliderVers=$(".range-vers");
        let outputVers=$(".slider-value-vers");
        let cnt=0;
        for (let i=0; i<graph.n; i++) {
            if (graph.vertices[i]===undefined) continue;
            cnt++;
        }
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

        if (graphController.changeRad===true) $(".range-rad").parent().parent().show();
        else $(".range-rad").parent().parent().hide();
    }
    function addSettingsPanel (wrapperName, graph, graphController) {
        if ($(wrapperName+" .settings-panel").length!==0) $(wrapperName+" .settings-panel").html(settingsPanel);
        addSaveFunctionality(wrapperName,graph);
        addImportFunctionality(wrapperName,graph);
        addUndoFunctionality(wrapperName,graph,graphController);
        $(wrapperName+" .settings").off("click.settings").on("click.settings",showSettings.bind(graph,graphController));
    }
    
    function GraphController (graph) {
        this.undoStack=undefined; this.undoTime=undefined;
        this.redoStack=undefined; this.redoTime=undefined;
        this.init = function () {
            this.undoStack=[]; this.undoTime=0; this.redoStack=[]; this.redoTime=0;
            addSettingsPanel(graph.wrapperName,graph,this);
        }
        this.addChange = function (type, data, time, increaseTime = true, undoType) {
            if (time===undefined) time=this.undoTime;
            this.undoStack.push({
                time: this.undoTime, 
                type: type, 
                data: data
            });
            if (increaseTime===true) this.undoTime++;
            if (undoType===undefined) this.redoStack=[];
        }
        this.addChanges = function (changes, increaseTime = true, undoType) {
            for (let [type, data] of changes) {
                this.addChange(type,data,undefined,false,undoType);
            }
            if (increaseTime===true) this.undoTime++;
        }
        this.redoChange = function (type, data) {
            this.redoStack.push({
                time: this.redoTime, 
                type: type,
                data: data
            });
            this.redoTime++;
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
        }
        this.registerAction = function (type, data, undoType) {
            if ((undoType===undefined)||(undoType==="redo")) this.addChange(type,data,undefined,true,undoType);
            else this.redoChange(type,data);
        }
        
        this.changeType=[true, true, true]; this.changeVers=true; this.changeRad=true;
        this.setSettings = function (changeType = [true, true, true], changeVers = true, changeRad = true) {
            this.changeType=[changeType[0], changeType[1], changeType[2]];
            this.changeVers=changeVers; this.changeRad=changeRad;
            if ($(this.wrapperName+" .settings-panel").length===0) addSettings(graph,this);
        }
        
        this.undoAction = function (undoType) {
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
            for (;;) {
                if (stack.length===0) break;
                let curr=stack[stack.length-1];
                if (curr.time!==currTime) break;
                stack.pop();
                if (curr.type==="vertex-list") graph.initVertices(curr.data[0],curr.data[1],undoType);
                else if (curr.type==="edge-list") graph.buildEdgeDataStructures(curr.data,undoType);
                else if (curr.type==="new-positions") graph.calcPositions.changePositions(curr.data[0],curr.data[1],undoType);
                else {
                    let ind=curr.data[0];
                    if (curr.type==="new-pos") {
                        pushOther(curr.type,[ind, [graph.svgVertices[ind].coord[0], graph.svgVertices[ind].coord[1]]]);
                        graph.svgVertices[ind].coord=curr.data[1];
                    }
                    else if (curr.type==="add-edge") graph.removeEdge(ind,undoType);
                    else if (curr.type==="remove-edge") {
                        let edgeData=curr.data[1];
                        graph.addEdge(edgeData[0],edgeData[1],edgeData[2],edgeData[3],edgeData[4],ind,undoType);
                    }
                    else if (curr.type==="add-vertex") graph.removeVertex(ind,undoType);
                    else if (curr.type==="remove-vertex") {
                        graph.addVertex(curr.data[2][0],curr.data[2][1],ind,undoType);
                        graph.svgVertices[ind].coord=curr.data[1];
                    }
                    else if (curr.type==="change-curve-height") {
                        pushOther(curr.type,[ind, graph.edgeList[ind].curveHeight]);
                        graph.edgeList[ind].curveHeight=curr.data[1];
                    }
                    else if (curr.type==="change-css-vertex") {
                        pushOther(curr.type,[ind, [graph.vertices[ind].addedCSS[0], graph.vertices[ind].addedCSS[1]]]);
                        graph.vertices[ind].addedCSS=curr.data[1];
                    }
                    else if (curr.type==="change-css-edge") {
                        pushOther(curr.type,[ind, [graph.edgeList[ind].addedCSS[0], graph.edgeList[ind].addedCSS[1]]]);
                        graph.edgeList[ind].addedCSS=curr.data[1];
                    }
                    else if (curr.type==="change-name") {
                        pushOther(curr.type,[ind, graph.vertices[ind].name]);
                        graph.vertices[ind].name=curr.data[1];
                    }
                    else if (curr.type==="change-weight") {
                        pushOther(curr.type,[ind, graph.edgeList[ind].weight]);
                        graph.edgeList[ind].weight=curr.data[1];
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
                        else if (type==="radius") {
                            pushOther(curr.type,[type, graph.vertexRad]);
                            graph.vertexRad=parseInt(curr.data[1]);
                        }
                    }
                }
                if (undoType==="undo") this.redoTime--;
                else this.undoTime--;
            }
            if (undoType==="undo") this.redoTime++;
            else this.undoTime++;

            graph.draw(graph.isDrawable);
            graph.graphChange();
        }
    }
    function addSaveFunctionality (wrapperName, graph) {
        let svg=$(graph.svgName);
        let canvas=$(wrapperName+" .canvas-save");
        let svgSave=$(wrapperName+" .svg-save");

        let saveButton=$(wrapperName+" .save");
        $(saveButton).off("click").on("click",function (event) {
            let dropdown=dropdownMenu(".dropdown-menu.save-menu",event);
            dropdown.find(".png").off("click").one("click",function () {
                let context=canvas[0].getContext('2d');
                let svgWidth=2*svg.width(),svgHeight=2*svg.height();

                svgSave.attr("viewBox",svg.attr("viewBox"));
                svgSave.attr("width",svgWidth);
                svgSave.attr("height",svgHeight);
                svgSave.html(svg.html());
                canvas.prop("width",svgWidth);
                canvas.prop("height",svgHeight);

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
            });

            dropdown.find(".svg").off("click").one("click",function () {
                $(".click-area").hide();
                svgSave.attr("viewBox",svg.attr("viewBox"));
                svgSave.removeAttr("width").removeAttr("height");
                svgSave.html(svg.html());
                svgSave[0].setAttribute("xmlns","http://www.w3.org/2000/svg");
                let svgData=svgSave[0].outerHTML.replaceAll("cursor: pointer;","")
                    .replace("border-style: dotted","border-style: none")
                    .replace("display: none","");
                let preface='<?xml version="1.0" standalone="no"?>\r\n';
                let svgBlob=new Blob([preface, svgData], {type: "image/svg+xml;charset=utf-8"});
                let svgURL=URL.createObjectURL(svgBlob);
                $("<a>").prop("download","graph.svg")
                    .prop("href",svgURL)
                    .prop("target","_black")[0].click();
                $(".click-area").show();
                svgSave.empty();
            });

            dropdown.find(".edge-list").off("click").one("click", function () {
                let vers=0;
                for (let vertex of graph.vertices) {
                    if (vertex===undefined) continue;
                    vers++;
                }
                let edges=[];
                for (let edge of graph.edgeList) {
                    if (edge===undefined) continue;
                    if (edge.weight==="") edges.push([graph.vertices[edge.x].name,graph.vertices[edge.y].name]);
                    else edges.push([graph.vertices[edge.x].name,graph.vertices[edge.y].name,edge.weight]);
                }
                let text=vers+" "+edges.length+"\n";
                for (let edge of edges) {
                    text+=edge[0]+" "+edge[1];
                    if (edge.length===3) text+=" "+edge[2];
                    text+="\n";
                }
                $("<a>").prop("download","edge_list.txt")
                    .prop("href","data:text/plain;charset=utf-8,"+encodeURIComponent(text))
                    .prop("target","_black")[0].click();
            });

            dropdown.find(".txt").off("click").on("click", function () {
                dropdown.find(".txt").off("click");

                $("<a>").prop("download","graph.txt")
                    .prop("href","data:text/plain;charset=utf-8,"+encodeURIComponent(graph.export()))
                    .prop("target","_black")[0].click();
            });
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
    function getTokens (s) {
        s=s.split("");
        let cnt=0;
        for (let i=0; i<s.length; i++) {
            if (s[i]==='[') cnt++;
            else if (s[i]===']') cnt--;
            else if ((s[i]===' ')&&(cnt>0)) s[i]='\x00'; // escaping spaces
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
    function addImportFunctionality (wrapperName, graph) {
        let importButton=$(wrapperName+" .import");
        let input=$(wrapperName+" .input-file");
        input.hide();
        $(importButton).off("click").on("click",function () {
            input.click();
        });
        input.off("change").on("change",function (event) {
            if (event.target.files.length===0) return ;
            let reader=new FileReader();
            reader.onload = function (event) {
                let text=event.target.result.replaceAll("\r\n","\n");
                let lines=removeEmpty(text.split("\n"));
                let nums=removeEmpty(lines[0].split(" "));
                if (nums.length!==2) {
                    alert("Очаквани са две числа за максимален номер на връх и брой ребра при: "+lines[0]);
                    return ;
                }
                let n=parseInt(nums[0]),m=parseInt(nums[1]);
                if (n<1) {
                    alert("Очакван е положителен максимален номер на връх при: "+lines[0]);
                    return ;
                }
                let curr=1,edges=[];
                for (let i=1; i<=m; i++) {
                    if (lines.length===curr) {
                        alert("Има липсващи ребра!");
                        return ;
                    }
                    let tokens=removeEmpty(getTokens(lines[curr]));
                    if (tokens.length<2) {
                        alert("Трябват поне върхове за реброто: "+lines[curr]);
                        return ;
                    }
                    let x=parseInt(tokens[0]),y=parseInt(tokens[1]);
                    if (!((x>=1)&&(x<=n)&&(y>=1)&&(y<=n))) {
                        alert("Невалиден номер на връх за: "+lines[curr]);
                        return ;
                    }
                    let weight="",addedCSS=["",""],curveHeight=undefined;
                    if (tokens.length>=3) {
                        let ind=2;
                        if (tokens[ind][0]!=='[') weight=tokens[ind++];
                        if (tokens.length>ind) {
                            if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                                alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                                return ;
                            }
                            if (tokens[ind][1]!='[') curveHeight=parseFloat(tokens[ind].slice(1,tokens[ind].length-1));
                            else {
                                let css=removeEmpty(tokens[ind].split(","));
                                if (css.length!==2) {
                                    alert("Очаква се да има два CSS-а, разделени със запетайка при: "+lines[curr]);
                                    return ;
                                }
                                addedCSS[0]=css[0].slice(2,css[0].length-1);
                                addedCSS[1]=css[1].slice(1,css[1].length-2);
                                ind++;
                                if (tokens.length>ind) {
                                    if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                                        alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                                        return ;
                                    }
                                    curveHeight=parseFloat(tokens[ind].slice(1,tokens[ind].length-1));
                                    ind++;
                                    if (tokens.length>ind) {
                                        alert("Твърде много свойства при: "+lines[curr]);
                                        return ;
                                    }
                                }
                            }
                        }
                    }
                    edges.push([x-1,y-1,weight,addedCSS,curveHeight]);
                    curr++;
                }
                
                let vers=[],flagCoords=false,versCoord=[];
                if ((lines.length>curr)&&(lines[curr][0]>='0')&&(lines[curr][0]<='9')) {
                    let num=removeEmpty(lines[curr].split(" "));
                    if (num.length!==1) {
                        alert("Очаквано е само едно число за брой върхове при: "+lines[curr]);
                        return ;
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
                            return ;
                        }
                        let tokens=removeEmpty(getTokens(lines[curr]));
                        if (tokens.length<1) {
                            alert("Трябва поне номер на връх: "+lines[curr]);
                            return ;
                        }
                        let x=parseInt(tokens[0]);
                        if (!((x>=1)&&(x<=n))) {
                            alert("Невалиден номер на връх за: "+lines[curr]);
                            return ;
                        }
                        let name=x.toString(),coord=undefined,addedCSS=["",""];
                        if (tokens.length>=2) {
                            let ind=1;
                            if (tokens[ind][0]!=='[') name=tokens[ind++];
                            if (tokens.length>ind) {
                                if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                                    alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                                    return ;
                                }
                                if (tokens[ind][1]!='[') {
                                    let coords=removeEmpty(tokens[ind].split(","));
                                    if (coords.length!==2) {
                                        alert("Очаква се да има две координати, разделени със запетайка при: "+lines[curr]);
                                        return ;
                                    }
                                    coord=[];
                                    coord[0]=parseFloat(coords[0].slice(1,coords[0].length));
                                    coord[1]=parseFloat(coords[1].slice(0,coords[1].length-1));
                                    ind++;
                                }
                            
                                if (tokens.length>ind) {
                                    if ((tokens[ind][0]!=='[')||(tokens[ind][tokens[ind].length-1]!==']')) {
                                        alert("Очаква се свойството да е оградено от квадратни скоби при: "+lines[curr]);
                                        return ;
                                    }
                                    let css=removeEmpty(tokens[ind].split(","));
                                    if (css.length!==2) {
                                        alert("Очаква се да има два CSS-а, разделени със запетайка при: "+lines[curr]);
                                        return ;
                                    }
                                    addedCSS[0]=css[0].slice(2,css[0].length-1);
                                    addedCSS[1]=css[1].slice(1,css[1].length-2);
                                    ind++;
                                    if (tokens.length>ind) {
                                        alert("Твърде много свойства при: "+lines[curr]);
                                        return ;
                                    }
                                }
                            }
                        }
                        if (coord===undefined) flagCoords=false;
                        vers[x-1]=[name,addedCSS];
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
                
                let isDirected=graph.isDirected,isWeighted=graph.isWeighted,isMulti=graph.isMulti,isTree=graph.isTree;
                for (;;) {
                    if (lines.length===curr) break;
                    let words=removeEmpty(lines[curr].split(" "));
                    if (words.length!==1) {
                        alert("Очаквано е само една дума, описващо свойство на графа, при: "+lines[curr]);
                        return ;
                    }
                    if (words[0]==="Directed") {
                        if (isDirected===false) {
                            if (graph.changeType[0]===false) {
                                alert("Графът трябва да е неориентиран!");
                                return ;
                            }
                            isDirected=true;
                        }
                    }
                    else if (words[0]==="Undirected") {
                        if (isDirected===true) {
                            if (graph.changeType[0]===false) {
                                alert("Графът трябва да е ориентиран!");
                                return ;
                            }
                            isDirected=false;
                        }
                    }
                    else if (words[0]==="Weighted") {
                        if (isWeighted===false) {
                            if (graph.changeType[1]===false) {
                                alert("Графът трябва да е непретеглен!");
                                return ;
                            }
                            isWeighted=true;
                        }
                    }
                    else if (words[0]==="Multigraph") {
                        if (isMulti===false) {
                            if (graph.changeType[2]===false) {
                                alert("Графът не трябва да е мулти!");
                                return ;
                            }
                            isMulti=true;
                        }
                    }
                    else if (words[0]==="Tree") isTree=true;
                    else {
                        alert("Неочаквано свойство на графа при: "+lines[curr]);
                        return ;
                    }
                    curr++;
                }
                
                graph.import(isDirected,isTree,isWeighted,isMulti,n,vers,edges);
            }
            reader.readAsText(event.target.files[0]);
            $(input).val("");
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