// SPDX-License-Identifier: non-open-source
pragma solidity >=0.6.0 <0.8.0;

contract Counter {
    int256 private count = 0;
    
    function incrementCounter() public {
        count += 1;
    }

    function decrementCounter() public {
        count -= 1;
    }

    function getCount() public view returns (int256) {
        return count;
    }

    function jumpTo(int256 to) public returns (int256) {
        count = to;
    }
}