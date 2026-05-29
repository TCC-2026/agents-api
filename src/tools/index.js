import * as addTransactionTool from './addTransactionTool.js';
import * as getTransactionsTool from './getTransactionsTool.js';
import * as updTransactionTool from './updTransactionTool.js';
import * as getBalanceTool from './getBalanceTool.js';


export const availableTools = {
    add_transaction: addTransactionTool,
    get_transactions: getTransactionsTool,
    update_transaction: updTransactionTool,
    get_balance: getBalanceTool
};

export const getGeminiToolsDeclaration = () => {
    return [
        {
            functionDeclarations: Object.values(availableTools).map((tool) => tool.declaration)
        }
    ];
};
