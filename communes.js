// GET /api/communes?dep=13,83  -> [{nom, code, population}]
module.exports=async(req,res)=>{
  const deps=String(req.query.dep||"13").split(",").filter(d=>/^(\d{2,3}|2[AB])$/.test(d)).slice(0,5);
  try{
    const out=[];
    for(const d of deps){const r=await fetch(`https://geo.api.gouv.fr/departements/${d}/communes?fields=nom,code,population`);
      if(!r.ok)throw new Error("geo.api.gouv.fr HTTP "+r.status);out.push(...await r.json())}
    res.setHeader("Cache-Control","s-maxage=604800, stale-while-revalidate");
    res.status(200).json(out);
  }catch(e){res.status(502).json({error:e.message})}
};
