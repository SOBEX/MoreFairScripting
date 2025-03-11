(()=>{
   const script=document.createElement('script');
   script.src='https://sobex.github.io/MoreFairScripting/sobqol.js';
   script.onload=()=>{
      sobqol.setup();
      //sobqol.register(sobTest);
      sobqol.register(sobPermissions);
      sobqol.register(sobTicker);
      //sobqol.register(sobSimExport);
      //sobqol.register(sobTop);
      //sobqol.register(sobBottom);
      sobqol.register(sobAlerter);
      sobAlerter.add('Become top',0);
      sobAlerter.add('Leave grapes floor',0);
      //sobAlerter.add('BERSERK!!',0);
      sobAlerter.add('Multi ready',0);
      sobAlerter.add('Bias ready',0);
      //sobAlerter.add('Auto ready',0);
      //sobAlerter.add('Throw ready',0);
      sobAlerter.add('Promote ready',0);
      //sobAlerter.add('Points reached',1000000);
      //sobAlerter.add('Power reached',10000);
      //sobAlerter.add('Bias follow',41894);
      //sobAlerter.add('Multi follow',41894);
      //sobAlerter.add('Pass ranker',41894);
      //sobAlerter.add('Become rank',2);
      sobqol.register(sobEta);
   }
   document.head.appendChild(script);
})();
