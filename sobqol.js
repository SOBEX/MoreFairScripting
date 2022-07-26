//https://mixkit.co/free-sound-effects/alerts/

// choicebox of dropdown + textfield, parse as just number or /^.*?\D?(\d+)\D?.*?\D?(\d+)\D?.*?$/
// TODO: throw all alerts into 1 sobAlerter
// A - asap, alert when able to multi or bias
// G = Graper stay bottom
// M##### - multi follow #####, ignore bias
// B##### = full follow ##### including bias
// P##### - pass, alert if above #####, for bias maybe
// R## - rank, alert when at least rank ##, also for bias maybe

//support subscribing to multiple actions

window.sobSetup=function(){
   Fair.register(api=>window.sobStore=api);
   window.sobStore_actions={'setupConnection':[],'setupGame':[],'setupChat':[],'incrementHighestLadder':[],'ladder/setup':[],'ladder/handleLadderEvent':[],'ladder/handleGlobalEvent':[],'ladder/handlePrivateEvent':[],'ladder/calculate':[],'ladder/handleEvent':[],'ladder/stats/calculate':[],'mod/searchName':[]};
   window.sobFunctions={};
   window.sobData={};
   window.sobSettings={};
   window.sobFlexbox=document.getElementById('app').children[2].children[0].children[0].children[0].children[0].children[2].appendChild(document.createElement('div'));
   window.sobFlexbox.parentNode.style.height='auto';
   window.sobRegister=function(module){
      "use strict";
      if(!('id'in module))throw 'error: id missing';
      const id=module.id;
      const action='action'in module?module.action:'ladder/calculate';
      if(!(action in window.sobStore_actions))throw 'error: action invalid';
      const noop=function(e){};
      const flexitem='flexitem'in module?module.flexitem:noop;
      const data='data'in module?module.data:noop;
      const settings='settings'in module?module.settings:noop;
      const setup='setup'in module?module.setup:noop;
      const before='before'in module?module.before:noop;
      const after='after'in module?module.after:noop;
      const _flexitem=flexitem();
      if(_flexitem)window.sobFlexbox.appendChild(_flexitem);
      const _data=data();
      window.sobData={...window.sobData,..._data};
      const _settings=settings();
      window.sobSettings={...window.sobSettings,..._settings};
      setup();
      if(!(action in window.sobFunctions)){
         window.sobFunctions[action]=[];
         const sobBeforeWrapper=function(e){window.sobFunctions[action].forEach(m=>m.before(e));};
         window.sobStore_actions[action].unshift(sobBeforeWrapper);
         const sobAfterWrapper=function(e){window.sobFunctions[action].forEach(m=>m.after(e));};
         window.sobStore_actions[action].push(sobAfterWrapper);
      };
      window.sobFunctions[action].push({'id':id,'before':before,'after':after});
   };
   window.sobUnregister=function(module){
      "use strict";
      if(!('id'in module))throw 'error: id missing';
      const id=module.id;
      const action='action'in module?module.action:'ladder/calculate';
      if(action in window.sobFunctions){
         window.sobFunctions[action]=window.sobFunctions[action].filter(m=>m.id!=id);
      }
   };
   window.sobResetup=function(){
      if(!(document.getElementById('app').children[2].children[0].children[0].children[0].children[0].children[2].lastChild===window.sobFlexbox)){
         sobFlexbox.parentNode.removeChild(window.sobFlexbox);
         document.getElementById('app').children[2].children[0].children[0].children[0].children[0].children[2].appendChild(window.sobFlexbox);
         window.sobFlexbox.parentNode.style.height='auto';
      };
   };
   window.sobResetupInterval=setInterval(window.sobResetup,1000);
   window.sobTickDetectLastValue=0;
   window.sobTickDetect=function(){
      let currentValue=window.sobStore.state.ladder.rankers.filter(r=>r.growing)[0]?.points.toNumber();
      if(currentValue&&window.sobTickDetectLastValue!=currentValue){
         window.sobTickDetectLastValue=currentValue;
         for(a in window.sobStore_actions){window.sobStore_actions[a].forEach(m=>m({'message':{'delta':1}}))};
      };
   };
   window.sobTickDetectInterval=setInterval(window.sobTickDetect,100);
};

