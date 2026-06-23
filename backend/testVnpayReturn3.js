import { vnpayConfig } from "./src/config/vnpayConfig.js";
import vnpayService from "./src/services/vnpayService.js";
import qs from "qs";

const urlStr = vnpayService.createPaymentUrl("127.0.0.1", "ORD-12345", 100000, "Thanh toan test");

const url = new URL(urlStr);
const vnp_Params = Object.fromEntries(url.searchParams.entries());

const axiosUrl = "/payment/vnpay_return?" + qs.stringify(vnp_Params);
const backendUrl = new URL("http://localhost:8088" + axiosUrl);
const backendParams = Object.fromEntries(backendUrl.searchParams.entries());

console.log("isValid via Axios logic:", vnpayService.verifyIpnCall(backendParams));
