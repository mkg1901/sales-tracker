from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Models
class ItemType(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str

class ItemTypeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str

class StockItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    item_number: str
    date_of_purchase: str
    type: str
    description: str
    supplier_name: str
    phone: str
    price: float
    status: str = "current"  # current or sold

class StockItemCreate(BaseModel):
    date_of_purchase: str
    type: str
    description: str
    supplier_name: str
    phone: str
    price: float

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    date: str
    transaction_type: str  # sell, purchase, spending
    name: str  # customer or supplier name
    amount: float
    payment_method: str  # cash, bank1, bank2
    stock_code: Optional[str] = None

class TransactionCreate(BaseModel):
    date: str
    transaction_type: str
    name: str
    amount: float
    payment_method: str
    stock_code: Optional[str] = None

class CustomerSupplier(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    type: str  # customer or supplier

class CustomerSupplierCreate(BaseModel):
    name: str
    type: str

class Balance(BaseModel):
    cash: float
    bank1: float
    bank2: float
    total: float


# Helper function to get next stock number
async def get_next_stock_number():
    counter = await db.counters.find_one({"name": "stock_counter"})
    if not counter:
        await db.counters.insert_one({"name": "stock_counter", "value": 1000})
        return "1000"
    
    new_value = counter["value"] + 1
    await db.counters.update_one(
        {"name": "stock_counter"},
        {"$set": {"value": new_value}}
    )
    return str(new_value)


# Item Types Routes
@api_router.post("/item-types", response_model=ItemTypeResponse)
async def create_item_type(item_type: ItemType):
    existing = await db.item_types.find_one({"name": item_type.name})
    if existing:
        raise HTTPException(status_code=400, detail="Item type already exists")
    
    doc = item_type.model_dump()
    await db.item_types.insert_one(doc)
    return ItemTypeResponse(**doc)

@api_router.get("/item-types", response_model=List[ItemTypeResponse])
async def get_item_types():
    types = await db.item_types.find({}, {"_id": 0}).to_list(1000)
    return types

@api_router.delete("/item-types/{name}")
async def delete_item_type(name: str):
    result = await db.item_types.delete_one({"name": name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item type not found")
    return {"message": "Item type deleted successfully"}


# Stock Routes
@api_router.post("/stock", response_model=StockItem)
async def create_stock_item(item: StockItemCreate):
    item_number = await get_next_stock_number()
    
    stock_dict = item.model_dump()
    stock_dict["item_number"] = item_number
    stock_dict["status"] = "current"
    
    await db.stock_items.insert_one(stock_dict)
    return StockItem(**stock_dict)

@api_router.get("/stock", response_model=List[StockItem])
async def get_stock_items(status: str = "current"):
    items = await db.stock_items.find({"status": status}, {"_id": 0}).to_list(1000)
    return items

@api_router.put("/stock/{item_number}/sell")
async def mark_item_as_sold(item_number: str):
    result = await db.stock_items.update_one(
        {"item_number": item_number},
        {"$set": {"status": "sold"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return {"message": "Item marked as sold"}

@api_router.delete("/stock/{item_number}")
async def delete_stock_item(item_number: str):
    result = await db.stock_items.delete_one({"item_number": item_number})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return {"message": "Stock item deleted successfully"}


# Transaction Routes
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate):
    trans_dict = transaction.model_dump()
    
    # If it's a sell transaction, mark the stock item as sold
    if transaction.transaction_type == "sell" and transaction.stock_code:
        await mark_item_as_sold(transaction.stock_code)
    
    await db.transactions.insert_one(trans_dict)
    return Transaction(**trans_dict)

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions():
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(1000)
    return transactions

@api_router.delete("/transactions/{date}/{name}")
async def delete_transaction(date: str, name: str):
    result = await db.transactions.delete_one({"date": date, "name": name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}


# Customer/Supplier Routes
@api_router.post("/customers-suppliers", response_model=CustomerSupplier)
async def create_customer_supplier(entity: CustomerSupplierCreate):
    existing = await db.customers_suppliers.find_one({"name": entity.name, "type": entity.type})
    if existing:
        raise HTTPException(status_code=400, detail=f"{entity.type.capitalize()} already exists")
    
    doc = entity.model_dump()
    await db.customers_suppliers.insert_one(doc)
    return CustomerSupplier(**doc)

@api_router.get("/customers-suppliers", response_model=List[CustomerSupplier])
async def get_customers_suppliers(type: Optional[str] = None):
    query = {"type": type} if type else {}
    entities = await db.customers_suppliers.find(query, {"_id": 0}).to_list(1000)
    return entities

@api_router.delete("/customers-suppliers/{name}/{type}")
async def delete_customer_supplier(name: str, type: str):
    result = await db.customers_suppliers.delete_one({"name": name, "type": type})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer/Supplier not found")
    return {"message": "Customer/Supplier deleted successfully"}


# Balance Route
@api_router.get("/balance", response_model=Balance)
async def get_balance():
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(10000)
    
    cash = 0.0
    bank1 = 0.0
    bank2 = 0.0
    
    for trans in transactions:
        amount = trans["amount"]
        payment_method = trans["payment_method"]
        trans_type = trans["transaction_type"]
        
        # Sell and purchase add to balance, spending subtracts
        if trans_type in ["sell", "purchase"]:
            if payment_method == "cash":
                cash += amount
            elif payment_method == "bank1":
                bank1 += amount
            elif payment_method == "bank2":
                bank2 += amount
        elif trans_type == "spending":
            if payment_method == "cash":
                cash -= amount
            elif payment_method == "bank1":
                bank1 -= amount
            elif payment_method == "bank2":
                bank2 -= amount
    
    total = cash + bank1 + bank2
    return Balance(cash=cash, bank1=bank1, bank2=bank2, total=total)


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()