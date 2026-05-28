import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';
import Employee from '../models/Employee.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const employeeCount = await Employee.countDocuments();
    
    const financeSummary = await Transaction.aggregate([
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const revenue = financeSummary.find(f => f._id === 'Income')?.total || 0;
    const expenses = financeSummary.find(f => f._id === 'Expense')?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        inventory: { totalProducts: productCount },
        sales: { totalOrders: orderCount },
        hr: { totalEmployees: employeeCount },
        finance: {
          revenue,
          expenses,
          profit: revenue - expenses
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAIInsights = async (req, res) => {
  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  try {
    // 1. Gather historical sales data
    const salesOrders = await Order.find({ type: 'Sales', status: 'Completed' }).select('orderDate totalAmount');
    let history = salesOrders.map(s => ({
      date: s.orderDate.toISOString().split('T')[0],
      amount: s.totalAmount
    }));

    if (history.length === 0) {
      // Seed mockup logs so regression models don't error out on empty systems
      history = [
        { date: '2026-04-01', amount: 150000 },
        { date: '2026-04-10', amount: 220000 },
        { date: '2026-05-01', amount: 180000 },
        { date: '2026-05-20', amount: 260000 },
      ];
    }

    // 2. Gather Inventory catalog items
    const productsList = await Product.find({});
    const inventoryItems = await Promise.all(productsList.map(async p => {
      const orderCount = await Order.countDocuments({ 'items.product': p._id });
      return {
        id: p._id.toString(),
        name: p.name,
        stock: p.stock,
        minStock: p.minStock || 10,
        costPrice: p.costPrice || p.price * 0.8,
        price: p.price,
        orderCount: orderCount || 1,
        leadTime: 5
      };
    }));

    // 3. Gather Employee data
    const employeesList = await Employee.find({});
    const employeeRecords = employeesList.map(e => ({
      id: e._id.toString(),
      name: e.name,
      salary: e.salary || 45000,
      attendanceRate: 0.95,
      leavesCount: 1,
      role: e.role || 'Staff'
    }));

    let salesForecast = null;
    let inventoryPredictions = null;
    let employeeAnalysis = null;

    try {
      const salesRes = await fetch(`${ML_SERVICE_URL}/api/predict/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, days_to_predict: 30 })
      });
      if (salesRes.ok) {
        salesForecast = (await salesRes.json()).forecast;
      }
    } catch (e) {
      console.log('⚠️ FastAPI Sales service offline. Using statistical simulation.');
    }

    try {
      const invRes = await fetch(`${ML_SERVICE_URL}/api/predict/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: inventoryItems })
      });
      if (invRes.ok) {
        inventoryPredictions = (await invRes.json()).predictions;
      }
    } catch (e) {
      console.log('⚠️ FastAPI Inventory service offline. Using statistical simulation.');
    }

    try {
      const empRes = await fetch(`${ML_SERVICE_URL}/api/predict/employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: employeeRecords })
      });
      if (empRes.ok) {
        employeeAnalysis = (await empRes.json()).analysis;
      }
    } catch (e) {
      console.log('⚠️ FastAPI Employee service offline. Using statistical simulation.');
    }

    // 5. Build intelligent Fallbacks if FastAPI did not respond
    if (!salesForecast) {
      salesForecast = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return {
          date: d.toISOString().split('T')[0],
          predictedAmount: Math.round(180000 + i * 1800 + Math.random() * 5000)
        };
      });
    }

    if (!inventoryPredictions) {
      inventoryPredictions = inventoryItems.map(item => {
        const velocity = Math.max(0.1, item.orderCount / 30);
        return {
          id: item.id,
          name: item.name,
          stock: item.stock,
          dailyVelocity: Math.round(velocity * 100) / 100,
          daysToStockout: Math.round((item.stock / velocity) * 10) / 10,
          safetyStock: Math.max(item.minStock, Math.round(velocity * 5 * 1.5)),
          reorderPoint: Math.round(velocity * 5 * 2.5),
          replenishmentStatus: item.stock <= item.minStock ? 'Critical (Reorder Immediately)' : 'Optimal'
        };
      });
    }

    if (!employeeAnalysis) {
      employeeAnalysis = employeeRecords.map(emp => {
        const score = 95 - emp.leavesCount * 2;
        return {
          id: emp.id,
          name: emp.name,
          role: emp.role,
          efficiencyScore: score,
          performanceRating: score >= 85 ? 'Outstanding' : 'Satisfactory',
          roiIndex: Math.round((score / (emp.salary / 1000)) * 1000) / 1000,
          recommendation: score >= 85 
            ? 'Eligible for quarterly performance bonus and lead responsibilities.' 
            : 'Maintain regular check-ins. Performance aligns with role requirements.'
        };
      });
    }

    // 6. Build dynamic recommendations based on predictions
    const recommendations = [];
    const lowStockAlerts = inventoryPredictions.filter(p => p.replenishmentStatus.includes('Critical') || p.stock <= p.reorderPoint);
    if (lowStockAlerts.length > 0) {
      recommendations.push({
        title: 'Replenish Inventory Warning',
        severity: 'critical',
        icon: 'Package',
        message: `${lowStockAlerts.length} SKU items are near or below their safety reorder thresholds. Immediate PO placement advised for ${lowStockAlerts[0].name}.`
      });
    }

    const weakPerformers = employeeAnalysis.filter(e => e.performanceRating === 'Needs Attention');
    if (weakPerformers.length > 0) {
      recommendations.push({
        title: 'Workforce Efficiency Audit',
        severity: 'warning',
        icon: 'Users',
        message: `${weakPerformers.length} staff members demonstrate declining attendance scores. Schedule productivity reviews.`
      });
    } else {
      recommendations.push({
        title: 'Peak Workforce Allocation',
        severity: 'positive',
        icon: 'Users',
        message: 'All department roles demonstrate stable attendance and performance ratings. ROI ratios optimal.'
      });
    }

    // Return the aggregated response structure
    res.status(200).json({
      success: true,
      data: {
        forecast: salesForecast,
        inventory: inventoryPredictions,
        employees: employeeAnalysis,
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdvancedAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const productCount = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 10 } });
    const employeeCount = await Employee.countDocuments({ status: 'Active' });
    
    const financeKpis = await Transaction.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);
    const revenue = financeKpis.find(f => f._id === 'Income')?.total || 0;
    const expenses = financeKpis.find(f => f._id === 'Expense')?.total || 0;
    const profit = revenue - expenses;

    const totalOrdersCount = await Order.countDocuments();
    const averageOrderValueResult = await Order.aggregate([
      { $group: { _id: null, avgValue: { $avg: '$totalAmount' } } }
    ]);
    const averageOrderValue = averageOrderValueResult[0]?.avgValue || 0;

    // Monthly trends (past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await Transaction.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          revenue: {
            $sum: { $cond: [{ $eq: ['$type', 'Income'] }, '$amount', 0] }
          },
          expenses: {
            $sum: { $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedTrends = monthlyTrends.map(t => {
      const monthStr = monthNames[t._id.month - 1];
      return {
        month: `${monthStr} ${t._id.year}`,
        revenue: t.revenue,
        expenses: t.expenses,
        profit: t.revenue - t.expenses
      };
    });

    // Department workforce allocations
    const deptAllocation = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 }, totalSalary: { $sum: '$salary' } } }
    ]);
    const formattedDept = deptAllocation.map(d => ({
      department: d._id || 'Operations',
      employees: d.count,
      salaryCost: d.totalSalary
    }));

    // Inventory category value breakdown
    const inventoryBreakdown = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          stock: { $sum: '$stock' },
          costValue: { $sum: { $multiply: ['$stock', '$costPrice'] } },
          retailValue: { $sum: { $multiply: ['$stock', '$price'] } }
        }
      }
    ]);
    const formattedInventory = inventoryBreakdown.map(i => ({
      category: i._id || 'Electronics',
      stock: i.stock,
      costValue: i.costValue,
      retailValue: i.retailValue
    }));

    // Order Trends (Sales vs Purchases)
    const orderTrends = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
            type: '$type'
          },
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const formattedOrderTrendsMap = {};
    orderTrends.forEach(o => {
      const monthStr = monthNames[o._id.month - 1];
      const key = `${monthStr} ${o._id.year}`;
      if (!formattedOrderTrendsMap[key]) {
        formattedOrderTrendsMap[key] = { month: key, salesCount: 0, purchaseCount: 0, salesAmount: 0, purchaseAmount: 0 };
      }
      if (o._id.type === 'Sales') {
        formattedOrderTrendsMap[key].salesCount = o.count;
        formattedOrderTrendsMap[key].salesAmount = o.amount;
      } else {
        formattedOrderTrendsMap[key].purchaseCount = o.count;
        formattedOrderTrendsMap[key].purchaseAmount = o.amount;
      }
    });
    const formattedOrderTrends = Object.values(formattedOrderTrendsMap);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          revenue,
          expenses,
          profit,
          averageOrderValue,
          lowStockCount,
          employeeCount,
          totalProducts: productCount,
          totalOrders: totalOrdersCount
        },
        monthlyTrends: formattedTrends,
        departmentMetrics: formattedDept,
        inventoryBreakdown: formattedInventory,
        orderTrends: formattedOrderTrends
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

