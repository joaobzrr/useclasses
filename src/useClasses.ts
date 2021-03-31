import { useState } from "react";
import Spec from "./Spec";
import { union, difference, isFunction, isString } from "./utils";
import * as types from "./types";

export function fromSchema(schema: types.Schema) {
    const spec = new Spec(schema);

    return (...initialState: string[]) => {
        spec.validate(...initialState);

        const [classes, setState] = useState(() => {
            return union(new Set(initialState), spec.defaultClasses);
        });

        function setClasses(...args: types.SetClassesFunctionArgument[]): void;
        function setClasses(args: types.UpdateFunction): void;
        function setClasses(args: null): void;
        function setClasses(...args: any): void {
            setState((currentState: Set<string>) => {
                if (args[0] === null) return new Set();

                let _args: types.SetClassesFunctionArgument[];
                if (isFunction(args[0])) {
                    _args = [ (<types.UpdateFunction>args[0])(currentState) ];
                } else {
                    _args = args;
                }

                let [enable, disable] = getDiff(currentState, _args);

                spec.validate(...enable);
                spec.validate(...disable);

                let exclude = new Set<string>();
                for (let [group, classes] of spec.mapGroupToClasses(enable)) {
                    if (group === "default" || group === null) {
                        continue;
                    }
                    const a = new Set<string>(spec.groupToClasses.get(group));
                    const b = new Set<string>(classes);
                    exclude = union(exclude, difference(a, b));
                }
                disable = union(disable, exclude);

                return difference(union(currentState, enable), disable);
            });
        }

        return { classes, setClasses };
    }
}

export function useClasses(...initialState: string[]) {
    const [classes, setState] = useState(() => new Set(initialState));

    function setClasses(...args: types.SetClassesFunctionArgument[]): void;
    function setClasses(args: types.UpdateFunction): void;
    function setClasses(args: null): void;
    function setClasses(...args: any): void {
        setState((currentState: Set<string>) => {
            if (args[0] === null) return new Set();

            let _args: types.SetClassesFunctionArgument[];
            if (isFunction(args[0])) {
                _args = [ (<types.UpdateFunction>args[0])(currentState) ];
            } else {
                _args = args;
            }

            const [enable, disable] = getDiff(currentState, _args);
            return difference(union(currentState, enable), disable);
        });
    }

    return { classes, setClasses };
}

export function serializeClasses(state: Set<string>) {
    return [...state].join(" ");
}

function getDiff(currentState: Set<string>, args: types.SetClassesFunctionArgument[]) {
    let enable  = new Set<string>();
    let disable = new Set<string>();

    for (const argument of args) {
        if (isString(argument)) {
            enable.add(argument as string);
        } else if (Array.isArray(argument)) {
            enable = new Set([...enable, ...<string[]>argument]);
        } else if (argument instanceof Set) {
            enable = new Set([...enable, ...<Set<string>>argument]);
        } else {
            const dict = argument as {[key: string]: boolean};
            for (let key of Object.keys(dict)) {
                (dict[key] ? enable : disable).add(key);
            }
        }
    }

    return [enable, disable];
}
