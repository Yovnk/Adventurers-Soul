export function createElarion(){
  const img=new Image(); img.src="Maps/elarion.jpg";
  const m={ mapName:"Elarion", displayName:"Elarion", name:"Elarion", file:"Maps/elarion.jpg", width:120, height:120, tileSize:40, pixelWidth:120*40, pixelHeight:120*40, tiles:[], image:img, loaded:false, esZonaSegura:true, nivelRecomendado:1 };
  for(let y=0;y<120;y++){ const r=[]; for(let x=0;x<120;x++) r.push(0); m.tiles.push(r); }
  m.ready=new Promise(res=>{ img.onload=()=>{m.loaded=true;res(m)}; img.onerror=()=>res(m); });
  return m;
}
