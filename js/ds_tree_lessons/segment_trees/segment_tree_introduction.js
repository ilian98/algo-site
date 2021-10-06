"use strict";
(function () {
    let dynSegTree = {
        maxC: 64,
        frameX: 2,
    };
    
    function endAnimation (tree, animationObj, elements, pos, val) {
        this.hide();

        animationObj.clear();
        elements[pos-1]=val;
        makeEdgesAndNames(0,0,elements.length-1,[],tree.vertices,elements,false);
        tree.draw(false);
        addSegmentsLabels(0,1,elements.length,tree,false,false);
    }
    function toggleIndexes (tree, elements, isDynamic) {
        if ((isDynamic===false)&&(elements.length===0)) return ;
        tree.draw(false);
        let flagIndexes;
        if (this.text()=="Покажи номерата") {
            this.text("Скрий номерата");
            flagIndexes=true;
        }
        else {
            this.text("Покажи номерата");
            flagIndexes=false;
        }
    
        if (isDynamic===false) addSegmentsLabels(0,1,elements.length,tree,flagIndexes,isDynamic);
        else addSegmentsLabels(0,1,dynSegTree.maxC,tree,flagIndexes,isDynamic);
    }
    function addSegmentsLabels (index, l, r, tree, flagIndex, isDynamic) {
        if (flagIndex===true) {
            let indexFontSize=tree.vertexRad*4/6;
            let textIndex=tree.s.text(0,0,index+1);
            textIndex.attr({"font-size": indexFontSize,"font-family": "Times New Roman", "font-weight": "bold", class: "unselectable", fill: "blue"});
            textIndex.attr({
                x: tree.svgVertices[index].coord[0], 
                y: tree.svgVertices[index].coord[1]-tree.vertexRad+1,
            });
            textIndex.attr({dy: 2*determineDy(index+1,"Times New Roman",indexFontSize), "text-anchor": "middle"});
        }

        let labelFontSize=tree.vertexRad*5/6;
        let segment=tree.s.text(0,0,"["+l+";"+r+"]");
        segment.attr({"font-size": labelFontSize, "font-family": "Times New Roman", class: "unselectable", fill: "#B22222"});
        if (l===r) {
           segment.attr({
               x: tree.svgVertices[index].coord[0], 
               y: tree.svgVertices[index].coord[1]+tree.vertexRad+tree.findStrokeWidth()+2
           });
           segment.attr({dy: 2*determineDy(segment.attr("text"),"Times New Roman",labelFontSize), "text-anchor": "middle"});
           return ;
        }
        segment.attr({
            x: tree.svgVertices[index].coord[0], 
            y: tree.svgVertices[index].coord[1]-tree.vertexRad-2,
        });
        segment.attr({"text-anchor": "middle"});
        let mid=Math.floor((l+r)/2);
        if (isDynamic===false) {
            addSegmentsLabels(2*index+1,l,mid,tree,flagIndex,isDynamic);
            addSegmentsLabels(2*index+2,mid+1,r,tree,flagIndex,isDynamic);
        }
        else {
            if (tree.vertices[index].hasOwnProperty("lind")===true) {
                addSegmentsLabels(tree.vertices[index].lind,l,mid,tree,flagIndex,isDynamic);
            }
            if (tree.vertices[index].hasOwnProperty("rind")===true) {
                addSegmentsLabels(tree.vertices[index].rind,mid+1,r,tree,flagIndex,isDynamic);
            }
        }
    }
    function makeEdgesAndNames (index, l, r, edges, vertices, elements, isDynamic) {
        if (l===r) {
           if (isDynamic===false) vertices[index].name=elements[l].toString();
           return ;
        }
        let mid=Math.floor((l+r)/2);
        if (isDynamic===false) {
            edges.push([index,2*index+1]); makeEdgesAndNames(2*index+1,l,mid,edges,vertices,elements,isDynamic);
            edges.push([index,2*index+2]); makeEdgesAndNames(2*index+2,mid+1,r,edges,vertices,elements,isDynamic);
            vertices[index].name=(parseInt(vertices[2*index+1].name)+parseInt(vertices[2*index+2].name)).toString();
        }
        else {
            if (vertices[index].hasOwnProperty("lind")===true) {
                edges.push([index,vertices[index].lind]);
                makeEdgesAndNames(vertices[index].lind,l,mid,edges,vertices,elements,isDynamic);
            }
            if (vertices[index].hasOwnProperty("rind")===true) {
                edges.push([index,vertices[index].rind]);
                makeEdgesAndNames(vertices[index].rind,mid+1,r,edges,vertices,elements,isDynamic);
            }
        }
    }
    function makeSegTree (exampleName, tree, elements, animationObj) {
        if (animationObj!==undefined) {
            animationObj.clear();
            if (exampleName===".segTreeExample2") $(".treeExample .end").hide();
        }
        tree.erase();
        
        elements.splice(0,elements.length);
        let [nums,error]=findNumbersFromText($(exampleName+" .array").val());
        if (error!=="") {
            alert("Невалиден масив - "+error+"!");
            return ;
        }
        if (nums.length>16) {
            alert("Позволяват се най-много до 16 числа! Въвели сте "+nums.length+" на брой числа.");
            return ;
        }
        for (let num of nums) {
            if (num>99) {
                alert("Най-голямото позволено число е 99!");
                elements.splice(0,elements.length);
                return ;
            }
            elements.push(num);
        }

        tree.initVertices(4*elements.length);
        let edgeList=[];
        makeEdgesAndNames(0,0,elements.length-1,edgeList,tree.vertices,elements,false);
        tree.buildEdgeDataStructures(edgeList);
        if (elements.length<=8) tree.drawNewGraph(1,1,299,149,10,false);
        else tree.drawNewGraph(1,1,299,149,7,false);

        if ($(exampleName+" .indexes").text()=="Скрий номерата") addSegmentsLabels(0,1,elements.length,tree,true,false);
        else addSegmentsLabels(0,1,elements.length,tree,false,false);
    }
    function makeDynSegTree (exampleName, tree) {
        tree.erase();

        tree.initVertices(1);
        tree.vertices[0].name="0";
        tree.buildEdgeDataStructures([]);
        tree.drawNewGraph(dynSegTree.frameX,1,300-dynSegTree.frameX,199,8,false);

        if ($(exampleName+" .indexes").text()=="Скрий номерата") addSegmentsLabels(0,1,dynSegTree.maxC,tree,true,true);
        else addSegmentsLabels(0,1,dynSegTree.maxC,tree,false,true);
    }
    function updateDyn (index, l, r, c, tree) {
        tree.vertices[index].name=(parseInt(tree.vertices[index].name)+1).toString();
        if (l===r) return ;
        let mid=Math.floor((l+r)/2);
        if (c<=mid) {
            if (tree.vertices[index].hasOwnProperty("lind")===false) {
                tree.vertices[index].lind=tree.n;
                tree.addVertex("0");
            }
            updateDyn(tree.vertices[index].lind,l,mid,c,tree);
        }
        else {
            if (tree.vertices[index].hasOwnProperty("rind")===false) {
                tree.vertices[index].rind=tree.n;
                tree.addVertex("0");
            }
            updateDyn(tree.vertices[index].rind,mid+1,r,c,tree);
        }
    }
    function addPoint (exampleName, tree) {
        let maxC=dynSegTree.maxC;
        let c=$(exampleName+" .c").val();
        if ((c<1)||(c>maxC)) {
            alert("Невалидна координата");
            return ;
        }
        updateDyn(0,1,maxC,c,tree);
        let edgeList=[];
        makeEdgesAndNames(0,1,dynSegTree.maxC,edgeList,tree.vertices,[],true);
        tree.buildEdgeDataStructures(edgeList);
        tree.drawNewGraph(dynSegTree.frameX,1,300-dynSegTree.frameX,199,8,false);

        if ($(exampleName+" .indexes").text()=="Скрий номерата") addSegmentsLabels(0,1,maxC,tree,true,true);
        else addSegmentsLabels(0,1,maxC,tree,false,true);
    }
    function defaultExample (exampleName, tree, elements, animationObj) {
        if (exampleName==".segTreeExample1") {
            $(exampleName+" .array").val("7,9,1,2,4,8,5,16");
            makeSegTree(exampleName,tree,elements);
        }
        else if ((exampleName==".segTreeExample2")||(exampleName==".segTreeExample3")) {
            $(exampleName+" .array").val("7,9,1,2,4,8,5,16");
            if (exampleName==".segTreeExample2") {
                $(exampleName+" .pos").val("3");
                $(exampleName+" .val").val("10");
            }
            else {
                $(exampleName+" .ql").val("2");
                $(exampleName+" .qr").val("7");
            }

            let pos,val;
            let ql,qr;
            makeSegTree(exampleName,tree,elements,animationObj);

            animationObj.init(exampleName+" .treeExample",function findAnimations () {
                let animations=[];
                if (exampleName===".segTreeExample2") {
                    pos=parseInt($(exampleName+" .pos").val());
                    val=parseInt($(exampleName+" .val").val());
                    if ((Number.isNaN(pos))||(Number.isNaN(val))||(pos<1)||(pos>elements.length)) {
                        alert("Невалидна позиция");
                        return animations;
                    }
                    animations.push({
                        startFunction: tree.drawVertexText.bind(tree,0,tree.vertices[0].name),
                        animFunctions: [tree.vertexAnimation(0,"red","circle")],
                        animText: "Започваме обхождането от корена на върховете за промяна."
                    });
                    update(0,1,elements.length,pos,val,tree,animations);
                }
                else {
                    ql=parseInt($(exampleName+" .ql").val());
                    qr=parseInt($(exampleName+" .qr").val());
                    if ((Number.isNaN(ql))||(Number.isNaN(qr))||(ql<1)||(qr<ql)||(qr>elements.length)) {
                        alert("Невалидни позиции");
                        return animations;
                    }
                    animations.push({
                        animFunctions: [tree.vertexAnimation(0,"red","circle")],
                        animText: "Започваме обхождането от корена на върховете за включване в сумата."
                    });
                    sumQuery(0,1,elements.length,ql,qr,tree,animations);
                }
                return animations;
            },function initialState () {
                makeEdgesAndNames(0,0,elements.length-1,[],tree.vertices,elements,false);
                tree.draw(false);
                addSegmentsLabels(0,1,elements.length,tree,false,false);
            });
            let endButton=$(".treeExample .end");
            endButton.hide();
            animationObj.startButton.on("click.bonus", function () {
                if (animationObj.startButton.html()==="Стоп") { // first click handler is in animationObj
                    if (exampleName==".segTreeExample2") {
                        endButton.show();
                        endButton.on("click",endAnimation.bind(endButton,tree,animationObj,elements,pos,val));
                    }
                }
                else {
                    if (exampleName==".segTreeExample2") {
                        endButton.hide();
                    }
                }
            });
        }
        else if (exampleName==".segTreeExample4") {
            $(exampleName+" .c").val("42");
            makeDynSegTree(exampleName,tree);
        }
    }
    function initExample (part) {
        if (part==2) {
            let tree=new Graph();
            let exampleName=".segTreeExample1";
            tree.init(exampleName+" .treeExample",8,false,true);
            let elements=[];
            $(exampleName+" .default").off("click").on("click",defaultExample.bind(this,exampleName,tree,elements));
            $(exampleName+" .make").off("click").on("click",makeSegTree.bind(this,exampleName,tree,elements,undefined));
            $(exampleName+" .indexes").off("click").on("click",toggleIndexes.bind($(exampleName+" .indexes"),tree,elements,false));

            $(exampleName+" .array").on("keydown",isDigitOrComma);

            defaultExample(exampleName,tree,elements);
        }
        else if (part==3) {
            let tree1=new Graph();
            let exampleName1=".segTreeExample2";
            tree1.init(exampleName1+" .treeExample",8,false,true);
            let animationObj1=new Animation();
            let elements1=[];
            $(exampleName1+" .default").off("click").on("click",defaultExample.bind(this,exampleName1,tree1,elements1,animationObj1));
            $(exampleName1+" .make").off("click").on("click",makeSegTree.bind(this,exampleName1,tree1,elements1,animationObj1));

            $(exampleName1+" .array").on("keydown",isDigitOrComma);
            $(exampleName1+" .pos").on("keydown",isDigit);
            $(exampleName1+" .val").on("keydown",isDigit);

            defaultExample(exampleName1,tree1,elements1,animationObj1);


            let tree2=new Graph();
            let exampleName2=".segTreeExample3";
            tree2.init(exampleName2+" .treeExample",8,false,true);
            let animationObj2=new Animation();
            let elements2=[];
            $(exampleName2+" .default").off("click").on("click",defaultExample.bind(this,exampleName2,tree2,elements2,animationObj2));
            $(exampleName2+" .make").off("click").on("click",makeSegTree.bind(this,exampleName2,tree2,elements2,animationObj2));

            $(exampleName2+" .array").on("keydown",isDigitOrComma);
            $(exampleName2+" .ql").on("keydown",isDigit);
            $(exampleName2+" .qr").on("keydown",isDigit);

            defaultExample(exampleName2,tree2,elements2,animationObj2);
        }
        else if (part==4) {
            let tree=new Graph();
            let exampleName=".segTreeExample4";
            tree.init(exampleName+" .treeExample",1,false,true);
            let elements=[];
            $(exampleName+" .default").off("click").on("click",defaultExample.bind(this,exampleName,tree,elements));
            $(exampleName+" .add").off("click").on("click",addPoint.bind(this,exampleName,tree));
            $(exampleName+" .indexes").off("click").on("click",toggleIndexes.bind($(exampleName+" .indexes"),tree,elements,true));

            $(exampleName+" .c").on("keydown",isDigit);

            defaultExample(exampleName,tree,elements);
        }
    }

    
    function update (index, l, r, pos, val, tree, animations) {
        if (l===r) {
            animations.push({
                startFunction: tree.drawVertexText.bind(tree,index,val.toString()),
                animFunctions: [tree.vertexAnimation(index,"black","circle"),
                                tree.vertexAnimation(index,"white","text")],
                animText: "Променяме стойността на листото на "+val+", след което го напускаме."
            });
            return val;
        }
        let mid=Math.floor((l+r)/2);
        let suml,sumr;
        if (pos<=mid) {
            animations.push({
                animFunctions: [tree.vertexAnimation(index,"grey","circle",2),
                                tree.vertexAnimation(index,"white","text",2),
                                tree.edgeAnimation(index,2*index+1,2)],
                animText: "Понеже "+pos+" е <= от средата на интервала ["+l+"; "+r+"], то отиваме в лявото дете."
            });
            animations.push({
                animFunctions: [tree.vertexAnimation(2*index+1,"red","circle"),
                                tree.vertexAnimation(2*index+1,"black","text")],
                animText: "Стигнахме до върха, който отговаря за интервала ["+l+"; "+mid+"]."
            });
            suml=update(2*index+1,l,mid,pos,val,tree,animations);
            sumr=parseInt(tree.vertices[2*index+2].name);
        }
        else {
            animations.push({
                animFunctions: [tree.vertexAnimation(index,"grey","circle",2),
                                tree.vertexAnimation(index,"white","text",2),
                                tree.edgeAnimation(index,2*index+2,2)],
                animText: "Понеже "+pos+" е > от средата на интервала ["+l+"; "+r+"], то отиваме в дясното дете."
            });
            animations.push({
                animFunctions: [tree.vertexAnimation(2*index+2,"red","circle"),
                                tree.vertexAnimation(2*index+2,"black","text")],
                animText: "Стигнахме до върха, който отговаря за интервала ["+(mid+1)+"; "+r+"]."
            });
            suml=parseInt(tree.vertices[2*index+1].name);
            sumr=update(2*index+2,mid+1,r,pos,val,tree,animations);
        }

        animations.push({
            animFunctions: [tree.vertexAnimation(index,"red","circle"),
                            tree.vertexAnimation(index,"black","text")],
            animText: "Връщаме се на върха, който отговаря за интервала ["+l+"; "+r+"]."
        });
        animations.push({
            startFunction: tree.drawVertexText.bind(tree,index,(suml+sumr).toString()),
            animFunctions: [tree.vertexAnimation(index,"black","circle",1.5),
                            tree.vertexAnimation(index,"white","text",1.5)],
            animText: "Променяме стойността на сбора от двете деца "+suml+"+"+sumr+"="+(suml+sumr)+" и напускаме върха."
        });
        return suml+sumr;
    }

    function addSumText (tree, index, isLeaf, sum) {
        let text=tree.s.text(0,0,sum),fontSize=tree.vertexRad*5/6;
        text.attr({"font-size": fontSize, "font-family": "Arial", "text-align": "center", class: "unselectable", fill: "orange"});
        if (isLeaf===true) {
            text.attr({
                x: tree.svgVertices[index].coord[0], 
                y: tree.svgVertices[index].coord[1]-tree.vertexRad-2
            });
            text.attr({"text-anchor": "middle"});
            return ;
        }
        text.attr({
            x: tree.svgVertices[index].coord[0]+tree.vertexRad+text.getBBox().w/2, 
            y: tree.svgVertices[index].coord[1]
        });
        text.attr({dy: determineDy(text.attr("text"),"Arial",fontSize), "text-anchor": "middle"});
    }
    function sumQuery (index, l, r, ql, qr, tree, animations) {
        if ((ql<=l)&&(r<=qr)) {
            let isLeaf=false;
            if (l===r) isLeaf=true;
            animations.push({
                startFunction: addSumText.bind(this,tree,index,isLeaf,tree.vertices[index].name),
                animFunctions: [tree.vertexAnimation(index,"orange","circle",2),
                                tree.vertexAnimation(index,"black","text",2)],
                animText: "Интервалът на текущия връх се съдържа в нашата заявка. Отчитаме стойността, записана в него, и го напускаме."
            });
            return parseInt(tree.vertices[index].name);
        }
        let mid=Math.floor((l+r)/2);
        let suml=0,sumr=0;
        if (ql<=mid) {
            animations.push({
                animFunctions: [tree.vertexAnimation(index,"grey","circle",2),
                                tree.vertexAnimation(index,"white","text",2),
                                tree.edgeAnimation(index,2*index+1,2.5)],
                animText: "Понеже ql<=mid ("+ql+"<="+mid+"), то трябва да отидем в лявото дете."
            });
            animations.push({
                animFunctions: [tree.vertexAnimation(2*index+1,"red","circle",1),
                                tree.vertexAnimation(2*index+1,"black","text",1)],
                animText: "Стигнахме до върха, който отговаря за интервала ["+l+"; "+mid+"]."
            });
            suml=sumQuery(2*index+1,l,mid,ql,qr,tree,animations);
            animations.push({
                animFunctions: [tree.vertexAnimation(index,"red","circle",1),
                                tree.vertexAnimation(index,"black","text",1)],
                animText: "Връщаме се на върха, който отговаря за интервала ["+l+"; "+r+"]."
            });
        }
        if (qr>mid) {
            animations.push({
                animFunctions: [tree.vertexAnimation(index,"grey","circle",2),
                                tree.vertexAnimation(index,"white","text",2),
                                tree.edgeAnimation(index,2*index+2,2.5)],
                animText: "Понеже qr>mid ("+qr+">"+mid+"), то отиваме "+((ql<=mid)?"и ":"")+"в дясното дете."
            });
            animations.push({
                animFunctions: [tree.vertexAnimation(2*index+2,"red","circle",1),
                                tree.vertexAnimation(2*index+2,"black","text",1)],
                animText: "Стигнахме до върха, който отговаря за интервала ["+(mid+1)+"; "+r+"]."
            });
            sumr=sumQuery(2*index+2,mid+1,r,ql,qr,tree,animations);
            animations.push({
                animFunctions: [tree.vertexAnimation(index,"red","circle",1),
                                tree.vertexAnimation(index,"black","text",1)],
                animText: "Връщаме се на върха, който отговаря за интервала ["+l+"; "+r+"]"
            });
        }

        let animation={
            startFunction: addSumText.bind(this,tree,index,false,suml+sumr),
            animFunctions: [tree.vertexAnimation(index,"black","circle",2),
                            tree.vertexAnimation(index,"white","text",2)],
            animText: "Сумата на елементите от заявката, които се съдържат в текущия интервал е "+suml+"+"+sumr+"="+(suml+sumr)+". След това напускаме върха."
        };
        animations.push(animation);
        return suml+sumr;
    }
    
    
    window.initExample = initExample;
    window.defaultExample = defaultExample;
})();