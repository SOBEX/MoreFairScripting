'use strict';

const sobAlertSound={
   map:new Map(),
   register(id,uri){
      let audio=new Audio(uri);
      audio.loop=true;
      this.map.set(id,audio);
   },
   play(id){
      let audio=this.map.get(id);
      if(audio.paused){
         audio.play();
      }
   },
   stop(id){
      let audio=this.map.get(id);
      if(!audio.paused){
         audio.pause();
         audio.currentTime=0;
      }
   }
}

const sobAlertNotification={
   map:new Map(),
   register(id,title,body){
      let notification={title,body,notification:undefined};
      this.map.set(id,notification);
   },
   play(id,body){
      let notification=this.map.get(id);
      let newNotification=new Notification(notification.title,{body:body||notification.body,tag:id,renotify:true,silent:true});
      if(notification.notification){
         notification.notification.close();
      }
      notification.notification=newNotification;
   },
   stop(id){
      let notification=this.map.get(id);
      if(notification.notification){
         notification.notification.close()
         notification.notification=undefined;
      }
   }
}

const sobWorker={
   //https://stackoverflow.com/a/47806806
   map:new Map(),
   register(id,func){
      const funcstr=func.toString();
      const workerCode=`
         const func=${funcstr};
         onmessage=async({data:args})=>{
            try{
               args=args.map(p=>(p.type==='fn')?new Function(\`return \${p.fn}\`)():p);
               const result=await func(...args);
               self.postMessage({result});
            }catch(error){
               self.postMessage({error:error.message});
            }
         };
      `;
      const workerBlob=new Blob([workerCode],{type:'text/javascript'});
      const workerUrl=URL.createObjectURL(workerBlob);
      const worker=new Worker(workerUrl);
      this.map.set(id,worker);
   },
   call(id,...args){
      const worker=this.map.get(id);
      worker.postMessage(args.map(arg=>(typeof arg==='function')?{type:'fn',fn:arg.toString()}:arg));
      return new Promise((next,error)=>{
         worker.onmessage=({data})=>{
            if(data.error){
               error('Error: '+data.error);
            }else{
               next(data);
            }
         };
         worker.onerror=({message})=>{
            error('Error: '+message);
         };
      });
   }
};

