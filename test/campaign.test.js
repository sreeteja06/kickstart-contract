const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

// compiledFactory = JSON.parse(compiledFactory);
// compiledCampaign = JSON.parse(compiledCampaign);

let accounts;
let factory;
let CampaignAddress;
let Campaign;

beforeEach( async () => {
    accounts = await web3.eth.getAccounts();
    try{
    factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({data: "0x"+compiledFactory["evm"]["bytecode"]["object"]})
    .send({gas: '4500000', from :accounts[0]});
    }
    catch(e){
        console.log('e'+e);
    }
    await factory.methods.createCampaign('1').send({
        from: accounts[0],
        gas: '1000000'
    });

    var receipt = await web3.eth.getTransactionReceipt(factory);
    console.log(receipt);    
    const address = await factory.methods.getDeployedContracts().call();
    CampaignAddress = address[0];
    Campaign = await new web3.eth.Contract(
        compiledCampaign.abi,
        CampaignAddress
    );
});

describe('campaign', ()=>{
    it('deploys a factory and a campaign',()=>{
        assert.ok(factory.options.address);
        assert.ok(Campaign.options.address);
    });
    it('marks caller as the manager',async ()=>{
        const manager = await Campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });
    it('allows peopleto contribute and marks them as approvers',async ()=>{
        await Campaign.methods.contribute().send({
            value: 2,
            from: accounts[1]
        });
        const isContrubuter = await Campaign.methods.approvers(accounts[1]).call();
        assert(isContrubuter);
    });
    it('requires a minimum contribution', async ()=>{
        try{
            await Campaign.methods.contribute().send({
                value: 0.1,
                from: accounts[1]
            });
            assert(false);
        }catch(err){
            assert(err);
        }
    });
    it('allows the manager to make payment request',async()=>{
        await Campaign.methods.createRequest("hello world", 1, accounts[1]).send({
            from: accounts[0],
            gas: '1000000'
        });
        const request = await Campaign.methods.requests(0).call();
        assert.equal('hello world', request.description);
    });
    it('proccess requests', async ()=>{
        await Campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10','ether')
        });
        await Campaign.methods
            .createRequest("a",web3.utils.toWei('5','ether'),accounts[1])
            .send({from: accounts[0], gas: '1000000'})
        await Campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        })
        await Campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });
        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);

        assert(balance > 104);
    })
})