- [Instllation](#Installation)
- [Echidna](#testing-properties-with-echidna)
# Installation

**Slither**
```
pip3 install slither-analyzer
```

**Echidna**
See [Echidna Installation](https://github.com/crytic/building-secure-contracts/tree/master/program-analysis/echidna#installation).

# Testing properties with Echidna

`slither-flat` will export the contract and translate external function to public, to faciliate writting properties:
```
slither-flat . --convert-external
```

The flattened contracts are in `crytic-export/flattening`. The Echidna properties are in `echidna/`.

## Testing BPool

### Properties

1. Can an attacker steal assets from a public pool?
2. Can an attacker force the pool balance to be out-of-sync?

- Implementation: [echidna/TBPoolBalance.sol](echidna/TBPoolBalance.sol)
- Configuration: [echidna/TBPoolBalance.yaml](echidna/TBPoolBalance.yaml) 

#### Run
```
echidna-test echidna/TBPoolBalance.sol TBPoolBalance -config echidna/TBPoolBalance.yaml
```

#### Descriptions
The properties check:

1. The external user (`0x42424242`) should always have 0 token.
2. The balance of pool in the token is equal to the balance recorded in the contract.  

For all the properties, the initialization comprises:

- Creates an ERC20 token
- Binds it to the pool
- Set the pool public

The address of the controller and the user are set in `echidna/TBPoolBalance.yaml` 

#### Result
```
echidna_pool_record_balance: passed! 🎉
echidna_user_token_balance: failed!💥  
  Call sequence:
    exitswapExternAmountOut(423ecb4c8e3daf34776dbacd1c269757528c437a,1,0)
```

This counter-example lead to the discovery of https://github.com/balancer-labs/balancer-core/issues/193.


## Testing BToken

### Properties

1. Does the contract complies with basic ERC20 properties?
2. Can an attacker increase their own balance and/or decrease the balance of the other users balance?

- Implementation: [echidna/TBTokenERC20.sol](echidna/TBTokenERC20.sol)
- Configuration: [echidna/TBTokenERC20.yaml](echidna/TBTokenERC20.yaml) 

#### Run
```
echidna-test echidna/TBTokenERC20.sol TBTokenERC20 --config echidna/TBTokenERC20.yaml
```

#### Descriptions

TODO

#### Result

TODO
