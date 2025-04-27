import Transaction from "../models/transaction.model.js";

const transactionsResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        if (!context.getUser()) {
          throw new Error("Unauthenticated!");
        }
        const userId = await context.getUser()._id;

        const transactions = await Transaction.find({ userId: userId });
        return transactions;
      } catch (err) {
        console.error("Error fetching transactions:", err);
        throw new Error("Error fetching transactions!");
      }
    },

    transaction: async (_, { transactionId }) => {
      try {
        const transaction = await Transaction.findById(transactionId);

        return transaction;
      } catch (error) {
        console.error("Error fetching transaction:", error);
        throw new Error("Error fetching transaction!");
      }
    },
  },

  Mutation: {
    createTransaction: async (_, { input }, context) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        condsole.error("Error creating transaction:", error);
        throw new Error("Error creating transaction!");
      }
    },

    updateTransaction: async (_, { input }) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          { ...input },
          { new: true }
        );
        return updatedTransaction;
      } catch (error) {
        console.error("Error updating transaction:", error);
        throw new Error("Error updating transaction!");
      }
    },

    deleteTransaction: async (_, { transactionId }) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deletedTransaction;
      } catch (error) {
        console.error("Error deleting transaction:", error);
        throw new Error("Error deleting transaction!");
      }
    },
  },
};

export default transactionsResolver;
