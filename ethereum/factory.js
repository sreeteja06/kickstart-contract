import web3 from './web3';
import { abi } from "./build/CampaignFactory.json";
const instance = new web3.eth.Contract(
    abi,
    '0x765eaBb617D3724E2Ba4Da38fED8F0FC28AE4369'
);

export default instance;