function toggleText (name) {
         if (cur===null) return 0;
         var cur=document.getElementById(name);
         if (cur.style.display==="block") cur.style.display="none";
         else cur.style.display="block";
}
function changeLanguage (object, language) {
    var s=document.URL;
    if (s.includes(".html")===false) {
        if (language=="en") s+="index_en.html";
        else return ;
        }
    if (language=="bg") s=s.replace("_en.html",".html");
    else if (s.includes("_en")===false) s=s.replace(".html","_en.html");
    object.setAttribute("href",s);
}
function triggerInfo (number) {
    if ($("#trigger"+number).is(":hidden")===false) {
        $("#trigger"+number).hide();
        $("#info"+number).show();
        }
    else {
        $("#trigger"+number).show();
        $("#info"+number).hide();
        }
}

function isDigit (event) {
    var charCode=(event.which)?event.which:event.keyCode;
    if ((charCode<=31)||((charCode>=48)&&(charCode<=57))) return true;
    return false;
}
function isDigitOrComma (event) {
    if (isDigit(event)==true) return true;
    var charCode=(event.which)?event.which:event.keyCode;
    if ((charCode<=31)||(charCode==44)) return true;
    return false;
}
function isSmallLatinLetter (event) {
    var charCode=(event.which)?event.which:event.keyCode;
    if ((charCode>=97)&&(charCode<=122)) return true;
    return false;
}

function initExamples () {
    var URL=document.URL,index=-1;
    for (var i=0; i<URL.length; i++) {
        if (URL[i]=='/') index=i;
        }
    var page=URL.slice(index+1,URL.length);
    if (page=="introduction_to_graphs.html") {
        var example1 = new Graph ();
        example1.n=5; example1.isOriented=true;
        example1.init(".graphExample1");
        example1.edgeList=[[0,1],[0,2],[0,3],[1,4],[2,4]];
        example1.adjList=[[1,2,3],[4],[4],[],[]];
        example1.adjMatrix=[[0,1,1,1,0],
                            [0,0,0,0,1],
                            [0,0,0,0,1],
                            [0,0,0,0,0],
                            [0,0,0,0,0]];
        drawGraph(example1,1,1,299,299);

        var example2 = new Graph ();
        example2.n=5; example2.isOriented=false;
        example2.init(".graphExample2");
        example2.edgeList=[[0,1],[0,2],[0,3],[1,4],[2,4]];
        example2.adjList=[[1,2,3],[0,4],[0,4],[0],[1,2]];
        example2.adjMatrix=[[0,1,1,1,0],
                            [1,0,0,0,1],
                            [1,0,0,0,1],
                            [1,0,0,0,0],
                            [0,1,1,0,0]];
        drawGraph(example2,1,1,299,299);
        }
    else if (page=="depth_first_search.html") {
        var example1 = new graphExample (".graphExample1",false);
        var example2 = new graphExample (".graphExample2",true);
        }
    else if (page=="hashing.html") {
        document.querySelector(".hashExample1 .base").value="307";
        document.querySelector(".hashExample1 .modulo").value="1009";
        document.getElementById("string").value="abcab";
        calculateHashString();
        
        document.querySelector(".hashExample2 .base").value="7";
        document.querySelector(".hashExample2 .modulo").value="1009";
        document.getElementById("multiSet").value="1,2,3";
        calculateHashMultiSet();
        }
}