"use strict";
(function () {
    function addChange (change, t, undoStack) {
        if (typeof change!=="function") return ;
        undoStack.push({
            time: t,
            action: change
        });
    }
    function skipAnimation (animations, index, undoStack, flagStarted = false) {
        if ((flagStarted===false)&&(animations[index].hasOwnProperty("startFunction")===true))
            addChange(animations[index].startFunction(),index,undoStack);
        for (let animation of animations[index].animFunctions) {
            animation(() => {},0,undoStack,index);
        }
        if (animations[index].hasOwnProperty("endFunction")===true) addChange(animations[index].endFunction(),index,undoStack);
    }

    function Animation () {
        let startButton,pauseButton,finishButton;
        let previousButton,nextButton;
        
        let flagStart,flagPause,flagStep;
        let animations=[];
        function startButtonFunc (findAnimations, isStatic, startButtonName, stopButtonName) {
            if (flagStart===false) {
                this.startFunc();
                stopAnimations();
                animations=findAnimations();
                if (animations.length===0) {
                    this.stopFunc();
                    return ;
                }
                if (isStatic===false) {
                    animations.push({
                        animFunctions: [],
                        animText: ""
                    });
                }
                
                flagStart=true; startButton.html(stopButtonName);
                if (this.finishFunc!==emptyFunc) finishButton.show();
                
                if (isStatic===false) {
                    speedObj.hide();
                    if (speedInput.val()==="") speed=4000/2;
                    else speed=4000/parseInt(speedInput.val());
                }
                
                animText.show();
                animText.css("height","auto");
                let maxH=0;
                for (let animation of animations) {
                    animText.text(animation.animText);
                    if (typeof MathJax!=="undefined") MathJax.typeset([name+" .anim-text"]);
                    if (maxH<animText.height()) maxH=animText.height();
                }
                animText.text("");
                animText.height(maxH);

                if (isStatic===false) {
                    pauseButton.show();
                    flagPause=false; flagStep=false;
                    pauseButton.html("Пауза");
                }

                previousButton.show();
                nextButton.show();

                this.start();
            }
            else finishButtonFunc.call(this,false,isStatic,startButtonName);
        }
        function finishButtonFunc (flagFinish, isStatic, startButtonName) {
            stopAnimations();
            for (;;) {
                if (undoStack.length===0) break;
                undoStack[undoStack.length-1].action();
                undoStack.pop();
            }
            
            flagStart=false; startButton.html(startButtonName);
            if (isStatic===false) {
                speedObj.show();
                if (speedInput.val()==="") speedInput.val("2");
            }
            animText.hide();

            this.clear();
            this.stopFunc();
            if (flagFinish===true) this.finishFunc();
        }
        function pauseButtonFunc () {
            if (flagPause===false) {
                flagPause=true; $(this).html("Пусни");
                if (minas!==undefined) {
                    cleanMinas();
                    for (let mina of minas) {
                        mina.pause();
                    }
                }
            }
            else {
                flagPause=false; $(this).html("Пaуза");
                if (minas!==undefined) {
                    cleanMinas();
                    for (let mina of minas) {
                        mina.resume();
                    }
                }
                if (flagStep===true) animFuncs[currAnimation]();
                flagStep=false;
            }
        }
        function stepButtonFunc (step, isStatic) {
            if (currAnimation!==undefined) {
                let flagStarted=!flagStep;
                if (isStatic===false) {
                    flagPause=false; flagStep=true;
                    pauseButton[0].click();
                    stopAnimations();
                }
                let animLen=animations.length;
                if ((step===-1)&&(currAnimation===0)) currAnimation=1;
                else if ((step===+1)&&(currAnimation===animLen-1)) currAnimation=animLen-2;

                if (isStatic===false) {
                    if (step===+1) {
                        skipAnimation(animations,currAnimation,undoStack,flagStarted);
                        currAnimation++;
                    }
                    else {
                        for (;;) {
                            if (undoStack.length===0) break;
                            if (undoStack[undoStack.length-1].time<currAnimation-1) break;
                            undoStack[undoStack.length-1].action();
                            undoStack.pop();
                        }
                        currAnimation--;
                    }
                    if (currAnimation==animLen-1) pauseButton.hide();
                    else pauseButton.show();
                }
                else {
                    if (step===+1) {
                        currAnimation++;
                        skipAnimation(animations,currAnimation,undoStack);
                    }
                    else {
                        for (;;) {
                            if (undoStack.length===0) break;
                            if (undoStack[undoStack.length-1].time<currAnimation) break;
                            undoStack[undoStack.length-1].action();
                            undoStack.pop();
                        }
                        currAnimation--;
                        skipAnimation(animations,currAnimation,undoStack);
                    }
                }
                if ((isStatic===true)||(currAnimation<animLen)) {
                    animText.text(animations[currAnimation].animText);
                    if (typeof MathJax!=="undefined") MathJax.typeset([name+" .anim-text"]);
                }
            }
        }
        
        let emptyFunc = () => {};
        let speed,speedObj,speedInput,animText;
        this.startFunc=undefined; this.stopFunc=undefined; this.finishFunc=undefined;
        this.isStatic=false;
        this.startButtonName="Старт!"; this.stopButtonName="Стоп";
        this.setParameters = function (isStatic = false, startButtonName = "Старт!", stopButtonName = "Стоп") {
            this.isStatic=isStatic;
            this.startButtonName=startButtonName;
            this.stopButtonName=stopButtonName;
        }
        this.name=undefined;
        this.init = async function (name, findAnimations, start = emptyFunc, stop = emptyFunc, finish = emptyFunc) {
            this.name=name;
            let isStatic=this.isStatic;
            let startButtonName=this.startButtonName;
            let stopButtonName=this.stopButtonName;
            function initialWork () {
                speed=2000;

                startButton=$(name+" .animation-panel .start");
                pauseButton=$(name+" .animation-panel .pause");
                finishButton=$(name+" .animation-panel .finish");
                previousButton=$(name+" .animation-panel .previous");
                nextButton=$(name+" .animation-panel .next");
                speedObj=$(name+" .animation-panel .speed-wrapper");
                speedInput=$(name+ " .animation-panel .speed");
                animText=$(name+" .anim-text");
            }
            function otherWork () {
                this.startFunc=(start===undefined)?emptyFunc:start;
                this.stopFunc=(stop===undefined)?emptyFunc:stop;
                this.finishFunc=(finish===undefined)?emptyFunc:finish;
                animText.hide();
                this.clear();
                if (isStatic===false) {
                    $(name+" .animation-panel .speed").val("2");
                    $(name+" .animation-panel .speed").on("keydown",isDigit);
                }
                startButton.flag=false;
                startButton.off("click").on("click",startButtonFunc.bind(this,findAnimations,isStatic,startButtonName,stopButtonName));
                pauseButton.off("click").on("click",pauseButtonFunc);
                finishButton.off("click").on("click",finishButtonFunc.bind(this,true,startButtonName));
                previousButton.off("click").on("click",stepButtonFunc.bind(this,-1,isStatic));
                nextButton.off("click").on("click",stepButtonFunc.bind(this,+1,isStatic));
            }
            
            return new Promise((resolve, reject) => {
                if ($(name+" .animation-panel").html().length===0) {
                    $.get("/algo-site/pages/animation_panel.html", function (data) {
                        $(name+" .animation-panel").html(data);
                        initialWork();
                        otherWork.call(this);
                    }.bind(this)).then(resolve, () => { alert("Load data error!") });
                }
                else {
                    otherWork.call(this);
                    resolve();
                }
            });
        }

        let minas,currAnimation;
        let undoStack;
        this.addChange = function (change) {
            undoStack.push({
                time: currAnimation,
                action: change
            });
        }
        let animFuncs;
        this.start = function () {
            currAnimation=0;
            undoStack=[];
            if (this.isStatic===true) {
                skipAnimation(animations,0,undoStack);
                animText.text(animations[0].animText);
                if (typeof MathJax!=="undefined") MathJax.typeset([name+" .anim-text"]);    
                return ;
            }
            minas=[];
            animFuncs=[];
            for (let i=animations.length-1; i>=0; i--) {
                let index=i;
                animFuncs[i] = function () {
                    let i=index;
                    if ((currAnimation<i-1)||(currAnimation>i)) {
                        return ;
                    }
                    currAnimation=i;
                    animText.text(animations[i].animText);
                    if (typeof MathJax!=="undefined") MathJax.typeset([name+" .anim-text"]);
                    if (i===animations.length-1) pauseButton.hide();

                    if (animations[i].hasOwnProperty("startFunction")) addChange(animations[i].startFunction(),i,undoStack);
                    for (let j=0; j<animations[i].animFunctions.length; j++) {
                        let isLast=(j===(animations[i].animFunctions.length-1));
                        minas.push(...animations[i].animFunctions[j](function () {
                            if ((this!==undefined)&&(this.removed!==undefined)) return ;
                            if (isLast===true) {
                                if (i<animations.length-1) {
                                    if (animations[i].hasOwnProperty("endFunction")) addChange(animations[i].endFunction(),i,undoStack);
                                    animFuncs[i+1]();
                                }
                            }
                        },speed,undoStack,i));
                    }
                    if (animations[i].animFunctions.length===0) {
                        if (animations[i].hasOwnProperty("endFunction")) addChange(animations[i].endFunction(),i,undoStack);
                        if (i+1<animations.length) animFuncs[i+1]();
                    }
                }
            }
            animFuncs[0]();
        }
        
        this.startedAnimation = function () {
            if (animations.length===0) return false;
            return true;
        }

        function cleanMinas () {
            let tmp=[];
            for (let i=0; i<minas.length; i++) {
                if (minas[i].s!==1) {
                    tmp.push(minas[i]);
                }
            }
            minas=tmp;
        }
        function stopAnimations () {
            if (minas!==undefined) {
                for (let mina of minas) {
                    mina.stop();
                }
                minas=[];
            }
        }

        this.clear = function () {
            stopAnimations();
            animations=[];
            minas=[]; animFuncs=[];
            if (startButton!==undefined) {
                flagStart=false;
                startButton.html(this.startButtonName);
            }
            if (pauseButton!==undefined) pauseButton.hide();
            if (finishButton!==undefined) finishButton.hide();
            if (previousButton!==undefined) previousButton.hide();
            if (nextButton!==undefined) nextButton.hide();
            if (speedObj!==undefined) {
                if (this.isStatic===false) speedObj.show();
                else speedObj.hide();
            }
            
            if (animText!==undefined) {
                animText.text("");
                animText.hide();
            }
        }
    }

    if (typeof Graph==="function") {
        Graph.prototype = {
            edgeAnimation: function (vr1, vr2, ind, speedCoeff = 1) {
                let graph=this;
                if (ind===-1) {
                    for (let [i, edge] of graph.getEdges()) {
                        if ((edge.x===vr1)&&(edge.y===vr2)) {
                            ind=i;
                            break;
                        }
                        if ((graph.isOriented===false)&&(edge.x===vr2)&&(edge.y===vr1)) {
                            ind=i;
                            break;
                        }
                    }
                }
                let lineDraw;
                return function(callback, speed, undoStack, t) {
                    if ((speed>0)&&(speedCoeff!==-1)) {
                        let obj1=graph.svgVertices[vr1];
                        let obj2=graph.svgVertices[vr2];

                        let reverse=false;
                        if ((graph.isDirected===false)&&(graph.getEdge(ind).x!=vr1)) reverse=true;
                        lineDraw=graph.s.path(graph.svgEdges[ind].line.attr("d"));
                        undoStack.push({
                            time: t,
                            action: function () {
                                lineDraw.remove();
                            }
                        });
                        
                        let pathLength=lineDraw.getTotalLength();
                        lineDraw.attr({fill: "none", stroke: "red", "stroke-width": graph.findStrokeWidth()*3});
                        lineDraw.attr({"stroke-dasharray": pathLength, "stroke-dashoffset": pathLength});
                        graph.s.append(obj1.group);
                        graph.s.append(obj2.group);
                        return [Snap.animate(0,pathLength,function (t) {
                            lineDraw.attr({"stroke-dashoffset": ((reverse===true)?(pathLength+t):(pathLength-t))});
                        },speed*speedCoeff,function () {
                            callback.call(lineDraw);
                            lineDraw.remove();
                        })];
                    }
                    else {
                        if (speedCoeff!==-1) setTimeout(callback.bind(this),0);
                        if (lineDraw!==undefined) lineDraw.remove();
                        return [];
                    }
                }
            },
        }
    }
    
    function attrChangesAnimation (obj, changes, speedCoeff = 1) {
        return function(callback, speed, undoStack, t) {
            let origProps=[];
            for (let prop in changes) {
                if (changes.hasOwnProperty(prop)===true) {
                    origProps[prop]=obj.attr(prop);
                }
            }
            undoStack.push({
                time: t,
                action: function () {
                    obj.attr(origProps);
                }
            });

            let minas=[];
            if ((speed>0)&&(speedCoeff!==-1)) {
                obj.animate(changes,speed*speedCoeff,callback);
                for (let anim of obj.inAnim()) {
                    minas.push(anim.mina);
                }
            }
            else {
                obj.attr(changes);
                if (speedCoeff!==-1) setTimeout(callback.bind(this),0);
            }
            return minas;
        }
    }
    function translateAnimation (obj, dx, dy, speedCoeff = 1) {
        return function(callback, speed, undoStack, t) {
            let origTranslate="t0 0";
            if (typeof obj._.transform==="string") origTranslate=obj._.transform;
            undoStack.push({
                time: t,
                action: function () {
                    obj.transform(origTranslate);
                }
            });

            let minas=[];
            if ((speed>0)&&(speedCoeff!==-1)) {
                obj.animate({"transform": "t"+dx+" "+dy},speed*speedCoeff,callback);
                for (let anim of obj.inAnim()) {
                    minas.push(anim.mina);
                }
            }
            else {
                obj.transform("t"+dx+" "+dy);
                if (speedCoeff!==-1) setTimeout(callback.bind(this),0);
            }
            return minas;
        }
    }
    function textAnimation (textField, text, speedCoeff = 1) {
        return function(callback, speed, undoStack, t) {
            let origText=textField.text();
            textField.text(text);
            if ((speed>0)&&(speedCoeff!==-1)) {
                setTimeout(() => {
                    callback.call();
                },speed*speedCoeff);
                return [];
            }
            else {
                if (speedCoeff!==-1) setTimeout(callback,0);
            }
            return [];
        }
    }
    function noAnimation (speedCoeff = 1) {
        return function(callback, speed, undoStack, t) {
            let minas=[];
            if ((speed>0)&&(speedCoeff!==-1)) minas.push(Snap.animate(0,0,() => {},speed*speedCoeff,callback));
            else setTimeout(callback,0);
            return minas;
        }
    }
    
    
    window.Animation = Animation;
    window.translateAnimation = translateAnimation;
    window.attrChangesAnimation = attrChangesAnimation;
    window.textAnimation = textAnimation;
    window.noAnimation = noAnimation;
})();