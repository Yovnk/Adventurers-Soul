export function createElarion(){
  const img=new Image(); img.src="Maps/elarion.jpg";
  const m={ mapName:"Elarion", displayName:"Elarion", name:"Elarion", file:"Maps/elarion.jpg", width:110, height:110, tileSize:32, pixelWidth:110*32, pixelHeight:110*32, tiles:[], image:img, loaded:false, esZonaSegura:true, nivelRecomendado:1 };
  for(let y=0;y<110;y++){ const r=[]; for(let x=0;x<110;x++) r.push(0); m.tiles.push(r); }
  
  m.portals = [
    { x1: 1515, y1: 2750, x2: 1670, y2: 2800, to: "CamposDelAmanecer", destX: 3400, destY: 370 }
  ];

  m.ready=new Promise(res=>{ img.onload=()=>{m.loaded=true;res(m)}; img.onerror=()=>res(m); });
  return m;
}
