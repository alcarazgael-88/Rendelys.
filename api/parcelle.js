// GET /api/parcelle?q=12 rue ... Aubagne  -> adresse géocodée + parcelle cadastrale
module.exports=async(req,res)=>{
  const q=String(req.query.q||"").trim().slice(0,200);
  if(q.length<5)return res.status(400).json({error:"adresse trop courte"});
  try{
    const a=await fetch("https://api-adresse.data.gouv.fr/search/?limit=1&q="+encodeURIComponent(q));
    if(!a.ok)throw new Error("API Adresse HTTP "+a.status);
    const f=((await a.json()).features||[])[0];
    if(!f)return res.status(404).json({error:"adresse introuvable"});
    const [lon,lat]=f.geometry.coordinates,p=f.properties;
    const geom=encodeURIComponent(JSON.stringify({type:"Point",coordinates:[lon,lat]}));
    const c=await fetch("https://apicarto.ign.fr/api/cadastre/parcelle?geom="+geom);
    if(!c.ok)throw new Error("API Carto HTTP "+c.status);
    const pf=((await c.json()).features||[])[0];
    res.status(200).json({adresse:p.label,commune:p.city,codeInsee:p.citycode,cp:p.postcode,lon,lat,
      parcelle:pf?{section:pf.properties.section,numero:pf.properties.numero,contenance:pf.properties.contenance,idu:pf.properties.idu}:null});
  }catch(e){res.status(502).json({error:e.message})}
};
