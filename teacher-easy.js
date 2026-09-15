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
  style.textContent=`
    #teacherEntry,#easyTeacherEntry,.studentIdentityCard,#teacherModal,#schoolCloudState,
    #studentSetupBtn,[data-student-setup],[data-school-setup],
    input[placeholder*="3-1"],input[placeholder*="12"]{display:none!important}
  `;
  (document.head||document.documentElement).appendChild(style);

  function removeSchoolUi(){
    document.querySelectorAll('.studentIdentityCard,#studentSetupBtn,#teacherEntry,#easyTeacherEntry,#teacherModal,#schoolCloudState').forEach(el=>el.remove());

    document.querySelectorAll('input').forEach(input=>{
      const p=(input.getAttribute('placeholder')||'').trim();
      if(p.includes('3-1')||p==='例 12'){
        let box=input.parentElement;
        while(box&&box!==document.body){
          const t=(box.textContent||'').replace(/\s+/g,'');
          if((t.includes('クラス')&&t.includes('出席番号'))||t.includes('学校用')){box.remove();break;}
          box=box.parentElement;
        }
      }
    });

    document.querySelectorAll('button').forEach(btn=>{
      const t=(btn.textContent||'').replace(/\s+/g,'');
      if(t.includes('クラス・出席番号を変更')) btn.remove();
    });
  }

  removeSchoolUi();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',removeSchoolUi,{once:true});
  else setTimeout(removeSchoolUi,0);
  window.addEventListener('load',()=>{removeSchoolUi();setTimeout(removeSchoolUi,500);},{once:true});
})();