const sobqol={
   api:undefined,
   store:undefined,
   callbacks:undefined,
   divs:undefined,
   reSetup(){
      if(!this.divs.parentElement.parentElement){
         document.body.appendChild(this.divs.parentElement);
      }
   },
   reSetupInterval:undefined,
   setup(){
      Fair.register((api)=>this.api=api);

      let newChangeDetected=false;
      if(JSON.stringify(Object.keys(this.api).sort((l,r)=>l>r))!='["addCallback","getHooks","stores","utils"]'){
         console.log('New api keys detected.');
         newChangeDetected=true;
      }
      if(JSON.stringify(Object.keys(this.api.getHooks()).sort((l,r)=>l>r))!='["onAccountEvent","onChatEvent","onLadderEvent","onModChatEvent","onModLogEvent","onRoundEvent","onTick","onUserEvent","onVinegarThrowEvent"]'){
         console.log('New events detected.');
         newChangeDetected=true;
      }
      if(JSON.stringify(Object.keys(this.api.stores).sort((l,r)=>l>r))!='["useAccountStore","useChatStore","useLadderStore","useOptionsStore","useRoundStore","useUiStore"]'){
         console.log('New stores detected.');
         newChangeDetected=true;
      }
      if(JSON.stringify(Object.keys(this.api.utils).sort((l,r)=>l>r))!='["useLadderUtils"]'){
         console.log('New utils detected.');
         newChangeDetected=true;
      }
      if(newChangeDetected){
         console.log('Contact SOBEX on Discord or GitHub to let him know.');
      }

      this.store={
         account:this.api.stores.useAccountStore(),
         chat:this.api.stores.useChatStore(),
         ladder:this.api.stores.useLadderStore(),
         options:this.api.stores.useOptionsStore(),
         round:this.api.stores.useRoundStore(),
         ui:this.api.stores.useUiStore(),
         utils:this.api.utils.useLadderUtils()
      };

      this.callbacks={};
      let hooks=this.api.getHooks();
      for(let hook in hooks){
         let map=new Map();
         this.callbacks[hook]=map;
         this.api.addCallback(hooks[hook],'sob'+hook.charAt(0).toUpperCase()+hook.slice(1),(body)=>{
            for(let callback of map.values()){
               callback(this.store,body);
            }
         });
      }

      let div=document.createElement('div');
      div.innerHTML=`
         <div style="position: absolute; left: 0px; top: 0px; width: auto; height: auto; min-width: 48px; min-height: 24px; max-width: 100%; max-height: 100%; resize: both; overflow: hidden; white-space: nowrap; z-index: 100000001; display: grid; grid-template-rows: 24px minmax(0, 1fr); grid-template-columns: minmax(0, 1fr) 24px;">
             <div style="background-color: var(--background-color); color: var(--text-light-highlight-color); grid-column: 1; text-align: left; cursor: move;">SOBEX/MoreFairScripting</div>
             <div style="background-color: var(--background-dark-color); color: var(--text-dark-highlight-color); grid-column: 2; text-align: center; cursor: pointer;">-</div>
             <div style="background-color: var(--background-light-color); color: var(--text-color); grid-row: 2; grid-column: 1 / span 2; padding: 12px; overflow: auto; display: block;"></div>
         </div>
      `;
      let modal=div.firstElementChild;
      document.body.appendChild(modal);
      let [drag,minimize,content]=modal.children;

      let isDragging=false;
      let dragOffsetX,dragOffsetY;
      drag.addEventListener('mousedown',(event)=>{
         isDragging=true;
         dragOffsetX=event.clientX-modal.offsetLeft;
         dragOffsetY=event.clientY-modal.offsetTop;
      });
      window.addEventListener('mousemove',(event)=>{
         if(isDragging){
            let left=Math.min(Math.max(event.clientX-dragOffsetX,0),window.innerWidth-48);
            let top=Math.min(Math.max(event.clientY-dragOffsetY,0),window.innerHeight-24);
            modal.style.left=left+'px';
            modal.style.maxWidth='calc(100% - '+left+'px)';
            modal.style.top=top+'px';
            modal.style.maxHeight='calc(100% - '+top+'px)';
         }
      });
      window.addEventListener('mouseup',(event)=>{
         if(isDragging){
            isDragging=false;
            if(event.clientX-dragOffsetX<=0){
               modal.style.width='auto';
            }
            if(event.clientY-dragOffsetY<=0){
               modal.style.height='auto';
            }
         }
      });

      let isMinimized=false;
      let previousWidthAuto,previousHeight;
      minimize.addEventListener('click',()=>{
         if(isMinimized){
            isMinimized=false;
            if(previousWidthAuto){
               modal.style.width='auto';
            }
            modal.style.height=previousHeight;
            minimize.innerText='-';
            content.style.display='block';
            modal.style.resize='both';
         }else{
            isMinimized=true;
            if(previousWidthAuto=modal.style.width==='auto'){
               modal.style.width=modal.offsetWidth+'px';
            }
            previousHeight=modal.style.height;
            modal.style.height='24px';
            minimize.innerText='+';
            content.style.display='none';
            modal.style.resize='none';
         }
      });

      this.divs=content;
      this.divs.map=new Map();

      this.reSetupInterval=setInterval(()=>this.reSetup(),1000);
   },
   register(module){
      let id=module.id;

      if('setup' in module){
         module.setup(this.store);
      }

      if('div' in module){
         let div=module.div(this.store);
         if(this.divs.map.has(id)){
            this.divs.replaceChild(div,this.divs.map.get(id));
            this.divs.map.set(id,div);
         }else{
            this.divs.appendChild(div);
            this.divs.map.set(id,div);
         }
      }

      for(let hook in this.callbacks){
         if(hook in module){
            this.callbacks[hook].set(id,module[hook].bind(module));
         }
      }
   },
   unregister(id){
      if(typeof id==='string'){
      }else if(typeof id==='object'&&id!==null&&'id'in id){
         id=id.id;
      }else{
         throw new Error('Input must be a string or an object with an id property');
      }

      for(let hook in this.callbacks){
         if(this.callbacks[hook].has(id)){
            this.callbacks[hook].delete(id);
         }
      }

      if(this.divs.map.has(id)){
         let div=this.divs.map.get(id);
         this.divs.removeChild(div);
         this.divs.map.delete(id);
      }
   }
};

