pragma solidity 0.8.23;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Test} from 'forge-std/Test.sol';

import {BFactory} from 'contracts/BFactory.sol';
import {IBPool} from 'interfaces/IBPool.sol';

import {GasSnapshot} from 'forge-gas-snapshot/GasSnapshot.sol';

abstract contract PoolSwapIntegrationTest is Test, GasSnapshot {
  BFactory public factory;
  IBPool public pool;

  IERC20 public tokenA;
  IERC20 public tokenB;

  address public lp = address(420);
  address public swapper = address(69);

  function setUp() public {
    tokenA = IERC20(address(deployMockERC20('TokenA', 'TKA', 18)));
    tokenB = IERC20(address(deployMockERC20('TokenB', 'TKB', 18)));

    deal(address(tokenA), address(lp), 100e18);
    deal(address(tokenB), address(lp), 100e18);

    deal(address(tokenA), address(swapper), 1e18);

    factory = new BFactory();

    vm.startPrank(lp);
    pool = factory.newBPool();

    tokenA.approve(address(pool), type(uint256).max);
    tokenB.approve(address(pool), type(uint256).max);

    pool.bind(address(tokenA), 1e18, 2e18); // 20% weight?
    pool.bind(address(tokenB), 1e18, 8e18); // 80%

    pool.finalize();
    vm.stopPrank();
  }

  function testSimpleSwap() public {
    _makeSwap();
    assertEq(tokenA.balanceOf(address(swapper)), 0.5e18);
    // NOTE: hardcoded from test result
    assertEq(tokenB.balanceOf(address(swapper)), 0.096397921069149814e18);

    vm.startPrank(lp);

    uint256 lpBalance = pool.balanceOf(address(lp));
    pool.exitPool(lpBalance, new uint256[](2));

    // NOTE: no swap fees involved
    assertEq(tokenA.balanceOf(address(lp)), 100.5e18); // initial 100 + 0.5 tokenA
    // NOTE: hardcoded from test result
    assertEq(tokenB.balanceOf(address(lp)), 99.903602078930850186e18); // initial 100 - ~0.09 tokenB
  }

  function _makeSwap() internal virtual;
}

contract DirectPoolSwapIntegrationTest is PoolSwapIntegrationTest {
  function _makeSwap() internal override {
    vm.startPrank(swapper);
    tokenA.approve(address(pool), type(uint256).max);

    // swap 0.5 tokenA for tokenB
    snapStart('swapExactAmountIn');
    pool.swapExactAmountIn(address(tokenA), 0.5e18, address(tokenB), 0, type(uint256).max);
    snapEnd();

    vm.stopPrank();
  }
}

contract IndirectPoolSwapIntegrationTest is PoolSwapIntegrationTest {
  function _makeSwap() internal override {
    vm.startPrank(address(pool));
    tokenA.approve(address(swapper), type(uint256).max);
    tokenB.approve(address(swapper), type(uint256).max);
    vm.stopPrank();

    vm.startPrank(swapper);
    // swap 0.5 tokenA for tokenB
    tokenA.transfer(address(pool), 0.5e18);
    tokenB.transferFrom(address(pool), address(swapper), 0.096397921069149814e18);
    vm.stopPrank();
  }
}
