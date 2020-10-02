function isDigit (event) {
    var charCode=(event.which)?event.which:event.keyCode;
    if ((charCode<=31)||((charCode>=48)&&(charCode<=57))) return true;
    return false;
}
function isSmallLatinLetter (event) {
    var charCode=(event.which)?event.which:event.keyCode;
    if ((charCode>=97)&&(charCode<=122)) return true;
    return false;
}

function calculateHash () {
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
    
    var base=document.getElementById("base").value;
    var modulo=document.getElementById("modulo").value;
    var paragraph=document.getElementById("hashString"),hash;
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
    MathJax.typeset(["#hashString"]);
}