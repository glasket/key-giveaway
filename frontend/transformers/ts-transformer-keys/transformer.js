"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_1 = __importDefault(require("typescript"));
var path_1 = __importDefault(require("path"));
var createArrayExpression = typescript_1.default.factory ? typescript_1.default.factory.createArrayLiteralExpression : typescript_1.default.createArrayLiteral;
var createStringLiteral = typescript_1.default.factory ? typescript_1.default.factory.createStringLiteral : typescript_1.default.createLiteral;
function transformer(program) {
    return function (context) { return function (file) { return visitNodeAndChildren(file, program, context); }; };
}
exports.default = transformer;
function visitNodeAndChildren(node, program, context) {
    return typescript_1.default.visitEachChild(visitNode(node, program), function (childNode) { return visitNodeAndChildren(childNode, program, context); }, context);
}
function visitNode(node, program) {
    var typeChecker = program.getTypeChecker();
    if (isKeysImportExpression(node)) {
        return;
    }
    if (!isKeysCallExpression(node, typeChecker)) {
        return node;
    }
    if (!node.typeArguments) {
        return createArrayExpression([]);
    }
    var type = typeChecker.getTypeFromTypeNode(node.typeArguments[0]);
    var properties = typeChecker.getPropertiesOfType(type).filter(function (p) { return !p.name.startsWith('#'); });
    return createArrayExpression(properties.map(function (property) { return createStringLiteral(property.name); }));
}
var indexJs = path_1.default.join(__dirname, 'index.js');
function isKeysImportExpression(node) {
    if (!typescript_1.default.isImportDeclaration(node)) {
        return false;
    }
    var module = node.moduleSpecifier.text;
    try {
        return indexJs === (module.startsWith('.')
            ? require.resolve(path_1.default.resolve(path_1.default.dirname(node.getSourceFile().fileName), module))
            : require.resolve(module));
    }
    catch (e) {
        return false;
    }
}
var indexTs = path_1.default.join(__dirname, 'index.d.ts');
function isKeysCallExpression(node, typeChecker) {
    var _a, _b;
    if (!typescript_1.default.isCallExpression(node)) {
        return false;
    }
    var declaration = (_a = typeChecker.getResolvedSignature(node)) === null || _a === void 0 ? void 0 : _a.declaration;
    if (!declaration || typescript_1.default.isJSDocSignature(declaration) || ((_b = declaration.name) === null || _b === void 0 ? void 0 : _b.getText()) !== 'keys') {
        return false;
    }
    try {
        // require.resolve is required to resolve symlink.
        // https://github.com/kimamula/ts-transformer-keys/issues/4#issuecomment-643734716
        return require.resolve(declaration.getSourceFile().fileName) === indexTs;
    }
    catch (_c) {
        // declaration.getSourceFile().fileName may not be in Node.js require stack and require.resolve may result in an error.
        // https://github.com/kimamula/ts-transformer-keys/issues/47
        return false;
    }
}
