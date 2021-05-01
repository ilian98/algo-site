"use strict";
function endAnimation (tree, animationObj, elements, pos, val) {
    this.hide();
    
    animationObj.clear();
    elements[pos-1]=val;
    tree.s.selectAll("*").remove();
    makeEdges(0,0,elements.length-1,[],tree.vertices,elements);
    tree.draw(false);
    addSegmentsLabels(0,1,elements.length,tree,false);
}
function toggleIndexes (tree, elements) {
    if (elements===[]) return ;
    tree.draw(false);
    if (this.text()=="Покажи номерата") {
        this.text("Скрий номерата");
        addSegmentsLabels(0,1,elements.length,tree,true);
    }
    else {
        this.text("Покажи номерата");
        addSegmentsLabels(0,1,elements.length,tree,false);
    }
}
function addSegmentsLabels (index, l, r, tree, flagIndex) {
    if (flagIndex===true) {
        let textIndex=tree.s.text(0,0,index+1);
        textIndex.attr({"font-size": tree.vertexRad*4/6, "font-family": "Times New Roman", "font-weight": "bold", "text-align": "center", class: "unselectable", fill: "blue"});
        textIndex.attr({
            x: tree.svgVertices[index].coord[0]+tree.vertexRad, 
            y: tree.svgVertices[index].coord[1]+textIndex.getBBox().h/2
        });
        textIndex.attr({dy: "0.34em", "text-anchor": "middle"});
    }
    
    let segment=tree.s.text(0,0,"["+l+";"+r+"]");
    segment.attr({"font-size": tree.vertexRad*5/6, "font-family": "Times New Roman", "text-align": "center", class: "unselectable", fill: "#B22222"});
    if (l==r) {
       segment.attr({
           x: tree.svgVertices[index].coord[0]+tree.vertexRad, 
           y: tree.svgVertices[index].coord[1]+2*tree.vertexRad+segment.getBBox().h/2
       });
       segment.attr({dy: "0.34em", "text-anchor": "middle"});
       return ;
    }
    segment.attr({
        x: tree.svgVertices[index].coord[0]+tree.vertexRad, 
        y: tree.svgVertices[index].coord[1]-segment.getBBox().h/2
    });
    segment.attr({dy: "0.34em", "text-anchor": "middle"});
    let mid=Math.floor((l+r)/2);
    addSegmentsLabels(2*index+1,l,mid,tree,flagIndex);
    addSegmentsLabels(2*index+2,mid+1,r,tree,flagIndex);
}
function makeEdges (index, l, r, edges, vertices, elements) {
    if (l==r) {
       vertices[index].name=elements[l].toString();
       return ;
       }
    let mid=Math.floor((l+r)/2);
    edges.push([index,2*index+1]); makeEdges(2*index+1,l,mid,edges,vertices,elements);
    edges.push([index,2*index+2]); makeEdges(2*index+2,mid+1,r,edges,vertices,elements);
    vertices[index].name=(parseInt(vertices[2*index+1].name)+parseInt(vertices[2*index+2].name)).toString();
}
function findElements (s, elements) {
    elements.splice(0,elements.length);
    let num=0,digs=0;
    for (let i=0; i<s.length; i++) {
        if (s[i]==',') {
            if (digs==0) {
                alert("Невалиден масив!");
                return [];
            }
            elements.push(num);
            num=0; digs=0;
        }
        else {
            if ((s[i]<'0')||(s[i]>'9')) {
               alert("Невалиден масив!");
               return [];
            }
            num*=10; num+=s[i]-'0';
            digs++;
        }
    }
    if (digs==0) {
       alert("Невалиден масив!");
       return [];
    }
    elements.push(num);
    if (elements.length>16) {
        alert("Позволяват се най-много до 16 числа! Въвели сте "+elements.length+" на брой числа.");
        return [];
    }
    for (let i=0; i<elements.length; i++) {
        if (elements[i]>99) {
            alert("Най-голямото позволено число е 99!");
            return [];
        }
    }
    return elements;
}
function makeSegTree (exampleName, tree, elements, animationObj) {
    if (animationObj!==undefined) animationObj.clear();
    tree.erase();
    findElements($(exampleName+" .array").val(),elements);
    if (elements.length===0) {
        elements=[];
        return ;
    }
    
    tree.edgeList=[]; tree.initVertices(4*elements.length);
    makeEdges(0,0,elements.length-1,tree.edgeList,tree.vertices,elements);
    tree.fillAdjListMatrix();
    if (elements.length<=8) tree.drawNewGraph(1,1,299,149,10,false);
    else tree.drawNewGraph(1,1,299,149,7,false);
    
    if ($(exampleName+" .indexes").text()=="Скрий номерата") addSegmentsLabels(0,1,elements.length,tree,true);
    else addSegmentsLabels(0,1,elements.length,tree,false);
}
function defaultExample (exampleName, tree, elements, animationObj) {
    $(exampleName+" .array").val("7,9,1,2,4,8,5,16");
    if (exampleName==".segTreeExample1") {
        makeSegTree(exampleName,tree,elements);
    }
    else if ((exampleName==".segTreeExample2")||(exampleName==".segTreeExample3")) {
        let extraInfo;
        if (exampleName==".segTreeExample2") {
            $(exampleName+" .pos").val("3");
            $(exampleName+" .val").val("10");
        }
        else {
            $(exampleName+" .ql").val("2");
            $(exampleName+" .qr").val("7");
            extraInfo=$(exampleName+" .extra-info");
            extraInfo.text("");
        }
        
        let pos,val;
        let ql,qr;
        makeSegTree(exampleName,tree,elements,animationObj);
        
        animationObj.init(exampleName+" .treeExample",function () {
            let animations=[];
            if (exampleName==".segTreeExample2") {
                pos=parseInt($(exampleName+" .pos").val());
                val=parseInt($(exampleName+" .val").val());
                if ((Number.isNaN(pos))||(Number.isNaN(val))||(pos<1)||(pos>elements.length)) {
                    alert("Невалидна позиция");
                    return animations;
                }
                animations.push({
                    startFunction: tree.drawVertexText.bind(tree,0,tree.vertices[0].name),
                    animFunctions: [vertexAnimation(tree,0,"red","circle")],
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
                    startFunction: addExtraInfo.bind(extraInfo,ql,qr),
                    animFunctions: [vertexAnimation(tree,0,"red","circle")],
                    animText: "Започваме обхождането от корена на върховете за включване в сумата."
                });
                sumQuery(0,1,elements.length,ql,qr,tree,animations,extraInfo);
            }
            return animations;
        },function (flag) {
            if (exampleName==".segTreeExample3") extraInfo.text("");
            tree.s.selectAll("*").remove();
            makeEdges(0,0,elements.length-1,[],tree.vertices,elements);
            tree.draw(false);
            addSegmentsLabels(0,1,elements.length,tree,false);
        });
        let endButton=$(".treeExample .end");
        endButton.hide();
        if (exampleName==".segTreeExample2") {
            animationObj.startButton.on("click.bonus", function () {
                if (animationObj.startButton.flag===true) {
                    endButton.show();
                    endButton.on("click",endAnimation.bind(endButton,tree,animationObj,elements,pos,val));
                }
                else endButton.hide();
            });
        }
    }
}
function initExample (part) {
    if (part==2) {
        let tree = new Graph();
        let exampleName=".segTreeExample1";
        tree.init(exampleName+" .treeExample .graph",8,false,true,true);
        let elements=[];
        $(exampleName+" .default").off("click").on("click",defaultExample.bind(this,exampleName,tree,elements));
        $(exampleName+" .make").off("click").on("click",makeSegTree.bind(this,exampleName,tree,elements,undefined));
        $(exampleName+" .indexes").text("Покажи номерата");
        $(exampleName+" .indexes").off("click").on("click",toggleIndexes.bind($(exampleName+" .indexes"),tree,elements));
        defaultExample(exampleName,tree,elements);
    }
    else if (part==3) {
        let tree1 = new Graph();
        let exampleName1=".segTreeExample2";
        tree1.init(exampleName1+" .treeExample .graph",8,false,true,true);
        let animationObj1 = new Animation();
        let elements1=[];
        $(exampleName1+" .default").off("click").on("click",defaultExample.bind(this,exampleName1,tree1,elements1,animationObj1));
        $(exampleName1+" .make").off("click").on("click",makeSegTree.bind(this,exampleName1,tree1,elements1,animationObj1));
        defaultExample(exampleName1,tree1,elements1,animationObj1);
        
        let tree2 = new Graph();
        let exampleName2=".segTreeExample3";
        tree2.init(exampleName2+" .treeExample .graph",8,false,true,true);
        let animationObj2 = new Animation();
        let elements2=[];
        $(exampleName2+" .default").off("click").on("click",defaultExample.bind(this,exampleName2,tree2,elements2,animationObj2));
        $(exampleName2+" .make").off("click").on("click",makeSegTree.bind(this,exampleName2,tree2,elements2,animationObj2));
        defaultExample(exampleName2,tree2,elements2,animationObj2);
    }
}


