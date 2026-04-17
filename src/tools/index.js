import * as addExpenseTool from './addExpenseTool.js';
// import * as addIncomeTool from './addIncomeTool.js';

export const availableTools = {
    add_expense: addExpenseTool
    // add_income: addIncomeTool
};

export const getGeminiToolsDeclaration = () => {
    return [
        {
            functionDeclarations: Object.values(availableTools).map((tool) => tool.declaration)
        }
    ];
};
