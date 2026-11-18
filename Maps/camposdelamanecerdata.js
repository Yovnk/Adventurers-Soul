export function createCampos(){
  const img=new Image(); img.src="Maps/camposdelamanecer.jpg";
  const m={ mapName:"CamposDelAmanecer", displayName:"Campos Del Amanecer", name:"Campos Del Amanecer", file:"Maps/camposdelamanecer.jpg", width:200, height:200, tileSize:36, pixelWidth:200*36, pixelHeight:200*36, tiles:[], image:img, loaded:false, esZonaSegura:false, nivelRecomendado:1 };
  for(let y=0;y<200;y++){ const r=[]; for(let x=0;x<200;x++) r.push(0); m.tiles.push(r); }
  m.ready=new Promise(res=>{ img.onload=()=>{m.loaded=true;res(m)}; img.onerror=()=>res(m); });
  return m;
}
