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
                let scrollTop=sessionStorage.getItem(get_page()+"scrollTop");
                if (home_page===true) $(".content").scrollTop(scrollTop);
                else $(".wrapper").scrollTop(scrollTop);
            });
        });
        
        let ind=0;
        let anchorBtn=checkForAnchor();
        for (let btn of $(".lesson-part-position >.btn")) {
            let ordinals=["first","second","third","fourth"];
            let name="#"+ordinals[ind]+"Part";
            $(btn).on("click",toggleText.bind($(btn),ind,name,page));
            $(btn).prop("id","part"+(ind+1));
            $(btn).append('<a class="show-anchor" href="#part'+(ind+1)+'"></a>');
            $(btn).append('<a class="hide-anchor" href="#"></a>');
            let state=sessionStorage.getItem(page+name);
            if (((state!==null)&&(state=="1"))||
                ($(btn).prop("id")==anchorBtn)) {
                showText(ind,name,page);
            }
            
            ind++;
        }
        
        let info=$(".info");
        for (let i=0; i<info.length; i+=2) {
            $(info[i]).on("click",triggerInfo.bind(info[i],$(info[i]),$(info[i+1]),page+"info"+i));
            $(info[i+1]).on("click",triggerInfo.bind(info[i+1],$(info[i]),$(info[i+1]),page+"info"+i));
            let state=sessionStorage.getItem(page+"info"+i);
            if ((state!==null)&&(state=="1")) {
                $(info[i+1]).show();
                $(info[i]).hide();
            }
        }
        
        for (let div of $("div")) {
            let id=$(div).prop("id");
            if (!id.endsWith("-placeholder")) continue;
            if ((id=="nav-placeholder")||(id=="footer-placeholder")) continue;
            let codeName=id.substring(0,id.length-("-placeholder").length)+".cpp";
            $.get(codeName, function (code) {
                let data=hljs.highlight(code,{language: "cpp"}).value;
                $(div).replaceWith('<pre><code class="language-cpp hljs">'+data+'</code></pre>');
            });
        }
    });
    
    $(window).on("beforeunload", function() {
        if (home_page===true) sessionStorage.setItem(page+"scrollTop",$(".content").scrollTop());
        else sessionStorage.setItem(page+"scrollTop",$(".wrapper").scrollTop());
        return ;
    });
})();


function get_page () {
    let URL=document.URL,index=-1,endIndex=URL.length;
    for (let i=0; i<URL.length; i++) {
        if (URL[i]=='/') index=i;
        if (URL[i]=='#') {
            endIndex=i;
            break;
        }
    }
    return URL.slice(index+1,endIndex);
}
function checkForAnchor ()  {
    let URL=document.URL,index=-1;
    for (let i=0; i<URL.length; i++) {
        if (URL[i]=='#') index=i;
    }
    if (index===-1) return "";
    return URL.slice(index+1,URL.length);
}
function triggerInfo (trigger, info, name) {
    if (trigger.is(":hidden")===false) {
        sessionStorage.setItem(name,1);
        trigger.hide();
        info.show();
    }
    else {
        sessionStorage.setItem(name,0);
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

function showText (index, name, page) {
    sessionStorage.setItem(page+name,1);
    $(name).show();
    if (typeof initExamples==="function") initExamples(index+1);
}
function toggleText (index, name, page) {
    if ($(name).is(":hidden")===false) {
        sessionStorage.setItem(page+name,0);
        this.children(".hide-anchor")[0].click();
        $(name).hide();
    }
    else {
        this.children(".show-anchor")[0].click();
        showText(index,name,page);
    }
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
        if (part==1) initExample(1);
        else if (part==3) initExample(3); 
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
    else if (page=="dp_profile.html") {
        if (part==3) initExample();
    }
}