/* JASON INVEST - local demo data layer
   This file makes the supplied frontend work on static hosting (GitHub Pages/Vercel static).
   It stores demo data in this browser only. It does NOT process real money or provide secure production authentication.
*/
(function(){
  const DBKEY='jason_invest_demo_v2';
  const SESSION='jason_invest_session';
  const ADMIN='jason_invest_admin';
  const now=()=>new Date().toISOString();
  function load(){try{return JSON.parse(localStorage.getItem(DBKEY))||{users:[],deposits:[],withdrawals:[],investments:[],transactions:[],notifications:[],vip:[]}}catch(e){return {users:[],deposits:[],withdrawals:[],investments:[],transactions:[],notifications:[],vip:[]}}}
  function save(db){localStorage.setItem(DBKEY,JSON.stringify(db));}
  function id(p){return p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
  function currentUser(db){const uid=localStorage.getItem(SESSION);return db.users.find(u=>u.id===uid)||null}
  function response(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})}
  function bodyOf(init){try{return init&&init.body?JSON.parse(init.body):{}}catch(e){return {}}}
  function adminOk(){return localStorage.getItem(ADMIN)==='1'}
  function userView(u){if(!u)return null; const x={...u}; delete x.password; return x}
  function authFail(){return response({success:false,message:'Vous devez être connecté.'},401)}
  function adminFail(){return response({success:false,message:'Accès administrateur requis.'},403)}

  const originalFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(!url.startsWith('/api/')) return originalFetch(input,init);
    const method=((init&&init.method)||'GET').toUpperCase();
    const path=new URL(url,location.origin).pathname;
    const body=bodyOf(init);
    const db=load();

    // AUTH
    if(path==='/api/auth/register' && method==='POST'){
      const email=String(body.email||'').trim().toLowerCase();
      if(!body.name||!body.phone||!email||!body.password) return response({success:false,message:'Tous les champs obligatoires sont requis.'},400);
      if(db.users.some(u=>u.email===email)) return response({success:false,message:'Cette adresse e-mail est déjà utilisée.'},409);
      const u={id:id('usr'),name:String(body.name).trim(),phone:String(body.phone).trim(),email,password:String(body.password),balance:0,balance_fc:0,investment:0,points:0,vipLevel:'Aucun',status:'active',referral:body.referral||null,referralCode:'JAS-'+Math.random().toString(36).slice(2,8).toUpperCase(),createdAt:now()};
      db.users.push(u);save(db);localStorage.setItem(SESSION,u.id);
      return response({success:true,user:userView(u),message:'Compte créé avec succès.'});
    }
    if(path==='/api/auth/login' && method==='POST'){
      const email=String(body.email||'').trim().toLowerCase(); const u=db.users.find(x=>x.email===email);
      if(!u||u.password!==String(body.password||'')) return response({success:false,message:'E-mail ou mot de passe incorrect.'},401);
      localStorage.setItem(SESSION,u.id);return response({success:true,user:userView(u),message:'Connexion réussie.'});
    }
    if(path==='/api/auth/logout' && method==='POST'){localStorage.removeItem(SESSION);return response({success:true,message:'Déconnexion réussie.'});}
    if(path==='/api/auth/forgot-password' && method==='POST') return response({success:true,message:'Si le compte existe, la procédure de récupération peut être poursuivie par le support.'});

    // USER
    if(path==='/api/user/me' && method==='GET') {const u=currentUser(db);return u?response({success:true,user:userView(u)}):authFail();}
    if(path==='/api/user/profile' && method==='PUT') {const u=currentUser(db);if(!u)return authFail();if(body.name)u.name=String(body.name).trim();if(body.phone)u.phone=String(body.phone).trim();save(db);return response({success:true,user:userView(u),message:'Profil mis à jour avec succès.'});}
    if(path==='/api/transactions/history' && method==='GET'){const u=currentUser(db);if(!u)return authFail();return response({success:true,transactions:db.transactions.filter(t=>t.userId===u.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});}
    if(path==='/api/notifications' && method==='GET'){const u=currentUser(db);if(!u)return authFail();return response({success:true,notifications:db.notifications.filter(n=>!n.userId||n.userId===u.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});}
    if(path==='/api/notifications/read-all' && method==='POST'){return currentUser(db)?response({success:true}):authFail();}

    // DEPOSIT / WITHDRAWAL
    if(path==='/api/transactions/deposit' && method==='POST'){
      const u=currentUser(db);if(!u)return authFail(); const amount=Number(body.amount);
      if(!Number.isFinite(amount)||amount<20000)return response({success:false,message:'Le montant minimum d’un dépôt est de 20 000 FC.'},400);
      const d={id:id('dep'),userId:u.id,userName:u.name,email:u.email,amount,paymentMethod:body.paymentMethod||'Orange Money',phone:body.phone||u.phone,reference:body.reference||'',status:'pending',createdAt:now()};
      db.deposits.push(d);db.transactions.push({id:id('tx'),userId:u.id,type:'deposit',amount,status:'pending',reference:d.reference,createdAt:d.createdAt});save(db);
      return response({success:true,deposit:d,message:'Votre demande de dépôt a été envoyée. Elle sera vérifiée par l’administration.'});
    }
    if(path==='/api/transactions/withdraw' && method==='POST'){
      const u=currentUser(db);if(!u)return authFail(); const amount=Number(body.amount);
      if(!Number.isFinite(amount)||amount<=0)return response({success:false,message:'Montant de retrait invalide.'},400);
      if(amount>Number(u.balance||0))return response({success:false,message:'Solde insuffisant.'},400);
      const w={id:id('wd'),userId:u.id,userName:u.name,email:u.email,amount,paymentMethod:body.paymentMethod||'Orange Money',phone:body.phone||u.phone,status:'pending',createdAt:now()};db.withdrawals.push(w);db.transactions.push({id:id('tx'),userId:u.id,type:'withdrawal',amount,status:'pending',createdAt:w.createdAt});save(db);return response({success:true,withdrawal:w,message:'Votre demande de retrait a été envoyée. Elle sera vérifiée par l’administration.'});
    }
    if(path==='/api/investments/create' && method==='POST'){
      const u=currentUser(db);if(!u)return authFail(); const amount=Number(body.amount);if(!Number.isFinite(amount)||amount<20000)return response({success:false,message:'Le montant minimum d’investissement est de 20 000 FC.'},400);if(amount>Number(u.balance||0))return response({success:false,message:'Solde insuffisant pour cette demande.'},400);
      const inv={id:id('inv'),userId:u.id,userName:u.name,plan:body.plan||'personnalise',amount,status:'pending',createdAt:now()};db.investments.push(inv);db.transactions.push({id:id('tx'),userId:u.id,type:'investment',amount,status:'pending',createdAt:inv.createdAt});save(db);return response({success:true,investment:inv,message:'Votre demande d’investissement a été enregistrée et doit être validée par l’administration.'});
    }
    if(path==='/api/vip/purchase' && method==='POST'){
      const u=currentUser(db);if(!u)return authFail();u.vipLevel=String(body.vipLevel||'Bronze');db.vip.push({id:id('vip'),userId:u.id,level:u.vipLevel,status:'active',createdAt:now()});save(db);return response({success:true,user:userView(u),message:'Votre niveau VIP a été mis à jour.'});
    }

    // ADMIN
    if(path==='/api/admin/me' && method==='GET'){localStorage.setItem(ADMIN,'1');return response({success:true,admin:{id:'local-admin',name:'Administrateur',email:'admin@jasoninvest.local',role:'admin'}});}
    if(path==='/api/admin/stats' && method==='GET'){if(!adminOk())return adminFail();return response({success:true,stats:{users:db.users.length,deposits:db.deposits.length,withdrawals:db.withdrawals.length,investments:db.investments.length,pendingDeposits:db.deposits.filter(x=>x.status==='pending').length,pendingWithdrawals:db.withdrawals.filter(x=>x.status==='pending').length,pendingInvestments:db.investments.filter(x=>x.status==='pending').length}});}
    if(path==='/api/admin/users' && method==='GET'){if(!adminOk())return adminFail();return response({success:true,users:db.users.map(userView)});}
    if(path==='/api/admin/deposits' && method==='GET'){if(!adminOk())return adminFail();return response({success:true,deposits:db.deposits});}
    if(path==='/api/admin/withdrawals' && method==='GET'){if(!adminOk())return adminFail();return response({success:true,withdrawals:db.withdrawals});}
    if(path==='/api/admin/investments' && method==='GET'){if(!adminOk())return adminFail();return response({success:true,investments:db.investments});}
    if(path==='/api/admin/vip' && method==='GET'){if(!adminOk())return adminFail();return response({success:true,vip:db.vip});}
    if(path==='/api/admin/transactions' && method==='GET'){if(!adminOk())return adminFail();return response({success:true,transactions:db.transactions});}
    if(path==='/api/admin/notifications' && method==='GET'){if(!adminOk())return adminFail();return response({success:true,notifications:db.notifications});}
    if(path==='/api/admin/notifications' && method==='POST'){if(!adminOk())return adminFail();const n={id:id('ntf'),title:String(body.title||'Notification'),message:String(body.message||''),createdAt:now()};db.notifications.push(n);save(db);return response({success:true,notification:n,message:'Notification envoyée avec succès.'});}
    if(path==='/api/admin/notifications/read-all' && method==='POST'){return response({success:true});}

    let m=path.match(/^\/api\/admin\/(deposits|withdrawals|investments)\/([^/]+)\/(approve|reject)$/);
    if(m&&method==='POST'){if(!adminOk())return adminFail();const type=m[1],rid=decodeURIComponent(m[2]),action=m[3];const arr=type==='deposits'?db.deposits:type==='withdrawals'?db.withdrawals:db.investments;const item=arr.find(x=>x.id===rid);if(!item)return response({success:false,message:'Opération introuvable.'},404);if(item.status!=='pending')return response({success:false,message:'Cette opération a déjà été traitée.'},400);const u=db.users.find(x=>x.id===item.userId);if(action==='approve'){if(type==='deposits'){item.status='approved';if(u){u.balance=Number(u.balance||0)+Number(item.amount);u.balance_fc=u.balance;u.points=Number(u.points||0)+Math.floor(Number(item.amount)/1000);}}else if(type==='withdrawals'){if(!u||Number(u.balance||0)<Number(item.amount))return response({success:false,message:'Solde insuffisant au moment de la validation.'},400);item.status='approved';u.balance-=Number(item.amount);u.balance_fc=u.balance;}else{if(!u||Number(u.balance||0)<Number(item.amount))return response({success:false,message:'Solde insuffisant au moment de la validation.'},400);item.status='approved';u.balance-=Number(item.amount);u.balance_fc=u.balance;u.investment=Number(u.investment||0)+Number(item.amount);}}else item.status='rejected';const tx=db.transactions.find(t=>((type==='deposits'&&t.type==='deposit')||(type==='withdrawals'&&t.type==='withdrawal')||(type==='investments'&&t.type==='investment'))&&t.userId===item.userId&&t.amount===item.amount&&t.status==='pending');if(tx)tx.status=item.status;save(db);return response({success:true,item,user:u?userView(u):null,message:action==='approve'?'Opération approuvée.':'Opération rejetée.'});}

    return response({success:false,message:'Route API non disponible dans cette version statique.'},404);
  };
})();
