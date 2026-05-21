export const generateOrderNumber = () => {
  const now = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `NQ-${now}-${random}`;
};
