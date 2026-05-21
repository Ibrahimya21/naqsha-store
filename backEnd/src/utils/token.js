import crypto from "crypto";

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const getResetTokenExpiryDate = () => {
  const minutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 15);
  return new Date(Date.now() + minutes * 60 * 1000);
};
