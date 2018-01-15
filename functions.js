function flagsPosition () {
         $("#flags").css({top: $("nav").height() + parseInt($("nav").css("paddingBottom")) + parseInt($("nav").css("paddingTop")),
                          width: $("nav").width() + parseInt($("nav").css("paddingRight")) + parseInt($("nav").css("paddingLeft"))});
}
function toggleText (name) {
         if (cur===null) return 0;
         var cur=document.getElementById(name);
         if (cur.style.display==="block") cur.style.display="none";
         else cur.style.display="block";
         flagsPosition();
}