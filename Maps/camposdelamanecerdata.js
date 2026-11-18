export function createCampos(){
  const img=new Image(); img.src="Maps/camposdelamanecer.jpg";
  const m={ mapName:"CamposDelAmanecer", displayName:"Campos Del Amanecer", name:"Campos Del Amanecer", file:"Maps/camposdelamanecer.jpg", width:200, height:200, tileSize:36, pixelWidth:200*36, pixelHeight:200*36, tiles:[], image:img, loaded:false, esZonaSegura:false, nivelRecomendado:1 };
  for(let y=0;y<m.height;y++){ const r=[]; for(let x=0;x<m.width;x++) r.push(0); m.tiles.push(r); }

  // Portal Campos -> Elarion
  // Coords de ejemplo, cambialas por las que quieras
  m.portals = [
    { x1: 100, y1: 100, x2: 250, y2: 200, to: "Elarion", destX: 1600, destY: 2700 }
  ];

  m.ready=new Promise(res=>{ img.onload=()=>{m.loaded=true;res(m)}; img.onerror=()=>res(m); });
  return m;
}
