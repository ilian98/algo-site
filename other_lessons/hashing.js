function calculateHash () {
    var table=document.getElementById("stringTable");
    var s=document.getElementById("string").value;
    $("#stringTable").empty();
    var rows=[document.createElement("tr"),document.createElement("tr")],td;
    
    td=document.createElement("td");
    td.appendChild(document.createTextNode("Символи"));
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
    paragraph.textContent="Хеш-кодът на низа е: ";
    paragraph.textContent+="\\( ("+s.charCodeAt(0)+"."+base+"^{"+(s.length-1)+"} \\) ";
    hash=s.charCodeAt(0);
    for (var i=1; i<s.length; i++) {
        paragraph.textContent+=" \\( +\\space"+s.charCodeAt(i)+"."+base+"^{"+(s.length-1-i)+"}\\)";
        hash*=base; hash+=s.charCodeAt(i);
        hash%=modulo;
    }
    paragraph.textContent+="\\( )\\space \\% \\space"+modulo+" = "+hash+"\\).";
    MathJax.typeset(["#hashString"]);
    
}