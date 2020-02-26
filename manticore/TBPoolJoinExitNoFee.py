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

# This plugin is used to speed up the exploration and skip the require(false) paths
# It won't be needed once https://github.com/trailofbits/manticore/issues/1593 is added
class SkipRequire(Plugin):
    def will_evm_execute_instruction_callback(self, state, instruction, arguments):
        world = state.platform
        if state.platform.current_transaction.sort != 'CREATE':
            if instruction.semantics == "JUMPI":
                potential_revert = world.current_vm.read_code(world.current_vm.pc + 4)
                if potential_revert[0].size == 8 and potential_revert[0].value == 0xfd:
                    state.constrain(arguments[1] == True)


print(f'controller: {hex(user.address)}')

skipRequire = SkipRequire()
m.register_plugin(skipRequire)

TestBpool = m.solidity_create_contract('./manticore/contracts/TBPoolJoinExitNoFee.sol',
                                       contract_name='TBPoolJoinExitNoFee',
                                       owner=user)

print(f'TestJoinExit deployed {hex(TestBpool.address)}')

# Call joinAndExitNoFeePool with symbolic values
poolAmountOut = m.make_symbolic_value()
poolAmountIn = m.make_symbolic_value()
poolTotal = m.make_symbolic_value()
_records_t_balance = m.make_symbolic_value()
TestBpool.joinAndExitNoFeePool(poolAmountOut, poolAmountIn, poolTotal, _records_t_balance)

print(f'joinAndExitNoFeePool Called')

for state in m.ready_states:

    m.generate_testcase(state, name="BugFound")

    # Look over the 10**i, and try to generate more free tokens
    for i in range(0, 18):
        print(i)
        add_value = 10**i
        condition = Operators.AND(poolAmountOut > poolAmountIn + add_value, poolAmountIn + add_value > poolAmountIn)
        m.generate_testcase(state, name=f"BugFound{add_value}", only_if=condition)

print(f'Results are in {m.workspace}')

