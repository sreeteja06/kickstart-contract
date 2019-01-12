const HDwalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { abi, evm } = require("./build/CampaignFactory.json");
const {seed} = require('./seed');

//the seed.js contains the seed of the ethereum account
//module.exports = {
//    seed: "your ethereum seed will be here"
//}

const bytecode = evm.bytecode;


const provider = new HDwalletProvider(
  seed,
  "https://rinkeby.infura.io/v3/ec2f8b79db3b4da587c4c5299162f65c"
);
const web3 = new Web3(provider);

const interface = JSON.stringify(abi);
let accounts, result;

const deploy = async () => {
  try {
    accounts = await web3.eth.getAccounts();
  } catch (e) {
    console.log("error 1 " + e);
  }
  try {
    result = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({ data: "0x" + bytecode.object })
      .send({ gas: "2000000", from: accounts[0] });
    console.log("contract deployed to " + result.options.address);              //0x38Cba1262020a0d1775Facdcdd3d442f64161FeF
  } catch (e) {
    console.log("error 2 " + e);
  }
};

deploy();
