"use strict";
(function () {
    let page=get_page(),home_page=false;
    if ((page=="")||(page=="index.html")||(page=="index_en.html")) {
        home_page=true;
    }
    else {
        window.isMobile=false;
        $(window).one("touchstart",function () {
            window.isMobile=true;
        });
    }
        
    function set_heights () {
        let min_height=$("body").outerHeight();
        if ($(".navbar").length) min_height-=$(".navbar").outerHeight();
        if ($("nav.unselectable").length) min_height-=$("nav.unselectable").outerHeight();
        min_height-=$("footer").outerHeight();
        if (home_page===false) {
            $(".content").css("min-height",min_height);
            $(".wrapper").css("max-height",min_height+$("footer").outerHeight());
        }
        else $(".content").css("max-height",min_height);
    }
    let navigation_page="/algo-site/navigation.html";
    if (page.endsWith("_en.html")===true) navigation_page="/algo-site/navigation_en.html";
    $(document).ready(function () {
        $.get(navigation_page, function (data) {
        $("#nav-placeholder").replaceWith(data);
        $("#nav-placeholder").ready(function () {
            let dropdown=$('[aria-labelledby="languages"]').children();
            $(dropdown[0]).on("click",changeLanguage.bind(dropdown[0],"bg"));
            $(dropdown[1]).on("click",changeLanguage.bind(dropdown[1],"en"));
        });
        
        let footer_page="/algo-site/footer.html";
        if (page.endsWith("_en.html")===true) footer_page="/algo-site/footer_en.html";
        $.get(footer_page, function (data) {
            $("#footer-placeholder").replaceWith(data);
            
            set_heights();
            $(window).resize(set_heights);
            });
        });
        
        let ind=0;
        for (let btn of $(".lesson-part-position >.btn")) {
            $(btn).on("click",toggleText.bind(btn,ind));
            ind++;
        }
        
        let info=$(".info");
        for (let i=0; i<info.length; i+=2) {
            $(info[i]).on("click",triggerInfo.bind(info[i],$(info[i]),$(info[i+1])));
            $(info[i+1]).on("click",triggerInfo.bind(info[i+1],$(info[i]),$(info[i+1])));
        }
    });
    
})();

function get_page () {
    let URL=document.URL,index=-1;
    for (let i=0; i<URL.length; i++) {
        if (URL[i]=='/') index=i;
        }
    return URL.slice(index+1,URL.length);
}
function toggleText (index) {
    let ordinals=["first","second","third","fourth"];
    let name="#"+ordinals[index]+"Part";
    if ($(name).is(":hidden")===false) $(name).hide();
    else {
        $(name).show();
        if (typeof initExamples==="function") initExamples(index+1);
    }
}
function triggerInfo (trigger, info) {
    if (trigger.is(":hidden")===false) {
        trigger.hide();
        info.show();
    }
    else {
        trigger.show();
        info.hide();
    }
}
function changeLanguage (language) {
    let s=document.URL;
    if (s.includes(".html")===false) {
        if (language=="en") s+="index_en.html";
        else return ;
        }
    if (language=="bg") s=s.replace("_en.html",".html");
    else if (s.includes("_en")===false) s=s.replace(".html","_en.html");
    this.setAttribute("href",s);
}

function isDigit (event) {
    let charCode=(event.which)?event.which:event.keyCode;
    if ((charCode<=31)||((charCode>=48)&&(charCode<=57))) return true;
    return false;
}
function isDigitOrComma (event) {
    if (isDigit(event)===true) return true;
    let charCode=(event.which)?event.which:event.keyCode;
    if ((charCode<=31)||(charCode==44)) return true;
    return false;
}
function isSmallLatinLetter (event) {
    let charCode=(event.which)?event.which:event.keyCode;
    if ((charCode>=97)&&(charCode<=122)) return true;
    return false;
}

function initExamples (part = 1) {
    let page=get_page();
    if (page=="introduction_to_graphs.html") {
        let example1 = new Graph ();
        example1.n=5; example1.isOriented=true;
        example1.init(".graphExample1");
        example1.edgeList=[[0,1],[0,2],[0,3],[1,4],[2,4]];
        example1.adjList=[[1,2,3],[4],[4],[],[]];
        example1.adjMatrix=[[0,1,1,1,0],
                            [0,0,0,0,1],
                            [0,0,0,0,1],
                            [0,0,0,0,0],
                            [0,0,0,0,0]];
        example1.drawNewGraph(1,1,299,299,20,true);

        let example2 = new Graph ();
        example2.n=5; example2.isOriented=false;
        example2.init(".graphExample2");
        example2.edgeList=[[0,1],[0,2],[0,3],[1,4],[2,4]];
        example2.adjList=[[1,2,3],[0,4],[0,4],[0],[1,2]];
        example2.adjMatrix=[[0,1,1,1,0],
                            [1,0,0,0,1],
                            [1,0,0,0,1],
                            [1,0,0,0,0],
                            [0,1,1,0,0]];
        example2.drawNewGraph(1,1,299,299,20,true);
    }
    else if (page=="depth_first_search.html") {
        let example1 = new graphExample (".graphExample1",false,20);
        let example2 = new graphExample (".graphExample2",true,20);
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
        if (part>1) {
            initExample(part);
            defaultExample(part);
        }
    }
}