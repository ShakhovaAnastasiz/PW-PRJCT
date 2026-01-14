  const date = new Date();
  date.setMonth(date.getMonth() + 3);

export const PaymentData = {
  creditCardNumber: "1111-1111-1111-1111",
  creditCardExpiry: `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
  creditCardCvv: "111",
  cardHolderName: "Jane Doe",
};