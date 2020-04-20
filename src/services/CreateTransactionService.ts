import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Insufficient funds');
    }

    const categoriesRepository = getRepository(Category);

    // Busca se já existe a categoria recebida
    const categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    // Prepara uma possível criação de categoria
    const createdCategory = categoriesRepository.create({
      title: category,
    });

    // Se a categoria ainda não existe, cria uma nova categoria
    if (!categoryExists) {
      await categoriesRepository.save(createdCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryExists ? categoryExists.id : createdCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
