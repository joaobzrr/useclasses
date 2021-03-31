import { useState } from "react";
import Spec from "./Spec";
import { union, difference, isFunction, isString } from "./utils";
import * as types from "./types";

// @Todo: Make it possible to disable all classes at once easily.
export function fromSchema(schema: types.Schema) {
    const spec = new Spec(schema);

    return (...classesToEnable: string[]) => {
        spec.validate(...classesToEnable);

        const [classes, setState] = useState(() => {
            return union(new Set(classesToEnable), spec.defaultClasses);
        });

        function setClasses(...args: types.SetClassesFunctionArgument[]): void;
        function setClasses(args: types.UpdateFunction): void;
        function setClasses(...args: any): void {
            setState((currentState: Set<string>) => {
                const normalized = handleSetClassesArguments(currentState, args);
                let [classesToEnable, classesToDisable] = getDiffFromArguments(currentState, normalized);

                spec.validate(...classesToEnable);
                spec.validate(...classesToDisable);

                let exclude = new Set<string>();
                for (let [group, classes] of spec.mapGroupToClasses(classesToEnable)) {
                    if (group === "default" || group === null) {
                        continue;
                    }
                    const a = new Set<string>(spec.groupToClasses.get(group));
                    const b = new Set<string>(classes);
                    exclude = union(exclude, difference(a, b));
                }
                classesToDisable = union(classesToDisable, exclude);

                return difference(union(currentState, classesToEnable), classesToDisable);
            });
        }

        return { classes, setClasses };
    }
}

export function useClasses(...initialState: string[]) {
    const [classes, setState] = useState(() => new Set(initialState));

    function setClasses(...args: types.SetClassesFunctionArgument[]): void;
    function setClasses(args: types.UpdateFunction): void;
    function setClasses(...args: any): void {
        setState((currentState: Set<string>) => {
            const normalized = handleSetClassesArguments(currentState, args);
            const [classesToEnable, classesToDisable] = getDiffFromArguments(currentState, normalized);
            return difference(union(currentState, classesToEnable), classesToDisable);
        });
    }

    return { classes, setClasses };
}

export function serializeClasses(state: Set<string>) {
    return [...state].join(" ");
}

function getDiffFromArguments(currentState: Set<string>, args: types.SetClassesFunctionArgument[]) {
    let classesToEnable  = new Set<string>();
    let classesToDisable = new Set<string>();

    for (const argument of args) {
        if (isString(argument)) {
            classesToEnable.add(argument as string);
        } else if (Array.isArray(argument)) {
            classesToEnable = new Set([...classesToEnable, ...<string[]>argument]);
        } else if (argument instanceof Set) {
            classesToEnable = new Set([...classesToEnable, ...<Set<string>>argument]);
        } else {
            const dict = argument as {[key: string]: boolean};
            for (let key of Object.keys(dict)) {
                (dict[key] ? classesToEnable : classesToDisable).add(key);
            }
        }
    }

    return [classesToEnable, classesToDisable];
}

function handleSetClassesArguments(currentState: Set<string>, args: types.SetClassesFunctionArgument[]): types.SetClassesFunctionArgument[];
function handleSetClassesArguments(currentState: Set<string>, args: types.UpdateFunction): types.SetClassesFunctionArgument[];
function handleSetClassesArguments(currentState: Set<string>, args: any): types.SetClassesFunctionArgument[] {
    if (isFunction(args[0])) {
        return [(args[0] as types.UpdateFunction)(currentState)]
    } else {
        return args;
    }
}
