"use strict";
(function () {
    let graphs=[];
    function initExample (part) {
        part--;
        graphs[part] = new Graph();
        graphs[part].init(".twoSATexample"+part+" .graphExample .graph",5,true,true);
        if (part===1) {
            $(".twoSATexample1 .formula").val("(a||b)&&(a||!c)&&(!a||!b)");
            $(".twoSATexample1 .make").on("click",makeImplicationGraph.bind(this,1));
            
            makeImplicationGraph(part);
        }
        else if (part==2) {
            $(".twoSATexample2 .formula").val("(a||b)&&(a||!c)&&(!a||!b)");
            $(".twoSATexample2 .show").on("click",showSCC);
            showSCC();
        }
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
            if (variables.has(implications[i][0])===false) {
                variables.set(implications[i][0],ind);
                graph.vertices[ind].name=implications[i][0];
                ind++;
            }
            x=variables.get(implications[i][0]);
            if (variables.has(implications[i][1])===false) {
                variables.set(implications[i][1],ind);
                graph.vertices[ind].name=implications[i][1];
                ind++;
            }
            y=variables.get(implications[i][1]);
            edgeList.push([x,y]);
        }
        graph.n=ind;
        graph.buildEdgeDataStructures(edgeList);    
        graph.drawNewGraph(1,1,299,149,10,false);
    }

    function dfs1 (vr, adjList, edgeList, used, order) {
        used[vr]=true;
        for (let ind of adjList[vr]) {
            let to=edgeList[ind].findEndPoint(vr);
            if (used[to]===false) dfs1(to,adjList,edgeList,used,order);
        }
        order.push(vr);
    }
    function dfs2 (vr, rev, used, num, comps) {
        comps[num].push(vr);
        used[vr]=true;
        for (let i=0; i<rev[vr].length; i++) {
            if (used[rev[vr][i]]===false) dfs2(rev[vr][i],rev,used,num,comps);
            }
    }

    function showSCC () {
        makeImplicationGraph(2);
        let graph=graphs[2],used=[];
        for (let i=0; i<graph.n; i++) {
            if (graph.vertices[i]===undefined) continue;
            used[i]=false;
        }
        let order=[];
        for (let i=0; i<graph.n; i++) {
            if (graph.vertices[i]===undefined) continue;
            if (used[i]===false) dfs1(i,graph.adjList,graph.edgeList,used,order);
        }

        let rev=[];
        for (let i=0; i<graph.n; i++) {
            if (graph.vertices[i]===undefined) continue;
            used[i]=false;
            rev[i]=[];
        }
        for (let edge of graph.edgeList) {
            if (edge===undefined) continue;
            rev[edge.y].push(edge.x);
        }
        let num=0,comps=[];
        for (let i=graph.n-1; i>=0; i--) {
            if (used[order[i]]===false) {
               comps[num]=[];
               dfs2(order[i],rev,used,num,comps);
               num++;
            }
        }

        let colours=["#f09481","#e66440","#de4026","#bd291e","#a6262f","#ba3a71","#e65c9a","#f777c2","#f094cd","#d97cc0",
                     "#c76dbf","#99498a","#80447f","#513d66","#3653b3","#248ad4","#5fcaed","#82ebf5","#17b2e6","#306ec9",
                     "#237040","#2d801b","#52992e","#66b324","#86cc14","#b0e627","#ffff69","#f7db02","#e8c00e","#f7aa25",
                     "#ff8c00","#ff8c00","#f0690e","#f0cab6","#e8bb97","#e09e75","#c9794b","#b06838","#ad6615","#733405",
                     "#542d01","#361c01","#574d43","#786e65","#b0a79d","#c7c5c3","#f2f2f2"];
        let jump=Math.floor(46/num),colour=0;
        for (let i=0; i<num; i++) {
            for (let j=0; j<comps[i].length; j++) {
                graph.svgVertices[comps[i][j]].circle.attr({fill: colours[colour]});
            }
            colour+=jump;
        }
        for (let i=0; i<graph.edgeList.length; i++) {
            if (graph.edgeList[i]===undefined) continue;
            let from=graph.edgeList[i].x,to=graph.edgeList[i].y;
            if (graph.svgVertices[from].circle.attr("fill")==graph.svgVertices[to].circle.attr("fill")) {
                graph.svgEdges[i].line.attr({stroke: graph.svgVertices[from].circle.attr("fill")});
                graph.svgEdges[i].line.markerEnd.attr({fill: graph.svgVertices[from].circle.attr("fill")});
            }
        }

        let solution=document.querySelector(".twoSATexample2 .solution"),text;
        text="\\(";
        for (let i=0; i<graph.n; i++) {
            if (graph.vertices[i]===undefined) continue;
            if (graph.vertices[i].name[0]==='!') continue;
            let comp=[];
            for (let j=0; j<num; j++) {
                for (let h=0; h<comps[j].length; h++) {
                    if (graph.vertices[comps[j][h]].name===graph.vertices[i].name) comp[0]=j;
                    else if (graph.vertices[comps[j][h]].name==="!"+graph.vertices[i].name) comp[1]=j;
                }
            }
            if (comp[0]===comp[1]) {
                text="Няма решение, защото в силно-свързаната компонента на връх \\("+graph.vertices[i].name+"\\) има и неговото отрицание!";
                break;
            }
            if (text!="\\(") text+=", ";
            text+=graph.vertices[i].name;
            if (comp[0]>comp[1]) text+=" = 1";
            else text+=" = 0";
            
            if (i===graph.n-1) text+="\\)";
        }
        solution.textContent=text;
        if (typeof MathJax!=="undefined") MathJax.typeset([".twoSATexample2 .solution"]);
    }
    
    
    window.initExample = initExample;
})();