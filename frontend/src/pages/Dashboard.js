import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState({ cash: 0, bank1: 0, bank2: 0, total: 0 });
  const [stockItems, setStockItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    transaction_type: 'sell',
    name: '',
    amount: '',
    payment_method: 'cash',
    stock_code: '',
  });

  const [customerForm, setCustomerForm] = useState({ name: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '' });

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
    fetchStockItems();
    fetchCustomers();
    fetchSuppliers();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${API}/balance`);
      setBalance(response.data);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchStockItems = async () => {
    try {
      const response = await axios.get(`${API}/stock?status=current`);
      setStockItems(response.data);
    } catch (error) {
      console.error('Error fetching stock items:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers-suppliers?type=customer`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/customers-suppliers?type=supplier`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/transactions`, transactionForm);
      toast.success('Transaction added successfully');
      setShowTransactionModal(false);
      setTransactionForm({
        date: new Date().toISOString().split('T')[0],
        transaction_type: 'sell',
        name: '',
        amount: '',
        payment_method: 'cash',
        stock_code: '',
      });
      fetchTransactions();
      fetchBalance();
      fetchStockItems();
    } catch (error) {
      toast.error('Error adding transaction');
      console.error('Error adding transaction:', error);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/customers-suppliers`, {
        name: customerForm.name,
        type: 'customer',
      });
      toast.success('Customer added successfully');
      setShowCustomerModal(false);
      setCustomerForm({ name: '' });
      fetchCustomers();
    } catch (error) {
      toast.error('Error adding customer');
      console.error('Error adding customer:', error);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/customers-suppliers`, {
        name: supplierForm.name,
        type: 'supplier',
      });
      toast.success('Supplier added successfully');
      setShowSupplierModal(false);
      setSupplierForm({ name: '' });
      fetchSuppliers();
    } catch (error) {
      toast.error('Error adding supplier');
      console.error('Error adding supplier:', error);
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    try {
      await axios.delete(`${API}/transactions/${transaction.date}/${transaction.name}`);
      toast.success('Transaction deleted successfully');
      fetchTransactions();
      fetchBalance();
    } catch (error) {
      toast.error('Error deleting transaction');
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 mb-6">Dashboard</h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6" data-testid="total-balance-card">
            <p className="text-sm text-slate-600 mb-1">Total Cash in Hand</p>
            <p className="text-3xl font-bold text-slate-900">₹{balance.total.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6" data-testid="cash-balance-card">
            <p className="text-sm text-slate-600 mb-1">Cash</p>
            <p className="text-2xl font-semibold text-slate-900">₹{balance.cash.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6" data-testid="bank1-balance-card">
            <p className="text-sm text-slate-600 mb-1">Bank 1</p>
            <p className="text-2xl font-semibold text-slate-900">₹{balance.bank1.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6" data-testid="bank2-balance-card">
            <p className="text-sm text-slate-600 mb-1">Bank 2</p>
            <p className="text-2xl font-semibold text-slate-900">₹{balance.bank2.toFixed(2)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
            <DialogTrigger asChild>
              <Button data-testid="add-transaction-btn" className="bg-slate-900 hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="add-transaction-modal">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>Enter transaction details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    data-testid="transaction-date-input"
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="transaction_type">Transaction Type</Label>
                  <Select
                    value={transactionForm.transaction_type}
                    onValueChange={(value) => setTransactionForm({ ...transactionForm, transaction_type: value })}
                  >
                    <SelectTrigger data-testid="transaction-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sell" data-testid="transaction-type-sell">Sell</SelectItem>
                      <SelectItem value="purchase" data-testid="transaction-type-purchase">Purchase</SelectItem>
                      <SelectItem value="spending" data-testid="transaction-type-spending">Spending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Customer/Supplier Name</Label>
                  <Input
                    id="name"
                    data-testid="transaction-name-input"
                    value={transactionForm.name}
                    onChange={(e) => setTransactionForm({ ...transactionForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    data-testid="transaction-amount-input"
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select
                    value={transactionForm.payment_method}
                    onValueChange={(value) => setTransactionForm({ ...transactionForm, payment_method: value })}
                  >
                    <SelectTrigger data-testid="payment-method-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash" data-testid="payment-method-cash">Cash</SelectItem>
                      <SelectItem value="bank1" data-testid="payment-method-bank1">Bank 1</SelectItem>
                      <SelectItem value="bank2" data-testid="payment-method-bank2">Bank 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(transactionForm.transaction_type === 'sell' || transactionForm.transaction_type === 'purchase') && (
                  <div>
                    <Label htmlFor="stock_code">Stock Code</Label>
                    <Select
                      value={transactionForm.stock_code}
                      onValueChange={(value) => setTransactionForm({ ...transactionForm, stock_code: value })}
                    >
                      <SelectTrigger data-testid="stock-code-select">
                        <SelectValue placeholder="Select stock item" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockItems.map((item) => (
                          <SelectItem key={item.item_number} value={item.item_number}>
                            {item.item_number} - {item.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" data-testid="submit-transaction-btn" className="w-full bg-slate-900 hover:bg-slate-800">
                  Add Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
            <DialogTrigger asChild>
              <Button data-testid="add-customer-btn" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="add-customer-modal">
              <DialogHeader>
                <DialogTitle>Add Customer</DialogTitle>
                <DialogDescription>Enter customer name</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    data-testid="customer-name-input"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ name: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" data-testid="submit-customer-btn" className="w-full bg-slate-900 hover:bg-slate-800">
                  Add Customer
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showSupplierModal} onOpenChange={setShowSupplierModal}>
            <DialogTrigger asChild>
              <Button data-testid="add-supplier-btn" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="add-supplier-modal">
              <DialogHeader>
                <DialogTitle>Add Supplier</DialogTitle>
                <DialogDescription>Enter supplier name</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSupplier} className="space-y-4">
                <div>
                  <Label htmlFor="supplier_name">Supplier Name</Label>
                  <Input
                    id="supplier_name"
                    data-testid="supplier-name-input"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ name: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" data-testid="submit-supplier-btn" className="w-full bg-slate-900 hover:bg-slate-800">
                  Add Supplier
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" data-testid="transactions-table">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Stock Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {transactions.map((transaction, index) => (
                  <tr key={index} data-testid={`transaction-row-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.transaction_type === 'sell'
                            ? 'bg-green-100 text-green-800'
                            : transaction.transaction_type === 'purchase'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{transaction.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">₹{transaction.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{transaction.payment_method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{transaction.stock_code || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`delete-transaction-${index}`}
                        onClick={() => handleDeleteTransaction(transaction)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;