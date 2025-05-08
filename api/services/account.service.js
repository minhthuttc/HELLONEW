const Account = require("../models/account.model");
const crypto = require("crypto");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createAccount = async ({ user, password, currency, description, balance }) => {
  const exists = await Account.findOne({ user });
  if (exists) throw new Error("User already exists");
  if (!password) throw new Error("Password is required");

  const hashedPassword = await bcrypt.hash(password, 10);

  const acc = new Account({
    user,
    password: hashedPassword,
    currency,
    description: description || `${user}'s budget`,
    balance: parseFloat(balance) || 0,
    transactions: [],
  });

  return acc.save();
};

const loginAccount = async ({ user, password }) => {
  const acc = await Account.findOne({ user });
  if (!acc) throw new Error('User not found');
  const isMatch = await bcrypt.compare(password, acc.password);
  if (!isMatch) throw new Error('Invalid password');
  // JWT payload chỉ nên chứa thông tin cần thiết
  const token = jwt.sign({ user: acc.user }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
  return { token };
};

const getAccount = async (user) => {
  return Account.findOne({ user });
};

const deleteAccount = async (user) => {
  return Account.deleteOne({ user });
};

const addTransaction = async (user, { date, object, amount }) => {
  const acc = await Account.findOne({ user });
  if (!acc) throw new Error("User not found");

  const amt = parseFloat(amount);
  if (isNaN(amt)) throw new Error("Invalid amount");

  const id = crypto.createHash("md5").update(date + object + amt).digest("hex");

  if (acc.transactions.some((tx) => tx.id === id)) {
    throw new Error("Transaction already exists");
  }

  const transaction = { id, date, object, amount: amt };
  acc.transactions.push(transaction);
  acc.balance += amt;

  await acc.save();
  return transaction;
};

const deleteTransaction = async (user, id) => {
  const acc = await Account.findOne({ user });
  if (!acc) throw new Error("User not found");

  const index = acc.transactions.findIndex((tx) => tx.id === id);
  if (index === -1) throw new Error("Transaction not found");

  const [removed] = acc.transactions.splice(index, 1);
  acc.balance -= removed.amount;

  await acc.save();
};

module.exports = {
  createAccount,
  getAccount,
  deleteAccount,
  addTransaction,
  deleteTransaction,
};