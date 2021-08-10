"use strict";
function bit (mask, pos) {
    return mask&(1<<pos)?1:0;
}
function matrix_mult (A, B, C, k) {
    let temp=[];
    for (let i=0; i<k; i++) {
        temp[i] = new Array(k);
    }
    for (let row=0; row<k; row++) {
        for (let col=0; col<k; col++) {
            temp[row][col]=0;
            for (let i=0; i<k; i++) {
                temp[row][col]+=(A[row][i]*B[i][col])%97;
            }
            temp[row][col]%=97;
        }
    }
    for (let row=0; row<k; row++) {
        for (let col=0; col<k; col++) {
            C[row][col]=temp[row][col];
        }
    }
}
function writeMatrix (matr, k, name, textField) {
    let text="\\("+name+"\\begin{pmatrix}";
    for (let i=0; i<k; i++) {
        for (let j=0; j<k; j++) {
            text+=matr[i][j];
            if (j!=k-1) text+=" & ";
            else if (i!=k-1) text+=" \\\\ ";
        }
    }
    text+="\\end{pmatrix}\\)";
    textField.text(text);
}
function calcMatrices () {
    let n=parseInt($(".dpProfileExample .n").val()),m=$(".dpProfileExample .m").val();
    if ((n<1)||(n>3)) {
        alert("Невалидна стойност за n!");
        return ;
    }
    if (m<1) {
        alert("Невалидна стойност за m!");
        return ;
    }
    let profiles=[];
    $(".profiles").html("");
    for (let mask=0; mask<(1<<n); mask++) {
        let i;
        for (i=1; i<n; i++) {
            if ((bit(mask,i)==1)&&(bit(mask,i-1)==1)) break;
        }
        if (i==n) {
            let table='<table class="table table-borderless profile">';
            table+='<thead><tr><th class="text-center">'+profiles.length+'</th></tr></thead>';
            table+='<tbody>';
            for (i=0; i<n; i++) {
                table+='<tr><td class="';
                if (bit(mask,i)==0) table+='white';
                else table+='black';
                table+='"></td></tr>';
            }
            table+='</tbody></table>';
            $(".profiles").append(table);
            
            profiles.push(mask);
        }
    }
    
    let k=profiles.length;
    let T=[];
    for (let i=0; i<k; i++) {
        T[i] = new Array(k);
    }
    for (let i=0; i<k; i++) {
        for (let j=0; j<k; j++) {
            if ((profiles[i]&profiles[j])==0) T[i][j]=1;
            else T[i][j]=0;
        }
    }

    let R=[];
    for (let i=0; i<k; i++) {
        R[i] = new Array(k);
        for (let j=0; j<k; j++) {
            R[i][j]=0;
        }
    }
    let pow=1;
    while (pow<=(m-1)) {
        pow*=2;
    }
    pow/=2;
    for (let i=0; i<k; i++) {
        R[i][i]=1;
    }
    while (pow>=1) {
        matrix_mult(R,R,R,k);
        if (((m-1)&pow)!=0) matrix_mult(R,T,R,k);
        pow/=2;
    }
    
    writeMatrix(T,k,"T=",$(".dpProfileExample .T"));
    writeMatrix(R,k,"T^{"+(m-1)+"}=",$(".dpProfileExample .Tm"));
    if (typeof MathJax!=="undefined") MathJax.typeset([".dpProfileExample .T", ".dpProfileExample .Tm"]);
    
    let ans=0;
    for (let i=0; i<k; i++) {
        for (let j=0; j<k; j++) {
            ans+=R[i][j]; ans%=97;
        }
    }
    $(".answer").text("Oтговор: "+ans);
}
function initExample () {
    $(".dpProfileExample .calc").off("click").on("click",calcMatrices);
    $(".dpProfileExample .n").val("2");
    $(".dpProfileExample .m").val("2");
    calcMatrices();
}