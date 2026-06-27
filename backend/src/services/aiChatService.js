import db from "../models/index.js";
import axios from "axios";

const getSystemPrompt = async (userMessage) => {
  const { Op } = db.Sequelize;

  // Lọc từ khóa tìm kiếm (độ dài >= 2 ký tự)
  const words = userMessage
    .toLowerCase()
    .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  let productsContext = "";

  if (words.length > 0) {
    try {
      const productMatches = await db.Product.findAll({
        where: {
          approval_status: "APPROVED",
          [Op.or]: words.map((word) => ({
            name: { [Op.like]: `%${word}%` },
          })),
        },
        limit: 5,
        attributes: ["id", "name", "price", "description"],
      });

      if (productMatches && productMatches.length > 0) {
        productsContext = productMatches
          .map(
            (p) =>
              `- Sản phẩm: ${p.name} | Giá: ${Number(
                p.price
              ).toLocaleString("vi-VN")}đ`
          )
          .join("\n");
      }
    } catch (err) {
      console.error("Lỗi truy vấn sản phẩm RAG:", err);
    }
  }

  const systemPrompt = `Bạn là Trợ lý ảo AI thông minh của UTEShop - Sàn thương mại điện tử thời trang Việt Nam.
Dưới đây là một số thông tin chính sách của sàn thời trang UTEShop:
- Thanh toán: Hỗ trợ thanh toán tiền mặt khi nhận hàng (COD), thẻ tín dụng (Visa, Master) và cổng VNPay.
- Đổi trả hàng: Khách hàng được đổi trả sản phẩm trong vòng 7 ngày kể từ khi nhận hàng thành công đối với sản phẩm lỗi nhà sản xuất hoặc nhầm kích thước. Sản phẩm đổi trả phải còn nguyên tem mác.
- Phí vận chuyển: Giao hàng nhanh toàn quốc với mức phí đồng giá 20.000đ. Với các đơn hàng có giá trị thanh toán từ 500.000đ trở lên, hệ thống sẽ tự động miễn phí vận chuyển.

Dưới đây là danh sách sản phẩm liên quan đang bán trên hệ thống khớp với câu hỏi của khách hàng:
${productsContext || "Không tìm thấy sản phẩm nào khớp chính xác trong hệ thống."}

Quy định trả lời khách hàng:
1. Trả lời bằng tiếng Việt thân thiện, lịch sự, ngắn gọn và tập trung giải quyết câu hỏi.
2. Không trả lời các câu hỏi chính trị, tôn giáo hoặc các vấn đề nhạy cảm khác. Hãy nói khéo léo để hướng khách hàng quay lại mua sắm.
3. Khi giới thiệu sản phẩm từ danh sách bên trên, bạn hãy chỉ đưa ra tên sản phẩm và giá tiền tương ứng, tuyệt đối không kèm theo bất kỳ đường dẫn liên kết (link URL) nào.`;

  return systemPrompt;
};

