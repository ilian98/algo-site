"use strict";
(function () {
    function animationsUntilStep (animations, step) {
        for (let i=0; i<step; i++) {
            if (animations[i].hasOwnProperty("startFunction")) animations[i].startFunction();
            for (let animation of animations[i].animFunctions) {
                animation(() => {},0);
            }
            if (animations[i].hasOwnProperty("endFunction")) animations[i].endFunction();
        }
    }

    function Animation () {
        let startButton,pauseButton,finishButton;
        let previousButton,nextButton;
        
        let flagStart,flagPause,flagStep;
        let animations;
        function startButtonFunc (findAnimations, initialState) {
            if (flagStart===false) {
                this.startFunc();
                stopAnimations();
                initialState();
                
                animations=findAnimations();
                if (animations.length===0) return ;
                animations.push({
                    animFunctions: [],
                    animText: ""
                });

                flagStart=true; startButton.html("Стоп");
                if (this.finishFunc!==emptyFunc) finishButton.show();
                
                speedObj.hide();
                if (speedInput.val()==="") speed=4000/2;
                else speed=4000/parseInt(speedInput.val());
                
                animText.show();
                animText.css("height","auto");
                let maxH=0;
                for (let animation of animations) {
                    animText.text(animation.animText);
                    if (maxH<animText.height()) maxH=animText.height();
                }
                animText.text("");
                animText.height(maxH);

                pauseButton.show();
                flagPause=false; flagStep=false;
                pauseButton.html("Пауза");

                previousButton.show();
                nextButton.show();

                this.start();
            }
            else finishButtonFunc.call(this,false,initialState);
        }
        function finishButtonFunc (flagFinish, initialState) {
            stopAnimations();
            initialState();
            
            flagStart=false; startButton.html("Старт!");
            speedObj.show();
            if (speedInput.val()==="") speedInput.val("2");
            animText.hide();

            this.clear();
            this.stopFunc();
            if (flagFinish===true) this.finishFunc();
        }
        function pauseButtonFunc () {
            if (flagPause===false) {
                flagPause=true; $(this).html("Пусни");
                if (minas!==undefined) {
                    for (let mina of minas) {
                        mina.pause();
                    }
                }
            }
            else {
                flagPause=false; $(this).html("Пaуза");
                if (minas!==undefined) {
                    for (let mina of minas) {
                        mina.resume();
                    }
                }
                if (flagStep===true) animFuncs[currAnimation]();
                flagStep=false;
            }
        }
        function stepButtonFunc (initialState, step) {
            if (currAnimation!==undefined) {
                flagPause=false; flagStep=true;
                pauseButton[0].click();
                stopAnimations();
                initialState();
                let animLen=animations.length;
                if ((step===-1)&&(currAnimation===0)) currAnimation=1;
                else if ((step===+1)&&(currAnimation===animLen-1)) currAnimation=animLen-2;

                currAnimation+=step;
                if (currAnimation==animLen-1) pauseButton.hide();
                else pauseButton.show();

                animationsUntilStep(animations,currAnimation);
                if (currAnimation<animLen) animText.text(animations[currAnimation].animText);
            }
        }
        
        let emptyFunc = () => {};
        let speed,speedObj,speedInput,animText;
        this.startFunc=undefined; this.stopFunc=undefined; this.finishFunc=undefined;
        this.init = async function (name, findAnimations, initialState, start = emptyFunc, stop = emptyFunc, finish = emptyFunc) {
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
                this.startFunc=start; this.stopFunc=stop; this.finishFunc=finish;
                animText.hide();
                this.clear();
                $(name+" .animation-panel .speed").val("2");
                $(name+" .animation-panel .speed").on("keydown",isDigit);
                startButton.flag=false; startButton.off("click").on("click",startButtonFunc.bind(this,findAnimations,initialState));
                pauseButton.off("click").on("click",pauseButtonFunc);
                finishButton.off("click").on("click",finishButtonFunc.bind(this,true,initialState));
                previousButton.off("click").on("click",stepButtonFunc.bind(this,initialState,-1));
                nextButton.off("click").on("click",stepButtonFunc.bind(this,initialState,+1));
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
                    otherWork.bind(this);
                    resolve();
                }
            });
        }

        let minas,currAnimation;
        let animFuncs;
        this.start = function () {
            minas=[]; currAnimation=0;
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
                    if (i===animations.length-1) pauseButton.hide();

                    if (animations[i].hasOwnProperty("startFunction")) animations[i].startFunction();
                    for (let j=0; j<animations[i].animFunctions.length; j++) {
                        let isLast=(j===(animations[i].animFunctions.length-1));
                        minas.push(...animations[i].animFunctions[j](function () {
                            if (this.removed!==undefined) return ;
                            if (isLast===true) {
                                if (i<animations.length-1) {
                                    if (animations[i].hasOwnProperty("endFunction")) animations[i].endFunction();
                                    animFuncs[i+1]();
                                }
                            }
                        },speed));
                    }
                }
            }
            animFuncs[0]();
        };

        function stopAnimations () {
            if (minas!==undefined) {
                for (let mina of minas) {
                    mina.stop();
                }
            }
        }

        this.clear = function () {
            stopAnimations();
            animations=[];
            minas=[]; animFuncs=[];
            if (startButton!==undefined) {
                flagStart=false;
                startButton.html("Старт!");
            }
            if (pauseButton!==undefined) pauseButton.hide();
            if (finishButton!==undefined) finishButton.hide();
            if (previousButton!==undefined) previousButton.hide();
            if (nextButton!==undefined) nextButton.hide();
            if (speedObj!==undefined) speedObj.show();
            if (animText!==undefined) {
                animText.text("");
                animText.hide();
            }
        }
    }

    if (typeof Graph==="function") {
        Graph.prototype = {
            vertexAnimation: function (vr, colour, type, speedCoeff = 1) {
                let graph=this;
                return function(callback, speed) {
                    let obj;
                    if (type==="circle") obj=graph.svgVertices[vr].circle;
                    else obj=graph.svgVertices[vr].text;
                    if (speed>0) {
                        obj.animate({fill: colour},speed*speedCoeff,callback);
                        let minas=[];
                        for (let anim of obj.inAnim()) {
                            minas.push(anim.mina);
                        }
                        return minas;
                    }
                    obj.attr({fill: colour});
                }
            },
            edgeAnimation: function (vr1, vr2, ind, speedCoeff = 1) {
                let graph=this;
                return function(callback, speed) {
                    if (speed>0) {
                        let obj1=graph.svgVertices[vr1];
                        let obj2=graph.svgVertices[vr2];

                        let reverse=false;
                        if ((graph.isDirected===false)&&(graph.edgeList[ind].x!=vr1)) reverse=true;
                        let lineDraw=graph.s.path(graph.svgEdges[ind].line.attr("d"));
                        
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
                }
            },
            edgeChangesAnimation: function (vr1, vr2, changes, speedCoeff = 1) {
                let graph=this;
                return function(callback, speed) {
                    let ind=graph.edgeList.findIndex(function (e) { return ((e!==undefined)&&(e.x==vr1)&&(e.y==vr2)); });
                    if ((ind==-1)&&(graph.isDirected===false)) {
                        ind=graph.edgeList.findIndex(function (e) { return ((e!==undefined)&&(e.x==vr2)&&(e.y==vr1)); });
                    }
                    let obj=graph.svgEdges[ind].line;
                    if (speed>0) {
                        obj.animate(changes,speed*speedCoeff,callback);
                        let minas=[];
                        for (let anim of obj.inAnim()) {
                            minas.push(anim.mina);
                        }
                        return minas;
                    }
                    obj.attr(changes);
                }
            }
        }
    }
    
    
    window.Animation = Animation;
})();