from manticore.ethereum import ManticoreEVM, ABI
from manticore.core.smtlib import Operators, Z3Solver
from manticore.utils import config
from manticore.core.plugin import Plugin

m = ManticoreEVM()

# Disable the gas tracking
consts_evm = config.get_group("evm")
consts_evm.oog = "ignore"

# Increase the solver timeout
config.get_group("smt").defaultunsat = False
config.get_group("smt").timeout = 3600

ETHER = 10 ** 18

user = m.create_account(balance=1 * ETHER)

print(f'controller: {hex(user.address)}')

TestBpool = m.solidity_create_contract('./manticore/contracts/TBPoolJoinPool.sol',
                                       contract_name='TBPoolJoinPool',
                                       owner=user)

print(f'TBPoolJoinPool deployed {hex(TestBpool.address)}')

# Call joinAndExitNoFeePool with symbolic values
poolAmountOut = m.make_symbolic_value()
poolAmountIn = m.make_symbolic_value()
poolTotal = m.make_symbolic_value()
_records_t_balance = m.make_symbolic_value()
TestBpool.joinPool(poolAmountOut, poolTotal, _records_t_balance)

print(f'joinPool Called')

for state in m.ready_states:

    m.generate_testcase(state, name="BugFound")

    # Look over the 10**i, and try to generate more free tokens
    for i in range(0, 18):
        print(i)
        add_value = 10**i
        condition = Operators.AND(poolAmountOut > poolAmountIn + add_value, poolAmountIn + add_value > poolAmountIn)
        m.generate_testcase(state, name=f"BugFound{add_value}", only_if=condition)

print(f'Results are in {m.workspace}')

