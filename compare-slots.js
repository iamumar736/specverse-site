// Each comparison position is a stable slot so all three search fields can be used independently.
export const EMPTY_COMPARE_SLOTS=Object.freeze([null,null,null]);

export function updateComparisonSlot(slots,index,phoneId){
  if(!Number.isInteger(index)||index<0||index>=3)return slots;
  const nextId=phoneId||null;
  if(nextId&&slots.some((id,i)=>i!==index&&id===nextId))return slots;
  return slots.map((id,i)=>i===index?nextId:id);
}
export function toggleComparisonPhone(slots,phoneId){
  if(!phoneId)return slots;
  const existingIndex=slots.indexOf(phoneId);
  if(existingIndex>=0)return updateComparisonSlot(slots,existingIndex,null);
  const emptyIndex=slots.findIndex(id=>!id);
  return emptyIndex<0?slots:updateComparisonSlot(slots,emptyIndex,phoneId);
}
export function selectedComparisonIds(slots){
  return slots.filter(Boolean);
}
