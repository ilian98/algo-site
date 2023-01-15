"use strict";
(function () {
    let graphs=[];
    function initExample (part) {
        part--;
        let showButton=$(".twoSATexample"+part+((part===1)?" .make":" .show"));
        showButton.on("click",(part===1)?makeImplicationGraph.bind(this,part):showSCC.bind(this,part));
        $(".twoSATexample"+part+" .default").on("click",function () {
            graphs[part]=new Graph();
            graphs[part].init(".twoSATexample"+part+" .graphExample",5,true);
            $(".twoSATexample"+part+" .formula").val("(a||b)&&(a||!c)&&(!a||!b)"+((part===3)?"&&(a||!b)":""));
            showButton.click();
        }).click();
    }

    function findImplications (implications, formula) {
        var n=formula.length;
        if (n==0) return false;
        if (n==1) {
            if ((formula[0]<'a')||(formula[0]>'z')) return false;
            implications.push(["!"+formula[0],formula[0]]);
            return true;
        }
        if (n==2) {
            if ((formula[0]=='!')&&(formula[1]>='a')&&(formula[1]<='z')) {
                implications.push([formula[1],"!"+formula[1]]);
                return true;
            }
            return false;
        }
        if (n==3) {
            if ((formula[0]!='(')||(formula[2]!=')')||(formula[1]<'a')||(formula[1]>'z')) return false;
            implications.push(["!"+formula[1],formula[1]]);
            return true;
        }

        for (let i=0; i<n; i++) {
            if (formula[i]=='&') {
                if ((i==n-1)||(formula[i+1]!='&')) return false;
                return findImplications(implications,formula.substring(0,i))&&
                    findImplications(implications,formula.substring(i+2));
            }
        }
        if (n==4) {
            if ((formula[0]!='(')||(formula[3]!=')')||(formula[1]!='!')||(formula[2]<'a')||(formula[2]>'z')) return false;
            implications.push([formula[2],"!"+formula[2]]);
            return true;
        }
        if (n==5) return false;

        if ((formula[0]!='(')||(formula[n-1]!=')')) return false;
        if (formula[1]=='!') {
            if ((formula[2]<'a')||(formula[2]>'z')) return false;
            if ((formula[3]!='|')||(formula[4]!='|')) return false;
            if (formula[5]=='!') {
                if ((n!=8)||(formula[6]<'a')||(formula[6]>'z')) return false;
                implications.push([formula[2],"!"+formula[6]]);
                implications.push([formula[6],"!"+formula[2]]);
                return true;
            }
            else {
                if ((n!=7)||(formula[5]<'a')||(formula[5]>'z')) return false;
                implications.push([formula[2],formula[5]]);
                implications.push(["!"+formula[5],"!"+formula[2]]);
                return true;
            }
        }
        else {
            if ((formula[1]<'a')||(formula[1]>'z')) return false;
            if ((formula[2]!='|')||(formula[3]!='|')) return false;
            if (formula[4]=='!') {
                if ((n!=7)||(formula[5]<'a')||(formula[5]>'z')) return false;
                implications.push(["!"+formula[1],"!"+formula[5]]);
                implications.push([formula[5],formula[1]]);
                return true;
            }
            else {
                if ((n!=6)||(formula[4]<'a')||(formula[4]>'z')) return false;
                implications.push(["!"+formula[1],formula[4]]);
                implications.push(["!"+formula[4],formula[1]]);
                return true;
            }
        }
        return true;
    }
    function makeImplicationGraph (part) {
        let graph=graphs[part];
        graph.erase();
        let formula=$(".twoSATexample"+part+" .formula").val();
        let implications=[];
        if (findImplications(implications,formula)===false) {
            alert("Невалиден израз!");
            return ;
        }
        let variables=new Map(),x,y;
        let ind=0;
        let edgeList=[];
        graph.initVertices(2*implications.length);
        for (let i=0; i<implications.length; i++) {
            for (let j=0; j<2; j++) {
                let curr=implications[i][j];
                if (variables.has(curr)===true) continue;
                variables.set(curr,ind);
                graph.getVertex(ind++).name=curr;
                
                let negative;
                if (curr[0]==='!') negative=curr.substr(1,curr.length-1);
                else negative="!"+curr;
                variables.set(negative,ind);
                graph.getVertex(ind++).name=negative;
            }
            x=variables.get(implications[i][0]);
            y=variables.get(implications[i][1]);
            edgeList.push([x,y]);
        }
        graph.n=ind;
        graph.buildEdgeDataStructures(edgeList);    
        graph.drawNewGraph(false,10);
    }

    function dfs1 (vr, adjList, edgeList, used, order) {
        used[vr]=true;
        for (let ind of adjList[vr]) {
            let to=edgeList[ind].findEndPoint(vr);
            if (used[to]===false) dfs1(to,adjList,edgeList,used,order);
        }
        order.push(vr);
    }
    let num,comps,nums;
    function dfs2 (vr, rev, used) {
        comps[num].push(vr); nums[vr]=num;
        used[vr]=true;
        for (let i=0; i<rev[vr].length; i++) {
            if (used[rev[vr][i]]===false) dfs2(rev[vr][i],rev,used,num,comps);
        }
    }

    let values;
    function colourSCC (graph, part) {
        let colours=["#f09481","#e66440","#de4026","#bd291e","#a6262f","#ba3a71","#e65c9a","#f777c2","#f094cd","#d97cc0",
                     "#c76dbf","#99498a","#80447f","#513d66","#3653b3","#248ad4","#5fcaed","#82ebf5","#17b2e6","#306ec9",
                     "#237040","#2d801b","#52992e","#66b324","#86cc14","#b0e627","#ffff69","#f7db02","#e8c00e","#f7aa25",
                     "#ff8c00","#ff8c00","#f0690e","#f0cab6","#e8bb97","#e09e75","#c9794b","#b06838","#ad6615","#733405",
                     "#542d01","#361c01","#574d43","#786e65","#b0a79d","#c7c5c3","#f2f2f2"];
        let jump=Math.floor(colours.length/num),colour=0;
        let versColour=[];
        for (let i=0; i<num; i++) {
            for (let j=0; j<comps[i].length; j++) {
                let v=comps[i][j],vr=graph.getVertex(v);
                if ((part===2)||(values.length===0)) {
                    vr.addedCSS[0]="fill: "+colours[colour];
                    versColour[v]=colours[colour];
                }
                else {
                    if (values[v]===true) {
                        vr.addedCSS[0]="fill: green";
                        versColour[v]="green";
                    }
                    else {
                        vr.addedCSS[0]="fill: red";
                        versColour[v]="red";
                    }
                }
            }
            colour+=jump;
        }
        for (let [i, edge] of graph.getEdges()) {
            let from=edge.x,to=edge.y;
            if (nums[from]===nums[to]) edge.addedCSS[0]="stroke: "+versColour[from];
        }
        graph.draw(false);
    }
    function showSCC (part) {
        makeImplicationGraph(part);
        let graph=graphs[part],used=[];
        let vers=graph.getVertices();
        for (let [i, vr] of vers) {
            used[i]=false;
        }
        let order=[];
        for (let [i, vr] of vers) {
            if (used[i]===false) dfs1(i,graph.adjList,graph.getIndexedEdges(),used,order);
        }

        let rev=[];
        for (let [i, vr] of vers) {
            used[i]=false;
            rev[i]=[];
        }
        for (let [i, edge] of graph.getEdges()) {
            rev[edge.y].push(edge.x);
        }
        num=0; comps=[]; nums=[];
        for (let i=order.length-1; i>=0; i--) {
            if (used[order[i]]===false) {
               comps[num]=[];
               dfs2(order[i],rev,used,num,comps);
               num++;
            }
        }
        
        let solution=document.querySelector(".twoSATexample"+part+" .solution"),text;
        text="$"; values=[];
        for (let ind=0; ind<vers.length; ind+=2) {
            let i=vers[ind][0];
            let comp,name;
            if (graph.getVertex(i).name[0]==='!') {
                comp=[nums[i+1], nums[i]];
                name=graph.getVertex(i+1).name;
            }
            else {
                comp=[nums[i], nums[i+1]];
                name=graph.getVertex(i).name;
            }
            if (comp[0]===comp[1]) {
                text="Няма решение, защото в силно-свързаната компонента на връх $"+name+"$ има и неговото отрицание!";
                values=[];
                break;
            }
            if (text!="$") text+=", ";
            text+=name;
            if (comp[0]>comp[1]) {
                text+=" = 1";
                if (graph.getVertex(i).name[0]==='!') values[i+1]=true, values[i]=false;
                else values[i]=true, values[i+1]=false;
            }
            else {
                text+=" = 0";
                if (graph.getVertex(i).name[0]==='!') values[i+1]=false, values[i]=true;
                else values[i]=false, values[i+1]=true;
            }
        }
        if (values.length!=0) text+="$";
        solution.textContent=text;
        if ((typeof MathJax!=="undefined")&&(MathJax.typeset!==undefined)) MathJax.typeset([".twoSATexample"+part+" .solution"]);
        
        colourSCC(graph,part);
    }
    
    
    window.initExample = initExample;
})();