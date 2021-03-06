"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdlCoder = void 0;
const camelcase_1 = __importDefault(require("camelcase"));
const borsh = __importStar(require("@project-serum/borsh"));
const error_1 = require("../error");
class IdlCoder {
    static fieldLayout(field, types) {
        const fieldName = field.name !== undefined ? camelcase_1.default(field.name) : undefined;
        switch (field.type) {
            case "bool": {
                return borsh.bool(fieldName);
            }
            case "u8": {
                return borsh.u8(fieldName);
            }
            case "i8": {
                return borsh.i8(fieldName);
            }
            case "u16": {
                return borsh.u16(fieldName);
            }
            case "i16": {
                return borsh.i16(fieldName);
            }
            case "u32": {
                return borsh.u32(fieldName);
            }
            case "i32": {
                return borsh.i32(fieldName);
            }
            case "u64": {
                return borsh.u64(fieldName);
            }
            case "i64": {
                return borsh.i64(fieldName);
            }
            case "u128": {
                return borsh.u128(fieldName);
            }
            case "i128": {
                return borsh.i128(fieldName);
            }
            case "bytes": {
                return borsh.vecU8(fieldName);
            }
            case "string": {
                return borsh.str(fieldName);
            }
            case "publicKey": {
                return borsh.publicKey(fieldName);
            }
            default: {
                // @ts-ignore
                if (field.type.vec) {
                    return borsh.vec(IdlCoder.fieldLayout({
                        name: undefined,
                        // @ts-ignore
                        type: field.type.vec,
                    }, types), fieldName);
                    // @ts-ignore
                }
                else if (field.type.option) {
                    return borsh.option(IdlCoder.fieldLayout({
                        name: undefined,
                        // @ts-ignore
                        type: field.type.option,
                    }, types), fieldName);
                    // @ts-ignore
                }
                else if (field.type.defined) {
                    // User defined type.
                    if (types === undefined) {
                        throw new error_1.IdlError("User defined types not provided");
                    }
                    // @ts-ignore
                    const filtered = types.filter((t) => t.name === field.type.defined);
                    if (filtered.length !== 1) {
                        throw new error_1.IdlError(`Type not found: ${JSON.stringify(field)}`);
                    }
                    return IdlCoder.typeDefLayout(filtered[0], types, fieldName);
                    // @ts-ignore
                }
                else if (field.type.array) {
                    // @ts-ignore
                    let arrayTy = field.type.array[0];
                    // @ts-ignore
                    let arrayLen = field.type.array[1];
                    let innerLayout = IdlCoder.fieldLayout({
                        name: undefined,
                        type: arrayTy,
                    }, types);
                    return borsh.array(innerLayout, arrayLen, fieldName);
                }
                else {
                    throw new Error(`Not yet implemented: ${field}`);
                }
            }
        }
    }
    static typeDefLayout(typeDef, types, name) {
        if (typeDef.type.kind === "struct") {
            const fieldLayouts = typeDef.type.fields.map((field) => {
                const x = IdlCoder.fieldLayout(field, types);
                return x;
            });
            return borsh.struct(fieldLayouts, name);
        }
        else if (typeDef.type.kind === "enum") {
            let variants = typeDef.type.variants.map((variant) => {
                const name = camelcase_1.default(variant.name);
                if (variant.fields === undefined) {
                    return borsh.struct([], name);
                }
                // @ts-ignore
                const fieldLayouts = variant.fields.map((f) => {
                    // @ts-ignore
                    if (f.name === undefined) {
                        throw new Error("Tuple enum variants not yet implemented.");
                    }
                    // @ts-ignore
                    return IdlCoder.fieldLayout(f, types);
                });
                return borsh.struct(fieldLayouts, name);
            });
            if (name !== undefined) {
                // Buffer-layout lib requires the name to be null (on construction)
                // when used as a field.
                return borsh.rustEnum(variants).replicate(name);
            }
            return borsh.rustEnum(variants, name);
        }
        else {
            throw new Error(`Unknown type kint: ${typeDef}`);
        }
    }
}
exports.IdlCoder = IdlCoder;
//# sourceMappingURL=idl.js.map