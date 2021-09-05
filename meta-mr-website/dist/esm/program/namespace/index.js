import camelCase from "camelcase";
import InstructionFactory from "./instruction";
import TransactionFactory from "./transaction";
import AccountFactory from "./account";
import { parseIdlErrors } from "../common";
// Re-exports.
export { StateClient } from "./state";
export { AccountClient } from "./account";
export default class NamespaceFactory {
    /**
     * Generates all namespaces for a given program.
     */
    static build(idl, coder, programId, provider) {
        const rpc = {};
        const instruction = {};
        const transaction = {};
        const simulate = {};
        const state = null;
        const idlErrors = parseIdlErrors(idl);
        idl.instructions.forEach((idlIx) => {
            const ixItem = InstructionFactory.build(idlIx, (ixName, ix) => coder.instruction.encode(ixName, ix), programId);
            const txItem = TransactionFactory.build(idlIx, ixItem);
            const name = camelCase(idlIx.name);
            instruction[name] = ixItem;
            transaction[name] = txItem;
        });
        const account = idl.accounts
            ? AccountFactory.build(idl, coder, programId, provider)
            : {};
        return [rpc, instruction, transaction, account, simulate, state];
    }
}
//# sourceMappingURL=index.js.map