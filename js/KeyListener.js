document.onkeydown = function(e){
    if(SentenceFixer.isActive){
        if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'F'){
            SentenceFixer.instructionDiv.firstElementChild.innerHTML =SentenceFixer.pgr.tofix.length+") choose Up or down, corresponding to whether the red box goes in the top or bottom yellow boxes. R to restart";
            SentenceFixer.routineFixIsActive = true;
            routineFix();
        }
        if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'S'){
            $('#sentenceSplitter').trigger('click');
        }
        if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'E'){
            if(!SentenceFixer.isEditingSentences){
                e.preventDefault();
                $('#editTextButton').trigger('click');
            }
        }
        if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'W'){
            console.log('Putting back up...');
            $('#combineSentenceUp').trigger('click');
        }
        if(SentenceFixer.splittingSentences){
            if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'C' && SentenceFixer.splittingSentences){
                SentenceFixer.splittingSentences = false;
                SentenceFixer.instructionDiv.firstElementChild.innerHTML = SentenceFixer.pgr.tofix.length+"): F to move forward. P to go to previous. R to restart";
            }
        }
        if(String.fromCharCode(e.keyCode).toLocaleUpperCase() === 'R'){
            SentenceFixer.routineFixIsActive = false;
            SentenceFixer.splittingSentences = false;
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
        if(e.keyCode === 27){
            // possibly something here
        }
        if(e.keyCode === 38 /* up arrow */ && SentenceFixer.routineFixIsActive){
            console.log('shift up!');
            if( SentenceFixer.englishIsLonger){
                console.log('shift english up');
                SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line = shiftUp({
                    array:SentenceFixer.pgr.en[SentenceFixer.pgr.tofix[0].index].line, 
                    index:SentenceFixer.currentEn
                });
                resetLists();
                routineFix({
                    en:SentenceFixer.currentEn,
                    jp:SentenceFixer.currentJp
                });
            }
            else if(!SentenceFixer.englishIsLonger){
                console.log('shift Japanese up');
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
        }
        if(e.keyCode === 40 /* down arrow*/ && SentenceFixer.routineFixIsActive){
            if(SentenceFixer.englishIsLonger){
                resetLists();
                routineFix({
                    en:SentenceFixer.currentEn+1,
                    jp:SentenceFixer.currentJp+1
                });
            }
            else if(!SentenceFixer.englishIsLonger){
                resetLists();
                routineFix({
                    en:SentenceFixer.currentEn+1,
                    jp:SentenceFixer.currentJp+1
                });
            }
        }      
    }
};