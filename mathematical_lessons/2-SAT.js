var graphs=[];
function initExample (part) {
    graphs[part] = new Graph();
    graphs[part].n=5; graphs[part].isOriented=true;
    graphs[part].init(".twoSATexample"+part+" .graphExample .graph");
    
    var saveButton=document.querySelector(".twoSATexample"+part+" .graphExample .save");
    saveButton.canvas=document.querySelector(".twoSATexample"+part+" .graphExample .canvas-save");
    saveButton.canvas.style.display="none";
    saveButton.svgSave=document.querySelector(".twoSATexample"+part+" .graphExample .svg-save");
    saveButton.svgSave.style.display="none";
    saveButton.onclick = function () {
        var canvas=this.canvas;
        var context=canvas.getContext('2d');
        var svg=document.querySelector(".twoSATexample"+part+" .graphExample .graph");
        var svgWidth=svg.getBoundingClientRect().width,svgHeight=svg.getBoundingClientRect().height;
        this.svgSave.setAttribute("width",svgWidth);
        this.svgSave.setAttribute("height",svgHeight);
        $('.twoSATexample'+part+' .graphExample .graph').clone().appendTo($(".twoSATexample"+part+" .graphExample .svg-save"));
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
            $(".twoSATexample"+part+" .graphExample .svg-save").empty();
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
function makeImplicationGraph (part) {
    graph=graphs[part];
    eraseGraph(graph);
    var formula=document.querySelector(".twoSATexample"+part+" .formula").value;
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

function dfs1 (vr, adjList, used, order) {
    var i;
    used[vr]=1;
    for (i=0; i<adjList[vr].length; i++) {
        if (used[adjList[vr][i]]==0) dfs1(adjList[vr][i],adjList,used,order);
        }
    order.push(vr);
}
function dfs2 (vr, rev, used, num, comps) {
    var i;
    comps[num].push(vr);
    used[vr]=1;
    for (i=0; i<rev[vr].length; i++) {
        if (used[rev[vr][i]]==0) dfs2(rev[vr][i],rev,used,num,comps);
        }
}

function showSCC () {
    makeImplicationGraph(2);
    var i,graph=graphs[2],used=[];
    for (i=0; i<graph.n; i++) {
        used[i]=0;
        }
    var order=[];
    for (i=0; i<graph.n; i++) {
        if (used[i]==0) dfs1(i,graph.adjList,used,order);
        }
    
    var rev=[];
    for (i=0; i<graph.n; i++) {
        used[i]=0;
        rev[i]=[];
        }
    for (i=0; i<graph.edgeList.length; i++) {
        rev[graph.edgeList[i][1]].push(graph.edgeList[i][0]);
        }
    var num=0,comps=[];
    for (i=graph.n-1; i>=0; i--) {
        if (used[order[i]]==0) {
           comps[num]=[];
           dfs2(order[i],rev,used,num,comps);
           num++;
           }
        }

    var colours=["#f09481","#e66440","#de4026","#bd291e","#a6262f","#ba3a71","#e65c9a","#f777c2","#f094cd","#d97cc0",
                 "#c76dbf","#99498a","#80447f","#513d66","#3653b3","#248ad4","#5fcaed","#82ebf5","#17b2e6","#306ec9",
                 "#237040","#2d801b","#52992e","#66b324","#86cc14","#b0e627","#ffff69","#f7db02","#e8c00e","#f7aa25",
                 "#ff8c00","#ff8c00","#f0690e","#f0cab6","#e8bb97","#e09e75","#c9794b","#b06838","#ad6615","#733405",
                 "#542d01","#361c01","#574d43","#786e65","#b0a79d","#c7c5c3","#f2f2f2"];
    var jump=Math.floor(46/num),colour=0;
    for (i=0; i<num; i++) {
        for (j=0; j<comps[i].length; j++) {
            graph.verCircles[comps[i][j]].attr({fill: colours[colour]});
            }
        colour+=jump;
        }
    
    var solution=document.querySelector(".twoSATexample2 .solution"),text;
    text="";
    for (i=0; i<graph.n; i++) {
        if (graph.verNames[i][0]=='!') continue;
        var comp=[];
        for (j=0; j<num; j++) {
            for (h=0; h<comps[j].length; h++) {
                if (graph.verNames[comps[j][h]]==graph.verNames[i]) comp[0]=j;
                else if (graph.verNames[comps[j][h]]=="!"+graph.verNames[i]) comp[1]=j;
                }
            }
        if (comp[0]==comp[1]) {
            text="Няма решение, защото в силно-свързаната компонента на връх \\("+graph.verNames[i]+"\\) има и неговото отрицание!";
            break;
            }
        if (text!="") text+=", ";
        text+=graph.verNames[i];
        if (comp[0]>comp[1]) text+=" = 1";
        else text+=" = 0";
        }
    solution.textContent=text;
    MathJax.typeset([".twoSATexample2 .solution"]);
}