window.sobTicker={
   id:'sobTicker',
   action:'ladder/calculate',
   flexitem:function(){
      "use strict";
      let div=document.createElement('div');
      div.innerHTML='<span style="font-family:monospace;"><span id="tickerText"></span> <span id="tickerCount"></span>+<span id="tickerDelta"></span></span>';
      return div;
   },
   data:function(){
      "use strict";
      return{
         tickerCount:0,
         tickerDelta:0,
         tickerSpanText:document.getElementById('tickerText'),
         tickerSpanCount:document.getElementById('tickerCount'),
         tickerSpanDelta:document.getElementById('tickerDelta'),
      };
   },
   settings:function(){
      "use strict";
      return{
         tickerFixedLength:4,
         tickerDelay:500,
      };
   },
   setup:function(){
      "use strict";
      window.sobData.tickerSpanText.innerHTML='the clock goes';
      window.sobData.tickerSpanCount.innerHTML=window.sobData.tickerCount.toFixed(window.sobSettings.tickerFixedLength);
      window.sobData.tickerSpanDelta.innerHTML=window.sobData.tickerDelta.toFixed(window.sobSettings.tickerFixedLength);
   },
   before:function(e){
      "use strict";
      window.sobData.tickerDelta+=e.message.delta;
      window.sobData.tickerSpanText.innerHTML='tick';
      window.sobData.tickerSpanCount.innerHTML=window.sobData.tickerCount.toFixed(window.sobSettings.tickerFixedLength);
      window.sobData.tickerSpanDelta.innerHTML=window.sobData.tickerDelta.toFixed(window.sobSettings.tickerFixedLength);
   },
   after:function(e){
      "use strict";
      setTimeout(function(){
         window.sobData.tickerCount+=window.sobData.tickerDelta;
         if(window.sobData.tickerDelta>=1.5)console.log('lag:',window.sobData.tickerDelta);
         window.sobData.tickerDelta=0;
         window.sobData.tickerSpanText.innerHTML='tock';
         window.sobData.tickerSpanCount.innerHTML=window.sobData.tickerCount.toFixed(window.sobSettings.tickerFixedLength);
         window.sobData.tickerSpanDelta.innerHTML=window.sobData.tickerDelta.toFixed(window.sobSettings.tickerFixedLength);
      },window.sobSettings.tickerDelay);
   },
};

window.sobSimExport={
   id:'sobSimExport',
   flexitem:function(){
      "use strict";
      let div=document.createElement('div');
      div.innerHTML='<button onclick="window.sobData.simExportCopy();">Copy to clipboard</button> <button ondblclick="window.sobData.simExportDownload();">Download log</button> <input type="checkbox" id="simExportLogActive"> simExportLogActive';
      return div;
   },
   data:function(){
      "use strict";
      return{
         simExportCheckboxLogActive:document.getElementById('simExportLogActive'),
         simExportActive:true,
         simExportLog:[],
         simExportCopy:function(){
            "use strict";
            navigator.clipboard.writeText(window.sobData.simExportLog[window.sobData.simExportLog.length-1].content);
         },
         simExportDownload:function(){
            "use strict";
            let button=document.createElement('a');
            let blob=new Blob([window.sobData.simExportLog.map(l=>l.time+'\r\n'+l.content).join('\r\n')]);
            button.href=URL.createObjectURL(blob);
            button.download='fairGameData'+(new Date()).toJSON().replace(/[-T:.Z]/g,'')+'.txt';
            button.click();
            URL.revokeObjectURL(button.href);
            button.remove();
         },
      };
   },
   after:function(e){
      "use strict";
      const space=' ';
      const endline='\r\n';
      let string=window.sobStore.state.ladder.yourRanker.accountId+space/*+store.state.ladder.basePointsToPromote.m+'e'+store.state.ladder.basePointsToPromote.e+space*/+(window.sobStore.state.ladder.number/*+1*/)+space+window.sobStore.state.ladder.rankers.length+endline;
      window.sobStore.state.ladder.rankers.forEach(function(r){
         string+=(r.growing?'1':'0')+space+r.rank+space+r.accountId+space+r.bias+space+r.multi+space+Math.round(r.power)+space+Math.round(r.points)+space;
         if(r.timesAsshole>0){
            string+='('+r.timesAsshole+')'+window.sobStore.state.settings.assholeTags[r.timesAsshole]+space;
         };
         string+=r.username.replace(/[\t\n\v\f\r]/g,'')+endline;
      });
      if(window.sobData.simExportActive){
         window.sobData.simExportLog.push({'time':Date(),'content':string});
      }else{
         window.sobData.simExportLog[window.sobData.simExportLog.length-1]={'time':Date(),'content':string};
      };
      window.sobData.simExportActive=window.sobData.simExportCheckboxLogActive.checked;
   },
};

