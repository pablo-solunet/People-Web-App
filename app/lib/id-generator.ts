let requisitionCounter = 1;
let loteCounter = 1;

function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateIds(count: number) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const loteId = `LOT-${String(loteCounter).padStart(6, '0')}-${year}${month}${day}`;

  const ids = Array.from({ length: count }, (_, index) => ({
    id_reg: generateUniqueId(),
    lote_id: loteId,
    requisition_id: `RQ-${String(requisitionCounter + index).padStart(5, '0')}`
  }));

  requisitionCounter += count;
  loteCounter++;
  return ids;
}

