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
const camelcase_1 = __importDefault(require("camelcase"));
const toml = __importStar(require("toml"));
const web3_js_1 = require("@solana/web3.js");
const program_1 = require("./program");
const common_1 = require("./utils/common");
let _populatedWorkspace = false;
/**
 * The `workspace` namespace provides a convenience API to automatically
 * search for and deserialize [[Program]] objects defined by compiled IDLs
 * in an Anchor workspace.
 *
 * This API is for Node only.
 */
const workspace = new Proxy({}, {
    get(workspaceCache, programName) {
        if (common_1.isBrowser) {
            console.log("Workspaces aren't available in the browser");
            return undefined;
        }
        const fs = require("fs");
        const process = require("process");
        if (!_populatedWorkspace) {
            const path = require("path");
            let projectRoot = process.cwd();
            while (!fs.existsSync(path.join(projectRoot, "Anchor.toml"))) {
                const parentDir = path.dirname(projectRoot);
                if (parentDir === projectRoot) {
                    projectRoot = undefined;
                }
                projectRoot = parentDir;
            }
            if (projectRoot === undefined) {
                throw new Error("Could not find workspace root.");
            }
            const idlFolder = `${projectRoot}/target/idl`;
            if (!fs.existsSync(idlFolder)) {
                throw new Error(`${idlFolder} doesn't exist. Did you use "anchor build"?`);
            }
            const idlMap = new Map();
            fs.readdirSync(idlFolder).forEach((file) => {
                const filePath = `${idlFolder}/${file}`;
                const idlStr = fs.readFileSync(filePath);
                const idl = JSON.parse(idlStr);
                idlMap.set(idl.name, idl);
                const name = camelcase_1.default(idl.name, { pascalCase: true });
                if (idl.metadata && idl.metadata.address) {
                    workspaceCache[name] = new program_1.Program(idl, new web3_js_1.PublicKey(idl.metadata.address));
                }
            });
            // Override the workspace programs if the user put them in the config.
            const anchorToml = toml.parse(fs.readFileSync(path.join(projectRoot, "Anchor.toml"), "utf-8"));
            const clusterId = anchorToml.provider.cluster;
            if (anchorToml.programs && anchorToml.programs[clusterId]) {
                attachWorkspaceOverride(workspaceCache, anchorToml.programs[clusterId], idlMap);
            }
            _populatedWorkspace = true;
        }
        return workspaceCache[programName];
    },
});
function attachWorkspaceOverride(workspaceCache, overrideConfig, idlMap) {
    Object.keys(overrideConfig).forEach((programName) => {
        const wsProgramName = camelcase_1.default(programName, { pascalCase: true });
        const entry = overrideConfig[programName];
        const overrideAddress = new web3_js_1.PublicKey(typeof entry === "string" ? entry : entry.address);
        let idl = idlMap.get(programName);
        if (typeof entry !== "string" && entry.idl) {
            idl = JSON.parse(require("fs").readFileSync(entry.idl, "utf-8"));
        }
        workspaceCache[wsProgramName] = new program_1.Program(idl, overrideAddress);
    });
}
exports.default = workspace;
//# sourceMappingURL=workspace.js.map