export function generateReport(
  userId: string,
  data: {
    name: string;
    age: number;
    email: string;
    purchaseHistory: Array<{ item: string; date: string; amount: number }>;
  },
): string {
  const userGreeting = `Hello ${data.name}, thank you for being a valued customer! We have reviewed your purchase history and generated the following report for user ID: ${userId}.`;

  const purchasesSummary = data.purchaseHistory
    .map(
      (purchase, index) =>
        `Purchase #${index + 1}: Item - ${purchase.item}, Date - ${purchase.date}, Amount - $${purchase.amount.toFixed(2)}`,
    )
    .join("; ");

  const report = `${userGreeting} Your age is ${data.age}, and your registered email is ${data.email}. Here is a summary of your recent purchases: ${purchasesSummary}`;

  return report;
}
