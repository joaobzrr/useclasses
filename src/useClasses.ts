import { useState } from "react";
import Spec from "./Spec";
import * as types from "./types";

export function fromSchema(schema: types.Schema) {
    const spec = new Spec(schema);

    function useClasses(...classesToEnable: string[]) {
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
                    const a = new Set(spec.groupToClasses.get(group));
                    const b = new Set(classes);
                    exclude = union(exclude, difference(a, b));
                }
                classesToDisable = union(classesToDisable, exclude);

                return difference(union(currentState, classesToEnable), classesToDisable);
            });
        }

        return { classes, setClasses };
    }

    function serializeClasses(state: Set<string>) {
        const sorted = [...state].sort((a: string, b: string) => {
            const pa = spec.classToPrecedence.get(a)!;
            const pb = spec.classToPrecedence.get(b)!;
            return pa - pb;
        });
        return sorted.join(" ");
    }

    return { useClasses, serializeClasses };
}

export function useClasses(...classesToEnable: string[]) {
    const [classes, setState] = useState(() => new Set(classesToEnable));

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

function union<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set<T>([...a, ...b]);
}

function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set<T>([...a].filter((k: T) => !b.has(k)));
}

function isFunction (obj: any) {
    return obj && Object.prototype.toString.call(obj) === '[object Function]';
}

function isString(obj: any) {
    return Object.prototype.toString.call(obj) === "[object String]";
}
