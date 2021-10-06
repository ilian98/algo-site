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
        this.startButton=undefined; this.pauseButton=undefined;
        this.previousButton=undefined; this.nextButton=undefined;
        
        let flagStart,flagPause,flagStep;
        let animations;
        function startButtonFunc (globalObj, name, findAnimations, initialState) {
            stopAnimations();
            initialState();

            let speedInput=$(name+" .speed");

            if (flagStart===false) {
                animations=findAnimations();
                if (animations.length===0) return ;
                animations.push({
                    animFunctions: [],
                    animText: ""
                });

                if ($(".dropdown-menu.save-menu").length!==0) {
                    $(".dropdown-menu.save-menu .txt").hide();
                    $(".dropdown-menu.save-menu .edge-list").hide();
                }
                flagStart=true; this.html("Стоп");
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

                globalObj.pauseButton.show();
                flagPause=false; flagStep=false;
                globalObj.pauseButton.html("Пауза");

                globalObj.previousButton.show();
                globalObj.nextButton.show();

                globalObj.start();
            }
            else {
                if ($(".dropdown-menu.save-menu").length!==0) {
                    $(".dropdown-menu.save-menu .txt").show();
                    $(".dropdown-menu.save-menu .edge-list").show();
                }
                flagStart=false; this.html("Старт!");
                speedObj.show();
                if (speedInput.val()==="") speedInput.val("2");
                animText.hide();

                globalObj.clear();
            }
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
        function stepButtonFunc (pauseButton, initialState, step) {
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
        
        let speed,speedObj,animText;
        this.init = function (name, findAnimations, initialState) {
            speed=2000;

            let startButton=this.startButton=$(name+" .start");
            let pauseButton=this.pauseButton=$(name+" .pause");
            let previousButton=this.previousButton=$(name+" .previous");
            let nextButton=this.nextButton=$(name+" .next");
            speedObj=$(name+" .speed-wrapper");
            animText=$(name+" .anim-text");
            animText.hide();

            this.clear();
            $(name+" .speed").val("2");
            $(name+" .speed").on("keydown",isDigit);
            startButton.flag=false; startButton.off("click.start").on("click.start",startButtonFunc.bind(startButton,this,name,findAnimations,initialState));
            pauseButton.off("click.pause").on("click.pause",pauseButtonFunc);
            previousButton.off("click.prev").on("click.prev",stepButtonFunc.bind(previousButton,pauseButton,initialState,-1));
            nextButton.off("click.next").on("click.next",stepButtonFunc.bind(nextButton,pauseButton,initialState,+1));
        }

        let minas,currAnimation;
        let animFuncs;
        this.start = function () {
            minas=[]; currAnimation=0;
            let pauseButton=this.pauseButton;
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
            if (this.startButton!==undefined) {
                flagStart=false;
                this.startButton.html("Старт!");
            }
            if (this.pauseButton!==undefined) this.pauseButton.hide();
            if (this.previousButton!==undefined) this.previousButton.hide();
            if (this.nextButton!==undefined) this.nextButton.hide();
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
            edgeAnimation: function (vr1, vr2, speedCoeff = 1) {
                let graph=this;
                return function(callback, speed) {
                    if (speed>0) {
                        let obj1=graph.svgVertices[vr1];
                        let obj2=graph.svgVertices[vr2];

                        let ind=graph.edgeList.findIndex(function (e) { return ((e!==undefined)&&(e.x==vr1)&&(e.y==vr2)); });
                        let reverse=false;
                        if ((ind==-1)&&(graph.isDirected===false)) {
                            reverse=true;
                            ind=graph.edgeList.findIndex(function (e) { return ((e!==undefined)&&(e.x==vr2)&&(e.y==vr1)); });
                        }
                        let lineDraw=graph.s.path(graph.svgEdges[ind].line.attr("d"));
                        let pathLength=lineDraw.getTotalLength();
                        lineDraw.attr({fill: "none", stroke: "red", "stroke-width": graph.vertexRad/20*4});
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
            }
        }
    }
    
    
    window.Animation = Animation;
})();