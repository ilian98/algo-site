'use strict';
function startButtonFunc (globalObj, name, findAnimations, initialState) {
    globalObj.stopAnimations();
    initialState(true);
    
    let speed=$(name+" .form-group");
    let speedInput=$(name+" .speed");
    
    if (this.flag===false) {
        this.flag=true; this.html("Стоп");
                
        speed.hide();
        if (speedInput.val()=="") globalObj.speed=4000/2;
        else globalObj.speed=4000/speedInput.val();
            
        globalObj.pauseButton.show();
        globalObj.pauseButton.flagPause=false; globalObj.pauseButton.flagStep=false;
        globalObj.pauseButton.html("Пауза");
        
        globalObj.previousButton.show();
        globalObj.nextButton.show();
        
        globalObj.animations=findAnimations();
        globalObj.animations.push({
            animFunctions: [],
            animText: ""
        });
        globalObj.start();
    }
    else {
        this.flag=false; this.html("Старт!");
        speed.show();
        if (speedInput.val()==="") speedInput.val("2");
                
        globalObj.clear();
    }
}
function pauseButtonFunc (globalObj) {
    if (this.flagPause===false) {
        this.flagPause=true; this.html("Пусни");
        if (globalObj.minas!==undefined) {
            for (let mina of globalObj.minas) {
                mina.pause();
            }
        }
    }
    else {
        this.flagPause=false; this.html("Пaуза");
        if (globalObj.minas!==undefined) {
            for (let mina of globalObj.minas) {
                mina.resume();
            }
        }
        if (this.flagStep===true) globalObj.animFuncs[globalObj.currAnimation]();
        this.flagStep=false;
    }
}

function animationsUntilStep (animations, step) {
    for (let i=0; i<step; i++) {
        if (animations[i].hasOwnProperty("startFunction")) animations[i].startFunction();
        for (let animation of animations[i].animFunctions) {
            animation(() => {},0);
        }
    }
}
function stepButtonFunc (globalObj, initialState, step) {
    let currAnimation=globalObj.currAnimation;
    if (currAnimation!==undefined) {
        globalObj.pauseButton.flagPause=false; globalObj.pauseButton.flagStep=true;
        globalObj.pauseButton[0].click();
        globalObj.stopAnimations();
        initialState(false);
        let animLen=globalObj.animations.length;
        if ((step==-1)&&(globalObj.currAnimation==0)) globalObj.currAnimation=currAnimation=1;
        else if ((step==+1)&&(globalObj.currAnimation==animLen-1)) globalObj.currAnimation=animLen-2;
        
        globalObj.currAnimation+=step;
        if (globalObj.currAnimation==animLen-1) globalObj.pauseButton.hide();
        else globalObj.pauseButton.show();
    
        animationsUntilStep(globalObj.animations,currAnimation+step);
        if (currAnimation+step<animLen) globalObj.animText.text(globalObj.animations[currAnimation+step].animText);
    }
}

function Animation () {
    
    this.speed=undefined;
    this.animText=undefined;
    this.startButton=undefined; this.pauseButton=undefined;
    this.previousButton=undefined; this.nextButton=undefined;
    
    this.animations=undefined;
    this.init = function (name, findAnimations, initialState) {
        this.speed=2000;
        
        let startButton=this.startButton=$(name+" .start");
        let pauseButton=this.pauseButton=$(name+" .pause");
        let previousButton=this.previousButton=$(name+" .previous");
        let nextButton=this.nextButton=$(name+" .next");
        let animText=this.animText=$(name+" .anim-text");
    
        this.clear();
        $(name+" .speed").val("2");
        startButton.flag=false; startButton.off("click.start").on("click.start",startButtonFunc.bind(startButton,this,name,findAnimations,initialState));
        pauseButton.off("click.pause").on("click.pause",pauseButtonFunc.bind(pauseButton,this));
        previousButton.off("click.prev").on("click.prev",stepButtonFunc.bind(previousButton,this,initialState,-1));
        nextButton.off("click.next").on("click.next",stepButtonFunc.bind(nextButton,this,initialState,+1));
    }
    
    this.minas=undefined; this.currAnimation=undefined;
    this.animFuncs=undefined;
    this.start = function () {
        let speed=parseInt(this.speed);
        this.minas=[]; this.currAnimation=0;
        let animations=this.animations;
        let globalObj=this;
        let animFuncs=this.animFuncs=[];
        for (let i=animations.length-1; i>=0; i--) {
            let index=i;
            animFuncs[i] = function () {
                let i=index;
                if ((globalObj.currAnimation<i-1)||(globalObj.currAnimation>i)) {
                    return ;
                }
                globalObj.currAnimation=i;
                globalObj.animText.text(animations[i].animText);
                if (i===animations.length-1) globalObj.pauseButton.hide();
                
                if (animations[i].hasOwnProperty("startFunction")) animations[i].startFunction();
                for (let j=0; j<animations[i].animFunctions.length; j++) {
                    let isLast=(j==animations[i].animFunctions.length-1);
                    globalObj.minas.push(animations[i].animFunctions[j](function () {
                        if (isLast==true) {
                            if (i<animations.length-1) animFuncs[i+1]();
                        }
                    },speed));
                }
            }
        }
        animFuncs[0]();
    };
    
    this.stopAnimations = function () {
        if (this.minas!==undefined) {
            for (let mina of this.minas) {
                mina.stop();
            }
        }
    }
    
    this.clear = function () {
        this.stopAnimations();
        this.animations=[];
        this.minas=[]; this.animFuncs=[];
        if (this.startButton!==undefined) {
            this.startButton.flag=false;
            this.startButton.html("Старт!");
        }
        if (this.pauseButton!==undefined) this.pauseButton.hide();
        if (this.previousButton!==undefined) this.previousButton.hide();
        if (this.nextButton!==undefined) this.nextButton.hide();
        if (this.animText!==undefined) this.animText.text("");
    }
}