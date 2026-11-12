/**
 * Runtime-only mobile capability hints. No tracking, fingerprints, or external APIs.
 * Keep expensive WebGL optional on touch, slow-network, battery-limited devices.
 */
export function shouldAutoload3D({width=0,coarsePointer=false,saveData=false,effectiveType='',cores=null,memory=null,reducedMotion=false}={}){
  if(reducedMotion||saveData||coarsePointer||width<=820)return false;
  if(/(?:^|\b)(?:slow-2g|2g|3g)(?:\b|$)/i.test(String(effectiveType)))return false;
  if(Number.isFinite(cores)&&cores>0&&cores<=4)return false;
  if(Number.isFinite(memory)&&memory>0&&memory<4)return false;
  return true;
}
export function getMobileCapabilities(){
  if(typeof window==='undefined')return {width:0,reducedMotion:true};
  const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  return {
    width:window.innerWidth,
    coarsePointer:window.matchMedia('(pointer: coarse)').matches,
    saveData:Boolean(connection?.saveData),
    effectiveType:connection?.effectiveType||'',
    cores:navigator.hardwareConcurrency||null,
    memory:navigator.deviceMemory||null,
    reducedMotion:window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };
}
export function shouldSkipScrollEffects({width=0,reducedMotion=false,saveData=false}={}){
  return reducedMotion||saveData||width<=820;
}
