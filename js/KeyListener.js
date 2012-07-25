document.onkeydown = function(e){
    if(SentenceFixer.isActive){
        if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'F'){
            SentenceFixer.instructionDiv.firstElementChild.innerHTML =SentenceFixer.pgr.tofix.length+") choose Up or down, corresponding to whether the red box goes in the top or bottom yellow boxes. R to restart";
            routineFix();
        }
        if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'R'){
            SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index] = SentenceFixer.backup.en;
            SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index] = SentenceFixer.backup.jp;
            console.log("Restarting...");
            moveOn();
        }
        if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'P'){
            if(SentenceFixer.pgr.previous.length == 0){
                return;
            }
            SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index] = SentenceFixer.backup.en;
            SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index] = SentenceFixer.backup.jp;
            var prev = SentenceFixer.pgr.previous.pop();
            SentenceFixer.pgr.previous.pop();
            SentenceFixer.pgr.en[prev.index] = prev.en;
            SentenceFixer.pgr.jp[prev.index] = prev.jp;
            SentenceFixer.pgr.backup = prev;
            console.log("Rewinding...");
            moveOn();
        }
        if(SentenceFixer.routineFixIsActive && SentenceFixer.isEnRed){
            if(e.keyCode === 38){
                SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line = shiftUp({
                    array:SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line, 
                    index:SentenceFixer.currentJp
                });
                resetLists();
                routineFix({
                    en:SentenceFixer.currentEn,
                    jp:SentenceFixer.currentJp
                });
                    
            }
            if(e.keyCode === 40){
                resetLists();
                routineFix({
                    en:SentenceFixer.currentEn+1,
                    jp:SentenceFixer.currentJp+1
                });
            }
        }
        if(SentenceFixer.routineFixIsActive && !SentenceFixer.isEnRed){
            if(e.keyCode === 38){
                SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line = shiftUp({
                    array:SentenceFixer.pgr.jp[SentenceFixer.pgr.tofix[0].index].line, 
                    index:SentenceFixer.currentJp
                });
                resetLists();
                routineFix({
                    en:SentenceFixer.currentEn,
                    jp:SentenceFixer.currentJp
                });
            }
            if(e.keyCode === 40){
                resetLists();
                routineFix({
                    en:SentenceFixer.currentEn+1,
                    jp:SentenceFixer.currentJp+1
                });
            }
            if(SentenceFixer.splittingSentences){
                if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'C' && SentenceFixer.splittingSentences){
                    SentenceFixer.splittingSentences = false;
                    SentenceFixer.instructionDiv.firstElementChild.innerHTML = SentenceFixer.pgr.tofix.length+"): F to move forward. P to go to previous. R to restart";
                }
            }
        }
    
    }
};