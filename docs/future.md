#### silver

* gas optimizations
* enhanced swapping / pooling
    - poolToken <-> single token
    - N-1 tokens <-> single token
    - joinPool with single token / K tokens
* dynamic public pools
    - setWeightControlled
    - setBalanceControlled
* 'free' internal arbitrage (local flash lending)
* automatic approval (single 'approve' call per token, per release)

#### gold

* central price+depth reporter
* zero term loans (general flash lending)
