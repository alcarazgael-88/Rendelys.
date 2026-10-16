// GET /api/dvf?code=13005&years=2023,2024,2025
function csvRows(t){const o=[];let r=[],f="",q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}else if(c=='"')q=true;else if(c==","){r.push(f);f=""}else if(c=="\n"){r.push(f);o.push(r);r=[];f=""}else if(c!="\r")f+=c}if(f||r.length){r.push(f);o.push(r)}return o}
function parse(txt){const r=csvRows(txt),h=r[0]||[],ix={};h.forEach((n,i)=>ix[n]=i);
  if(ix.id_mutation==null||ix.valeur_fonciere==null)return [];
  const g={};for(let i=1;i<r.length;i++){const x=r[i];if(x.length<h.length-2)continue;(g[x[ix.id_mutation]]=g[x[ix.id_mutation]]||[]).push(x)}
  const res=[];for(const id in g){const rows=g[id];if(rows[0][ix.nature_mutation]!=="Vente")continue;
    const loc=rows.filter(x=>x[ix.type_local]==="Appartement"||x[ix.type_local]==="Maison");
    if(!loc.length||new Set(loc.map(x=>x[ix.type_local]+"|"+x[ix.surface_reelle_bati])).size!==1)continue;
    const l=loc[0],p=+l[ix.valeur_fonciere],s=+l[ix.surface_reelle_bati];
    if(!(p>0)||!(s>9))continue;const m=p/s;if(m<500||m>20000)continue;
    res.push({id,d:l[ix.date_mutation],t:l[ix.type_local],n:+l[ix.nombre_pieces_principales]||0,s,p,m:Math.round(m)})}
  return res}
module.exports=async(req,res)=>{
  const code=String(req.query.code||""),years=String(req.query.years||"2024").split(",").filter(y=>/^20(19|2\d)$/.test(y)).slice(0,6);
  if(!/^(\d{5}|2[AB]\d{3})$/.test(code)||!years.length)return res.status(400).json({error:"paramètres invalides"});
  const dep=code.startsWith("97")?code.slice(0,3):code.slice(0,2),rows=[],errors=[];
  await Promise.all(years.map(async y=>{try{
    const r=await fetch(`https://files.data.gouv.fr/geo-dvf/latest/csv/${y}/communes/${dep}/${code}.csv`);
    if(!r.ok){errors.push(`${y}: HTTP ${r.status}`);return}
    rows.push(...parse(await r.text()))}catch(e){errors.push(`${y}: ${e.message}`)}}));
  if(!rows.length&&errors.length===years.length)return res.status(502).json({error:"DVF indisponible",errors});
  res.setHeader("Cache-Control","s-maxage=86400, stale-while-revalidate");
  res.status(200).json({code,rows,errors});
};
