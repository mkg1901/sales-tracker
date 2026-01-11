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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Stock = () => {
  const [currentStock, setCurrentStock] = useState([]);
  const [soldStock, setSoldStock] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const [itemForm, setItemForm] = useState({
    date_of_purchase: new Date().toISOString().split('T')[0],
    type: '',
    description: '',
    supplier_name: '',
    phone: '',
    price: '',
  });

  const [typeForm, setTypeForm] = useState({ name: '' });

  useEffect(() => {
    fetchCurrentStock();
    fetchSoldStock();
    fetchItemTypes();
  }, []);

  const fetchCurrentStock = async () => {
    try {
      const response = await axios.get(`${API}/stock?status=current`);
      setCurrentStock(response.data);
    } catch (error) {
      console.error('Error fetching current stock:', error);
    }
  };

  const fetchSoldStock = async () => {
    try {
      const response = await axios.get(`${API}/stock?status=sold`);
      setSoldStock(response.data);
    } catch (error) {
      console.error('Error fetching sold stock:', error);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await axios.get(`${API}/item-types`);
      setItemTypes(response.data);
    } catch (error) {
      console.error('Error fetching item types:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/stock`, itemForm);
      toast.success('Stock item added successfully');
      setShowItemModal(false);
      setItemForm({
        date_of_purchase: new Date().toISOString().split('T')[0],
        type: '',
        description: '',
        supplier_name: '',
        phone: '',
        price: '',
      });
      fetchCurrentStock();
    } catch (error) {
      toast.error('Error adding stock item');
      console.error('Error adding stock item:', error);
    }
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/item-types`, typeForm);
      toast.success('Item type added successfully');
      setShowTypeModal(false);
      setTypeForm({ name: '' });
      fetchItemTypes();
    } catch (error) {
      toast.error('Error adding item type');
      console.error('Error adding item type:', error);
    }
  };

  const handleDeleteItem = async (itemNumber) => {
    try {
      await axios.delete(`${API}/stock/${itemNumber}`);
      toast.success('Stock item deleted successfully');
      fetchCurrentStock();
      fetchSoldStock();
    } catch (error) {
      toast.error('Error deleting stock item');
      console.error('Error deleting stock item:', error);
    }
  };

  const handleDeleteType = async (typeName) => {
    try {
      await axios.delete(`${API}/item-types/${typeName}`);
      toast.success('Item type deleted successfully');
      fetchItemTypes();
    } catch (error) {
      toast.error('Error deleting item type');
      console.error('Error deleting item type:', error);
    }
  };

  const StockTable = ({ items, testIdPrefix }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200" data-testid={`${testIdPrefix}-table`}>
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Item Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {items.map((item, index) => (
            <tr key={item.item_number} data-testid={`${testIdPrefix}-row-${index}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.item_number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.date_of_purchase}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.type}</td>
              <td className="px-6 py-4 text-sm text-slate-900">{item.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.supplier_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">₹{item.price}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid={`delete-${testIdPrefix}-${index}`}
                  onClick={() => handleDeleteItem(item.item_number)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 mb-6">Stock Management</h1>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
            <DialogTrigger asChild>
              <Button data-testid="add-item-btn" className="bg-slate-900 hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" data-testid="add-item-modal">
              <DialogHeader>
                <DialogTitle>Add Stock Item</DialogTitle>
                <DialogDescription>Enter item details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_purchase">Date of Purchase</Label>
                    <Input
                      id="date_of_purchase"
                      data-testid="item-date-input"
                      type="date"
                      value={itemForm.date_of_purchase}
                      onChange={(e) => setItemForm({ ...itemForm, date_of_purchase: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={itemForm.type}
                      onValueChange={(value) => setItemForm({ ...itemForm, type: value })}
                    >
                      <SelectTrigger data-testid="item-type-select">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemTypes.map((type) => (
                          <SelectItem key={type.name} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    data-testid="item-description-input"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier_name">Supplier Name</Label>
                    <Input
                      id="supplier_name"
                      data-testid="item-supplier-input"
                      value={itemForm.supplier_name}
                      onChange={(e) => setItemForm({ ...itemForm, supplier_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      data-testid="item-phone-input"
                      value={itemForm.phone}
                      onChange={(e) => setItemForm({ ...itemForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    data-testid="item-price-input"
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" data-testid="submit-item-btn" className="w-full bg-slate-900 hover:bg-slate-800">
                  Add Item
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showTypeModal} onOpenChange={setShowTypeModal}>
            <DialogTrigger asChild>
              <Button data-testid="add-type-btn" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="add-type-modal">
              <DialogHeader>
                <DialogTitle>Add Item Type</DialogTitle>
                <DialogDescription>Enter a new item type category</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddType} className="space-y-4">
                <div>
                  <Label htmlFor="type_name">Type Name</Label>
                  <Input
                    id="type_name"
                    data-testid="type-name-input"
                    value={typeForm.name}
                    onChange={(e) => setTypeForm({ name: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" data-testid="submit-type-btn" className="w-full bg-slate-900 hover:bg-slate-800">
                  Add Type
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Item Types */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Item Types</h2>
          <div className="flex flex-wrap gap-2" data-testid="item-types-list">
            {itemTypes.map((type) => (
              <div
                key={type.name}
                className="inline-flex items-center bg-slate-100 rounded-full px-4 py-2 text-sm"
                data-testid={`item-type-${type.name}`}
              >
                <span className="text-slate-900">{type.name}</span>
                <button
                  onClick={() => handleDeleteType(type.name)}
                  data-testid={`delete-type-${type.name}`}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Tables */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="current" data-testid="current-inventory-tab">
              Current Inventory ({currentStock.length})
            </TabsTrigger>
            <TabsTrigger value="sold" data-testid="sold-inventory-tab">
              Sold Inventory ({soldStock.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Current Inventory</h2>
              </div>
              <StockTable items={currentStock} testIdPrefix="current-stock" />
            </div>
          </TabsContent>
          <TabsContent value="sold" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Sold Inventory</h2>
              </div>
              <StockTable items={soldStock} testIdPrefix="sold-stock" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Stock;