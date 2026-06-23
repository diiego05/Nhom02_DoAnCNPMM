import { vnpayConfig } from "./src/config/vnpayConfig.js";
import vnpayService from "./src/services/vnpayService.js";

const testUrl = "http://localhost:5173/payment/vnpay-return?vnp_Amount=10000000&vnp_BankCode=NCB&vnp_BankTranNo=VNP14860088&vnp_CardType=ATM&vnp_OrderInfo=Thanh+toan+don+hang+ORD-20260623-1A2B3&vnp_PayDate=20260623120000&vnp_ResponseCode=00&vnp_TmnCode=309BEHTO&vnp_TransactionNo=14860088&vnp_TransactionStatus=00&vnp_TxnRef=ORD-20260623-1A2B3&vnp_SecureHash=dummy";

const url = new URL(testUrl);
const vnp_Params = Object.fromEntries(url.searchParams.entries());

console.log("isValid:", vnpayService.verifyIpnCall(vnp_Params));
