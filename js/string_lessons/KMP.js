"use strict";
(function () {
    function makeBlueRegions (s, end, i1, i2, i3, i4, i5 = -1, i6 = -1, i7 = -1) {
        let text="\\(";
        for (let i=0; i<i1; i++) {
            text+=s[i];
        }
        if (i5!==-1) text+="[";
        if (i1<=i2) {
            text+="\\colorbox{lightblue}{$";
            for (let i=i1; i<=i2; i++) {
                if (i3===i) text+="\\textcolor{blue}{";
                text+=s[i];
            }
            if (i3<=i2) text+="}";
            if (i1<=i2) text+="$}";
        }
        for (let i=i2+1; i<i3; i++) {
            if (i===i6) text+="\\underline{";
            text+=s[i];
            if (i===i6) text+="}";
            if (i===i5) text+="]";
        }
        if (i3<=i4) {
            if (i2+1<i3) text+="\\colorbox{lightblue}{$";
            else text+="\\textcolor{blue}{";
            for (let i=Math.max(i2+1,i3); i<=i4; i++) {
                if (i===i6) text+="\\underline{";
                text+=s[i];
                if (i===i6) text+="}";
                if ((i===i5)&&(i!==i4)) text+="\\textcolor{black}{]}";
            }
            if (i2+1<i3) text+="$}";
            else text+="}";
            if (i4===i5) text+="]";
        }
        for (let i=i4+1; i<=end; i++) {
            if (i===i7) text+="\\underline{";
            text+=s[i];
            if (i===i7) text+="}";
        }
        text+="\\)";
        return text;
    }
    function makeOrangeRegions (s, end, i1, i2, i3, i4) {
        if (i1>i2) return "";
        let text="\\(";
        for (let i=0; i<i1; i++) {
            text+=s[i];
        }
        text+="\\colorbox{pink}{$";
        for (let i=i1; i<=i2; i++) {
            if (i3===i) text+="\\textcolor{magenta}{";
            text+=s[i];
        }
        if (i3<=i2) text+="}";
        text+="$}";
        for (let i=i2+1; i<i3; i++) {
            text+=s[i];
        }
        text+="\\textcolor{magenta}{";
        for (let i=Math.max(i2+1,i3); i<=i4; i++) {
            text+=s[i];
        }
        text+="}";
        for (let i=i4+1; i<=end; i++) {
            text+=s[i];
        }
        text+="\\)";
        return text;
    }
    
    function initExample (part) {
        if (part===2) {
            let s,m,f;
            let animFunc=$(".failureExample .anim-func"),animFunc2=$(".failureExample .anim-func2");
            let animationObj=new Animation();
            let indexObj=undefined,indexVal=undefined;
            animationObj.setParameters(true,"Покажи намирането","Прекъсни");
            $(".failureExample .default").on("click", function () {
                $(".failureExample .calc-f").click();
                if (indexVal!==undefined) indexVal.val("8");
                $(".failureExample .model").val("aabaabaaac");
                animationObj.init(".failureExample",function findAnimations () {
                    let animations=[];
                    let index=parseInt(indexVal.val());
                    if ((isNaN(index)===true)||(index>=m)) {
                        alert("Невалиден индекс!");
                        return animations;
                    }
                    if (index===0) {
                        animations.push({
                            animFunctions: [],
                            animText: "Стойността на \\(f(0)=0\\) като базов случай."
                        });
                        return animations;
                    }
                    let pos=index-1;
                    animations.push({
                        animFunctions: [textAnimation(animFunc,makeBlueRegions(s,index,0,f[pos]-1,index-f[pos],index-1,pos),-1),
                                        textAnimation(animFunc2,"",-1)],
                        animText: "Показан е низът \\(s[0..."+index+"]\\)"+
                        ((f[pos]>0)?
                         ", както и най-дългият добър суфикс на позиция \\("+pos+"\\). Дължината му е \\(l=f("+pos+")="+f[pos]+"\\).":
                         ". Дължината на най-дългия добър суфикс на позиция \\("+pos+"\\) е \\(l=f("+pos+")="+f[pos]+"\\)."),
                        endFunction: () => {
                            MathJax.typeset([".failureExample .anim-func"]);
                        }
                    });
                    f[-1]=0;
                    while (pos>=0) {
                        let l=f[pos];
                        if (pos<index-1) {
                            animations.push({
                                animFunctions: [textAnimation(animFunc,makeBlueRegions(s,index,0,l-1,index-l,index-1,pos),-1),
                                                textAnimation(animFunc2,"",-1),],
                                animText: ((l>0)?
                                           "Показан е префиксът, съответстващ на най-дългия добър суфикс на позиция \\("+pos+"\\) и еднаквия му суфикс на позиция \\("+(index-1)+"\\). Дължината му е \\(l=f("+pos+")="+l+"\\).":
                                           "Дължината на най-дългия добър суфикс на позиция \\("+pos+"\\) е \\(l=f("+pos+")=0\\)."),
                                endFunction: () => {
                                    MathJax.typeset([".failureExample .anim-func"]);
                                }
                            });
                        }
                        animations.push({
                            animFunctions: [textAnimation(animFunc,makeBlueRegions(s,index,0,l-1,index-l,index-1,-1,l,index),-1),
                                            textAnimation(animFunc2,"",-1),],
                            animText: "Сравняваме символите \\(s[l="+l+"]\\) и текущия символ \\(s["+index+"]\\).",
                            endFunction: () => {
                                if (typeof MathJax!=="undefined") MathJax.typeset([".failureExample .anim-func"]);
                            }
                        });
                        if (s[l]===s[index]) {
                            animations.push({
                                animFunctions: [textAnimation(animFunc,makeBlueRegions(s,index,0,l,index-l,index),-1),
                                                textAnimation(animFunc2,"",-1),],
                                animText: "Понеже са равни, то можем да удължим най-дългия добър суфикс на позиция \\("+pos+"\\) с \\(s[l="+l+"]\\) и приключваме търсенето. Намерихме, че \\(f("+index+")=l+1="+(l+1)+"\\).",
                                endFunction: () => {
                                    MathJax.typeset([".failureExample .anim-func"]);
                                }
                            });
                            break;
                        }
                        animations.push({
                            animFunctions: [textAnimation(animFunc,makeBlueRegions(s,index,0,l-1,index-l,index-1),-1),
                                            textAnimation(animFunc2,makeOrangeRegions(s,index,l-f[l-1],l-1,index-f[l-1],index-1),-1),],
                            animText: "Понеже са различни, то се връщаме на по-предна позиция \\(l-1="+(l-1)+"\\), получена от префикса, съответстващ на най-дългия добър суфикс на предната позиция \\("+pos+"\\)."+
                            ((f[l-1]>0)?" Изобразен е също най-дългият добър суфикс на новата позиция \\("+(l-1)+"\\), който е и суфикс на позиция \\(i-1="+(index-1)+"\\).":""),
                            endFunction: () => {
                                MathJax.typeset([".failureExample .anim-func"]);
                                MathJax.typeset([".failureExample .anim-func2"]);
                            }
                        });
                        pos=l-1;
                    }
                    if (pos<0) {
                        animations.push({
                            animFunctions: [textAnimation(animFunc,"\\("+s.substr(0,index+1)+"\\)",-1),
                                            textAnimation(animFunc2,"",-1)],
                            animText: "Накрая стигнахме до позиция \\(-1\\), съответстваща на празния префикс. Понеже не срещнахме равенство, то се получава, че \\(f("+index+")=0\\).",
                            endFunction: () => {
                                MathJax.typeset([".failureExample .anim-func"]);
                            }
                        });
                    }
                    return animations;
                },function startFunc () {
                    indexObj.hide();
                },function stopFunc () {
                    indexObj.show();
                }).then(
                    () => {
                        if (indexObj===undefined) {
                            indexObj=$(`<div class="row form-group justify-content-end speed-wrapper">
		                                  <label for="index" class="col-auto col-form-label pe-0 unselectable">\\(i\\):</label>
		                                  <div class="col-auto">
			                                 <input class="form-control index" maxLength="2" style="width: 3rem; max-width: 100%"/>
		                                  </div>
	                                   </div>`);
                            $(".failureExample .animation-panel .col.text-end").append(indexObj);
                            if ((typeof MathJax!=="undefined")&&(MathJax.typeset!==undefined)) 
                                MathJax.typeset([".failureExample .animation-panel .col.text-end"]);
                            indexVal=$(".failureExample .animation-panel .index");
                            indexVal.on("keydown",isDigit);
                            indexVal.val("8");
                        }
                    },
                    () => { alert("Failed loading animation data!"); }
                );
            }).click();
            $(".failureExample .calc-f").on("click", function () {
                animationObj.clear();
                animFunc.text("");
                animFunc2.text("");
                if (indexObj!==undefined) indexObj.show();
                s=$(".failureExample .model").val();
                m=s.length;
                f=[];
                f[0]=0;
                for (let i=1; i<m; i++) {
                    let l=f[i-1];
                    while (l>0) {
                        if (s[l]===s[i]) break;
                        l=f[l-1];
                    }
                    if (s[l]===s[i]) {
                        f[i]=l+1;
                    }
                    else f[i]=0;
                }
                let table=[];
                for (let i=0; i<3; i++) {
                    table.push([]);
                }
                table[0].push("\\(i\\)");
                for (let i=0; i<m; i++) {
                    table[0].push("\\("+i+"\\)");
                }
                table[1].push("\\(s\\)");
                for (let i=0; i<m; i++) {
                    table[1].push("\\("+s[i]+"\\)");
                }
                table[2].push("\\(f\\)");
                for (let i=0; i<m; i++) {
                    table[2].push("\\("+f[i]+"\\)");
                }
                $("#failureTable").html(tableHTML(table,true,true));
                if ((typeof MathJax!=="undefined")&&(MathJax.typeset!==undefined)) MathJax.typeset(["#failureTable"]);
            }).click();
            $(".failureExample .model").on("keydown",isSmallLatinLetter);
        }
    }
    
    
    window.initExample = initExample;
})();
