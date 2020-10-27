var graph;
function initExample () {
    graph = new Graph();
    graph.n=5; graph.isOriented=true;
    graph.init(".graph");
    
    var saveButton=document.querySelector(".twoSATexample .graphExample .save");
    saveButton.canvas=document.querySelector(".twoSATexample .graphExample .canvas-save");
    saveButton.canvas.style.display="none";
    saveButton.svgSave=document.querySelector(".twoSATexample .graphExample .svg-save");
    saveButton.svgSave.style.display="none";
    saveButton.onclick = function () {
        var canvas=this.canvas;
        var context=canvas.getContext('2d');
        var svg=document.querySelector(".twoSATexample .graphExample .graph");
        var svgWidth=svg.getBoundingClientRect().width,svgHeight=svg.getBoundingClientRect().height;
        this.svgSave.setAttribute("width",svgWidth);
        this.svgSave.setAttribute("height",svgHeight);
        $('.twoSATexample .graphExample .graph').clone().appendTo($(".twoSATexample .graphExample .svg-save"));
        canvas.width=svgWidth;
        canvas.height=svgHeight;
        
        this.svgSave.style.display="";
        var svgString=(new XMLSerializer()).serializeToString(this.svgSave);
        this.svgSave.style.display="none";
        var image = new Image();
        image.src="data:image/svg+xml; charset=utf8, "+encodeURIComponent(svgString);
        image.onload = function () {
            context.drawImage(image,0,0);
            var imageURI=canvas.toDataURL('image/png').replace('image/png','image/octet-stream');
            var event = new MouseEvent('click',{view: window, bubbles: false, cancelable: true});
            var temp=document.createElement('a');
            temp.setAttribute('download','graph.png');
            temp.setAttribute('href',imageURI);
            temp.setAttribute('target','_blank');
            temp.dispatchEvent(event);
            $(".twoSATexample .graphExample .svg-save").empty();
            }
        }
}

var flag;
function findImplications (implications, formula) {
    var n=formula.length;
    if (n==0) {
        flag=true;
        return ;
        }
    if (n==1) {
        if ((formula[0]<'a')||(formula[0]>'z')) {
            flag=true;
            return ;
            }
        implications.push(["!"+formula[0],formula[0]]);
        return ;
        }
    if (n==2) {
        if ((formula[0]=='!')&&(formula[1]>='a')&&(formula[1]<='z')) {
            implications.push([formula[1],"!"+formula[1]]);
            return ;
            }
        flag=true;
        return ;
        }
    if (n==3) {
        if ((formula[0]!='(')||(formula[2]!=')')||(formula[1]<'a')||(formula[1]>'z')) {
            flag=true;
            return ;
            }
        implications.push(["!"+formula[1],formula[1]]);
        return ;
        }
    
    for (i=0; i<n; i++) {
        if (formula[i]=='&') {
            if ((i==n-1)||(formula[i+1]!='&')) {
                flag=true;
                return ;
                }
            findImplications(implications,formula.substring(0,i));
            findImplications(implications,formula.substring(i+2));
            return ;
            }
        }
    if (n==4) {
        if ((formula[0]!='(')||(formula[3]!=')')||(formula[1]!='!')||(formula[2]<'a')||(formula[2]>'z')) {
            flag=true;
            return ;
            }
        implications.push([formula[2],"!"+formula[2]]);
        return ;
        }
    if (n==5) {
        flag=true;
        return ;
        }
    
    if ((formula[0]!='(')||(formula[n-1]!=')')) {
        flag=true;
        return ;
        }
    if (formula[1]=='!') {
        if ((formula[2]<'a')||(formula[2]>'z')) {
            flag=true;
            return ;
            }
        if ((formula[3]!='|')||(formula[4]!='|')) {
            flag=true;
            return ;
            }
        if (formula[5]=='!') {
            if ((n!=8)||(formula[6]<'a')||(formula[6]>'z')) {
                flag=true;
                return ;
                }
            implications.push([formula[2],"!"+formula[6]]);
            implications.push([formula[6],"!"+formula[2]]);
            return ;
            }
        else {
            if ((n!=7)||(formula[5]<'a')||(formula[5]>'z')) {
                flag=true;
                return ;
                }
            implications.push([formula[2],formula[5]]);
            implications.push(["!"+formula[5],"!"+formula[2]]);
            return ;
            }
        }
    else {
        if ((formula[1]<'a')||(formula[1]>'z')) {
            flag=true;
            return ;
            }
        if ((formula[2]!='|')||(formula[3]!='|')) {
            flag=true;
            return ;
            }
        if (formula[4]=='!') {
            if ((n!=7)||(formula[5]<'a')||(formula[5]>'z')) {
                flag=true;
                return ;
                }
            implications.push(["!"+formula[1],"!"+formula[5]]);
            implications.push([formula[5],formula[1]]);
            return ;
            }
        else {
            if ((n!=6)||(formula[4]<'a')||(formula[4]>'z')) {
                flag=true;
                return ;
                }
            implications.push(["!"+formula[1],formula[4]]);
            implications.push(["!"+formula[4],formula[1]]);
            return ;
            }
        }
}
function makeImplicationGraph () {
    eraseGraph(graph);
    var formula=document.querySelector(".twoSATexample .formula").value;
    var implications = [];
    flag = false;
    findImplications(implications,formula);
    //console.log(flag,implications);
    if (flag==true) return ;
    var variables = new Map(),x,y;
    graph.n=0; graph.edgeList=[]; graph.adjList=[];
    for (i=0; i<implications.length; i++) {
        if (variables.has(implications[i][0])===false) {
            variables.set(implications[i][0],graph.n);
            graph.verNames[graph.n]=implications[i][0];
            graph.adjList[graph.n]=[];
            graph.n++;
            }
        x=variables.get(implications[i][0]);
        if (variables.has(implications[i][1])===false) {
            variables.set(implications[i][1],graph.n);
            graph.verNames[graph.n]=implications[i][1];
            graph.adjList[graph.n]=[];
            graph.n++;
            }
        y=variables.get(implications[i][1]);
        graph.edgeList.push([x,y]);
        graph.adjList[x].push(y);
        }
    graph.adjMatrix=[];
    for (i=0; i<graph.n; i++) {
        graph.adjMatrix[i]=[];
        for (j=0; j<graph.n; j++) {
            graph.adjMatrix[i].push(0);
            }
        }
    for (i=0; i<graph.n; i++) {
        for (j=0; j<graph.adjList[i].length; j++) {
            graph.adjMatrix[i][graph.adjList[i][j]]=1;
            }
        }
    
    drawGraph(graph,1,1,299,149,10);
    draw(graph,false);
}