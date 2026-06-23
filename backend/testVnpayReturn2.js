import { vnpayConfig } from "./src/config/vnpayConfig.js";
import vnpayService from "./src/services/vnpayService.js";
import qs from "qs";

const urlStr = vnpayService.createPaymentUrl("127.0.0.1", "ORD-12345", 100000, "Thanh toan test");
console.log("Created URL:", urlStr);

const url = new URL(urlStr);
const vnp_Params = Object.fromEntries(url.searchParams.entries());

console.log("isValid directly:", vnpayService.verifyIpnCall(vnp_Params));

// Now try serializing and deserializing like Axios and Express does
const axiosUrl = "/payment/vnpay_return?" + qs.stringify(vnp_Params);
console.log("Axios request URL:", axiosUrl);

const backendUrl = new URL("http://localhost:8088" + axiosUrl);
const backendParams = Object.fromEntries(backendUrl.searchParams.entries());
console.log("isValid after passing through Axios stringify:", vnpayService.verifyIpnCall(backendParams));
