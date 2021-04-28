function pauseButtonFunc (globalObj) {
    if (this.flagPause===false) {
        this.flagPause=true; this.innerText="Пусни";
        if (globalObj.minas!==undefined) {
            for (let mina of globalObj.minas) {
                mina.pause();
            }
        }
    }
    else {
        this.flagPause=false; this.innerText="Пaуза";
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
        for (let animation of animations[i].animFunctions) {
            animation(() => {},0);
        }
    }
}
function stepButtonFunc (globalObj, initialState, step) {
    let currAnimation=globalObj.currAnimation;
    if (currAnimation!==undefined) {
        globalObj.pauseButton.flagPause=false; globalObj.pauseButton.flagStep=true;
        globalObj.pauseButton.click();
        globalObj.stopAnimations();
        initialState(false);
        let animLen=globalObj.animations.length;
        if ((step==-1)&&(globalObj.currAnimation==0)) globalObj.currAnimation=currAnimation=1;
        else if ((step==+1)&&(globalObj.currAnimation==animLen-1)) globalObj.currAnimation=animLen-2;
        globalObj.currAnimation+=step;
        animationsUntilStep(globalObj.animations,currAnimation+step);
        if (currAnimation+step<animLen) globalObj.animText.innerText=globalObj.animations[currAnimation+step].animText;
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
        
        let startButton=this.startButton=document.querySelector(name+" .start");
        let pauseButton=this.pauseButton=document.querySelector(name+" .pause");
        let previousButton=this.previousButton=document.querySelector(name+" .previous");
        let nextButton=this.nextButton=document.querySelector(name+" .next");
        let animText=this.animText=document.querySelector(name+" .anim-text");
    
        let speed=document.querySelector(name+" .form-group");
        let speedInput=document.querySelector(name+" .speed");
        speedInput.value="2";
    
        this.clear();
        let globalObj=this;
        startButton.flag=false;
        startButton.onclick = function () {
            globalObj.stopAnimations();
            initialState(true);
            
            if (this.flag===false) {
                this.flag=true; this.innerText="Стоп";
                
                speed.style.display="none";
                if (speedInput.value==="") globalObj.speed=4000/2;
                else globalObj.speed=4000/speedInput.value;
            
                pauseButton.style.display="block";
                pauseButton.flagPause=false; pauseButton.flagStep=false;
                pauseButton.innerText="Пауза";
                pauseButton.onclick=pauseButtonFunc.bind(pauseButton,globalObj);
            
                previousButton.style.display="block";
                previousButton.onclick=stepButtonFunc.bind(previousButton,globalObj,initialState,-1);
            
                nextButton.style.display="block";
                nextButton.onclick=stepButtonFunc.bind(nextButton,globalObj,initialState,+1);
                
                globalObj.animations=findAnimations();
                globalObj.start();
            }
            else {
                this.flag=false; this.innerText="Старт!";
                speed.style.display="block";
                if (speedInput.value==="") speedInput.value="2";
                
                globalObj.clear();
            }
        }
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
                globalObj.animText.innerText=animations[i].animText;
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
        this.startButton.flag=false; this.startButton.innerText="Старт!";
        this.pauseButton.style.display="none";
        this.previousButton.style.display="none"; this.nextButton.style.display="none";
        this.animText.innerText="";
    }
}