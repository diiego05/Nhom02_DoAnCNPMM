import db from "../models/index.js";
import { generateTrackingNumber } from "../utils/helpers.js";

const getShipmentHistory = async (shipmentId) => {
  const shipment = await db.Shipment.findByPk(shipmentId, {
    include: [
      {
        model: db.ShipmentHistory,
        as: "histories",
      }
    ],
    order: [[{ model: db.ShipmentHistory, as: "histories" }, "created_at", "DESC"]],
  });

  if (!shipment) throw new Error("Không tìm thấy vận đơn");
  return shipment.histories;
};

const getShipmentByOrderId = async (orderId) => {
  const shipment = await db.Shipment.findOne({
    where: { shop_order_id: orderId },
    include: [
      {
        model: db.ShipmentHistory,
        as: "histories",
      },
      {
        model: db.User,
        as: "shipper",
        attributes: ["id", "phone"],
        include: [{
          model: db.UserProfile,
          as: "profile",
          attributes: ["full_name", "avatar_url"]
        }]
      }
    ],
    order: [[{ model: db.ShipmentHistory, as: "histories" }, "created_at", "DESC"]],
  });

  if (shipment) {
    const plainShipment = shipment.toJSON();
    if (plainShipment.shipper && plainShipment.shipper.profile) {
      plainShipment.shipper.full_name = plainShipment.shipper.profile.full_name;
      plainShipment.shipper.avatar_url = plainShipment.shipper.profile.avatar_url;
      delete plainShipment.shipper.profile;
    }
    return plainShipment;
  }

  return shipment;
};

const createShipment = async (shopOrderId, shipperId = null, transaction = null) => {
  const trackingNumber = generateTrackingNumber();
  
  const shipment = await db.Shipment.create({
    shop_order_id: shopOrderId,
    shipper_id: shipperId,
    tracking_number: trackingNumber,
    status: 'PENDING_PICKUP',
    shipping_fee: 30000, // Default for now
  }, { transaction });

  await db.ShipmentHistory.create({
    shipment_id: shipment.id,
    status: 'PENDING_PICKUP',
    note: 'Vận đơn đã được tạo và đang chờ shipper nhận lấy hàng',
  }, { transaction });

  return shipment;
};

const addShipmentHistory = async (shipmentId, status, location, note, proofImageUrl, shipperId) => {
  const shipment = await db.Shipment.findByPk(shipmentId);
  if (!shipment) throw new Error("Không tìm thấy vận đơn");
  
  if (shipment.shipper_id !== shipperId && shipperId !== 'system') {
    // Allow claiming if it's unassigned
    if (shipment.shipper_id === null && status === 'PENDING_PICKUP') {
      // It's fine, we will update the shipper_id later in the transaction
    } else {
      throw new Error("Không có quyền cập nhật vận đơn này");
    }
  }

  const transaction = await db.sequelize.transaction();
  try {
    // 1. Cập nhật trạng thái Shipment (và nhận đơn nếu chưa có shipper)
    const updateData = { status };
    if (shipment.shipper_id === null && shipperId !== 'system') {
      updateData.shipper_id = shipperId;
    }
    await shipment.update(updateData, { transaction });

    // 2. Thêm lịch sử cập nhật
    const history = await db.ShipmentHistory.create({
      shipment_id: shipmentId,
      status,
      location,
      note,
      proof_image_url: proofImageUrl,
    }, { transaction });

    // 3. Đồng bộ status sang ShopOrder nếu giao thành công hoặc hoàn trả
    if (['DELIVERED', 'FAILED', 'RETURNED'].includes(status)) {
      const orderStatus = status === 'DELIVERED' ? 'DELIVERED' 
                        : status === 'FAILED' ? 'FAILED' 
                        : 'RETURN_PENDING';
                        
      const shopOrder = await db.ShopOrder.findByPk(shipment.shop_order_id, { transaction });
      if (shopOrder) {
        const orderUpdateData = { status: orderStatus };
        if (shopOrder.shipper_id === null && updateData.shipper_id) {
          orderUpdateData.shipper_id = updateData.shipper_id;
        }
        await shopOrder.update(orderUpdateData, { transaction });
        
        // Ghi log vào ShopOrderStatusHistory
        await db.ShopOrderStatusHistory.create({
          shop_order_id: shopOrder.id,
          old_status: shopOrder.status,
          new_status: orderStatus,
          note: note || `Cập nhật tự động từ shipper (Shipment ID: ${shipmentId})`,
          changed_by: shipperId !== 'system' ? shipperId : null
        }, { transaction });
      }
    } else if (status === 'IN_TRANSIT' || status === 'PICKED_UP' || status === 'OUT_FOR_DELIVERY' || status === 'PENDING_PICKUP') {
      // Khi lấy hàng hoặc đang giao thì chuyển order về SHIPPING 
      const shopOrder = await db.ShopOrder.findByPk(shipment.shop_order_id, { transaction });
      if (shopOrder) {
        const orderUpdateData = {};
        let needsUpdate = false;
        if (shopOrder.status !== 'SHIPPING') {
          orderUpdateData.status = 'SHIPPING';
          needsUpdate = true;
        }
        if (shopOrder.shipper_id === null && updateData.shipper_id) {
          orderUpdateData.shipper_id = updateData.shipper_id;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          const oldStatus = shopOrder.status;
          await shopOrder.update(orderUpdateData, { transaction });
          
          if (orderUpdateData.status) {
            await db.ShopOrderStatusHistory.create({
              shop_order_id: shopOrder.id,
              old_status: oldStatus,
              new_status: 'SHIPPING',
              note: `Shipper bắt đầu giao hàng (Shipment ID: ${shipmentId})`,
              changed_by: shipperId !== 'system' ? shipperId : null
            }, { transaction });
          }
        }
      }
    }

    await transaction.commit();
    return history;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  getShipmentHistory,
  getShipmentByOrderId,
  createShipment,
  addShipmentHistory
};
