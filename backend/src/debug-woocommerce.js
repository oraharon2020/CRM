import wooCommerceService from './services/woocommerce.service';

async function debugWoocommerce() {
  try {
    const storeId = 1734219687; // Nalla store ID
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    // Get the first and last day of the current month
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${lastDay}`;
    
    console.log(`Debugging WooCommerce orders for ${startDate} to ${endDate}`);
    
    // Get all statuses
    const statuses = ['completed', 'processing', 'on-hold', 'pending'];
    
    // Define params
    const params = {
      after: startDate,
      before: endDate,
      status: statuses,
      per_page: 100
    };
    
    console.log("Fetching orders with params:", params);
    
    // Fetch orders
    const orders = await wooCommerceService.getOrders(storeId, params);
    
    console.log(`Fetched ${orders.length} orders`);
    
    // Print first 3 orders for debugging
    if (orders.length > 0) {
      console.log("First order:", JSON.stringify(orders[0], null, 2));
      
      // Calculate totals
      let totalIncome = 0;
      let productCount = 0;
      
      orders.forEach(order => {
        totalIncome += parseFloat(order.total);
        if (order.line_items) {
          order.line_items.forEach(item => {
            productCount += item.quantity;
          });
        }
      });
      
      console.log(`Total Income: ${totalIncome}`);
      console.log(`Total Orders: ${orders.length}`);
      console.log(`Total Products: ${productCount}`);
      
      // Count orders by date
      const ordersByDate = {};
      orders.forEach(order => {
        const date = order.date_created.split('T')[0];
        if (!ordersByDate[date]) {
          ordersByDate[date] = { count: 0, total: 0 };
        }
        ordersByDate[date].count++;
        ordersByDate[date].total += parseFloat(order.total);
      });
      
      console.log("Orders by date:", ordersByDate);
    } else {
      console.log("No orders found in this date range");
      
      // Try fetching with a broader date range to see if there are any orders at all
      const lastYearStart = `${year-1}-${month}-01`;
      console.log(`Trying a broader date range: ${lastYearStart} to ${endDate}`);
      
      const broadOrders = await wooCommerceService.getOrders(storeId, {
        after: lastYearStart,
        before: endDate,
        status: statuses,
        per_page: 10
      });
      
      console.log(`Found ${broadOrders.length} orders in the broader range`);
      if (broadOrders.length > 0) {
        console.log("Most recent order:", JSON.stringify(broadOrders[0], null, 2));
      }
    }
    
    // Try getting store stats as well
    console.log("\nTrying store stats...");
    const stats = await wooCommerceService.getStoreStats(storeId, {
      startDate: startDate,
      endDate: endDate,
      statuses: statuses,
      period: 'custom'
    });
    
    console.log("Store stats result:", stats);
    
  } catch (error) {
    console.error("Debug error:", error);
  }
}

debugWoocommerce().then(() => {
  console.log("Debug complete");
});
