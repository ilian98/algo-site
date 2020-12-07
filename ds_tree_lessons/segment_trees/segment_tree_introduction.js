var trees=[];
function initExample (part) {
    trees[part] = new Graph();
    trees[part].init(".segTreeExample"+part+" .treeExample .graph",8,false,true,true);
}

function makeEdges (index, l, r, edges, verNames, elements) {
    if (l==r) {
       verNames[index]=elements[l].toString();
       return ;
       }
    var mid=Math.floor((l+r)/2);
    edges.push([index,2*index+1]); makeEdges(2*index+1,l,mid,edges,verNames,elements);
    edges.push([index,2*index+2]); makeEdges(2*index+2,mid+1,r,edges,verNames,elements);
    verNames[index]=(parseInt(verNames[2*index+1])+parseInt(verNames[2*index+2])).toString();
}
function addSegmentsLabels (index, l, r, tree) {
    var text=tree.s.text(0,0,"["+l+";"+r+"]");
    tree.circles[index]=tree.s.group(tree.circles[index],text);
    text.attr({"font-size": tree.vertexRad*5/6, "text-align": "center", class: "unselectable", fill: "#B22222"});
    if (l==r) {
       text.attr({x: tree.verCoord[index][0]+tree.vertexRad, y: tree.verCoord[index][1]+2*tree.vertexRad+text.getBBox().h/2});
       text.attr({dy: "0.34em", "text-anchor": "middle"});
       return ;
       }
    text.attr({x: tree.verCoord[index][0]+tree.vertexRad, y: tree.verCoord[index][1]-text.getBBox().h/2});
    text.attr({dy: "0.34em", "text-anchor": "middle"});
    var mid=Math.floor((l+r)/2);
    addSegmentsLabels(2*index+1,l,mid,tree);
    addSegmentsLabels(2*index+2,mid+1,r,tree);
}
function makeSegTree (part) {
    tree=trees[part];
    eraseGraph(tree);
    var s=document.querySelector(".segTreeExample"+part+" .array").value;
    var elements=[],num=0,digs=0,i;
    for (i=0; i<s.length; i++) {
        if (s[i]==',') {
            if (digs==0) {
                alert("Невалиден масив!");
                return ;
                }
            elements.push(num);
            num=0; digs=0;
            }
        else {
            if ((s[i]<'0')||(s[i]>'9')) {
               alert("Невалиден масив!");
               return ;
               }
            num*=10; num+=s[i]-'0';
            digs++;
            }
        }
    if (digs==0) {
       alert("Невалиден масив!");
       return ;
       }
    elements.push(num);
    if (elements.length>16) {
        alert("Позволяват се най-много до 16 числа! Въвели сте "+elements.length+" на брой числа.");
        return ;
        }
    for (i=0; i<elements.length; i++) {
        if (elements[i]>99) {
            alert("Най-голямото позволено число е 99!");
            return ;
            }
        }
    tree.edgeList=[]; tree.verNames=[];
    makeEdges(0,0,elements.length-1,tree.edgeList,tree.verNames,elements);
    tree.fillAdjListMatrix();
    if (elements.length<=8) drawGraph(tree,1,1,299,149,10);
    else drawGraph(tree,1,1,299,149,7);
    draw(tree,false);
    
    addSegmentsLabels(0,1,elements.length,tree);
}
function defaultExample () {
    document.querySelector(".segTreeExample1 .array").value="9,5,3,2,1,7,8,6";
    makeSegTree(1);
}