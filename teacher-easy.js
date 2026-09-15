(()=>{
  const originalFetch=window.fetch.bind(window);
  const blockedHosts=new Set(['arbcsdlypbtwiyrupaod.supabase.co']);
  const blockedLocalPaths=new Set(['/api/activity']);
  window.fetch=function(input,init){
    try{
      const raw=typeof input==='string'?input:input?.url;
      const url=new URL(raw,location.href);
      if(blockedHosts.has(url.hostname)||blockedLocalPaths.has(url.pathname)){
        console.info('[漢字たんけん] 端末内モードのため旧クラウド通信を停止:',url.pathname);
        return Promise.resolve(new Response(JSON.stringify({localOnly:true}),{status:200,headers:{'Content-Type':'application/json'}}));
      }
    }catch(_){}
    return originalFetch(input,init);
  };
  ['kq.cloudToken','kq.cloudSessionV2','kq.cloudSnapshotV2','kq.teacherToken','kq.schoolTeacherCode','kq.classCode','kq.studentNo','kq.studentProfile'].forEach(key=>localStorage.removeItem(key));
  const style=document.createElement('style');
  style.id='localOnlyPublicStyle';
  style.textContent='#teacherEntry,#easyTeacherEntry,.studentIdentityCard,#teacherModal,#schoolCloudState{display:none!important}';
  (document.head||document.documentElement).appendChild(style);
  function simplifyHome(){
    document.querySelector('.studentIdentityCard')?.remove();
    document.querySelector('#studentSetupBtn')?.remove();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',simplifyHome,{once:true});
  else simplifyHome();
})();
