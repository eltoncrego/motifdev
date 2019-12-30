type queryValidity = {valid: boolean, error: string | null}
type queryState = {lastToken: string | null, openingParens: number,  error: string | null}
type operator = "and" | "or";
type parenthesis = "(" | ")";

class QueryValidator {
    validateQuery(tokens: string[]): queryValidity {
        var state: queryState = {lastToken: null, openingParens: 0, error: null}
        for (var i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            state = this.processToken(token, state);
            if (state.error) {
                return {valid: false, error: state.error}
            }
        }

        return this.validateEndingState(state);
     }

    processToken(token: string, state: queryState): queryState {
        if (this.isOperator(token))  {
            return this.processOperator(token as operator, state);
        } else if (this.isParenthesis(token))  {
            return this.processParen(token as parenthesis, state);
        } else {
            return this.processTag(token, state);
        }
    }

    processTag(token: string, state: queryState): queryState {
        if (this.isTag(state.lastToken)) {
            state.error = "Tags cannot be stacked consecutively";
            return state;
        }

        state.lastToken = token;
        return state;
    }

    processOperator(token: operator, state: queryState): queryState {
        if (this.isOperator(state.lastToken)) {
            state.error = "Operators cannot directly follow one another (e.g and and)";
            return state;
        }

        state.lastToken = token;
        return state;
    }
    
    processParen(token: parenthesis, state: queryState): queryState {
        if (token === "(")  {
            if (this.isTag(state.lastToken)) {
                state.error = "Cannot open a parenthesis directly after a tag."
                return state;
            }

            state.openingParens += 1;
        } else if (token === ")") {
            if (state.openingParens === 0) {
                state.error = "Closing parenthesis missing opening one."
                return state;
            }
            if (this.isOperator(state.lastToken)) {
                state.error = "Closing parenthesis must close a valid clause"
                return state;
            }
            state.openingParens -= 1;
        }

        state.lastToken = token;
        return state; 
    }

    isOperator(token: string | null)  {
        return token === "and" || token === "or";
    }

    isParenthesis(token: string | null)  {
        return token === "(" || token === ")";
    }

    isTag(token: string | null) {
        return !this.isOperator(token) && !this.isParenthesis(token) && token !== null;
    }

    validateEndingState(state: queryState): queryValidity {
        if (state.openingParens !== 0) {
            return {valid: false, error: "All opening parens must be closed"};
        }

        if (this.isOperator(state.lastToken)) {
            return {valid: false, error: "Query cannot end with an operator (and/or)"};
        }

        if (state.lastToken === null) {
            return {valid: false, error: "Query cannot be empty"};
        }

        return { valid: true, error: null }
    }
}

export default QueryValidator;