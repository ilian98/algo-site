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
        tree.svgVertices[index].text=tree.s.group(tree.svgVertices[index].text,textIndex);
        textIndex.attr({"font-size": tree.vertexRad*4/6, "font-family": "Times New Roman", "font-weight": "bold", "text-align": "center", class: "unselectable", fill: "blue"});
        textIndex.attr({
            x: tree.svgVertices[index].coord[0]+tree.vertexRad, 
            y: tree.svgVertices[index].coord[1]+textIndex.getBBox().h/2
        });
        textIndex.attr({dy: "0.34em", "text-anchor": "middle"});
    }
    
    let segment=tree.s.text(0,0,"["+l+";"+r+"]");
    tree.svgVertices[index].text=tree.s.group(tree.svgVertices[index].text,segment);
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
function defaultExample () {
    document.querySelector(".segTreeExample1 .array").value="9,5,3,2,1,7,8,6";
    makeSegTree(1);
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