function calculateHashString () {
    var table=document.getElementById("stringTable");
    var s=document.getElementById("string").value;
    $("#stringTable").empty();
    var rows=[document.createElement("tr"),document.createElement("tr")],td;
    
    td=document.createElement("td");
    if (s.length!=1) td.appendChild(document.createTextNode("Символи"));
    else td.appendChild(document.createTextNode("Символ"));
    rows[0].appendChild(td);
        
    td=document.createElement("td");
    td.appendChild(document.createTextNode("ASCII код"));
    rows[1].appendChild(td);
        
    for (var i=0; i<s.length; i++) {
        td=document.createElement("td");
        td.appendChild(document.createTextNode(s[i]));
        rows[0].appendChild(td);
        
        td=document.createElement("td");
        td.appendChild(document.createTextNode(s.charCodeAt(i)));
        rows[1].appendChild(td);
        }
    table.appendChild(rows[0]);
    table.appendChild(rows[1]);
    
    var base=document.querySelector(".hashExample1 .base").value;
    var modulo=document.querySelector(".hashExample1 .modulo").value;
    var paragraph=document.querySelector(".hashExample1 .hash"),hash;
    if ((s.length==0)||(base<2)||(modulo<2)) {
        paragraph.textContent="";
        return ;
    }
    
    hash=s.charCodeAt(0); hash%=modulo;
    if (s.length==1) {
        paragraph.textContent="Хеш-кодът на низа е: \\("+s.charCodeAt(0)+"."+base+"^0 \\space \\% \\space"+modulo+" = "+hash+"\\).";
        MathJax.typeset(["#hashString"]);
        return ;
    }
    paragraph.textContent="Хеш-кодът на низа е: ";
    paragraph.textContent+="\\( ("+s.charCodeAt(0)+"."+base+"^{"+(s.length-1)+"} \\) ";
    for (var i=1; i<s.length; i++) {
        paragraph.textContent+=" \\( +\\space"+s.charCodeAt(i)+"."+base+"^{"+(s.length-1-i)+"}\\)";
        hash*=base; hash+=s.charCodeAt(i);
        hash%=modulo;
    }
    paragraph.textContent+="\\( )\\space \\% \\space"+modulo+" = "+hash+"\\).";
    MathJax.typeset([".hashExample1 .hash"]);
}

function fastPower (base, power, modulo) {
    if (power==0) return 1;
    if (power%2==1) return (base*fastPower(base,power-1,modulo))%modulo;
    var num=fastPower(base,power/2,modulo);
    return (num*num)%modulo;
    
}
function calculateHashMultiSet () {
    var s=document.getElementById("multiSet").value;
    var base=document.querySelector(".hashExample2 .base").value;
    var modulo=document.querySelector(".hashExample2 .modulo").value;
    var paragraph=document.querySelector(".hashExample2 .hash"),hash,curHash;
    if ((s.length==0)||(base<2)||(modulo<2)) {
        paragraph.textContent="";
        return ;
    }
    
    var elements=[],num=0,digs=0;
    for (var i=0; i<s.length; i++) {
        if (s[i]==',') {
            if (digs==0) {
                paragraph.textContent="";
                return ;
            }
            elements.push(num);
            num=0; digs=0;
        }
        else {
            num*=10; num+=s[i]-'0';
            digs++;
        }
    }
    if (digs==0) {
        paragraph.textContent="";
        return ;
    }
    elements.push(num);
    
    paragraph.textContent="Хеш-кодът на мултимножеството е: ";
    for (var i=0; i<elements.length; i++) {
        paragraph.textContent+=" \\(";
        if (i==0) paragraph.textContent+="(";
        paragraph.textContent+=base+"^{"+elements[i]+"} \\space \\% \\space"+modulo+"\\)";
        if (i<elements.length-1) paragraph.textContent+="\\( \\space + \\)";
    }
    paragraph.textContent+="\\( ) \\space \\% \\space"+modulo+" = \\)";
    hash=0;
    for (var i=0; i<elements.length; i++) {
        curHash=fastPower(base,elements[i],modulo);
        paragraph.textContent+=" \\(";
        if (i==0) paragraph.textContent+="(";
        paragraph.textContent+=curHash+"\\)";
        if (i<elements.length-1) paragraph.textContent+="\\( \\space + \\)";
        hash+=curHash; hash%=modulo;
    }
    paragraph.textContent+="\\( ) \\space \\% \\space"+modulo+"\\space = "+hash+"\\).";
    MathJax.typeset([".hashExample2 .hash"]);
}