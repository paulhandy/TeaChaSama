var datajson;
var OldFileInfo = (function(){
    var jsonkeys, key;
    this.jsondata = {};
    this.arraydata = [];
    $.ajax({
        url:"../jsonlength.txt", 
        success: function(data){
            setData(data);
        }
    });
    function setData(rawstring){
        this.arraydata = [];
        this.jsondata = JSON.parse(rawstring);
        jsonkeys = [];
        for(key in this.jsondata){
            jsonkeys.push(key);
        }
        jsonkeys.sort();
        for(key in jsonkeys){
            this.arraydata.push(this.jsondata[jsonkeys[key]]);
        }
        datajson = this.jsondata;
        
    }
    
})();
var SetOldClips = function(args){
    console.log(args);
    var rawlines = args.raw.en[0].line;
    console.log('got raw lines');
    var index = args.index<10?'0'+args.index:''+args.index;
    console.log(index);
    var myArray = datajson[index];
    console.log({array: myArray});
    var i;
    for(i in rawlines){
        rawlines[i].clip = {
            start: i==0?0:rawlines[i-1].clip.end,
            end: i==0?myArray[i].length:myArray[i].length+rawlines[i-1].clip.end
        }
    }
    args.index++;
}