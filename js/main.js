"use strict";
(function () {
    let page=get_page(),home_page=false;
    if ((page=="")||(page=="index.html")||(page=="index_en.html")) {
        home_page=true;
    }
    
    window.isMobile="false";
    if (sessionStorage.getItem("mobile")!==null) window.isMobile=sessionStorage.getItem("mobile");
    else sessionStorage.setItem("mobile","false");
    $(window).on("touchstart.mobile", function () {
        sessionStorage.setItem("mobile","true");
        window.isMobile="true";
        $(window).off("touchstart.mobile");
    });
        
    function setHeights () { console.log("tuk");
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
    function pageSetup () {
        setHeights();
        $(window).resize(setHeights);
        $(window).on("orientationchange",function() { console.log("tuk2"); setHeights});
        let scrollTop=sessionStorage.getItem(get_page()+"scrollTop");
        let wrapper=$(".wrapper");
        if (home_page===true) wrapper=$(".content");
        wrapper.scrollTop(scrollTop);
        wrapper.focus();
    }
    
    function getParts (s) {
        let nums = [];
        for (let c of s) {
            if ((c>='0')&&(c<='9')) nums.push(parseInt(c));
        }
        return nums;
    }
    function removePart (num, text) {
        let res=text.replace(","+num.toString(),"").replace(num.toString(),"");
        if (res.length===0) return "";
        if (res.startsWith(",")) res=res.slice(1);
        return "part"+res;
    }
    function addPart (num, text) {
        if (text.length===0) return num;
        return text+","+num;
    }
    function toggleParts () {
        let anchor=checkForAnchor();
        if (anchor.startsWith("part")) anchor=anchor.slice(4);
        else if (anchor.length!==0) return ;
        let parts=getParts(anchor);
        let ordinals=["first","second","third","fourth"];
        let ind=0;
        for (let btn of $(".lesson-part-position >.btn")) {
            let name="#"+ordinals[ind]+"Part";
            if (parts.includes(ind+1)) {
                if ($(name).is(":hidden")===true) {
                    $(name).show();
                }
            }
            else $(name).hide();
            ind++;
        }
    }
    function checkLessonParts(beginning) {
        let anchor=checkForAnchor();
        if (anchor.startsWith("part")) anchor=anchor.slice(4);
        else if (anchor.length!==0) return ;
        let parts=getParts(anchor);
        $(".anchor").remove();
        let ordinals=["first","second","third","fourth"];
        let ind=0;
        for (let btn of $(".lesson-part-position >.btn")) {
            let name="#"+ordinals[ind]+"Part";
            if (parts.includes(ind+1)) {
                $(btn).append('<a class="anchor" href="#'+removePart(ind+1,anchor)+'"></a>');
                if ($(name).is(":hidden")===true) {
                    sessionStorage.setItem(page+name,1);
                    $(name).show();
                    if ((beginning===false)&&(typeof initExamples==="function")) initExamples(ind+1);
                }
                if ((beginning===true)&&(typeof initExamples==="function")) initExamples(ind+1);
                if (parts[parts.length-1]!==ind+1) $(btn).prop("id","");
            }
            else {
                $(btn).append('<a class="anchor" href="#part'+addPart(ind+1,anchor)+'"></a>');
                $(btn).prop("id","part"+addPart(ind+1,anchor));
                sessionStorage.setItem(page+name,0);
                $(name).hide();
            }
            let part=ind+1;
            $(btn).off("click").on("click",function () {
                $(btn).children(".anchor")[0].click();
            });
            
            ind++;
        }
    }
    function toggleInfos () {
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
                
                toggleParts();
                toggleInfos();
                let lastCode="none";
                for (let elem of $(".placeholder")) {
                    lastCode=elem;
                }
                for (let elem of $(".placeholder")) {
                    let codeName=$(elem).prop("id")+".cpp";
                    $.get(codeName, function (code) {
                        let data=hljs.highlight(code,{language: "cpp"}).value;
                        $(elem).replaceWith('<pre><code class="language-cpp hljs">'+data+'</code></pre>');

                        if (elem===lastCode) {
                            if (typeof MathJax!=="undefined") MathJax.typeset([".hljs-comment"]);  
                            pageSetup();
                        }
                    });
                }
                if (lastCode==="none") pageSetup();
            });
        });
        
        checkLessonParts(true);
    });
    
    $(window).on("beforeunload", function() {
        if (home_page===true) sessionStorage.setItem(page+"scrollTop",$(".content").scrollTop());
        else sessionStorage.setItem(page+"scrollTop",$(".wrapper").scrollTop());
        return ;
    });
    
    $(window).on("popstate", function(event) {
        checkLessonParts(false);
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


function isBinary (event) {
    let charCode=(event.which)?event.which:event.keyCode;
    if ((charCode<=31)||((charCode>=48)&&(charCode<=49))) return true;
    return false;
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
    let ordinals=["","first","second","third","fourth"];
    let name="#"+ordinals[part]+"Part";
    if ($(name).hasClass("inited")===true) return ;
    $(name).addClass("inited");
        
    let page=get_page();
    if (page=="introduction_to_graphs.html") {
        if (part>=2) initExample(part);
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
        if (part>=3) initExample(part);
    }
}