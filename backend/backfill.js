import db from './src/models/index.js';
import shipmentService from './src/services/shipmentService.js';

async function run() {
  const orders = await db.ShopOrder.findAll({
    where: { status: 'SHIPPING' },
    include: [{ model: db.Shipment, as: 'shipment' }]
  });
  
  for (const order of orders) {
    if (!order.shipment) {
      console.log('Creating shipment for order ' + order.id);
      await shipmentService.createShipment(order.id, order.shipper_id);
    }
  }
  console.log('Done');
  process.exit(0);
}
run();
