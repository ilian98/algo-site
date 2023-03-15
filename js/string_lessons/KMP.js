"use strict";
(function () {
    let fontData;
    function loadFontData () {
        return new Promise((resolve, reject) => {
            if (typeof window.font==="undefined") {
                opentype.load("/algo-site/fonts/Consolas.woff", (error, font) => {
                    fontData=font;
                    resolve();
                });
            }
            else resolve();
        });
    }
    function textBBox (text, fontSize) {
        return fontData.getPath(text.toString(),0,0,fontSize).getBoundingBox();
    }
    function calcHeight (text, fontSize) {
        let bBox=textBBox(text,fontSize);
        return bBox.y2-bBox.y1;
    }
    function calcWidth (text, fontSize) {
        let bBox=textBBox(text,fontSize);
        return bBox.x2-bBox.x1;
    }
    function calcY (text, fontSize, y) {
        let bBox=textBBox(text,fontSize);
        let underBaseline=bBox.y2;
        return y-underBaseline;
    }
    
    function calcFailureFunction (s) {
        let m=s.length,f=[];
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
        return f;
    }
    function makeFailureTable (s, f, id) {
        let m=s.length;
        let table=[];
        for (let i=0; i<3; i++) {
            table.push([]);
        }
        table[0].push("$i$");
        for (let i=0; i<m; i++) {
            table[0].push("$"+i+"$");
        }
        table[1].push("$s$");
        for (let i=0; i<m; i++) {
            table[1].push("$"+s[i]+"$");
        }
        table[2].push("$f$");
        for (let i=0; i<m; i++) {
            table[2].push("$"+f[i]+"$");
        }
        $("#"+id).html(tableHTML(table,true,true));
        if ((typeof MathJax!=="undefined")&&(MathJax.typeset!==undefined)) MathJax.typeset(["#"+id]);
    }
    function makeBlueRegions (s, end, i1, i2, i3, i4, i5 = -1, i6 = -1, i7 = -1) {
        let text="$";
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
        text+="$";
        return text;
    }
    function makeOrangeRegions (s, end, i1, i2, i3, i4) {
        if (i1>i2) return "";
        let text="$";
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
        text+="$";
        return text;
    }
    
    function createText (text, x, y, s, fontSize) {
        let letters=[];
        let len=text.length,maxH=0;
        for (let i=0; i<len; i++) {
            letters[i]=s.text(x,0,text[i]);
            letters[i].attr({
                "font-size": fontSize,
                "font-family": "Consolas",
                class: "unselectable",
            });
            maxH=Math.max(maxH,calcHeight(text[i],fontSize));
            x+=calcWidth(text[i],fontSize)+5;
        }
        let maxY=0;
        for (let i=0; i<len; i++) {
            let currY=calcY(text[i],fontSize,y+maxH);
            letters[i].attr("y",currY);
            maxY=Math.max(maxY,currY);
        }
        return [s.group(...letters), Math.round(maxY)];
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
                            animText: "Стойността на $f(0)=0$ като базов случай."
                        });
                        return animations;
                    }
                    let pos=index-1;
                    animations.push({
                        animFunctions: [textAnimation(animFunc,makeBlueRegions(s,index,0,f[pos]-1,index-f[pos],index-1,pos),-1),
                                        textAnimation(animFunc2,"",-1)],
                        animText: "Показан е низът $s[0..."+index+"]$"+
                        ((f[pos]>0)?
                         ", както и най-дългият добър суфикс на позиция $"+pos+"$. Дължината му е $l=f("+pos+")="+f[pos]+"$.":
                         ". Дължината на най-дългия добър суфикс на позиция $"+pos+"$ е $l=f("+pos+")="+f[pos]+"$."),
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
                                           "Показан е префиксът, съответстващ на най-дългия добър суфикс на позиция $"+pos+"$ и еднаквия му суфикс на позиция $"+(index-1)+"$. Дължината му е $l=f("+pos+")="+l+"$.":
                                           "Дължината на най-дългия добър суфикс на позиция $"+pos+"$ е $l=f("+pos+")=0$."),
                                endFunction: () => {
                                    MathJax.typeset([".failureExample .anim-func"]);
                                }
                            });
                        }
                        animations.push({
                            animFunctions: [textAnimation(animFunc,makeBlueRegions(s,index,0,l-1,index-l,index-1,-1,l,index),-1),
                                            textAnimation(animFunc2,"",-1),],
                            animText: "Сравняваме символите $s[l="+l+"]$ и текущия символ $s["+index+"]$.",
                            endFunction: () => {
                                if (typeof MathJax!=="undefined") MathJax.typeset([".failureExample .anim-func"]);
                            }
                        });
                        if (s[l]===s[index]) {
                            animations.push({
                                animFunctions: [textAnimation(animFunc,makeBlueRegions(s,index,0,l,index-l,index),-1),
                                                textAnimation(animFunc2,"",-1),],
                                animText: "Понеже са равни, то можем да удължим най-дългия добър суфикс на позиция $"+pos+"$ с $s[l="+l+"]$ и приключваме търсенето. Намерихме, че $f("+index+")=l+1="+(l+1)+"$.",
                                endFunction: () => {
                                    MathJax.typeset([".failureExample .anim-func"]);
                                }
                            });
                            break;
                        }
                        animations.push({
                            animFunctions: [textAnimation(animFunc,makeBlueRegions(s,index,0,l-1,index-l,index-1),-1),
                                            textAnimation(animFunc2,makeOrangeRegions(s,index,l-f[l-1],l-1,index-f[l-1],index-1),-1),],
                            animText: "Понеже са различни, то се връщаме на по-предна позиция $l-1="+(l-1)+"$, получена от префикса, съответстващ на най-дългия добър суфикс на предната позиция $"+pos+"$."+
                            ((f[l-1]>0)?" Изобразен е също най-дългият добър суфикс на новата позиция $"+(l-1)+"$, който е и суфикс на позиция $i-1="+(index-1)+"$.":""),
                            endFunction: () => {
                                MathJax.typeset([".failureExample .anim-func"]);
                                MathJax.typeset([".failureExample .anim-func2"]);
                            }
                        });
                        pos=l-1;
                    }
                    if (pos<0) {
                        animations.push({
                            animFunctions: [textAnimation(animFunc,"$"+s.substr(0,index+1)+"$",-1),
                                            textAnimation(animFunc2,"",-1)],
                            animText: "Накрая стигнахме до позиция $-1$, съответстваща на празния префикс. Понеже не срещнахме равенство, то се получава, че $f("+index+")=0$.",
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
		                                  <label for="index" class="col-auto col-form-label pe-0 unselectable">$i$:</label>
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
                f=calcFailureFunction(s);
                makeFailureTable(s,f,"failureTable");
            }).click();
            $(".failureExample .model").on("keydown",isSmallLatinLetter);
        }
        else if (part===3) {
            let model=$(".KMPExample .model"),text=$(".KMPExample .text");
            let svgModel,svgText;
            let s,t,f;
            let snap=Snap(".KMPExample .text-animation");
            let fontSize=25;
            let animationObj=new Animation();
            $(".KMPExample .default").on("click", function () {
                model.val("ababac");
                text.val("abababac");
                makeFailureTable(model.val(),calcFailureFunction(model.val()),"failureTable2");
                snap.selectAll("*").remove();
                loadFontData().then(() => {
                    let y;
                    [svgText, y]=createText(text.val(),5,0,snap,fontSize);
                    [svgModel, y]=createText(model.val(),5,y+20,snap,fontSize);
                }, () => { alert("Load font data error!") });
                animationObj.init(".KMPExample",function findAnimations () {
                    if (s.length===0) {
                        alert("Шаблонът трябва да има ненулева дължина!");
                        return [];
                    }
                    if (t.length===0) {
                        alert("Текстът трябва да има ненулева дължина!");
                        return [];
                    }
                    
                    let animations=[];
                    let pos=0,matched=0;
                    for (;;) {
                        if (pos+s.length>t.length) {
                            animations.push({
                                animFunctions: [noAnimation()],
                                animText: "Понеже от тази позиция нататък няма достатъчно символи, то изчерпихме текста и приключваме търсенето на шаблона с неуспех."
                            });
                            break;
                        }
                        animations.push({
                            animFunctions: [noAnimation((pos===0)?1:2)],
                            animText: (pos===0)?"Започваме търсенето на шаблона в текста от позиция $pos=1$ в текста.":
                            "Търсим шаблона в текста от позиция $pos="+(pos+1)+"$, като вече знаем, че първите "+(matched)+" символа съвпадат."
                        });
                        let j;
                        for (j=matched; j<s.length; j++) {
                            let pos1=pos,j1=j;
                            animations.push({
                                startFunction: function () {
                                    svgText[pos1+j1].attr("text-decoration","underline");
                                    svgModel[j1].attr("text-decoration","underline");
                                    return function () {
                                        svgText[pos1+j1].attr("text-decoration","");
                                        svgModel[j1].attr("text-decoration","");
                                    };
                                },
                                animFunctions: [attrChangesAnimation(svgText[pos+j],{"fill": "orange"},2),
                                                attrChangesAnimation(svgModel[j],{"fill": "orange"},2)],
                                animText: "Сравняваме символа на позиция "+(pos+j+1)+" в текста със символа на позиция "+(j+1)+" в шаблона.",
                                
                            });
                            if (s[j]!==t[pos+j]) {
                                animations.push({
                                    animFunctions: [attrChangesAnimation(svgText[pos+j],{"fill": "red"},2),
                                                    attrChangesAnimation(svgModel[j],{"fill": "red"},2)],
                                    animText: "Понеже символите са различни, то прекъсваме търсенето на шаблона в текста от тази позиция и ще изчислим на коя следваща позиция $pos$ в текста, трябва да се преместим.",
                                    endFunction : function () {
                                        svgText[pos1+j1].attr("text-decoration","");
                                        svgModel[j1].attr("text-decoration","");
                                        return function () {
                                            svgText[pos1+j1].attr("text-decoration","underline");
                                            svgModel[j1].attr("text-decoration","underline");
                                        };
                                    }    
                                });
                                break;
                            }
                            animations.push({
                                animFunctions: [attrChangesAnimation(svgText[pos+j],{"fill": "green"}),
                                                attrChangesAnimation(svgModel[j],{"fill": "green"})],
                                animText: "Понеже символите са равни, "+((j===s.length-1)?"то намерихме пълно съвпадение на шаблона с текста на позиция $pos="+(pos+1)+"$.":" продължаваме напред сравняването."),
                                endFunction : function () {
                                    svgText[pos1+j1].attr("text-decoration","");
                                    svgModel[j1].attr("text-decoration","");
                                    return function () {
                                        svgText[pos1+j1].attr("text-decoration","underline");
                                        svgModel[j1].attr("text-decoration","underline");
                                    };
                                }    
                            });
                        }
                        if (j===s.length) break;
                        if (j>0) {
                            let r1,r2,pos1=pos;
                            function makeRectangles () {
                                let ind1=f[j-1]-1;
                                r1=snap.rect(
                                    svgText[pos1].getBBox().x-0.5,svgModel[0].getBBox().y-5,
                                    svgModel[ind1].getBBox().x2-svgModel[0].getBBox().x+1,
                                    svgModel[ind1].getBBox().y2-svgModel[0].getBBox().y+10,5
                                );
                                r1.attr({
                                    "fill": "none",
                                    "stroke": "blue",
                                    "stroke-width": 2
                                });
                                let ind3=j-1,ind2=ind3-f[j-1]+1;
                                r2=snap.rect(
                                    svgText[pos1+ind2].getBBox().x-0.5,svgModel[ind2].getBBox().y-((ind2<=ind1)?10:5),
                                    svgModel[ind3].getBBox().x2-svgModel[ind2].getBBox().x+1,
                                    svgModel[ind3].getBBox().y2-svgModel[ind2].getBBox().y+((ind2<=ind1)?20:10),5
                                );
                                r2.attr({
                                    "fill": "none",
                                    "stroke": "blue",
                                    "stroke-width": 2
                                });   
                            }
                            animations.push({
                                startFunction: function () {
                                    makeRectangles();
                                    return function () {
                                        r1.remove();
                                        r2.remove();
                                    };
                                },
                                animFunctions: [attrChangesAnimation(svgText[pos+j],{"fill": "black"},2),
                                                attrChangesAnimation(svgModel[j],{"fill": "black"},2)],
                                animText: "За да видим следващата удачна позиция в текста, гледаме функцията на неуспеха на шаблона за съвпадащия префикс с дължина "+j+". Имаме, че $f("+(j-1)+")="+f[j-1]+"$."
                            });
                            let funcs=[];
                            for (let i=pos; i<pos+j-1-f[j-1]+1; i++) {
                                funcs.push(attrChangesAnimation(svgText[i],{"fill": "black"},2));
                            }
                            for (let i=f[j-1]; i<j; i++) {
                                funcs.push(attrChangesAnimation(svgModel[i],{"fill": "black"},2));
                            }
                            funcs.push(translateAnimation(svgModel,svgText[pos+j-1-f[j-1]+1].attr("x")-5,0,2));
                            animations.push({
                                startFunction: function () {
                                    r1.remove();
                                    r2.remove();
                                    return function () {
                                        makeRectangles();
                                    }
                                },
                                animFunctions: funcs,
                                animText: "Следващата позиция, от която ще пробваме да намерим шаблона е равна на $pos=pos+"+j+"-f("+(j-1)+")+1="+(pos+j-f[j-1]+1)+"$. Освен това знаем, че от тази позиция първите "+f[j-1]+" символа съвпадат, защото се преместихме на добър суфикс."
                            });
                            matched=f[j-1];
                            pos=pos+j-1-matched+1;
                        }
                        else {
                            matched=0;
                            pos++;
                            animations.push({
                                animFunctions: [attrChangesAnimation(svgText[pos-1],{"fill": "black"},2),
                                                attrChangesAnimation(svgModel[0],{"fill": "black"},2),
                                                translateAnimation(svgModel,svgText[pos].attr("x")-5,0,2)],
                                animText: "Понеже още първия символ на шаблона се различаваше с текста, то ще търсим шаблона в текста на следващата позиция $pos="+(pos+1)+"."
                            });
                        }
                    }
                    return animations;
                },function startFunc () {
                    snap.selectAll("*").remove();
                    t=text.val();
                    s=model.val();
                    f=calcFailureFunction(s);
                    let y;
                    [svgText, y]=createText(t,5,0,snap,fontSize);
                    [svgModel, y]=createText(s,5,y+20,snap,fontSize);    
                },function stopFunc () {
                    makeFailureTable(model.val(),calcFailureFunction(model.val()),"failureTable2");
                });
            }).click();
            model.on("keydown",isSmallLatinLetter);
            text.on("keydown",isSmallLatinLetter);
            model.off("input").on("input",() => {
                if (animationObj.startedAnimation()===false)
                    makeFailureTable(model.val(),calcFailureFunction(model.val()),"failureTable2");
            });
        }
    }
    
    
    window.initExample = initExample;
})();
