import expectThrow from './helpers/expectThrow';
import { doesNotReject } from 'assert';

const ZCDistribution = artifacts.require("./ZCDistribution.sol");
const ERC20Mock = artifacts.require("./mocks/ERC20Mock.sol");

const BigNumber = web3.BigNumber;

contract('ZCDistribution', function([_, ctcOwner, customer1, customer2, customer3, customer4, customer5]) {
 
  describe('Test Construct', async function() {

    const totalTokenSupply = new BigNumber('200000000000000000000000000');

    beforeEach(async function () {
      this.token = await ERC20Mock.new(ctcOwner, totalTokenSupply);
      this.zcdist = await ZCDistribution.new(this.token.address, {from : ctcOwner});
    });

    it('Test MockToken Setup', async function() {
      var ctcOwnerBalance = await this.token.balanceOf(ctcOwner);
      assert.isTrue(totalTokenSupply.eq(ctcOwnerBalance));
    });

    it('Contract should have a owner', async function() {
      const owner = await this.zcdist.owner();
      assert.isTrue(owner !== 0);
      assert.isTrue(owner == ctcOwner);
      assert.isTrue(owner != customer1);
    });

    it('Contract should set token address', async function() {
      const tokenSetAddr = await this.zcdist.tokenAddress();
      assert.isTrue(tokenSetAddr == this.token.address, 'Expected address ' + this.token.address + ', found ' + tokenSetAddr);
    });

    it('Contract initial values', async function() {
      assert.isTrue(( await this.zcdist.numDrops()).eq(new BigNumber(0)) );
      assert.isTrue(( await this.zcdist.dropAmount()).eq(new BigNumber(0)) );
    });

    it('Only owner can distribute', async function() {
      var accs = [customer1, customer2, customer3, customer4, customer5];
      var values = [new BigNumber(100), new BigNumber(200), new BigNumber(300),new BigNumber(400),new BigNumber(500),]
      await expectThrow(this.zcdist.multisend(accs, values, {from : customer1}));
    });
  });

  describe('Test Multisend', async function() {

    const totalTokenSupply = new BigNumber('200000000000000000000000000');

    beforeEach(async function () {
      this.token = await ERC20Mock.new(ctcOwner, totalTokenSupply);
      this.zcdist = await ZCDistribution.new(this.token.address, {from : ctcOwner});
    });

    it('Test malformed', async function() {
      await this.token.transfer(this.zcdist.address, new BigNumber(1500), {from : ctcOwner});
      var zcbalance = await this.token.balanceOf(this.zcdist.address);
      var accs = [customer1, customer2, customer3, customer4];
      var values = [new BigNumber(100), new BigNumber(200), new BigNumber(300),new BigNumber(400),new BigNumber(500)]
      await expectThrow(this.zcdist.multisend(accs, values, {from : ctcOwner}));
    });

    it('Test no funds', async function() {
      var accs = [customer1, customer2];
      var values = [new BigNumber(100), new BigNumber(200)];
      await expectThrow(this.zcdist.multisend(accs, values, {from : ctcOwner}));
    });

    it('Test multsend', async function() {

      await this.token.transfer(this.zcdist.address, new BigNumber(1500), {from : ctcOwner});
      var zcbalance = await this.token.balanceOf(this.zcdist.address);
      assert.isTrue(zcbalance.eq(new BigNumber(1500)), 'Expected ZCDist to have balance of 1500 found balance of ' + zcbalance);

      var accs = [customer1, customer2, customer3, customer4, customer5];
      var values = [new BigNumber(100), new BigNumber(200), new BigNumber(300),new BigNumber(400),new BigNumber(500)]
      await this.zcdist.multisend(accs, values, {from : ctcOwner});

      assert.isTrue((await this.token.balanceOf(customer1)).eq(values[0]), 'Expected customer 1 to have 100 tokens');
      assert.isTrue((await this.token.balanceOf(customer2)).eq(values[1]), 'Expected customer 2 to have 200 tokens');
      assert.isTrue((await this.token.balanceOf(customer3)).eq(values[2]), 'Expected customer 3 to have 300 tokens');
      assert.isTrue((await this.token.balanceOf(customer4)).eq(values[3]), 'Expected customer 4 to have 400 tokens');
      assert.isTrue((await this.token.balanceOf(customer5)).eq(values[4]), 'Expected customer 5 to have 500 tokens');
    });

  });
});