const sobTest={
   id:'sobTest',
   count:undefined,
   span:undefined,
   setup(store){
      this.count=store.ladder.getters.yourRanker.accountId;
   },
   div(store){
      let div=document.createElement('div');
      div.innerHTML='dont mind me<br/>just counting your accountId: <span></span>';
      [,this.span]=div.children;
      this.span.textContent=this.count;
      return div;
   },
   onAccountEvent(store,body){
      this.span.textContent=this.count+=100000000;
      console.log('onAccountEvent',{sobTest:this,store,body});
   },
   onChatEvent(store,body){
      this.span.textContent=this.count+=10000000;
      console.log('onChatEvent',{sobTest:this,store,body});
   },
   onLadderEvent(store,body){
      this.span.textContent=this.count+=1000000;
      console.log('onLadderEvent',{sobTest:this,store,body});
   },
   onModChatEvent(store,body){
      this.span.textContent=this.count+=100000;
      console.log('onModChatEvent',{sobTest:this,store,body});
   },
   onModLogEvent(store,body){
      this.span.textContent=this.count+=10000;
      console.log('onModLogEvent',{sobTest:this,store,body});
   },
   onRoundEvent(store,body){
      this.span.textContent=this.count+=1000;
      console.log('onRoundEvent',{sobTest:this,store,body});
   },
   onTick(store,body){
      this.span.textContent=this.count+=100;
      console.log('onTick',{sobTest:this,store,body});
   },
   onUserEvent(store,body){
      this.span.textContent=this.count+=10;
      console.log('onUserEvent',{sobTest:this,store,body});
   },
   onVinegarThrowEvent(store,body){
      this.span.textContent=this.count+=1;
      console.log('onVinegarThrowEvent',{sobTest:this,store,body});
   }
}

const sobPermissions={
   id:'sobPermissions',
   button:undefined,
   div(store){
      let div=document.createElement('div');
      if('Notification' in window&&Notification.permission!=='granted'){
         div.innerHTML='<button style="color: var(--text-dark-highlight-color);">Request notification permission</button>';
         const [buttonRequestNotificationPermission]=div.children;
         buttonRequestNotificationPermission.addEventListener('click',()=>{
            if('Notification' in window){
               if(Notification.permission!=='granted'){
                  Notification.requestPermission().then(permission=>{
                     if(permission!=='granted'){
                        console.log('Notification permission not granted.');
                     }
                  });
            }
            }else{
               console.log('Notifications not supported.');
            }
            div.innerHTML='';
         });
      }
      return div;
   }
}

const sobTicker={
   id:'sobTicker',
   ticks:undefined,
   deltas:undefined,
   secondsStart:undefined,
   spanTicks:undefined,
   spanDeltas:undefined,
   spanSeconds:undefined,
   setup(store){
      this.ticks=0;
      this.deltas=0;
   },
   div(store){
      let div=document.createElement('div');
      div.innerHTML='<span></span> ticks<br/><span></span> seconds (in-game)<br/><span></span> seconds (real-time)';
      [this.spanTicks,,this.spanDeltas,,this.spanSeconds]=div.children;
      return div;
   },
   onTick(store,body){
      let now=performance.now();
      if(this.secondsStart){
         const ticks=this.ticks+=1;
         const deltas=this.deltas+=body.delta;
         const seconds=(now-this.secondsStart)/1000;
         this.spanTicks.textContent=ticks.toFixed(0);
         this.spanDeltas.textContent=deltas.toFixed(3);
         this.spanSeconds.textContent=seconds.toFixed(3);
      }else{
         this.secondsStart=now;
      }
   }
}

