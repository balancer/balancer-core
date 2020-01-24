import "../crytic-export/flattening/BPool.sol";
import "./CryticInterface.sol";

contract TBPoolControllerPrivileged is CryticInterface, BPool {

    function echidna_controller_should_change() public returns (bool) {
        if (this.getController() == crytic_owner) {
            setController(crytic_user);
            return (this.getController() == crytic_user);
        }
        // if the controller was changed, this should return true
        return true;
    }

    function echidna_revert_controller_cannot_be_null() public returns (bool) {
        if (this.getController() == crytic_owner) {
           // setting the controller to 0x0 should fail
           setController(address(0x0));
           return true;
        }
        // if the controller was changed, this should revert anyway
        revert();
    }
}

contract TBPoolControllerUnprivileged is CryticInterface, BPool {

    function echidna_no_other_user_can_change_the_controller() public returns (bool) {
        // the controller cannot be changed by other users
        return this.getController() == crytic_owner;
    }

}
