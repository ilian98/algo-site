var s,vertices=[],edges=[];
function loadSvg () {
         s=Snap("#img");
         Snap.load("graph_DFS.svg",function (data) {
                  for (var i=0; i<5; i++) {
                      var name="#vertex"+(i+1).toString();
                      vertices[i]=data.select(name);
                      name="#edge"+(i+1).toString();
                      edges[i]=data.select(name);
                      }
                  s.append(data);
                  });
}
function start () {
         vertices[0].animate({fill: "red"},1000,function () {
             vertices[0].animate({fill: "white"},1000);
             var stx,sty,endx,endy;
             stx=edges[0].getBBox().x; sty=edges[0].getBBox().y2;
             endx=edges[0].getBBox().x2; endy=edges[0].getBBox().y;
             var matrix=new Snap.matrix();
             matrix.translate(endx-stx,endy-sty);
             var cir=s.circle(stx,sty,2,2).attr({fill: "red"});
             cir.animate({transform: matrix},1000,function () {
                 cir.remove();
             });
             });
}