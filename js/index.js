"use strict";
(function () {
    $(document).ready(function () {
        for (let anchor of $("a")) {
            if ($(anchor).prop("href")==="") continue;
            let URL=$(anchor).prop("href");
            let page=get_page(URL);
            
            let ordinals=["first","second","third","fourth"];
            let flag=false;
            for (let ind=0; ind<4; ind++) {
                let name="#"+ordinals[ind]+"Part";
                let state=sessionStorage.getItem(page+name);
                if ((state!==null)&&(state==="1")) {
                    if (flag===false) URL+="#part"+(ind+1);
                    else URL+=","+(ind+1);
                    flag=true;
                }
            }
            $(anchor).prop("href",URL);
        }
    });
})();