window.sobGraper={
   id:'sobGraper',
   flexitem:function(){
      "use strict";
      let div=document.createElement('div');
      div.innerHTML='<input type="checkbox" id="graperActive"> graperActive';
      return div;
   },
   data:function(){
      "use strict";
      return{
         graperCheckboxActive:document.getElementById('graperActive'),
         graperAlert:new Audio('https://assets.mixkit.co/sfx/preview/mixkit-police-whistle-614.mp3'),
      };
   },
   after:function(e){
      "use strict";
      if(window.sobData.graperCheckboxActive.checked&&window.sobStore.state.ladder.yourRanker.growing&&window.sobStore.state.ladder.yourRanker.rank<window.sobStore.state.ladder.rankers.length){
         window.sobData.graperAlert.play();
      };
   },
};

window.sobEventerLadder={
   id:'sobEventerLadder',
   action:'ladder/handleLadderEvent',
   before:function(e){
      "use strict";
      console.log('ladder/handleLadderEvent:',e);
   },
};
window.sobEventerGlobal={
   id:'sobEventerGlobal',
   action:'ladder/handleGlobalEvent',
   before:function(e){
      "use strict";
      console.log('ladder/handleGlobalEvent:',e);
   },
};
window.sobEventerPrivate={
   id:'sobEventerPrivate',
   action:'ladder/handlePrivateEvent',
   before:function(e){
      "use strict";
      console.log('ladder/handlePrivateEvent:',e);
   },
};
window.sobEventerCalculate={
   id:'sobEventerCalculate',
   action:'ladder/calculate',
   before:function(e){
      "use strict";
      console.log('ladder/calculate:',e);
   },
};
window.sobEventer={
   id:'sobEventer',
   action:'ladder/handleEvent',
   before:function(e){
      "use strict";
      console.log('ladder/handleEvent:',e);
   },
};

window.sobFollower=function(e){
   "use strict";
   if(window.sobSettings.followerId<0){if(!window.sobSettings.followerSilent)console.log('skipped: not following');return;};
   if(!window.sobStore.state.ladder.yourRanker.growing){if(!window.sobSettings.followerSilent)console.log('skipped: not growing');return;};
   if(window.sobSettings.followerId===0){
      if(!document.getElementsByClassName('btn-group')[1].children[0].classList.contains('disabled')){
         window.sobData.followerMulti.play();
         if(!window.sobSettings.followerSilent)console.log('buy multi');
         return;
      };
      if(!window.sobSettings.followerSilent)console.log('cant multi');
      if(!document.getElementsByClassName('btn-group')[1].children[1].classList.contains('disabled')){
         window.sobData.followerBias.play();
         if(!window.sobSettings.followerSilent)console.log('buy bias');
         return;
      };
      if(!window.sobSettings.followerSilent)console.log('cant bias');
   }else{
      window.sobStore.state.ladder.rankers.forEach(function(r){
         if(r.accountId!=window.sobSettings.followerId)return;
         let s=window.sobStore.state.ladder.yourRanker;
         if(!window.sobSettings.followerSilent)console.log('found '+r.username+'#'+r.accountId+' at [+'+r.bias+' x'+r.multi+'], self at [+'+s.bias+' x'+s.multi+']');
         if(s.multi<r.multi){
            if(!document.getElementsByClassName('btn-group')[1].children[0].classList.contains('disabled')){
               window.sobData.followerMulti.play();
               if(!window.sobSettings.followerSilent)console.log('buy multi');
               return;
            };
            if(!window.sobSettings.followerSilent)console.log('cant multi');
         };
         if(s.multi<r.multi||(s.multi===r.multi&&s.bias<r.bias)){
            if(!document.getElementsByClassName('btn-group')[1].children[1].classList.contains('disabled')){
               window.sobData.followerBias.play();
               if(!window.sobSettings.followerSilent)console.log('buy bias');
               return;
            };
            if(!window.sobSettings.followerSilent)console.log('cant bias');
         };
      });
   };
};
window.sobRegisterSobFollower=function(){
   window.sobData.followerBias=new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bonus-earned-in-video-game-2058.mp3');
   window.sobData.followerMulti=new Audio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-error-alert-898.mp3');
   window.sobSettings.followerId=-1;
   window.sobSettings.followerSilent=false;
   window.sobFunctions['ladder/calculate'].push({'id':'sobFollower','before':function(e){},'after':window.sobFollower});
};

window.sobSetup();
window.sobRegister(window.sobTicker);
window.sobRegister(window.sobSimExport);
window.sobRegister(window.sobGraper);
//window.sobRegister(window.sobEventerLadder);
//window.sobRegister(window.sobEventerGlobal);
//window.sobRegister(window.sobEventerPrivate);
//window.sobRegister(window.sobEventerCalculate);
//window.sobRegister(window.sobEventer);
window.sobRegisterSobFollower();