const sobSimExport={
   id:'sobSimExport',
   log:undefined,
   checkboxDoLog:undefined,
   make(store){
      const space=' ';
      const endline='\r\n';
      let sobSimExport=store.ladder.getters.yourRanker.accountId+space+store.ladder.state.number+space+store.ladder.state.basePointsToPromote.toFixed()+space+store.ladder.state.rankers.length+endline;
      for(let ranker of store.ladder.state.rankers){
         sobSimExport+=(ranker.growing?'1':'0')+space+ranker.rank+space+ranker.accountId+space+ranker.bias+space+ranker.multi+space+ranker.power.toFixed()+space+ranker.points.toFixed()+space;
         if(ranker.assholePoints>0){
            sobSimExport+='('+ranker.assholePoints+')'+ranker.assholeTag+space;
         }
         sobSimExport+=ranker.username.replaceAll(/[\t\n\v\f\r]/g,'')+endline;
      }
      return sobSimExport;
   },
   copy(store){
      navigator.clipboard.writeText(this.checkboxDoLog.checked?this.log[this.log.length-1].content:this.make(store));
   },
   download(){
      let button=document.createElement('a');
      let blob=new Blob([this.log.map(l=>l.time+'\r\n'+l.content).join('\r\n')]);
      button.href=URL.createObjectURL(blob);
      button.download='fairGameData'+(new Date()).toJSON().replace(/[-T:.Z]/g,'')+'.txt';
      button.click();
      URL.revokeObjectURL(button.href);
   },
   setup(store){
      this.log=[];
   },
   div(store){
      let div=document.createElement('div');
      div.innerHTML='<button style="color: var(--text-dark-highlight-color);">Copy to clipboard</button><br/><button style="color: var(--text-dark-highlight-color);">Download log</button><br/><input type="checkbox" id="sobSimDoLog"> <label for="sobSimDoLog">Do log</label>';
      let buttonCopyToClipboard,buttonDownloadLog;
      [buttonCopyToClipboard,,buttonDownloadLog,,this.checkboxDoLog]=div.children;
      buttonCopyToClipboard.addEventListener('click',()=>this.copy(store));
      buttonDownloadLog.addEventListener('dblclick',()=>this.download());
      return div;
   },
   onTick(store,body){
      if(this.checkboxDoLog.checked){
         this.log.push({time:Date(),content:this.make(store)});
      }
   }
}

const sobTop={
   id:'sobTop',
   previousSound:undefined,
   previousNotification:undefined,
   checkboxDoSound:undefined,
   checkboxDoNotification:undefined,
   setup(store){
      this.previousSound=false;
      this.previousNotification=false;
      sobAlertSound.register(this.id,'https://sobex.github.io/MoreFairScripting/mixkit-police-whistle-614.wav');
      sobAlertNotification.register(this.id,'You\'re top!','Go ahead and press your buttons.');
   },
   div(store){
      let div=document.createElement('div');
      div.innerHTML='<input type="checkbox" id="sobTopDoSound"> <label for="sobTopDoSound">Do top sound</label><br/><input type="checkbox" id="sobTopDoNotification"> <label for="sobTopDoNotification">Do top notification</label>';
      [this.checkboxDoSound,,,this.checkboxDoNotification]=div.children;
      return div;
   },
   onTick(store,body){
      if(store.ladder.getters.yourRanker?.rank===1){
         if(this.checkboxDoSound.checked){
            sobAlertSound.play(this.id);
            this.previousSound=true;
         }else if(this.previousSound){
            sobAlertSound.stop(this.id);
            this.previousSound=false;
         }
         if(this.checkboxDoNotification.checked){
            sobAlertNotification.play(this.id);
            this.previousNotification=true;
         }else if(this.previousNotification){
            sobAlertNotification.stop(this.id);
            this.previousNotification=false;
         }
      }
   }
}

