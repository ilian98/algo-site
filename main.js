function get_page (URL) {
    var URL=document.URL,index=-1;
    for (var i=0; i<URL.length; i++) {
        if (URL[i]=='/') index=i;
        }
    return URL.slice(index+1,URL.length);
}
(function () {
    var page=get_page(),home_page=false;
    if ((page=="")||(page=="index.html")||(page=="index_en.html")) {
        home_page=true;
    }
    else {
        window.isMobile=false;
        window.addEventListener("touchstart",function onFirstTouch() {
            window.isMobile=true;
            window.removeEventListener("touchstart",onFirstTouch,false);
        },false);
    }
        
    function set_heights () {
        var min_height=$("body").outerHeight();
        if ($(".navbar").length) min_height-=$(".navbar").outerHeight();
        if ($("nav.unselectable").length) min_height-=$("nav.unselectable").outerHeight();
        min_height-=$("footer").outerHeight();
        if (home_page===false) {
            $(".content").css("min-height",min_height);
            $(".wrapper").css("max-height",min_height+$("footer").outerHeight());
        }
        else $(".content").css("max-height",min_height);
    }
    var navigation_page="/algo-site/navigation.html";
    if (page.endsWith("_en.html")===true) navigation_page="/algo-site/navigation_en.html";
    $(document).ready(function () {
        $.get(navigation_page, function (data) {
        $("#nav-placeholder").replaceWith(data);
        
        var footer_page="/algo-site/footer.html";
        if (page.endsWith("_en.html")===true) footer_page="/algo-site/footer_en.html";
        $.get(footer_page, function (data) {
            $("#footer-placeholder").replaceWith(data);
            
            set_heights();
            $(window).resize(set_heights);
            });
        });
    });
})();
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
    if (isDigit(event)===true) return true;
    var charCode=(event.which)?event.which:event.keyCode;
    if ((charCode<=31)||(charCode==44)) return true;
    return false;
}
function isSmallLatinLetter (event) {
    var charCode=(event.which)?event.which:event.keyCode;
    if ((charCode>=97)&&(charCode<=122)) return true;
    return false;
}

function initExamples (part = 1) {
    var page=get_page();
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
        drawGraph(example1,1,1,299,299,20);

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
        drawGraph(example2,1,1,299,299,20);
        }
    else if (page=="depth_first_search.html") {
        var example1 = new graphExample (".graphExample1",false,20);
        var example2 = new graphExample (".graphExample2",true,20);
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
    else if (page=="2-SAT.html") {
        if (part==2) {
            document.querySelector(".twoSATexample1 .formula").value="(a||b)&&(a||!c)&&(!a||!b)";
            initExample(1);
            makeImplicationGraph(1);
            }
        else if (part==3) {
            document.querySelector(".twoSATexample2 .formula").value="(a||b)&&(a||!c)&&(!a||!b)";
            initExample(2);
            showSCC();
            }
        }
    else if (page=="segment_tree_introduction.html") {
        document.querySelector(".segTreeExample1 .array").value="9,5,3,2,1,7,8,6";
        initExample(1);
        makeSegTree(1);
        }
}