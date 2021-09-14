"use strict";
(function () {
    function initExample (part) {
        if (part===2) {
            $(".hashExample1 .base").val("307");
            $(".hashExample1 .modulo").val("1009");
            $("#string").val("abcab");
            $(".hashExample1 .start").on("click",calculateHashString);
            calculateHashString();
        }
        else if (part===4) {
            $(".hashExample2 .base").val("7");
            $(".hashExample2 .modulo").val("1009");
            $("#multiSet").val("1,2,3");
            $(".hashExample2 .start").on("click",calculateHashMultiSet);
            calculateHashMultiSet();
        }
    }
    
    function calculateHashString () {
        let s=$("#string").val();
        let table=[];
        table.push([]); table.push([]);
        if (s.length!=1) table[0].push("Символи");
        else table[0].push("Символ");
        table[1].push("ASCII код");
        for (let i=0; i<s.length; i++) {
            table[0].push(s[i]);
            table[1].push(s.charCodeAt(i));
        }
        $("#stringTable").html(tableHTML(table));

        let base=$(".hashExample1 .base").val();
        let modulo=$(".hashExample1 .modulo").val();
        let paragraph=$(".hashExample1 .hash"),hash;
        paragraph.text("");
        if ((s.length==0)||(base<2)||(modulo<2)) return ;

        hash=s.charCodeAt(0); hash%=modulo;
        if (s.length===1) {
            paragraph.append("Хеш-кодът на низа е: \\("+s.charCodeAt(0)+"."+base+"^0 \\space \\% \\space"+modulo+" = "+hash+"\\).");
            if (typeof MathJax!=="undefined") MathJax.typeset(["#hashString"]);
            return ;
        }
        paragraph.append("Хеш-кодът на низа е: ");
        paragraph.append("\\( ("+s.charCodeAt(0)+"."+base+"^{"+(s.length-1)+"} \\) ");
        for (let i=1; i<s.length; i++) {
            paragraph.append(" \\( +\\space"+s.charCodeAt(i)+"."+base+"^{"+(s.length-1-i)+"}\\)");
            hash*=base; hash+=s.charCodeAt(i);
            hash%=modulo;
        }
        paragraph.append("\\( )\\space \\% \\space"+modulo+" = "+hash+"\\).");
        if (typeof MathJax!=="undefined") MathJax.typeset([".hashExample1 .hash"]);
    }

    function fastPower (base, power, modulo) {
        if (power==0) return 1;
        if (power%2==1) return (base*fastPower(base,power-1,modulo))%modulo;
        let num=fastPower(base,power/2,modulo);
        return (num*num)%modulo;
    }
    function calculateHashMultiSet () {
        let s=$("#multiSet").val();
        let base=$(".hashExample2 .base").val();
        let modulo=$(".hashExample2 .modulo").val();
        let paragraph=$(".hashExample2 .hash"),hash,currHash;
        paragraph.text("");
        if ((s.length===0)||(base<2)||(modulo<2)) return ;

        let [elements,error]=findNumbersFromText(s);
        if (error!==0) return ;
        
        paragraph.append("Хеш-кодът на мултимножеството е: ");
        for (let i=0; i<elements.length; i++) {
            paragraph.append(" \\(");
            if (i==0) paragraph.append("(");
            paragraph.append(base+"^{"+elements[i]+"} \\space \\% \\space"+modulo+"\\)");
            if (i<elements.length-1) paragraph.append("\\( \\space + \\)");
        }
        paragraph.append("\\( ) \\space \\% \\space"+modulo+" = \\)");
        hash=0;
        for (let i=0; i<elements.length; i++) {
            currHash=fastPower(base,elements[i],modulo);
            paragraph.append(" \\(");
            if (i==0) paragraph.append("(");
            paragraph.append(currHash+"\\)");
            if (i<elements.length-1) paragraph.append("\\( \\space + \\)");
            hash+=currHash; hash%=modulo;
        }
        paragraph.append("\\( ) \\space \\% \\space"+modulo+"\\space = "+hash+"\\).");
        if (typeof MathJax!=="undefined") MathJax.typeset([".hashExample2 .hash"]);
    }
    
    
    window.initExample = initExample;
})();