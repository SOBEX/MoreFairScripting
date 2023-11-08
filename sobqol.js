'use strict';

let alertSound={
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

let alertNotification={
   map:new Map(),
   register(id,title,body){
      let notification={title:title,body:body,notification:undefined};
      this.map.set(id,notification);
   },
   play(id,override){
      let notification=this.map.get(id);
      if(notification.notification){
         notification.notification.close()
         notification.notification=undefined;
      }else{
         notification.notification=new Notification(override.title||notification.title,{body:override.body||notification.body});
      }
   },
   stop(id){
      let notification=this.map.get(id);
      if(notification.notification){
         notification.notification.close()
         notification.notification=undefined;
      }
   }
}

let sob={
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
      if(JSON.stringify(Object.keys(this.api).sort((l,r)=>l>r))!='["addCallback","getHooks","stores"]'){
         console.log('New api keys detected.');
         newChangeDetected=true;
      }
      if(JSON.stringify(Object.keys(this.api.getHooks()).sort((l,r)=>l>r))!='["onAccountEvent","onChatEvent","onLadderEvent","onModChatEvent","onModLogEvent","onRoundEvent","onTick"]'){
         console.log('New events detected.');
         newChangeDetected=true;
      }
      if(JSON.stringify(Object.keys(this.api.stores).sort((l,r)=>l>r))!='["useAccountStore","useChatStore","useLadderStore","useOptionsStore","useRoundStore","useUiStore"]'){
         console.log('New stores detected.');
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
         ui:this.api.stores.useUiStore()
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
         <div style="position: absolute; left: 0px; top: 0px; width: auto; height: auto; min-width: 24px; min-height: 24px; max-width: 100%; max-height: 100%; resize: both; overflow: hidden; white-space: nowrap; z-index: 100000001; display: grid; grid-template-rows: 24px minmax(0, 1fr); grid-template-columns: minmax(0, 1fr) 24px;">
             <div style="background-color: var(--background-dark-color); color: var(--text-dark-highlight-color); grid-column: 1; text-align: left; cursor: move;">SOBEX/MoreFairScripting</div>
             <div style="background-color: var(--background-light-color); color: var(--text-light-highlight-color); grid-column: 2; text-align: center; cursor: pointer;">-</div>
             <div style="background-color: var(--background-color); color: var(--text-color); grid-row: 2; grid-column: 1 / span 2; overflow: auto; display: block;"></div>
         </div>
      `;
      let modal=div.firstElementChild;
      document.body.appendChild(modal);
      let [drag,minimize,content]=modal.children;

      let isDragging=false;
      let dragOffsetX,dragOffsetY;
      drag.addEventListener('mousedown',function(e){
         isDragging=true;
         dragOffsetX=e.clientX-modal.offsetLeft;
         dragOffsetY=e.clientY-modal.offsetTop;
      });
      window.addEventListener('mousemove',function(e){
         if(isDragging){
            let left=Math.max(0,e.clientX-dragOffsetX);
            let top=Math.max(0,e.clientY-dragOffsetY);
            modal.style.left=left+'px';
            modal.style.maxWidth='calc(100% - '+left+'px)';
            modal.style.top=top+'px';
            modal.style.maxHeight='calc(100% - '+top+'px)';
         }
      });
      window.addEventListener('mouseup',function(e){
         isDragging=false;
         if(e.clientX-dragOffsetX<=0){
            modal.style.width='auto';
         }
         if(e.clientY-dragOffsetY<=0){
            modal.style.height='auto';
         }
      });

      let isMinimized=false;
      let previousHeight=modal.style.height;
      minimize.addEventListener('click',function(){
         if(isMinimized){
            isMinimized=false;
            modal.style.height=previousHeight;
            minimize.innerText='-';
            content.style.display='block';
            modal.style.resize='both';
         }else{
            isMinimized = true;
            previousHeight=modal.style.height;
            modal.style.height='24px';
            minimize.innerText='+';
            content.style.display='none';
            modal.style.resize='none';
         }
      });

      this.divs=content;
      this.divs.map=new Map();

      this.reSetupInterval=setInterval(this.reSetup.bind(this),1000);
   },
   register(module){
      let id=module.id;

      module.setup(this.store);

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

let sobTest={
   id:'sobTest',
   count:undefined,
   span:undefined,
   setup(store){
      this.count=store.ladder.getters.yourRanker.accountId;
   },
   div(store){
      let div=document.createElement('div');
      div.innerHTML='dont mind me<br>just counting your accountId: <span></span>';
      [,this.span]=div.children;
      this.span.textContent=this.count;
      return div;
   },
   onAccountEvent(store,body){
      this.span.textContent=this.count+=1000000;
      console.log('onAccountEvent',this,store,body);
   },
   onChatEvent(store,body){
      this.span.textContent=this.count+=100000;
      console.log('onChatEvent',this,store,body);
   },
   onLadderEvent(store,body){
      this.span.textContent=this.count+=10000;
      console.log('onLadderEvent',this,store,body);
   },
   onModChatEvent(store,body){
      this.span.textContent=this.count+=1000;
      console.log('onModChatEvent',this,store,body);
   },
   onModLogEvent(store,body){
      this.span.textContent=this.count+=100;
      console.log('onModLogEvent',this,store,body);
   },
   onRoundEvent(store,body){
      this.span.textContent=this.count+=10;
      console.log('onRoundEvent',this,store,body);
   },
   onTick(store,body){
      this.span.textContent=this.count+=1;
      console.log('onTick',this,store,body);
   }
}

let sobTicker={
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
      div.innerHTML='<span></span> ticks<br><span></span> seconds (in-game)<br><span></span> seconds (real-time)';
      [this.spanTicks,,this.spanDeltas,,this.spanSeconds]=div.children;
      return div;
   },
   onTick(store,body){
      let now=performance.now();
      if(this.secondsStart){
         this.spanTicks.textContent=this.ticks+=1;
         this.spanDeltas.textContent=this.deltas+=body.delta;
         this.spanSeconds.textContent=(now-this.secondsStart)/1000;
      }else{
         this.secondsStart=now;
      }
   }
}

let sobSimExport={
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
      div.innerHTML='<button>Copy to clipboard</button><br><button>Download log</button><br><input type="checkbox" id="sobSimDoLog"> <label for="sobSimDoLog">Do log</label>';
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

let sobTop={
   id:'sobTop',
   previousSound:undefined,
   previousNotification:undefined,
   checkboxDoSound:undefined,
   checkboxDoNotification:undefined,
   setup(store){
      this.previousSound=false;
      this.previousNotification=false;
      alertSound.register(this.id,'https://assets.mixkit.co/sfx/preview/mixkit-police-whistle-614.mp3');
      alertNotification.register(this.id,'You\'re top!','Go ahead and press your buttons.');
   },
   div(store){
      let div=document.createElement('div');
      div.innerHTML='<input type="checkbox" id="sobTopDoSound"> <label for="sobTopDoSound">Do top sound</label><br><input type="checkbox" id="sobTopDoNotification"> <label for="sobTopDoNotification">Do top notification</label>';
      [this.checkboxDoSound,,,this.checkboxDoNotification]=div.children;
      return div;
   },
   onTick(store,body){
      if(this.checkboxDoSound.checked&&store.ladder.getters.yourRanker.rank==1){
         alertSound.play(this.id);
         this.previousSound=true;
      }else if(this.previousSound){
         alertSound.stop(this.id);
         this.previousSound=false;
      }
      if(this.checkboxDoNotification.checked&&store.ladder.getters.yourRanker.rank==1){
         alertNotification.play(this.id);
         this.previousNotification=true;
      }else if(this.previousNotification){
         alertNotification.stop(this.id);
         this.previousNotification=false;
      }
   }
}

let sobBottom={
   id:'sobBottom',
   previousSound:undefined,
   previousNotification:undefined,
   checkboxDoSound:undefined,
   checkboxDoNotification:undefined,
   setup(store){
      this.previousSound=false;
      this.previousNotification=false;
      alertSound.register(this.id,'https://assets.mixkit.co/sfx/preview/mixkit-police-whistle-614.mp3');
      alertNotification.register(this.id,'You\'re no longer bottom!','Go ahead and press your buttons.');
   },
   div(store){
      let div=document.createElement('div');
      div.innerHTML='<input type="checkbox" id="sobBottomDoSound"> <label for="sobBottomDoSound">Do bottom sound</label><br><input type="checkbox" id="sobBottomDoNotification"> <label for="sobBottomDoNotification">Do bottom notification</label>';
      [this.checkboxDoSound,,,this.checkboxDoNotification]=div.children;
      return div;
   },
   onTick(store,body){
      if(this.checkboxDoSound.checked&&store.ladder.getters.yourRanker.rank!=store.ladder.state.rankers.length){
         alertSound.play(this.id);
         this.previousSound=true;
      }else if(this.previousSound){
         alertSound.stop(this.id);
         this.previousSound=false;
      }
      if(this.checkboxDoNotification.checked&&store.ladder.getters.yourRanker.rank!=store.ladder.state.rankers.length){
         alertNotification.play(this.id);
         this.previousNotification=true;
      }else if(this.previousNotification){
         alertNotification.stop(this.id);
         this.previousNotification=false;
      }
   }
}

sob.setup();
//sob.register(sobTest);
sob.register(sobTicker);
sob.register(sobSimExport);
sob.register(sobTop);
sob.register(sobBottom);
