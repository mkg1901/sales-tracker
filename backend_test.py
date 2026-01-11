#!/usr/bin/env python3
import requests
import json
import sys
from datetime import datetime

class ComputerShopAPITester:
    def __init__(self, base_url="https://compstore-system.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_items = []  # Track created items for cleanup
        
    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request and return response"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            return success, response
            
        except Exception as e:
            print(f"Request failed: {str(e)}")
            return False, None

    def test_item_types_management(self):
        """Test Item Types CRUD operations"""
        print("\n🔧 Testing Item Types Management...")
        
        # Create item types
        types_to_create = ["Laptop", "Desktop", "Monitor", "Keyboard"]
        created_types = []
        
        for item_type in types_to_create:
            success, response = self.make_request('POST', 'item-types', 
                                                {"name": item_type}, 200)
            if success:
                created_types.append(item_type)
                self.log_test(f"Create item type '{item_type}'", True, 
                            f"- Status: {response.status_code}")
            else:
                self.log_test(f"Create item type '{item_type}'", False, 
                            f"- Status: {response.status_code if response else 'No response'}")
        
        # Get all item types
        success, response = self.make_request('GET', 'item-types')
        if success:
            types_data = response.json()
            type_names = [t['name'] for t in types_data]
            all_created = all(t in type_names for t in created_types)
            self.log_test("Get all item types", all_created, 
                        f"- Found: {type_names}")
        else:
            self.log_test("Get all item types", False, 
                        f"- Status: {response.status_code if response else 'No response'}")
        
        # Delete one item type
        if created_types:
            type_to_delete = created_types[0]
            success, response = self.make_request('DELETE', f'item-types/{type_to_delete}')
            self.log_test(f"Delete item type '{type_to_delete}'", success,
                        f"- Status: {response.status_code if response else 'No response'}")
            
            # Verify deletion
            success, response = self.make_request('GET', 'item-types')
            if success:
                remaining_types = [t['name'] for t in response.json()]
                deleted_successfully = type_to_delete not in remaining_types
                self.log_test(f"Verify '{type_to_delete}' deleted", deleted_successfully,
                            f"- Remaining: {remaining_types}")

    def test_stock_management(self):
        """Test Stock Management operations"""
        print("\n📦 Testing Stock Management...")
        
        # Create stock items
        stock_items = [
            {
                "date_of_purchase": "2024-01-15",
                "type": "Laptop",
                "description": "Dell XPS 15",
                "supplier_name": "Tech Supplier",
                "phone": "1234567890",
                "price": 75000
            },
            {
                "date_of_purchase": "2024-01-16",
                "type": "Monitor",
                "description": "LG 27 inch",
                "supplier_name": "Display World",
                "phone": "9876543210",
                "price": 25000
            },
            {
                "date_of_purchase": "2024-01-17",
                "type": "Keyboard",
                "description": "Mechanical RGB",
                "supplier_name": "Accessories Plus",
                "phone": "5555555555",
                "price": 3500
            }
        ]
        
        created_stock_codes = []
        
        for i, item in enumerate(stock_items):
            success, response = self.make_request('POST', 'stock', item, 200)
            if success:
                stock_data = response.json()
                item_number = stock_data.get('item_number')
                created_stock_codes.append(item_number)
                expected_number = str(1000 + i)  # Should be 1000, 1001, 1002
                number_correct = item_number == expected_number
                self.log_test(f"Create stock item {i+1}", success and number_correct,
                            f"- Item number: {item_number} (expected: {expected_number})")
            else:
                self.log_test(f"Create stock item {i+1}", False,
                            f"- Status: {response.status_code if response else 'No response'}")
        
        # Get current stock
        success, response = self.make_request('GET', 'stock?status=current')
        if success:
            current_stock = response.json()
            stock_numbers = [item['item_number'] for item in current_stock]
            expected_numbers = ['1000', '1001', '1002']
            numbers_match = all(num in stock_numbers for num in expected_numbers[:len(created_stock_codes)])
            self.log_test("Get current stock with correct numbers", numbers_match,
                        f"- Found numbers: {stock_numbers}")
        else:
            self.log_test("Get current stock", False,
                        f"- Status: {response.status_code if response else 'No response'}")
        
        return created_stock_codes

    def test_customer_supplier_management(self):
        """Test Customer/Supplier Management"""
        print("\n👥 Testing Customer/Supplier Management...")
        
        # Create customers
        customers = ["John Doe", "Jane Smith"]
        for customer in customers:
            success, response = self.make_request('POST', 'customers-suppliers',
                                                {"name": customer, "type": "customer"}, 200)
            self.log_test(f"Create customer '{customer}'", success,
                        f"- Status: {response.status_code if response else 'No response'}")
        
        # Create suppliers
        suppliers = ["Tech Supplier", "Display World"]
        for supplier in suppliers:
            success, response = self.make_request('POST', 'customers-suppliers',
                                                {"name": supplier, "type": "supplier"}, 200)
            self.log_test(f"Create supplier '{supplier}'", success,
                        f"- Status: {response.status_code if response else 'No response'}")
        
        # Get customers
        success, response = self.make_request('GET', 'customers-suppliers?type=customer')
        if success:
            customer_data = response.json()
            customer_names = [c['name'] for c in customer_data]
            all_customers_found = all(c in customer_names for c in customers)
            self.log_test("Get all customers", all_customers_found,
                        f"- Found: {customer_names}")
        else:
            self.log_test("Get all customers", False,
                        f"- Status: {response.status_code if response else 'No response'}")
        
        # Get suppliers
        success, response = self.make_request('GET', 'customers-suppliers?type=supplier')
        if success:
            supplier_data = response.json()
            supplier_names = [s['name'] for s in supplier_data]
            all_suppliers_found = all(s in supplier_names for s in suppliers)
            self.log_test("Get all suppliers", all_suppliers_found,
                        f"- Found: {supplier_names}")
        else:
            self.log_test("Get all suppliers", False,
                        f"- Status: {response.status_code if response else 'No response'}")

    def test_transaction_management(self, stock_codes):
        """Test Transaction Management"""
        print("\n💰 Testing Transaction Management...")
        
        if not stock_codes or len(stock_codes) < 2:
            print("⚠️  Insufficient stock codes for transaction testing")
            return
        
        # Create transactions
        transactions = [
            {
                "date": "2024-01-20",
                "transaction_type": "sell",
                "name": "John Doe",
                "amount": 75000,
                "payment_method": "cash",
                "stock_code": stock_codes[0]  # Should be "1000"
            },
            {
                "date": "2024-01-21",
                "transaction_type": "purchase",
                "name": "Display World",
                "amount": 25000,
                "payment_method": "bank1",
                "stock_code": stock_codes[1]  # Should be "1001"
            },
            {
                "date": "2024-01-22",
                "transaction_type": "spending",
                "name": "Office Rent",
                "amount": 5000,
                "payment_method": "bank2"
                # No stock_code for spending
            }
        ]
        
        for i, transaction in enumerate(transactions):
            success, response = self.make_request('POST', 'transactions', transaction, 200)
            self.log_test(f"Create {transaction['transaction_type']} transaction", success,
                        f"- Status: {response.status_code if response else 'No response'}")
        
        # Get all transactions
        success, response = self.make_request('GET', 'transactions')
        if success:
            transaction_data = response.json()
            self.log_test("Get all transactions", True,
                        f"- Found {len(transaction_data)} transactions")
        else:
            self.log_test("Get all transactions", False,
                        f"- Status: {response.status_code if response else 'No response'}")
        
        # Verify sold item moved to sold inventory
        success, response = self.make_request('GET', 'stock?status=sold')
        if success:
            sold_items = response.json()
            sold_codes = [item['item_number'] for item in sold_items]
            item_sold = stock_codes[0] in sold_codes
            self.log_test(f"Item {stock_codes[0]} moved to sold inventory", item_sold,
                        f"- Sold items: {sold_codes}")
        else:
            self.log_test("Check sold inventory", False,
                        f"- Status: {response.status_code if response else 'No response'}")

    def test_balance_calculation(self):
        """Test Balance Calculation"""
        print("\n💳 Testing Balance Calculation...")
        
        success, response = self.make_request('GET', 'balance')
        if success:
            balance_data = response.json()
            
            # Expected: cash=75000, bank1=25000, bank2=-5000, total=95000
            expected_cash = 75000
            expected_bank1 = 25000
            expected_bank2 = -5000
            expected_total = 95000
            
            cash_correct = balance_data.get('cash') == expected_cash
            bank1_correct = balance_data.get('bank1') == expected_bank1
            bank2_correct = balance_data.get('bank2') == expected_bank2
            total_correct = balance_data.get('total') == expected_total
            
            self.log_test("Cash balance correct", cash_correct,
                        f"- Expected: {expected_cash}, Got: {balance_data.get('cash')}")
            self.log_test("Bank1 balance correct", bank1_correct,
                        f"- Expected: {expected_bank1}, Got: {balance_data.get('bank1')}")
            self.log_test("Bank2 balance correct", bank2_correct,
                        f"- Expected: {expected_bank2}, Got: {balance_data.get('bank2')}")
            self.log_test("Total balance correct", total_correct,
                        f"- Expected: {expected_total}, Got: {balance_data.get('total')}")
        else:
            self.log_test("Get balance", False,
                        f"- Status: {response.status_code if response else 'No response'}")

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Computer Shop Management System API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        
        # Test in sequence as some tests depend on previous ones
        self.test_item_types_management()
        stock_codes = self.test_stock_management()
        self.test_customer_supplier_management()
        self.test_transaction_management(stock_codes)
        self.test_balance_calculation()
        
        # Print final results
        print(f"\n📊 Final Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend API tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = ComputerShopAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())