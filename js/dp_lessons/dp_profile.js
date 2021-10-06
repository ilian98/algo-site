"use strict";
(function () {
    function bit (mask, pos) {
        return mask&(1<<pos)?1:0;
    }
    const modulo=100;
    function matrix_mult (A, B, C, k) {
        let temp=[];
        for (let i=0; i<k; i++) {
            temp[i] = new Array(k);
        }
        for (let row=0; row<k; row++) {
            for (let col=0; col<k; col++) {
                temp[row][col]=0;
                for (let i=0; i<k; i++) {
                    temp[row][col]+=(A[row][i]*B[i][col])%modulo;
                }
                temp[row][col]%=modulo;
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
        let n=$(".dpProfileExample1 .n").val(),m=$(".dpProfileExample1 .m").val();
        if ((n<1)||(n>3)) {
            alert("Невалидна стойност за n!");
            return ;
        }
        if (m<1) {
            alert("Невалидна стойност за m!");
            return ;
        }
        let profiles=[];
        $(".dpProfileExample1 .profiles").html("");
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
                $(".dpProfileExample1 .profiles").append(table);

                profiles.push(mask);
            }
        }

        let k=profiles.length;
        let T=[];
        for (let i=0; i<k; i++) {
            T[i]=new Array(k);
        }
        for (let i=0; i<k; i++) {
            for (let j=0; j<k; j++) {
                if ((profiles[i]&profiles[j])==0) T[i][j]=1;
                else T[i][j]=0;
            }
        }

        let R=[];
        for (let i=0; i<k; i++) {
            R[i]=new Array(k);
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

        writeMatrix(T,k,"T=",$(".dpProfileExample1 .T"));
        writeMatrix(R,k,"T^{"+(m-1)+"}=",$(".dpProfileExample1 .Tm"));
        if (typeof MathJax!=="undefined") MathJax.typeset([".dpProfileExample1 .T",".dpProfileExample1 .Tm"]);

        let ans=0;
        for (let i=0; i<k; i++) {
            for (let j=0; j<k; j++) {
                ans+=R[i][j]; ans%=modulo;
            }
        }
        $(".dpProfileExample1 .answer").text("Oтговор: "+ans);
    }
    function checkProfiles () {
        let table=$(".dpProfileExample2 .profiles");
        table.hide();

        let l=Array.from($(".dpProfileExample2 .l").val()),r=Array.from($(".dpProfileExample2 .r").val());
        if (l.length!=r.length) {
            alert("Профилите не са с една и съща дължина!");
            return ;
        }
        let n=l.length;
        let message=$(".dpProfileExample2 .error");
        message.show(); message.text("");
        for (let i=0; i<n; i++) {
            if ((l[i]==='1')&&(r[i]==='1')) {
                message.text("Несъвместими профили - две единици една до друга!");
                return ;
            }
            if (l[i]==='1') r[i]='2';
        }
        let cnt=0;
        for (let i=0; i<n; i++) {
            if (r[i]!=='0') {
                if (cnt%2!=0) {
                    message.text("Несъвместими профили - нечетен брой клетки трябва да бъдат покрити с вертикални домина!");
                    return ;
                }
                cnt=0;
            }
            else cnt++;
        }
        if (cnt%2!=0) {
            message.text("Несъвместими профили - нечетен брой клетки трябва да бъдат покрити с вертикални домина!");
            return ;
        }
        message.hide();

        table.show();
        table.html("");
        let tableText='<tbody>';
        cnt=0;
        for (let i=0; i<n; i++) {
            if (r[i]!=='0') cnt=0;
            else cnt++;

            tableText+='<tr><td class="text-center'
            if (l[i]==='1') tableText+=' white r-hole';
            tableText+='" style="padding: 0; vertical-align: middle">'+l[i]+'</td>';

            tableText+='<td class="text-center white'
            if (r[i]==='2') tableText+=' l-hole';
            else if (r[i]==='1') tableText+=' r-hole';
            else if (r[i]==='0') {
                if (cnt%2==1) tableText+=' d-hole';
                else tableText+=' u-hole';
            }
            tableText+='" style="padding: 0; vertical-align: middle">'+((r[i]==='1')?'1':'0')+'</td></tr>';
        }
        tableText+='</tbody>';
        table.append(tableText);
    }
    function initExample (part) {
        if (part==3) {
            $(".dpProfileExample1 .calc").off("click").on("click",calcMatrices);
            $(".dpProfileExample1 .n").val("2");
            $(".dpProfileExample1 .m").val("2");
            $(".dpProfileExample1 .n").on("keydown",isDigit);
            $(".dpProfileExample1 .m").on("keydown",isDigit);
            calcMatrices();
        }
        else {
            $(".dpProfileExample2 .check").off("click").on("click",checkProfiles);
            $(".dpProfileExample2 .error").hide();
            $(".dpProfileExample2 .l").val("01001");
            $(".dpProfileExample2 .r").val("10000");
            $(".dpProfileExample2 .l").on("keydown",isBinary);
            $(".dpProfileExample2 .r").on("keydown",isBinary);
            checkProfiles();
        }
    }
    
    
    window.initExample = initExample;
})();