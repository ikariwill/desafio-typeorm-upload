import csv from 'csvtojson';
import fs from 'fs';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const csvTransactions = await csv().fromFile(
      `${uploadConfig.directory}/${filename}`,
    );

    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const { title, type, category, value } of csvTransactions) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const created = await createTransaction.execute({
        title: title.trim(),
        type: type.trim(),
        category: category.trim(),
        value: Number(value.trim()),
      });

      transactions.push(created);
    }

    await fs.promises.unlink(`${uploadConfig.directory}/${filename}`);

    return transactions;
  }
}

export default ImportTransactionsService;
