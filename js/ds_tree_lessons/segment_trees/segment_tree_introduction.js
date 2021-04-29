var trees=[];
function initExample (part) {
    trees[part] = new Graph();
    trees[part].init(".segTreeExample"+part+" .treeExample .graph",8,false,true,true);
}

function makeEdges (index, l, r, edges, vertices, elements) {
    if (l==r) {
       vertices[index].name=elements[l].toString();
       return ;
       }
    var mid=Math.floor((l+r)/2);
    edges.push([index,2*index+1]); makeEdges(2*index+1,l,mid,edges,vertices,elements);
    edges.push([index,2*index+2]); makeEdges(2*index+2,mid+1,r,edges,vertices,elements);
    vertices[index].name=(parseInt(vertices[2*index+1].name)+parseInt(vertices[2*index+2].name)).toString();
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
function findElements (s) {
    let elements=[],num=0,digs=0;
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
    for (i=0; i<elements.length; i++) {
        if (elements[i]>99) {
            alert("Най-голямото позволено число е 99!");
            return [];
        }
    }
    return elements;
}
let elements=[];
function makeSegTree (part) {
    tree=trees[part];
    tree.erase();
    var s=document.querySelector(".segTreeExample"+part+" .array").value;
    elements=findElements(document.querySelector(".segTreeExample"+part+" .array").value);
    if (elements.length===0) return ;
    
    tree.edgeList=[]; tree.initVertices(4*elements.length);
    makeEdges(0,0,elements.length-1,tree.edgeList,tree.vertices,elements);
    tree.fillAdjListMatrix();
    if (elements.length<=8) tree.drawNewGraph(1,1,299,149,10,false);
    else tree.drawNewGraph(1,1,299,149,7,false);
    
    if ($("#index-btn").text()=="Покажи номерата") addSegmentsLabels(0,1,elements.length,tree,false);
    else addSegmentsLabels(0,1,elements.length,tree,true);
}
function defaultExample (part) {
    if (part==2) {
        document.querySelector(".segTreeExample2 .array").value="9,5,3,2,1,7,8,6";
    }
    else {
        document.querySelector(".segTreeExample3 .array").value="9,5,3,2,1,7,8,6";
        document.querySelector(".segTreeExample3 .pos").value="3";
        document.querySelector(".segTreeExample3 .val").value="10";
        let animationObj = new Animation();
        animationObj.init(".treeExample",function () {
            let animations=[];
            animations.push({
                startFunction: tree.drawVertexText.bind(trees[part],0,trees[part].vertices[0].name),
                animFunctions: [vertexAnimation(trees[part],0,"red","circle")],
                animText: "Започваме обхождането от корена на върховете с промяна."
            });
            pos=parseInt($(".segTreeExample3 .pos").val());
            val=parseInt($(".segTreeExample3 .val").val());
            query(0,1,elements.length,pos,val,trees[part],animations);
            return animations;
        },function (flag) {
            trees[part].s.selectAll("*").remove();
            makeEdges(0,0,elements.length-1,[],tree.vertices,elements);
            trees[part].draw(false);
            addSegmentsLabels(0,1,elements.length,tree,false);
        });
    }
    makeSegTree(part);
}

function indexes () {
    if (elements===[]) return ;
    trees[1].draw(false);
    if ($("#index-btn").text()=="Покажи номерата") {
        $("#index-btn").text("Скрий номерата");
        addSegmentsLabels(0,1,elements.length,trees[1],true);
    }
    else {
        $("#index-btn").text("Покажи номерата");
        addSegmentsLabels(0,1,elements.length,trees[1],false);
    }
}

function vertexAnimation (graph, vr, colour, type) {
    return function(callback, speed) {
        let obj;
        if (type==="circle") obj=graph.svgVertices[vr].circle;
        else obj=graph.svgVertices[vr].text;
        if (speed>0) {
            obj.animate({fill: colour},speed,callback);
            return obj.inAnim()[0].mina;
        }
        obj.attr({fill: colour});
    }
}
function edgeAnimation (graph, vr1, vr2) {
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
            lineDraw.animate({x1: stx, y1:sty, x2: endx, y2: endy},speed,function () {
                callback();
                lineDraw.remove();
            });
            return lineDraw.inAnim()[0].mina;
        }
    }
}
function query (index, l, r, pos, val, tree, animations) {
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
            animFunctions: [vertexAnimation(tree,index,"grey","circle"),
                            vertexAnimation(tree,index,"white","text"),
                            edgeAnimation(tree,index,2*index+1)],
            animText: text
        });
        text="Стигнахме до върха, който отговаря за интервала ["+l+"; "+mid+"].";
        animations.push({
            animFunctions: [vertexAnimation(tree,2*index+1,"red","circle"),
                            vertexAnimation(tree,2*index+1,"black","text")],
            animText: text
        });
        suml=query(2*index+1,l,mid,pos,val,tree,animations);
        sumr=parseInt(tree.vertices[2*index+2].name);
    }
    else {
        text="Понеже "+pos+" е > от средата на интервала ["+l+"; "+r+"], то отиваме на дясното дете.";
        animations.push({
            animFunctions: [vertexAnimation(tree,index,"grey","circle"),
                            vertexAnimation(tree,index,"white","text"),
                            edgeAnimation(tree,index,2*index+2)],
            animText: text
        });
        text="Стигнахме до върха, който отговаря за интервала ["+(mid+1)+"; "+r+"].";
        animations.push({
            animFunctions: [vertexAnimation(tree,2*index+2,"red","circle"),
                            vertexAnimation(tree,2*index+2,"black","text")],
            animText: text
        });
        suml=parseInt(tree.vertices[2*index+1].name);
        sumr=query(2*index+2,mid+1,r,pos,val,tree,animations);
    }
    
    text="Връщаме се на върха, който отговаря за интервала ["+l+"; "+r+"].";
    animations.push({
        animFunctions: [vertexAnimation(tree,index,"red","circle"),
                        vertexAnimation(tree,index,"black","text")],
        animText: text
    });
    text="Променяме стойността на "+(suml+sumr)+" и напускаме върха.";
    animations.push({
        startFunction: tree.drawVertexText.bind(tree,index,(suml+sumr).toString()),
        animFunctions: [vertexAnimation(tree,index,"black","circle"),
                        vertexAnimation(tree,index,"white","text")],
        animText: text
    });
    return suml+sumr;
}