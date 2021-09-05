"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountClient = exports.StateClient = void 0;
const camelcase_1 = __importDefault(require("camelcase"));
const instruction_1 = __importDefault(require("./instruction"));
const transaction_1 = __importDefault(require("./transaction"));
const account_1 = __importDefault(require("./account"));
const common_1 = require("../common");
// Re-exports.
var state_1 = require("./state");
Object.defineProperty(exports, "StateClient", { enumerable: true, get: function () { return state_1.StateClient; } });
var account_2 = require("./account");
Object.defineProperty(exports, "AccountClient", { enumerable: true, get: function () { return account_2.AccountClient; } });
class NamespaceFactory {
    /**
     * Generates all namespaces for a given program.
     */
    static build(idl, coder, programId, provider) {
        const rpc = {};
        const instruction = {};
        const transaction = {};
        const simulate = {};
        const state = null;
        const idlErrors = common_1.parseIdlErrors(idl);
        idl.instructions.forEach((idlIx) => {
            const ixItem = instruction_1.default.build(idlIx, (ixName, ix) => coder.instruction.encode(ixName, ix), programId);
            const txItem = transaction_1.default.build(idlIx, ixItem);
            const name = camelcase_1.default(idlIx.name);
            instruction[name] = ixItem;
            transaction[name] = txItem;
        });
        const account = idl.accounts
            ? account_1.default.build(idl, coder, programId, provider)
            : {};
        return [rpc, instruction, transaction, account, simulate, state];
    }
}
exports.default = NamespaceFactory;
//# sourceMappingURL=index.js.map