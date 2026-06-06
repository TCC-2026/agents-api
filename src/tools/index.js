import * as addTransactionTool from './addTransactionTool.js';
import * as getTransactionsTool from './getTransactionsTool.js';
import * as updTransactionTool from './updTransactionTool.js';
import * as getBalanceTool from './getBalanceTool.js';
import * as setLimitTool from './setLimitTool.js';  
import * as getLimitsTool from './getLimitsTool.js';

export const availableTools = {
    add_transaction: addTransactionTool,
    get_transactions: getTransactionsTool,
    update_transaction: updTransactionTool,
    get_balance: getBalanceTool,
    set_spending_limit: setLimitTool,
    get_spending_limits: getLimitsTool
};

export const getGeminiToolsDeclaration = () => {
    return [
        {
            functionDeclarations: Object.values(availableTools).map((tool) => tool.declaration)
        }
    ];
};
