const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const PORT=process.env.PORT||10000;
const KEY=process.env.CCO_API_KEY;
const REFERER=process.env.CCO_REFERER;
const root=path.join(__dirname,'public');
http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/start-bay'){
  res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','public,max-age=600');
  if(!KEY||!REFERER){res.writeHead(503);return res.end(JSON.stringify({error:'CCO_API_KEY and CCO_REFERER must be configured for the deployment domain'}));}
  try{
   const u='https://coastalmonitoring.org/observations/waves/latest.geojson?sensor=Start%20Bay&duration=24';
   const upstream=await fetch(u,{headers:{'X-API-Key':KEY,'Referer':REFERER,'Accept':'application/json'},signal:AbortSignal.timeout(12000)});
   if(!upstream.ok){res.writeHead(502);return res.end(JSON.stringify({error:'CCO upstream refused request',status:upstream.status}));}
   const data=await upstream.json();return res.end(JSON.stringify({source:'Channel Coastal Observatory',receivedAt:new Date().toISOString(),data}));
  }catch(e){res.writeHead(502);return res.end(JSON.stringify({error:'Buoy API unavailable'}));}
 }
 if(pathname==='/health'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({ok:true}));}
 const file=path.join(root,pathname==='/'?'index.html':pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'text/plain');res.end(data);});
}).listen(PORT,'0.0.0.0',()=>console.log('Torcross listening',PORT));
