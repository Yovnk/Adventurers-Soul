import { createElarion } from "./elariondata.js";
import { createCampos } from "./camposdelamanecerdata.js";
export async function loadAllMaps(){
  const elarion=createElarion(), campos=createCampos();
  await Promise.all([elarion.ready, campos.ready]);
  return { Elarion: elarion, CamposDelAmanecer: campos };
}
