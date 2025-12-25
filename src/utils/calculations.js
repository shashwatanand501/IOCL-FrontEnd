export const calculateQty = ({
  qty,
  length,
  width,
  height,
  coefficient
}) => {
  if (qty && qty > 0) return Number(qty);

  const l = Number(length || 1);
  const w = Number(width || 1);
  const h = Number(height || 1);
  const c = Number(coefficient || 1);

  if (!length && !width) return 0;

  return l * w * h * c;
};
