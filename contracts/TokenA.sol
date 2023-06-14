// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyTokenA is ERC20 {
    constructor() ERC20("MyTokenA", "MTA") {
        _mint(msg.sender, 10000 * 10 ** decimals());
    }
}