const sobBottom={
   id:'sobBottom',
   previousSound:undefined,
   previousNotification:undefined,
   checkboxDoSound:undefined,
   checkboxDoNotification:undefined,
   setup(store){
      this.previousSound=false;
      this.previousNotification=false;
      sobAlertSound.register(this.id,'https://sobex.github.io/MoreFairScripting/mixkit-police-whistle-614.wav');
      sobAlertNotification.register(this.id,'You\'re no longer bottom!','Go ahead and press your buttons.');
   },
   div(store){
      let div=document.createElement('div');
      div.innerHTML='<input type="checkbox" id="sobBottomDoSound"> <label for="sobBottomDoSound">Do bottom sound</label><br/><input type="checkbox" id="sobBottomDoNotification"> <label for="sobBottomDoNotification">Do bottom notification</label>';
      [this.checkboxDoSound,,,this.checkboxDoNotification]=div.children;
      return div;
   },
   onTick(store,body){
      if(store.ladder.getters.yourRanker?.rank!==store.ladder.state.rankers.length){
         if(this.checkboxDoSound.checked){
            sobAlertSound.play(this.id);
            this.previousSound=true;
         }else if(this.previousSound){
            sobAlertSound.stop(this.id);
            this.previousSound=false;
         }
         if(this.checkboxDoNotification.checked){
            sobAlertNotification.play(this.id);
            this.previousNotification=true;
         }else if(this.previousNotification){
            sobAlertNotification.stop(this.id);
            this.previousNotification=false;
         }
      }
   }
}

const sobAlerter={
   id:'sobAlerter',
   alerts:undefined,
   previousSound:undefined,
   previousNotification:undefined,
   divs:undefined,
   add(description,number){
      let test;
      switch(description){
      case 'Become top':
         test=(store)=>store.ladder.getters.yourRanker?.rank===1;
         break;
      case 'Leave grapes floor':
         test=(store)=>store.ladder.getters.yourRanker?.rank!==store.ladder.state.rankers.length;
         break;
      case 'BERSERK!!':
         test=(store)=>Array.from(document.querySelectorAll('button.whitespace-nowrap')).some(button=>!button.disabled);
         break;
      case 'Multi ready':
         test=(store)=>document.querySelectorAll('button.whitespace-nowrap')[0]?.disabled===false;
         break;
      case 'Bias ready':
         test=(store)=>document.querySelectorAll('button.whitespace-nowrap')[1]?.disabled===false;
         break;
      case 'Auto ready':
         test=(store)=>document.querySelectorAll('button.whitespace-nowrap')[2]?.disabled===false;
         break;
      case 'Throw ready':
         test=(store)=>((button=>button&&button.textContent==='Throw all Vinegar'&&!button.disabled)(document.querySelectorAll('button.whitespace-nowrap')[3]));
         break;
      case 'Promote ready':
         test=(store)=>((button=>button&&button.textContent!=='Throw all Vinegar'&&!button.disabled)(document.querySelectorAll('button.whitespace-nowrap')[3]));
         break;
      case 'Points reached':
         description=number+' points reached';
         test=(store)=>store.ladder.getters.yourRanker?.points?.gte(number);
         break;
      case 'Power reached':
         description=number+' power reached';
         test=(store)=>store.ladder.getters.yourRanker?.power?.gte(number);
         break;
      case 'Bias follow':
         description+=' #'+number;
         test=(store)=>store.ladder.getters.yourRanker?.bias<store.ladder.state.rankers.find((ranker)=>ranker.accountId===number)?.bias;
         break;
      case 'Multi follow':
         description+=' #'+number;
         test=(store)=>store.ladder.getters.yourRanker?.multi<store.ladder.state.rankers.find((ranker)=>ranker.accountId===number)?.multi;
         break;
      case 'Pass ranker':
         description+=' #'+number;
         test=(store)=>store.ladder.getters.yourRanker?.rank<store.ladder.state.rankers.find((ranker)=>ranker.accountId===number)?.rank;
         break;
      case 'Become rank':
         description+=' '+number;
         test=(store)=>store.ladder.getters.yourRanker?.rank===number;
         break;
      default:
         description='ERROR: Unrecognized type "'+description+'"';
         test=(store)=>false;
         break;
      }
      if(!this.alerts.has(description)){
         let div=document.createElement('div');
         div.innerHTML='<button>🗑</button>&nbsp;&nbsp;&nbsp;<input type="checkbox"> <input type="checkbox"> '+description;
         let [button,checkboxSound,checkboxNotification]=div.children;
         button.addEventListener('click',()=>{
            this.divs.removeChild(div);
            this.alerts.delete(description);
         });
         this.alerts.set(description,{test,checkboxSound,checkboxNotification});
         this.divs.appendChild(div);
      }
   },
   setup(store){
      this.alerts=new Map();
      this.previousSound=false;
      this.previousNotification=false;
      sobAlertSound.register(this.id,'https://sobex.github.io/MoreFairScripting/mixkit-police-whistle-614.wav');
      sobAlertNotification.register(this.id,'Chad is calling!','ERROR: No alerts active');
   },
   div(store){
      let div=document.createElement('div');
      div.innerHTML='<select></select> <input type="number" min="0" value="0" style="background-color: inherit; width: 100px;"> <button style="color: var(--text-dark-highlight-color);">Add Alert</button><br/><div></div>';
      let dropdown,input,button;
      [dropdown,input,button,,this.divs]=div.children;
      for(let description of [
         'Become top',
         'Leave grapes floor',
         'BERSERK!!',
         'Multi ready',
         'Bias ready',
         'Auto ready',
         'Throw ready',
         'Promote ready',
         'Points reached',
         'Power reached',
         'Bias follow',
         'Multi follow',
         'Pass ranker',
         'Become rank'
      ]){
         let option=document.createElement('option');
         option.value=description;
         option.text=description;
         dropdown.appendChild(option);
      }
      button.addEventListener('click',()=>this.add(dropdown.value,parseInt(input.value)));
      return div;
   },
   onTick(store,body){
      let alerted=false;
      let message=[];
      for(let [description,alert] of this.alerts.entries()){
         let active=alert.test(store);
         if(alert.checkboxSound.checked&&active){
            alerted=true;
         }
         if(alert.checkboxNotification.checked&&active){
            message.push(description);
         }
      }
      if(alerted){
         sobAlertSound.play(this.id);
         this.previousSound=true;
      }else if(this.previousSound){
         sobAlertSound.stop(this.id);
         this.previousSound=false;
      }
      if(message.length){
         sobAlertNotification.play(this.id,message.join('\n'));
         this.previousNotification=true;
      }else if(this.previousNotification){
         sobAlertNotification.stop(this.id);
         this.previousNotification=false;
      }
   }
}

