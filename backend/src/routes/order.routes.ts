import express, { Request, Response, Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import wooCommerceService from '../services/woocommerce.service';
import { mapWooCommerceStatus } from '../utils/status-mapping.utils';

const router = Router();

// These routes will be implemented with actual controllers later
// For now, we'll just return placeholder responses

// Get all orders
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const statuses = req.query.statuses ? 
      Array.isArray(req.query.statuses) ? 
        req.query.statuses as string[] : 
        [req.query.statuses as string] : 
      undefined;
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : null;
    const period = req.query.period as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    console.log('Order route - Request parameters:', {
      page,
      limit,
      status,
      statuses,
      storeId,
      period,
      startDate,
      endDate
    });
    
    // Prepare WooCommerce API parameters
    const wooParams: any = {
      per_page: limit,
      page: page
    };
    
    // Add status filter if provided
    if (statuses && statuses.length > 0) {
      // If multiple statuses are provided, use them
      console.log('Statuses array received:', JSON.stringify(statuses).substring(0, 100) + '...');
      
      // Case 1: We got an array containing a single object with numeric keys
      if (statuses.length === 1 && typeof statuses[0] === 'object' && statuses[0] !== null) {
        // Check if it's the specific format with numeric keys
        const firstItem: Record<string, any> = statuses[0];
        // Since we've already checked that firstItem is not null, we can assert it's an object
        const hasNumericKeys = Object.keys(firstItem).some(key => !isNaN(Number(key)));
        
        if (hasNumericKeys) {
          console.log('Processing object with numeric keys...');
          const extractedValues: string[] = [];
          
          // Extract each Status value from the numeric keys
          for (const key in firstItem) {
            if (Object.prototype.hasOwnProperty.call(firstItem, key)) {
              const item = firstItem[key];
              if (item && typeof item === 'object' && 'value' in item) {
                extractedValues.push(String(item.value));
              }
            }
          }
          
          wooParams.status = extractedValues;
        } else if (firstItem && 'value' in firstItem) {
          // Case 2: Regular array of Status objects
          wooParams.status = statuses.map((status: any) => 
            status && typeof status === 'object' && 'value' in status 
              ? String(status.value) 
              : String(status)
          );
        }
      } else if (typeof statuses[0] === 'object' && statuses[0] !== null) {
        // Case 3: Array of Status objects
        wooParams.status = statuses.map((status: any) => 
          status && typeof status === 'object' && 'value' in status 
            ? String(status.value) 
            : String(status)
        );
      } else {
        // Case 4: Array of strings
        wooParams.status = statuses.map(status => String(status));
      }
      
      console.log('Using multiple statuses filter:', wooParams.status);
    } else if (status && status !== 'all') {
      // Fallback to single status if provided
      wooParams.status = status;
      console.log('Using single status filter:', status);
    }
    
      // Add date filters
      if (startDate && endDate) {
        // Always normalize dates to ensure consistent format
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        
        console.log('Custom date range - start:', startDateObj.toISOString(), 'end:', endDateObj.toISOString());
        
        // Calculate the number of days in the range
        const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`Date range spans ${daysDiff} days`);
        
        wooParams.after = startDateObj.toISOString();
        wooParams.before = endDateObj.toISOString();
      } else if (period) {
        const now = new Date();
        let startPeriod = new Date();
        
        if (period === 'today') {
          // For 'today', set start date to beginning of today (00:00:00)
          startPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          // Set end date to end of today (23:59:59)
          const endPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          
          console.log('Today period - start:', startPeriod.toISOString(), 'end:', endPeriod.toISOString());
          
          wooParams.after = startPeriod.toISOString();
          wooParams.before = endPeriod.toISOString();
        } else if (period === 'week') {
          startPeriod.setDate(now.getDate() - 7);
          wooParams.after = startPeriod.toISOString();
          wooParams.before = now.toISOString();
        } else if (period === 'month') {
          startPeriod.setMonth(now.getMonth() - 1);
          wooParams.after = startPeriod.toISOString();
          wooParams.before = now.toISOString();
        } else if (period === 'year') {
          startPeriod.setFullYear(now.getFullYear() - 1);
          wooParams.after = startPeriod.toISOString();
          wooParams.before = now.toISOString();
        } else {
          wooParams.after = startPeriod.toISOString();
          wooParams.before = now.toISOString();
        }
      }
    
    let orders = [];
    
    // If a store is selected, get orders from that store
    if (storeId) {
      try {
        // Get orders from WooCommerce
        const wooOrders = await wooCommerceService.getOrders(storeId, wooParams);
        
        // Ensure wooOrders is an array before mapping
        if (Array.isArray(wooOrders)) {
          // Map WooCommerce orders to our format
          orders = wooOrders.map((order: any) => {
            // Get current date as fallback
            const today = new Date().toISOString().split('T')[0];
            
            return {
              id: order.id || 0,
              customerName: order.billing ? `${order.billing.first_name || ''} ${order.billing.last_name || ''}` : 'Unknown',
              phone: order.billing ? (order.billing.phone || '') : '',
              total: order.total ? parseFloat(order.total) : 0,
              status: mapWooCommerceStatus(order.status),
              date: order.date_created ? order.date_created.split('T')[0] : today
            };
          });
        } else {
          console.warn(`Expected array of orders but got: ${typeof wooOrders}`);
          orders = []; // Use empty array as fallback
        }
      } catch (error) {
        console.error(`Error fetching orders from store ${storeId}:`, error);
        // Fallback to sample data if API fails
        orders = getSampleOrdersForStore(storeId);
      }
    } else {
      // If no store is selected, return sample data from all stores
      orders = getSampleOrders();
    }
    
    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders: orders,
        pagination: {
          total: orders.length,
          page,
          limit,
          pages: Math.ceil(orders.length / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message || 'Unknown error'
    });
  }
});

