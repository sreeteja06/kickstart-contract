import web3 from './web3';
import { abi } from './build/Campaign.json';

// var campaign = JSON.parse(Campaign);

export default address => {
  return new web3.eth.Contract(abi, address);
};