const sobEta={
   id:'sobEta',
   busy:undefined,
   dropdown:undefined,
   out:undefined,
   getLadder(store,bias,multi,accountId){
      let yourRanker;
      if(accountId){
         yourRanker=store.ladder.rankers.find((ranker)=>ranker.accountId===accountId);
      }else{
         yourRanker=store.ladder.getters.yourRanker;
         accountId=yourRanker.accountId;
      }
      bias??=yourRanker.bias;
      multi??=yourRanker.multi;
      const resetPower=multi>yourRanker.multi;
      const resetPoints=resetPower||bias>yourRanker.bias;
      let ladder=store.ladder.state.rankers.map((ranker)=>ranker.accountId===accountId?{
         username:ranker.username,
         points:resetPoints?0:ranker.points.toNumber(),
         power:resetPower?0:ranker.power.toNumber(),
         bias:bias,
         multi:multi,
         growing:ranker.growing,
         ticks:0
      }:{
         username:ranker.username,
         points:ranker.points.toNumber(),
         power:ranker.power.toNumber(),
         bias:ranker.bias,
         multi:ranker.multi,
         growing:ranker.growing,
         ticks:0
      }).sort((l,r)=>r.points-l.points);
      ladder.growers=ladder.reduce((growers,ranker)=>ranker.growing?growers+1:growers,0);
      return ladder;
   },
   getRequirement(store){
      return store.ladder.state.basePointsToPromote.toNumber();
   },
   simulate:function(ladder,requirement){
      while(ladder.growers>0){
         for(let index=0;index<ladder.length;index++){
            if(ladder[index].growing){
               if(index>0){
                  ladder[index].power+=(index+ladder[index].bias)*ladder[index].multi;
               }
               ladder[index].points+=ladder[index].power;
               ladder[index].ticks++;
               for(let i=index;i>0&&ladder[i].points>ladder[i-1].points;i--){
                  [ladder[i],ladder[i-1]]=[ladder[i-1],ladder[i]];
               }
            }
         }
         if(ladder[0].growing&&ladder[0].points>=requirement){
            ladder[0].growing=false;
            ladder.growers--;
         }
      }
      const result=ladder.map((ranker)=>({
         time:new Date(Date.now()+ranker.ticks*1000).toLocaleTimeString(),
         ticks:((ticks)=>{
            const seconds=ticks%60;
            ticks=(ticks-seconds)/60;
            const minutes=ticks%60;
            ticks=(ticks-minutes)/60;
            const hours=ticks;
            return `${String(hours)}h ${String(minutes).padStart(2,' ')}m ${String(Math.floor(seconds)).padStart(2,' ')}s`
         })(ranker.ticks),
         points:ranker.points.toFixed(),
         power:ranker.power.toFixed(),
         bias:ranker.bias.toFixed(),
         multi:ranker.multi.toFixed(),
         username:ranker.username
      }));
      const max=result.reduce((max,resulter)=>{
         max.time=Math.max(max.time||0,resulter.time.length);
         max.ticks=Math.max(max.ticks||0,resulter.ticks.length);
         max.points=Math.max(max.points||0,resulter.points.length);
         max.power=Math.max(max.power||0,resulter.power.length);
         max.bias=Math.max(max.bias||0,resulter.bias.length);
         max.multi=Math.max(max.multi||0,resulter.multi.length);
         max.username=Math.max(max.username||0,resulter.username.length);
         return max;
      },{});

      return result.reverse().map(resulter=>`${resulter.time.padStart(max.time)}  ${resulter.ticks.padStart(max.ticks)}  ${resulter.points.padStart(max.points)}  ${resulter.power.padStart(max.power)}  ${resulter.bias.padStart(max.bias)}  ${resulter.multi.padStart(max.multi)}  ${resulter.username}`);
   },
   eta(ladder,requirement){
      this.busy=true;
      sobWorker.call(this.id,ladder,requirement).then(({result})=>this.out.textContent=result.join('\n'),this.busy=false).catch(({error})=>console.error('error',error));
   },
   nowEta(store){
      return [this.getLadder(store),this.getRequirement(store)];
   },
   biasEta(store){
      return [this.getLadder(store,store.ladder.getters.yourRanker.bias+1),this.getRequirement(store)];
   },
   multiEta(store){
      return [this.getLadder(store,0,store.ladder.getters.yourRanker.multi+1),this.getRequirement(store)];
   },
   multiPlusEta(store){
      const yourRanker=store.ladder.getters.yourRanker;
      return [this.getLadder(store,yourRanker.bias,yourRanker.multi+1),this.getRequirement(store)];
   },
   eta1(store=sobqol.store){
      return ['',
         this.simulate(...this.nowEta(store)).join('\n')
      ].join('\n\n');
   },
   eta2(store=sobqol.store){
      return ['',
         this.simulate(...this.nowEta(store)).join('\n'),
         this.simulate(...this.biasEta(store)).join('\n')
      ].join('\n\n');
   },
   eta3(store=sobqol.store){
      return ['',
         this.simulate(...this.nowEta(store)).join('\n'),
         this.simulate(...this.biasEta(store)).join('\n'),
         this.simulate(...this.multiEta(store)).join('\n')
      ].join('\n\n');
   },
   setup(store){
      this.busy=false;
      sobWorker.register(this.id,this.simulate);
   },
   div(store){
      let div=document.createElement('div');
      div.innerHTML='ETA: <select></select><br/><pre></pre>';
      [this.dropdown,,this.out]=div.children;
      for(let description of [
         'OFF',
         'NOW',
         'BIAS',
         'MULTI',
         'MULTI+'
      ]){
         let option=document.createElement('option');
         option.value=description;
         option.text=description;
         this.dropdown.appendChild(option);
      }
      return div;
   },
   onTick(store,body){
      if(!this.busy){
         switch(this.dropdown.value){
            case 'OFF':
               this.out.textContent='';
               break;
            case 'NOW':
               this.eta(...this.nowEta(store));
               break;
            case 'BIAS':
               this.eta(...this.biasEta(store));
               break;
            case 'MULTI':
               this.eta(...this.multiEta(store));
               break;
            case 'MULTI+':
               this.eta(...this.multiPlusEta(store));
               break;
            default:
               this.out.textContent='ERROR: Unrecognized type "'+this.dropdown.value+'"';
               break;
         }
      }
   }
}