function vertexAnimation (graph, vr, colour, type, slowSpeed = 1) {
    return function(callback, speed) {
        let obj;
        if (type==="circle") obj=graph.svgVertices[vr].circle;
        else obj=graph.svgVertices[vr].text;
        if (speed>0) {
            obj.animate({fill: colour},speed*slowSpeed,callback);
            return obj.inAnim()[0].mina;
        }
        obj.attr({fill: colour});
    }
}
function edgeAnimation (graph, vr1, vr2, slowSpeed) {
    return function(callback, speed) {
        if (speed>0) {
            let obj1=graph.svgVertices[vr1];
            let obj2=graph.svgVertices[vr2];
            let stx=obj1.coord[0]+graph.vertexRad;
            let sty=obj1.coord[1]+graph.vertexRad;
            let endx=obj2.coord[0]+graph.vertexRad;
            let endy=obj2.coord[1]+graph.vertexRad;

            let lineDraw=graph.s.line(stx,sty,stx,sty);
            lineDraw.attr({stroke: "red", "stroke-width": graph.vertexRad/20*4});
            graph.s.append(obj1.group);
            graph.s.append(obj2.group);
            lineDraw.animate({x1: stx, y1:sty, x2: endx, y2: endy},speed*slowSpeed,function () {
                callback();
                lineDraw.remove();
            });
            return lineDraw.inAnim()[0].mina;
        }
    }
}
function update (index, l, r, pos, val, tree, animations) {
    let text;
    if (l==r) {
        text="Променяме стойността на листото на "+val+", след което го напускаме.";
        animations.push({
            startFunction: tree.drawVertexText.bind(tree,index,val.toString()),
            animFunctions: [vertexAnimation(tree,index,"black","circle"),
                            vertexAnimation(tree,index,"white","text")],
            animText: text
        });
        return val;
    }
    let mid=Math.floor((l+r)/2);
    let suml,sumr;
    if (pos<=mid) {
        text="Понеже "+pos+" е <= от средата на интервала ["+l+"; "+r+"], то отиваме на лявото дете.";
        animations.push({
            animFunctions: [vertexAnimation(tree,index,"grey","circle",2),
                            vertexAnimation(tree,index,"white","text",2),
                            edgeAnimation(tree,index,2*index+1,2)],
            animText: text
        });
        text="Стигнахме до върха, който отговаря за интервала ["+l+"; "+mid+"].";
        animations.push({
            animFunctions: [vertexAnimation(tree,2*index+1,"red","circle"),
                            vertexAnimation(tree,2*index+1,"black","text")],
            animText: text
        });
        suml=update(2*index+1,l,mid,pos,val,tree,animations);
        sumr=parseInt(tree.vertices[2*index+2].name);
    }
    else {
        text="Понеже "+pos+" е > от средата на интервала ["+l+"; "+r+"], то отиваме на дясното дете.";
        animations.push({
            animFunctions: [vertexAnimation(tree,index,"grey","circle",2),
                            vertexAnimation(tree,index,"white","text",2),
                            edgeAnimation(tree,index,2*index+2,2)],
            animText: text
        });
        text="Стигнахме до върха, който отговаря за интервала ["+(mid+1)+"; "+r+"].";
        animations.push({
            animFunctions: [vertexAnimation(tree,2*index+2,"red","circle"),
                            vertexAnimation(tree,2*index+2,"black","text")],
            animText: text
        });
        suml=parseInt(tree.vertices[2*index+1].name);
        sumr=update(2*index+2,mid+1,r,pos,val,tree,animations);
    }
    
    text="Връщаме се на върха, който отговаря за интервала ["+l+"; "+r+"].";
    animations.push({
        animFunctions: [vertexAnimation(tree,index,"red","circle"),
                        vertexAnimation(tree,index,"black","text")],
        animText: text
    });
    text="Променяме стойността на сбора от двете деца "+suml+"+"+sumr+"="+(suml+sumr)+" и напускаме върха.";
    animations.push({
        startFunction: tree.drawVertexText.bind(tree,index,(suml+sumr).toString()),
        animFunctions: [vertexAnimation(tree,index,"black","circle",1.5),
                        vertexAnimation(tree,index,"white","text",1.5)],
        animText: text
    });
    return suml+sumr;
}

