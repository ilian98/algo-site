"use strict";
(function () {
    function get_page (URL = document.URL) {
        let index=-1,endIndex=URL.length;
        for (let i=0; i<URL.length; i++) {
            if (URL[i]=='/') index=i;
            if (URL[i]=='#') {
                endIndex=i;
                break;
            }
        }
        return URL.slice(index+1,endIndex);
    }
    function ignoreKey (key, event) {
        if (key.length>1) return true;
        return false;
    }
    function isBinary (event) {
        let key=event.key;
        if (ignoreKey(key,event)===true) return true;
        if ((key==="0")||(key==="1")) return true;
        return false;
    }
    function isDigit (event) {
        let key=event.key;
        if (ignoreKey(key,event)===true) return true;
        if ((key>='0')&&(key<='9')) return true;
        return false;
    }
    function isDigitOrComma (event) {
        if (isDigit(event)===true) return true;
        if (event.key===",") return true;
        return false;
    }
    function isSmallLatinLetter (event) {
        let key=event.key;
        if (ignoreKey(key,event)===true) return true;
        if ((key>='a')&&(key<='z')) return true;
        return false;
    }
    function tableHTML (table, hasHeadRow = false, hasHeadColumn = false) {
        let tableText="";
        for (let i=0; i<table.length; i++) {
            let td="td";
            if ((hasHeadRow===true)&&(i===0)) {
                tableText+='<thead>';
                td="th";
            }
            else {
                if (i===0) tableText+='<tbody>';
                tableText+='<tr>';
            }
            for (let j=0; j<table[i].length; j++) {
                if (((hasHeadRow===true)&&(i===0))||
                    ((hasHeadColumn===true)&&(j===0))) tableText+='<'+td+' style="background-color: grey">';
                else tableText+='<'+td+'>';
                tableText+=table[i][j];
                tableText+='</'+td+'>';
            }
            if (td==="th") tableText+='</thead><tbody>';
            else tableText+='</tr>';
        }
        tableText+='</tbody>';
        return tableText;
    }
    function findItemsFromText (s, flagNumbers=true) {
        if (s.length>1000) return [[],(language==="bg")?"дължината е над 1000 символа":"the length is greater than 1000 symbols"];
        let elements=[],last=0;
        for (let i=0; i<s.length; i++) {
            if ((s[i]===',')||(i===s.length-1)) {
                if ((s[i]===',')&&(last===i)) return [[],(language==="bg")?"липсва елемент между 2 запетайки":"missing element between 2 commas"];
                let curr=s.substring(last,(s[i]===',')?i:i+1);
                if (flagNumbers===true) {
                    curr=parseInt(curr);
                    if (isNaN(curr)===true) return [[],s.substring(last,(s[i]===',')?i:i+1)+
                                                    ((language==="bg")?" не е число":" is not a number")];
                }
                elements.push(curr);
                last=i+1;
            }
        }
        if (s[s.length-1]===',') return [[],(language==="bg")?"липсва елемент след последната запетайка":"missing element after the last comma"];
        return [elements,""];
    }

    let page=get_page(),home_page=false;
    if ((page=="")||(page=="index.html")||(page=="index_en.html")) {
        home_page=true;
    }
    
    function cssMobile () {
        $("body").css("overflow-y","auto");
    }
    window.isMobile="false";
    if (sessionStorage.getItem("mobile")!==null) window.isMobile=sessionStorage.getItem("mobile");
    $(window).on("touchstart.mobile", function () {
        sessionStorage.setItem("mobile","true");
        window.isMobile="true";
        cssMobile();
        $(window).off("touchstart.mobile");
    });
    if (window.isMobile==="true") cssMobile();
        
    function setHeights () {
        let min_height=$("body").outerHeight();
        if ($(".navbar").length) min_height-=$(".navbar").outerHeight();
        if ($("nav.unselectable").length) min_height-=$("nav.unselectable").outerHeight();
        min_height-=$("footer").outerHeight();
        if (home_page===false) {
            $(".content").css("min-height",min_height);
            if (window.isMobile==="false") $(".wrapper").css("max-height",min_height+$("footer").outerHeight());
        }
        else if (window.isMobile==="false") $(".wrapper").css("max-height",min_height);
    }
    function pageSetup () {
        setHeights();
        $(window).resize(setHeights);
        $(window).on("findOrientationchange",setHeights);
        let scrollTop=parseInt(sessionStorage.getItem(page+"scrollTop"));
        let wrapper=$(".wrapper");
        wrapper.scrollTop(scrollTop);
        if (window.isMobile==="false") wrapper.focus();
    }
    
    function checkForAnchor ()  {
        let URL=document.URL,index=-1;
        for (let i=0; i<URL.length; i++) {
            if (URL[i]=='#') index=i;
        }
        if (index===-1) return "";
        let anchor=URL.slice(index+1,URL.length);
        if (anchor.startsWith("part")) return anchor.slice(4);
        return "";
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
    let ordinals=["first","second","third","fourth"];
    function initiateParts () {
        let ind=0;
        for (let btn of $(".lesson-part-position >.btn")) {
            let name="#"+ordinals[ind]+"Part";
            $(btn).parent().children("div:first").prop("id",name.substr(1,name.length-1));
            ind++;
        }
    }
    function toggleParts () {
        let anchor=checkForAnchor();
        if (anchor.length===0) return ;
        let parts=getParts(anchor);
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
    function checkLessonParts (beginning) {
        let anchor=checkForAnchor();
        let parts=getParts(anchor);
        let initFuncs=[];
        let ind=0;
        for (let btn of $(".lesson-part-position >.btn")) {
            let name="#"+ordinals[ind]+"Part";
            let href;
            if (parts.includes(ind+1)) {
                href="#"+removePart(ind+1,anchor);
                if ($(name).is(":hidden")===true) {
                    sessionStorage.setItem(page+name,"1");
                    $(name).show();
                    $("#miniLesson"+ind).show();
                    if (beginning===false) initFuncs.push(initExamples.bind(this,ind+1));
                    if (parts[parts.length-1]===ind+1) {
                        $(".wrapper").animate({
                            scrollTop: $(btn)[0].offsetTop-$(".wrapper")[0].offsetTop
                        },"slow");
                    }
                }
                if (beginning===true) initFuncs.push(initExamples.bind(this,ind+1));
            }
            else {
                href="#part"+addPart(ind+1,anchor);
                sessionStorage.setItem(page+name,"0");
                $(name).hide();
                $("#miniLesson"+ind).hide();
            }
            
            $(btn).off("click").on("click",function () {
                $(btn).off("click");
                window.location.hash=href;
            });
            ind++;
        }
        if (typeof GraphLoadData==="function") GraphLoadData();
        if ((ind===0)&&(typeof init==="function")) init();
        for (let initFunc of initFuncs) {
            initFunc();
        }
    }
    function triggerInfo (trigger, info, name) {
        if (trigger.is(":hidden")===false) {
            sessionStorage.setItem(name,"1");
            trigger.hide();
            info.show();
        }
        else {
            sessionStorage.setItem(name,"0");
            trigger.show();
            info.hide();
        }
    }
    function toggleInfos () {
        let info=$(".info");
        for (let i=0; i<info.length; i+=2) {
            $(info[i]).on("click",triggerInfo.bind(info[i],$(info[i]),$(info[i+1]),page+"info"+i));
            $(info[i+1]).on("click",triggerInfo.bind(info[i+1],$(info[i]),$(info[i+1]),page+"info"+i));
            let state=sessionStorage.getItem(page+"info"+i);
            if ((state!==null)&&(state==="1")) {
                $(info[i+1]).show();
                $(info[i]).hide();
            }
        }
    }
    
    let navigation_page="/algo-site/navigation.html";
    if (page.endsWith("_en.html")===true) navigation_page="/algo-site/navigation_en.html";
    let language="bg";
    if (page.endsWith("_en.html")===true) language="en";
    function changeLanguage (language) {
        let s=document.URL;
        if (s.includes(".html")===false) {
            if (language==="en") s+="index_en.html";
            else return ;
            }
        if (language==="bg") s=s.replace("_en.html",".html");
        else if (s.includes("_en")===false) s=s.replace(".html","_en.html");
        this.setAttribute("href",s);
    }

    $(document).ready(function () {
        let finishedWork=[];
        let cnt=2;
        for (let elem of $(".placeholder")) {
            cnt++;
        }
        function checkForFinish () {
            let flag=true;
            for (let i=0; i<cnt; i++) {
                if (finishedWork[i]!==true) {
                    flag=false;
                    break;
                }
            }
            if (flag===true) {
                if ((typeof MathJax!=="undefined")&&(MathJax.typeset!==undefined)) MathJax.typeset([".hljs-comment"]);
                pageSetup();
            }
        }
        
        $.get(navigation_page, function (data) {
            finishedWork[0]=true;
            $("#nav-placeholder").replaceWith(data);
            let dropdown=$('[aria-labelledby="languages"] .dropdown-item');
            $(dropdown[0]).on("click",changeLanguage.bind(dropdown[0],"bg"));
            $(dropdown[1]).on("click",changeLanguage.bind(dropdown[1],"en"));
            $(dropdown[2]).on("click",changeLanguage.bind(dropdown[2],"bg"));
            $(dropdown[3]).on("click",changeLanguage.bind(dropdown[3],"en"));
                
            $("#search").submit(function (event) {
                if ($("#search input").val().length===0) event.preventDefault();
            });
        
            let footer_page="/algo-site/footer.html";
            if (page.endsWith("_en.html")===true) footer_page="/algo-site/footer_en.html";
            $.get(footer_page, function (data) {
                finishedWork[1]=true; checkForFinish();
                $("#footer-placeholder").replaceWith(data);
                pageSetup();
                
            });
        });
        let ind=0;
        for (let elem of $(".placeholder")) {
            let codeName=$(elem).prop("id")+".cpp";
            let index=2+ind;
            $.get(codeName, function (code) {
                let data=hljs.highlight(code,{language: "cpp"}).value;
                $(elem).replaceWith('<pre><code class="language-cpp hljs">'+data+'</code></pre>');
                finishedWork[index]=true; checkForFinish();
            });
            ind++;
        }
        
        initiateParts();
        toggleParts();
        checkLessonParts(true);
        
        toggleInfos();
        unimportantWork();
    });
    
    $(window).on("pagehide visibilitychange", function() {
        sessionStorage.setItem(page+"scrollTop",$(".wrapper").scrollTop());
    });
    
    $(window).on("popstate", function(event) {
        checkLessonParts(false);
    });
    
    let inited=new Set();
    function initExamples (part = 1) {
        if (inited.has(part)===true) return ;
        inited.add(part);
        if (typeof initExample==="function") initExample(part);
    }
    
    function unimportantWork () {
        const d=new Date();
        const month=d.getMonth()+1,day=d.getDate();
        if (((month==12)&&(day>=22))||
            (month==1)||(month==2)||
            ((month==3)&&(day<21))) {
            $("head").append('<link type="text/css" rel="stylesheet" href="/algo-site/styles/snow.css" media="screen,projection"/>');
            if (home_page===true) $("body").append('<div id="winter"></div>');
            else $("header").append('<div id="winter"></div>');
            let winter=$("#winter");
            for (let i=0; i<200; i++) {
                winter.append('<div class="snow"></div>');
            }
        }
        
        $("header nav ol li .link-secondary").append('<div class="mini-menu"></div>');
        let parts=getParts(checkForAnchor());
        let ind=0;
        for (let btn of $(".lesson-part-position >.btn")) {
            $(btn).clone().wrap('<div class="mini-btn" id="miniBtn'+ind+'"></div>').parent().appendTo(".mini-menu");
            $("#miniBtn"+ind).on("click",function () {
                $(btn).click();
            });
            $(".mini-menu").append('<div class="mini-lesson-part" id="miniLesson'+ind+'"></div>');
            if (parts.includes(ind+1)===false) $("#miniLesson"+ind).hide();
            $("#miniLesson"+ind).on("click",function (ind) {
                $(".wrapper").animate({
                    scrollTop: $("#"+ordinals[ind]+"Part")[0].offsetTop-$(".wrapper")[0].offsetTop
                },"slow");
            }.bind(this,ind));
            ind++;
        }
        const h=$(".lesson-part-position .btn").height();
        $(".mini-lesson-part").height(h).css({
            "background-image": "radial-gradient(circle at "+h/2+"px "+h/2+"px, black 2px, transparent 0)",
            "background-size": h+"px "+h+"px",
        });
    }
    
    window.get_page = get_page;
    window.isBinary = isBinary;
    window.isDigit = isDigit;
    window.isDigitOrComma = isDigitOrComma;
    window.isSmallLatinLetter = isSmallLatinLetter;
    window.tableHTML = tableHTML;
    window.findItemsFromText = findItemsFromText;
    window.language = language;
})();