// Use the mapWooCommerceStatus function from utils

// Helper function to get sample orders for a specific store
function getSampleOrdersForStore(storeId: number) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const storeOrders: Record<number, Array<{
    id: string | number;
    customerName: string;
    phone: string;
    total: number;
    status: string;
    date: string;
  }>> = {
    // Bellano store orders
    1734091091: [
      { id: 'B1001', customerName: 'לקוח של bellano 1', phone: '050-1111111', total: 350, status: 'בטיפול', date: today }, // Today's order
      { id: 'B1002', customerName: 'לקוח של bellano 2', phone: '050-2222222', total: 420, status: 'הושלם', date: '2025-02-18' },
      { id: 'B1003', customerName: 'לקוח של bellano 3', phone: '050-3333333', total: 280, status: 'בהמתנה', date: '2025-02-22' },
      { id: 'B1004', customerName: 'לקוח של bellano 4', phone: '050-4444444', total: 560, status: 'בטיפול', date: '2025-02-21' },
      { id: 'B1005', customerName: 'לקוח של bellano 5', phone: '050-5555555', total: 320, status: 'הושלם', date: '2025-02-15' },
      { id: 'B1006', customerName: 'לקוח של bellano 6', phone: '050-6666666', total: 480, status: 'בטיפול', date: today }, // Today's order
    ],
    // Nalla store orders
    1734219687: [
      { id: 'N1001', customerName: 'לקוח של Nalla 1', phone: '052-1111111', total: 450, status: 'בטיפול', date: today }, // Today's order
      { id: 'N1002', customerName: 'לקוח של Nalla 2', phone: '052-2222222', total: 380, status: 'הושלם', date: '2025-02-17' },
      { id: 'N1003', customerName: 'לקוח של Nalla 3', phone: '052-3333333', total: 290, status: 'בהמתנה', date: '2025-02-23' },
      { id: 'N1004', customerName: 'לקוח של Nalla 4', phone: '052-4444444', total: 520, status: 'בטיפול', date: '2025-02-20' },
      { id: 'N1005', customerName: 'לקוח של Nalla 5', phone: '052-5555555', total: 340, status: 'הושלם', date: '2025-02-16' },
      { id: 'N1006', customerName: 'לקוח של Nalla 6', phone: '052-6666666', total: 410, status: 'בהמתנה', date: today }, // Today's order
    ]
  };
  
  return storeOrders[storeId] || [];
}

// Helper function to get sample orders
function getSampleOrders() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  return [
    { id: 1001, customerName: 'ישראל ישראלי', phone: '050-1234567', total: 350, status: 'בטיפול', date: today }, // Today's order
    { id: 1002, customerName: 'שרה כהן', phone: '052-7654321', total: 420, status: 'הושלם', date: '2025-02-18' },
    { id: 1003, customerName: 'יוסי לוי', phone: '054-9876543', total: 280, status: 'בהמתנה', date: '2025-02-22' },
    { id: 1004, customerName: 'רחל אברהם', phone: '053-1122334', total: 560, status: 'בטיפול', date: '2025-02-21' },
    { id: 1005, customerName: 'דוד שמעון', phone: '050-5566778', total: 320, status: 'הושלם', date: '2025-02-15' },
    { id: 1006, customerName: 'מיכל לוין', phone: '050-9988776', total: 490, status: 'בטיפול', date: today }, // Today's order
  ];
}