function addSumText (tree, index, isLeaf, sum) {
    let text=tree.s.text(0,0,sum);
    text.attr({"font-size": tree.vertexRad*5/6, "font-family": "Arial", "text-align": "center", class: "unselectable", fill: "orange"});
    if (isLeaf===true) {
        text.attr({
            x: tree.svgVertices[index].coord[0]+tree.vertexRad, 
            y: tree.svgVertices[index].coord[1]-text.getBBox().h/2
        });
        text.attr({dy: "0.34em", "text-anchor": "middle"});
        return ;
    }
    text.attr({
        x: tree.svgVertices[index].coord[0]+2*tree.vertexRad+text.getBBox().w/2, 
        y: tree.svgVertices[index].coord[1]+tree.vertexRad
    });
    text.attr({dy: "0.34em", "text-anchor": "middle"});
}
function addExtraInfo (ql, qr) {
    this.text("Текуща заявка: ["+ql+"; "+qr+"]");
}
function sumQuery (index, l, r, ql, qr, tree, animations, extraInfo) {
    let text;
    if ((ql<=l)&&(r<=qr)) {
        text="Интервалът на текущия връх се съдържа в нашата заявка. Отчитаме стойността, записана в него, и го напускаме.";
        let isLeaf=false;
        if (l==r) isLeaf=true;
        animations.push({
            startFunction: addSumText.bind(this,tree,index,isLeaf,tree.vertices[index].name),
            animFunctions: [vertexAnimation(tree,index,"orange","circle",2),
                            vertexAnimation(tree,index,"black","text",2)],
            animText: text
        });
        return parseInt(tree.vertices[index].name);
    }
    let mid=Math.floor((l+r)/2);
    let suml=0,sumr=0;
    if (ql<=mid) {
        text="Понеже ql<=mid ("+ql+"<="+mid+"), то трябва да отидем в лявото дете.";
        animations.push({
            animFunctions: [vertexAnimation(tree,index,"grey","circle",2),
                            vertexAnimation(tree,index,"white","text",2),
                            edgeAnimation(tree,index,2*index+1,2.5)],
            endFunction: addExtraInfo.bind(extraInfo,ql,mid),
            animText: text
        });
        text="Стигнахме до върха, който отговаря за интервала ["+l+"; "+mid+"].";
        animations.push({
            animFunctions: [vertexAnimation(tree,2*index+1,"red","circle",1),
                            vertexAnimation(tree,2*index+1,"black","text",1)],
            animText: text
        });
        suml=sumQuery(2*index+1,l,mid,ql,mid,tree,animations,extraInfo);
        text="Връщаме се на върха, който отговаря за интервала ["+l+"; "+r+"].";
        animations.push({
            startFunction: addExtraInfo.bind(extraInfo,ql,qr),
            animFunctions: [vertexAnimation(tree,index,"red","circle",1),
                            vertexAnimation(tree,index,"black","text",1)],
            animText: text
        });
    }
    if (qr>mid) {
        text="Понеже qr>mid ("+qr+">"+mid+"), то отиваме ";
        if (ql<=mid) text+="и в дясното дете.";
        else text+="в дясното дете.";
        animations.push({
            animFunctions: [vertexAnimation(tree,index,"grey","circle",2),
                            vertexAnimation(tree,index,"white","text",2),
                            edgeAnimation(tree,index,2*index+2,2.5)],
            endFunction: addExtraInfo.bind(extraInfo,mid+1,qr),
            animText: text
        });
        text="Стигнахме до върха, който отговаря за интервала ["+(mid+1)+"; "+r+"].";
        animations.push({
            animFunctions: [vertexAnimation(tree,2*index+2,"red","circle",1),
                            vertexAnimation(tree,2*index+2,"black","text",1)],
            animText: text
        });
        sumr=sumQuery(2*index+2,mid+1,r,mid+1,qr,tree,animations,extraInfo);
        text="Връщаме се на върха, който отговаря за интервала ["+l+"; "+r+"]";
        animations.push({
            startFunction: addExtraInfo.bind(extraInfo,ql,qr),
            animFunctions: [vertexAnimation(tree,index,"red","circle",1),
                            vertexAnimation(tree,index,"black","text",1)],
            animText: text
        });
    }
    
    text="Сумата на елементите от заявката, които се съдържат в текущия интервал е "+suml+"+"+sumr+"="+(suml+sumr)+". След това напускаме върха.";
    let animation={
        startFunction: addSumText.bind(this,tree,index,false,suml+sumr),
        animFunctions: [vertexAnimation(tree,index,"black","circle",2),
                        vertexAnimation(tree,index,"white","text",2)],
        animText: text
    };
    if (index===0) animation.endFunction=() => { extraInfo.text(""); };
    animations.push(animation);
    return suml+sumr;
}