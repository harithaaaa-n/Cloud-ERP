import sys
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

# Fallback-safe imports
try:
    import numpy as np
    import pandas as pd
    from sklearn.linear_model import LinearRegression
    HAS_ML = True
except ImportError:
    HAS_ML = False
    print("⚠️ ML libraries (numpy/pandas/scikit-learn) not fully loaded. Utilizing native pure-Python mathematical models.")

app = FastAPI(title="CloudERP AI Predictive Analytics Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---

class SalesRecord(BaseModel):
    date: str
    amount: float

class SalesPredictRequest(BaseModel):
    history: List[SalesRecord]
    days_to_predict: Optional[int] = 30

class InventoryItem(BaseModel):
    id: str
    name: str
    stock: int
    minStock: int
    costPrice: float
    price: float
    orderCount: int
    leadTime: int

class InventoryPredictRequest(BaseModel):
    items: List[InventoryItem]

class EmployeeRecord(BaseModel):
    id: str
    name: str
    salary: float
    attendanceRate: float  # e.g. 0.95
    leavesCount: int
    role: str

class EmployeePredictRequest(BaseModel):
    employees: List[EmployeeRecord]

# --- Native Math Fallbacks (To guarantee uptime) ---

def pure_python_linear_regression(x, y):
    """Computes basic slope and intercept using least squares (y = mx + c)"""
    n = len(x)
    if n < 2:
        return 0.0, float(y[0]) if n == 1 else 0.0
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xx = sum(val * val for val in x)
    sum_xy = sum(x_val * y_val for x_val, y_val in zip(x, y))
    
    denominator = (n * sum_xx - sum_x * sum_x)
    if abs(denominator) < 1e-9:
        return 0.0, sum_y / n
        
    slope = (n * sum_xy - sum_x * sum_y) / denominator
    intercept = (sum_y - slope * sum_x) / n
    return slope, intercept

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "Scikit-Learn + FastAPI" if HAS_ML else "Native Math Engine (Fallback Mode)",
        "timestamp": datetime.now().isoformat()
      }

@app.post("/api/predict/sales")
def predict_sales(payload: SalesPredictRequest):
    if not payload.history:
        raise HTTPException(status_code=400, detail="Sales history cannot be empty")

    history = payload.history
    days_to_predict = payload.days_to_predict or 30

    try:
        # Sort history chronologically
        history_sorted = sorted(history, key=lambda x: x.date)
        dates = [datetime.strptime(x.date[:10], "%Y-%m-%d") for x in history_sorted]
        amounts = [x.amount for x in history_sorted]

        # Convert dates to relative day index
        start_date = dates[0]
        days_relative = [(d - start_date).days for d in dates]

        # Perform linear regression to calculate trends
        if HAS_ML:
            X = np.array(days_relative).reshape(-1, 1)
            y = np.array(amounts)
            model = LinearRegression()
            model.fit(X, y)
            slope = float(model.coef_[0])
            intercept = float(model.intercept_)
        else:
            slope, intercept = pure_python_linear_regression(days_relative, amounts)

        # Forecast future days
        last_day = days_relative[-1]
        forecast = []
        for i in range(1, days_to_predict + 1):
            target_day = last_day + i
            pred_amount = max(0.0, slope * target_day + intercept)
            target_date = dates[-1] + timedelta(days=i)
            forecast.append({
                "date": target_date.strftime("%Y-%m-%d"),
                "predictedAmount": round(pred_amount, 2)
            })

        return {
            "success": True,
            "metrics": {
                "slope": round(slope, 2),
                "intercept": round(intercept, 2),
                "growthRatePercent": round((slope / (amounts[0] if amounts[0] != 0 else 1)) * 100, 2)
            },
            "forecast": forecast
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/inventory")
def predict_inventory(payload: InventoryPredictRequest):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Inventory items catalog cannot be empty")

    predictions = []
    try:
        for item in payload.items:
            # Sales velocity index (simulated daily rate based on order count and stock level)
            sales_per_day = max(0.1, item.orderCount / 30.0)
            
            # Days until stockout
            days_to_stockout = round(item.stock / sales_per_day, 1)
            
            # Optimal Safety Stock (Formula: Avg daily sales * lead time safety multiplier)
            safety_stock = int(sales_per_day * item.leadTime * 1.5)
            if safety_stock < item.minStock:
                safety_stock = item.minStock
                
            # Reorder Point (Formula: (daily sales * lead time) + safety stock)
            reorder_point = int((sales_per_day * item.leadTime) + safety_stock)
            
            # Urgency flag
            if item.stock <= reorder_point:
                status = "Critical (Reorder Immediately)"
            elif item.stock <= safety_stock:
                status = "Low Stock Warning"
            else:
                status = "Optimal"

            predictions.append({
                "id": item.id,
                "name": item.name,
                "stock": item.stock,
                "dailyVelocity": round(sales_per_day, 2),
                "daysToStockout": days_to_stockout,
                "safetyStock": safety_stock,
                "reorderPoint": reorder_point,
                "replenishmentStatus": status
            })

        return {"success": True, "predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/employee")
def predict_employee(payload: EmployeePredictRequest):
    if not payload.employees:
        raise HTTPException(status_code=400, detail="Employee list cannot be empty")

    results = []
    try:
        for emp in payload.employees:
            # Multi-parameter score: Attendance Rate - (Leaves * 0.02)
            efficiency_score = (emp.attendanceRate * 100.0) - (emp.leavesCount * 1.5)
            efficiency_score = max(10.0, min(100.0, efficiency_score))
            
            # Salary efficiency factor
            if emp.salary > 0:
                roi_index = efficiency_score / (emp.salary / 1000.0)
            else:
                roi_index = 1.0

            # Classification
            if efficiency_score >= 85:
                performance = "Outstanding"
                recommendation = "Eligible for quarterly performance bonus and lead responsibilities."
            elif efficiency_score >= 70:
                performance = "Satisfactory"
                recommendation = "Maintain regular check-ins. Performance aligns with role requirements."
            else:
                performance = "Needs Attention"
                recommendation = "Provide targeted training. Monitor attendance patterns."

            results.append({
                "id": emp.id,
                "name": emp.name,
                "role": emp.role,
                "efficiencyScore": round(efficiency_score, 1),
                "performanceRating": performance,
                "roiIndex": round(roi_index, 3),
                "recommendation": recommendation
            })

        return {"success": True, "analysis": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