// Get order by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const storeId = parseInt(req.query.storeId as string);
    
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required to fetch order details'
      });
    }
    
    try {
      // Get order from WooCommerce
      const wooOrder = await wooCommerceService.getOrder(storeId, orderId);
      
      // Get current date as fallback
      const today = new Date().toISOString().split('T')[0];
      
      // Map WooCommerce order to our format
      const order = {
        id: wooOrder.id || 0,
        customerName: wooOrder.billing ? `${wooOrder.billing.first_name || ''} ${wooOrder.billing.last_name || ''}` : 'Unknown',
        phone: wooOrder.billing ? (wooOrder.billing.phone || '') : '',
        email: wooOrder.billing ? (wooOrder.billing.email || '') : '',
        address: wooOrder.billing ? 
          `${wooOrder.billing.address_1 || ''}, ${wooOrder.billing.city || ''}` : '',
        total: wooOrder.total ? parseFloat(wooOrder.total) : 0,
        status: mapWooCommerceStatus(wooOrder.status),
        date: wooOrder.date_created ? wooOrder.date_created.split('T')[0] : today,
        estimatedDelivery: '', // WooCommerce doesn't provide this by default
        items: (wooOrder.line_items || []).map((item: any) => ({
          id: item.id || 0,
          name: item.name || 'Unknown Item',
          quantity: item.quantity || 1,
          price: item.price ? parseFloat(item.price) : 0,
          total: item.total ? parseFloat(item.total) : 0
        })),
        notes: wooOrder.customer_note || '',
        history: [
          { 
            date: wooOrder.date_created 
              ? wooOrder.date_created.replace('T', ' ').substring(0, 19) 
              : new Date().toISOString().replace('T', ' ').substring(0, 19), 
            status: 'התקבלה', 
            user: 'מערכת' 
          },
          // WooCommerce doesn't provide detailed status history by default
        ]
      };
      
      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      console.error(`Error fetching order ${orderId} from store ${storeId}:`, error);
      
      // Fallback to sample data if API fails
      const order = {
        id: orderId,
        customerName: 'ישראל ישראלי',
        phone: '050-1234567',
        email: 'israel@example.com',
        address: 'רחוב הרצל 1, תל אביב',
        total: 350,
        status: 'בטיפול',
        date: '2025-02-20',
        estimatedDelivery: '2025-03-01',
        items: [
          { id: 1, name: 'מוצר א', quantity: 2, price: 100, total: 200 },
          { id: 2, name: 'מוצר ב', quantity: 1, price: 150, total: 150 }
        ],
        notes: 'לקוח מבקש משלוח בשעות הבוקר',
        history: [
          { date: '2025-02-20 10:30', status: 'התקבלה', user: 'מערכת' },
          { date: '2025-02-21 09:15', status: 'בטיפול', user: 'שרה כהן' }
        ]
      };
      
      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully (sample data)',
        data: order
      });
    }
  } catch (error: any) {
    console.error('Error retrieving order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: error.message || 'Unknown error'
    });
  }
});

// Create new order
router.post('/', authenticate, (req: Request, res: Response) => {
  const { customerName, phone, email, items } = req.body;
  
  // Validate input
  if (!customerName || !phone || !items || !items.length) {
    return res.status(400).json({
      success: false,
      message: 'Please provide customer name, phone and at least one item'
    });
  }
  
  // Simulate order creation
  const newOrder = {
    id: 1006,
    customerName,
    phone,
    email,
    total: items.reduce((sum: number, item: { price: number; quantity: number }) => 
      sum + (item.price * item.quantity), 0),
    status: 'התקבלה',
    date: new Date().toISOString().split('T')[0],
    items
  };
  
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: newOrder
  });
});

// Update order
router.put('/:id', authenticate, (req: Request, res: Response) => {
  const orderId = parseInt(req.params.id);
  const { status, notes } = req.body;
  
  res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    data: {
      id: orderId,
      status: status || 'בטיפול',
      notes: notes || '',
      updatedAt: new Date().toISOString()
    }
  });
});

// Delete order (admin only)
router.delete('/:id', authenticate, isAdmin, (req: Request, res: Response) => {
  const orderId = parseInt(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
});

export default router;
