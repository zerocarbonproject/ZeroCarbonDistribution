pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol";

/**
 * @title ZCDistribution
 * 
 * Used to distribute rewards to consumers
 *
 * (c) Philip Louw / Zero Carbon Project 2018. The MIT Licence.
 */
contract ZCDistribution is Claimable {

    // Total amount of airdrops that happend
    uint256 public numDrops;
    // Total amount of tokens dropped
    uint256 public dropAmount;
    // Address of the Token
    address public tokenAddress;

    /**
     * @param _tokenAddr The Address of the Token
     */
    constructor(address _tokenAddr) public {
        tokenAddress = _tokenAddr;
    }

    /**
    * @dev Event when reward is distributed to consumer
    * @param receiver Consumer address
    * @param amount Amount of tokens distributed
    */
    event RewardDistributed(address receiver, uint amount);

    /**
    * @dev Distributes the rewards to the consumers. Returns the amount of customers that received tokens. Can only be called by Owner
    * @param dests Array of cosumer addresses
    * @param values Array of token amounts to distribute to each client
    */
    function multisend(address[] dests, uint256[] values) public onlyOwner returns (uint256) {
        assert(dests.length == values.length);
        uint256 i = 0;
        while (i < dests.length) {
            assert(ERC20Basic(tokenAddress).transfer(dests[i], values[i]));
            emit RewardDistributed(dests[i], values[i]);
            dropAmount += values[i];
            i += 1;
        }
        numDrops += dests.length;
        return i;
    }
}
