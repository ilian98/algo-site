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
    function ignoreKey (code, event) {
        if ((event.altKey===true)||(event.ctrlKey===true)||(event.metaKey===true)||(event.shiftKey===true)) return true;
        if (code===32) return false;
        if (code<=40) return true;
        if ((code>=44)&&(code<=46)) return true; /// printscreen, insert and delete
        if ((code>=91)&&(code<=93)) return true; /// windows key and select
        if ((code>=112)&&(code<=123)) return true; /// f keys
        if ((code===144)||(code===145)) return true; /// num and scroll lock
        return false;
    }
    function isBinary (event) {
        let charCode=(event.which)?event.which:event.keyCode;
        if (ignoreKey(charCode,event)===true) return true;
        if ((charCode>=48)&&(charCode<=49)) return true;
        return false;
    }
    function isDigit (event) {
        let charCode=(event.which)?event.which:event.keyCode;
        if (ignoreKey(charCode,event)===true) return true;
        if ((charCode>=48)&&(charCode<=57)) return true;
        return false;
    }
    function isDigitOrComma (event) {
        if (isDigit(event)===true) return true;
        let charCode=(event.which)?event.which:event.keyCode;
        if (charCode===188) return true;
        return false;
    }
    function isSmallLatinLetter (event) {
        let charCode=(event.which)?event.which:event.keyCode;
        if (ignoreKey(charCode,event)===true) return true;
        if ((charCode>=65)&&(charCode<=90)) return true;
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
    function findNumbersFromText (s) {
        if (s.length>1000) return [[],"дължината е над 100 символа"];
        let elements=[],num=0,digs=0;
        for (let i=0; i<s.length; i++) {
            if (s[i]===',') {
                if (digs===0) return [[],"липсва число между 2 запетайки"];
                elements.push(num);
                num=0; digs=0;
            }
            else {
                if ((s[i]<'0')||(s[i]>'9')) return [[],"намерен е знак различен от цифра между запетайките"];
                num*=10; num+=s[i]-'0';
                digs++;
            }
        }
        if (digs===0) return [[],"липсва число след последната запетайка"];
            
        elements.push(num);
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
        return URL.slice(index+1,URL.length);
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
    let ordinals=["first","second","third","fourth"];
    function checkLessonParts (beginning) {
        let anchor=checkForAnchor();
        if (anchor.startsWith("part")) anchor=anchor.slice(4);
        else if (anchor.length!==0) return ;
        let parts=getParts(anchor);
        $(".anchor").remove();
        let ind=0;
        for (let btn of $(".lesson-part-position >.btn")) {
            let name="#"+ordinals[ind]+"Part";
            if (parts.includes(ind+1)) {
                $(btn).append('<a class="anchor" href="#'+removePart(ind+1,anchor)+'"></a>');
                if ($(name).is(":hidden")===true) {
                    sessionStorage.setItem(page+name,"1");
                    $(name).show();
                    if ((beginning===false)&&(typeof initExamples==="function")) initExamples(ind+1);
                }
                if ((beginning===true)&&(typeof initExamples==="function")) initExamples(ind+1);
                if (parts[parts.length-1]!==ind+1) $(btn).prop("id","");
            }
            else {
                $(btn).append('<a class="anchor" href="#part'+addPart(ind+1,anchor)+'"></a>');
                $(btn).prop("id","part"+addPart(ind+1,anchor));
                sessionStorage.setItem(page+name,"0");
                $(name).hide();
            }
            let part=ind+1;
            $(btn).off("click").on("click",function () {
                $(btn).children(".anchor")[0].click();
            });
            
            ind++;
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
        $.get(navigation_page, function (data) {
            $("#nav-placeholder").replaceWith(data);
            $("#nav-placeholder").ready(function () {
                let dropdown=$('[aria-labelledby="languages"] .dropdown-item');
                $(dropdown[0]).on("click",changeLanguage.bind(dropdown[0],"bg"));
                $(dropdown[1]).on("click",changeLanguage.bind(dropdown[1],"en"));
                $(dropdown[2]).on("click",changeLanguage.bind(dropdown[2],"bg"));
                $(dropdown[3]).on("click",changeLanguage.bind(dropdown[3],"en"));
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
        
        if (typeof opentype!=="undefined") {
            opentype.load("/algo-site/fonts/Consolas.woff", (error, font) => {
                window.font=[];
                window.font["Consolas"]=font;
                opentype.load("/algo-site/fonts/Arial.woff", (error, font) => {
                    window.font["Arial"]=font;
                    opentype.load("/algo-site/fonts/TimesNewRoman.woff", (error, font) => {
                        window.font["Times New Roman"]=font;
                        checkLessonParts(true);
                        if (page==="graph_drawer.html") init();
                    });
                });
            });
        }
        else {
            checkLessonParts(true);
            if (page==="graph_drawer.html") init();
        }
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
        let name="#"+ordinals[part-1]+"Part";

        if (page==="introduction_to_graphs.html") {
            if (part>=2) initExample(part);
        }
        else if (page==="depth_first_search.html") {
            if (part===1) initExample(1);
            else if (part===3) initExample(3); 
        }
        else if (page==="hashing.html") {
            if (part===2) initExample(2);
            else initExample(4);
        }
        else if (page==="2-SAT.html") {
            if (part>1) initExample(part);
        }
        else if (page==="segment_tree_introduction.html") {
            if (part>1) {
                initExample(part);
                defaultExample(part);
            }
        }
        else if (page==="dp_profile.html") {
            if (part>=3) initExample(part);
        }
    }
    
    window.get_page = get_page;
    window.isBinary = isBinary;
    window.isDigit = isDigit;
    window.isDigitOrComma = isDigitOrComma;
    window.isSmallLatinLetter = isSmallLatinLetter;
    window.tableHTML = tableHTML;
    window.findNumbersFromText = findNumbersFromText;
})();