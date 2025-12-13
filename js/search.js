(function () {
    "use strict";
    function Node () {
        this.children=[];
        this.fail=undefined;
        this.word=undefined;
    }
    let trie=new Node();
    function addWord (word, ind) {
        let curr=trie;
        for (let c of word) {
            let code=c.charCodeAt(0);
            if (curr.children[code]===undefined) curr.children[code]=new Node();
            curr=curr.children[code];
        }
        curr.word=ind;
    }
    function addLinks () {
        let bfs=[];
        bfs.push(trie);
        trie.fail=trie;
        while (bfs.length>0) {
            let curr=bfs.shift();
            if (curr.children===undefined) continue;
            for (let i=0; i<curr.children.length; i++) {
                let child=curr.children[i];
                if (child===undefined) continue;
                bfs.push(child);

                let up=curr;
                let flag=false;
                while (up!==trie) {
                    up=up.fail;
                    if (up.children[i]!==undefined) {
                        child.fail=up.children[i];
                        flag=true;
                        break;
                    }
                }
                if (flag===false) child.fail=trie;
            }
        }
    }
    function takePart (text, i) {
        let first=-1,last;
        for (let i=0; i<text.length; i++) {
            if (text[i]===' ') {
                if (first===-1) first=i;
                last=i;
            }
        }
        return text.substring(first+1,last);
    }
    function matchTrie (text) {
        let matches=[];
        let curr=trie;
        for (let i=0; i<text.length; i++) {
            let code=text[i].toLowerCase().charCodeAt(0);
            while (curr!==trie) {
                if (curr.children[code]!==undefined) break;
                curr=curr.fail;
            }
            if (curr.children[code]!==undefined) curr=curr.children[code];
            else curr=trie;

            if (curr.word!==undefined) {
                let from=Math.max(i-200,0);
                matches.push(takePart(text.substring(from,from+400,i)));
                curr=trie;
                i=from+600-1;
            }
        }
        return matches;
    }
    function filter (text) {
        if (text.length===0) return "";
        
        let tags=[];
        let flag=false,tag;
        let filtered="";
        for (let i=0; i<text.length; i++) {
            if ((tags.length>0)&&(text[i]==='<')&&(text[i+1]==='/')) {
                let last=tags[tags.length-1],len=last.length;
                if (text.substr(i+2,len)===last) tags.pop();
                i+=(len+2);
            }
            else if ((text[i]==='<')&&(text[i+1]!=='/')) {
                flag=true;
                tag="";
            }
            else if (flag===true) {
                if (text[i]===' ') i=text.indexOf(">",i);
                if (text[i]==='>') {
                    if ((tag==="b")||(tag==="i")) {
                        if (tags.length===0) filtered+="<"+tag+">";
                    }
                    else tags.push(tag);
                    flag=false;
                }
                else tag+=text[i];
            }
            else if (tags.length==0) filtered+=text[i];
        }
        return " "+filtered.replaceAll("()","")+" ";
    }
    function match (text) {
        let flag=[false, false];
        let matches=[];
        let curr="";
        for (let i=0; i<text.length; i++) {
            if ((i>0)&&(text[i-1]==='<')&&(text[i]==='p')) flag[0]=true;
            else if ((flag[0]===true)&&(flag[1]===false)&&(text[i]==='>')) flag[1]=true;
            else if ((flag[0]===true)&&(flag[1]===true)) {
                if ((i>=3)&&(text[i-3]==='<')&&(text[i-2]==='/')&&(text[i-1]==='p')&&(text[i]==='>')) {
                    flag[0]=false;
                    flag[1]=false;
                    let res=matchTrie(filter(curr.substr(0,curr.length-3)));
                    for (let s of res) {
                        if (s==="") continue;
                        if ((matches.length==0)||(matches[matches.length-1]!=s)) matches.push(s);
                    }
                    curr="";
                }
                else curr+=text[i];
            }
        }
        return matches;
    }
    
    $(document).ready(function () {
        let text=decodeURI(document.location.search).substring("?searched=".length);
        if (text.length===0) return ;
        $("h1").append(text.replaceAll("+"," "));
        let words=text.split('+');
        for (let i=0; i<words.length; i++) {
            words[i]=words[i].toLowerCase();
            addWord(words[i],i);
        }
        addLinks();
        $.get("/algo-site/index.html","",function (data) {
            data=decodeURI(data);
            let URLs=[];
            let names=[];
            let ind=data.indexOf("<body");
            for (;;) {
                let next=data.indexOf('href="',ind+1);
                if (next===-1) break;
                let URL="";
                for (let i=next+'href="'.length; i<data.length; i++) {
                    if (data[i]==='"') break;
                    URL+=data[i];
                }
                URLs.push(URL);
                ind=next+1;
            }
            ind=data.indexOf("<body");
            for (;;) {
                let next=data.indexOf('</b>',ind+1);
                if (next===-1) break;
                let name="";
                for (let i=next-1; i>=0; i--) {
                    if (data[i]=='>') break;
                    name=data[i]+name;
                }
                names.push(name);
                ind=next+1;
            }
            
            const checkMatch = (URL, name, data) => {
                let matches=match(data);
                if (matches.length===0) return ;
                let card=`
                    <div class="card result">
                        <div class="card-body">
                            <h3 class="card-title unselectable"><a href="`+URL+`">`+name+`</a></h3>`;
                for (let i=0; i<Math.min(5,matches.length); i++) {
                    let text=matches[i];
                    for (let word of words) {
                        text=text.replaceAll(word,'<span style="background-color: orange">'+word+'</span>');
                        let capitalWord=word[0].toUpperCase()+word.substr(1);
                        text=text.replaceAll(capitalWord,'<span style="background-color: orange">'+capitalWord+'</span>');
                        text=text.replaceAll(word.toUpperCase(),'<span style="background-color: orange">'+word.toUpperCase()+'</span>');
                    }
                    text="... "+text+" ...";
                    card+='<p class="card-text mb-2">'+text+'</p>';
                }
                card+="</div></div>";
                $(".content").append(card);
                if ((typeof MathJax!=="undefined")&&(MathJax.typeset!==undefined)) MathJax.typeset([".card.result"]);
            };
            for (let i=0; i<URLs.length; i++) {
                let j;
                for (j=0; j<i; j++) {
                    if (URLs[i]===URLs[j]) break;
                }
                if (j<i) continue;
                $.get(URLs[i],"",checkMatch.bind(null,URLs[i],names[i]));
            }
        });
    });
})();