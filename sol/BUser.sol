contract BUser {
    bytes4 ExactOutSig = bytes4(keccak256("swap_ExactOut(address,uint256,address,uint256,uint256)"));

    function trySwap_ExactOut(BPool b, address Ti, uint Li, address To, uint Ao, uint Lp)
        internal returns (uint256 Ai, uint256 Mp)
    {
        bool res;
        bytes memory err;
        assembly {
            (res, err) = b.call(abi.encodePacked(ExactOutSig, Ti, Li, To, Ao, Lp))
        }
    }
    // viewSwap w/ staticcall
}