const callGeminiAPI = async (apiKey, systemPrompt, message) => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: `Khách hàng hỏi: "${message}"` },
          ],
        },
      ],
    },
    {
      timeout: 30000,
    }
  );
  return response;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateLocalFallbackResponse = async (message) => {
  const lowercaseMsg = message.toLowerCase();
  const { Op } = db.Sequelize;

  // 1. Phí vận chuyển / ship / giao hàng
  if (
    lowercaseMsg.includes("ship") ||
    lowercaseMsg.includes("vận chuyển") ||
    lowercaseMsg.includes("giao hàng") ||
    lowercaseMsg.includes("phí")
  ) {
    return `Chào bạn! Về chính sách vận chuyển của UTEShop:
- Sàn hỗ trợ giao hàng nhanh toàn quốc với phí đồng giá là **20.000đ**.
- Đặc biệt, với mọi đơn hàng có giá trị thanh toán từ **500.000đ** trở lên, hệ thống sẽ tự động **miễn phí vận chuyển (Freeship)**.`;
  }

  // 2. Đổi trả / trả hàng / đổi size
  if (
    lowercaseMsg.includes("đổi trả") ||
    lowercaseMsg.includes("trả hàng") ||
    lowercaseMsg.includes("đổi size") ||
    lowercaseMsg.includes("hoàn tiền") ||
    lowercaseMsg.includes("size")
  ) {
    return `Chào bạn! Về chính sách đổi trả của UTEShop:
- Bạn được hỗ trợ đổi trả sản phẩm trong vòng **7 ngày** kể từ khi nhận hàng thành công.
- Áp dụng đối với các sản phẩm bị lỗi từ nhà sản xuất hoặc giao nhầm size/mẫu.
- Điều kiện: Sản phẩm đổi trả phải còn nguyên tem mác, chưa qua sử dụng hay giặt là.`;
  }

  // 3. Thanh toán / vnpay / cod / thẻ
  if (
    lowercaseMsg.includes("thanh toán") ||
    lowercaseMsg.includes("vnpay") ||
    lowercaseMsg.includes("cod") ||
    lowercaseMsg.includes("chuyển khoản")
  ) {
    return `Chào bạn! UTEShop hỗ trợ các phương thức thanh toán sau:
- **COD (Thanh toán khi nhận hàng):** Nhận hàng và thanh toán tiền mặt trực tiếp cho shipper.
- **Thanh toán online qua cổng VNPay:** Quét mã QR hoặc thẻ ATM/Internet Banking nội địa.
- **Thẻ quốc tế:** Hỗ trợ các thẻ Visa, Mastercard.`;
  }

  // 4. Tìm kiếm sản phẩm
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  if (words.length > 0) {
    try {
      const productMatches = await db.Product.findAll({
        where: {
          approval_status: "APPROVED",
          [Op.or]: words.map((word) => ({
            name: { [Op.like]: `%${word}%` },
          })),
        },
        limit: 5,
        attributes: ["id", "name", "price"],
      });

      if (productMatches && productMatches.length > 0) {
        let reply = `Chào bạn! UTEShop tìm thấy một số sản phẩm phù hợp với nhu cầu của bạn:\n\n`;
        productMatches.forEach((p) => {
          reply += `- **${p.name}** | Giá: ${Number(p.price).toLocaleString("vi-VN")}đ\n`;
        });
        return reply;
      }
    } catch (err) {
      console.error("Lỗi fallback tìm sản phẩm:", err);
    }
  }

  // 5. Câu trả lời mặc định nếu không khớp từ khóa nào
  return `Chào bạn! Tôi là Trợ Lý AI của UTEShop. Tôi sẵn sàng hỗ trợ bạn các thông tin sau:
- **Đổi trả:** Hỗ trợ đổi trả trong vòng 7 ngày nếu lỗi sản xuất hoặc sai kích thước (sản phẩm còn nguyên tem mác).
- **Vận chuyển:** Đồng giá 20.000đ toàn quốc, miễn phí vận chuyển cho đơn từ 500.000đ trở lên.
- **Thanh toán:** Hỗ trợ COD, Visa/Mastercard và VNPay.

Bạn muốn hỏi về thông tin gì trong số các mục trên, hoặc muốn tìm sản phẩm nào không?`;
};

const chatWithAI = async (message) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("[AI Chat] Không tìm thấy GEMINI_API_KEY, chuyển sang local fallback.");
    return await generateLocalFallbackResponse(message);
  }

  console.log("[AI Chat] Đang gọi Gemini API với key:", apiKey.substring(0, 8) + "...");

  const systemPrompt = await getSystemPrompt(message);
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await callGeminiAPI(apiKey, systemPrompt, message);

      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0]
      ) {
        return response.data.candidates[0].content.parts[0].text;
      }

      console.error("[AI Chat] Phản hồi không hợp lệ từ API.");
      return await generateLocalFallbackResponse(message);
    } catch (error) {
      const errData = error.response?.data;
      const errStatus = error.response?.status;
      console.error(`[AI Chat] Lỗi Gemini API (HTTP ${errStatus}, lần ${attempt + 1}):`, JSON.stringify(errData) || error.message);

      // Nếu bị rate limit (429) và còn lần retry → chờ rồi thử lại
      if (errStatus === 429 && attempt < maxRetries) {
        const waitTime = (attempt + 1) * 3000; // 3s, 6s
        console.log(`[AI Chat] Rate limited, chờ ${waitTime / 1000}s rồi thử lại...`);
        await delay(waitTime);
        continue;
      }

      // Khi hết số lần retry hoặc gặp lỗi nghiêm trọng (400, 403, 429, v.v.),
      // tự động chuyển qua Local Fallback để phản hồi khách hàng thay vì báo lỗi.
      console.log("[AI Chat] Chuyển hướng sang Local Fallback do lỗi API.");
      return await generateLocalFallbackResponse(message);
    }
  }
};

export default {
  chatWithAI,
};
