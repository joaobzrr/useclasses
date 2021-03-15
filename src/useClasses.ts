import { useState } from "react";
import * as types from "./types";

class Spec {
    validClasses:      Set<string>;
    defaultClasses:    Set<string>;

    classToGroup:      Map<string, types.GroupSpecifier>;
    classToPrecedence: Map<string, number>;
    groupToClasses:    Map<types.GroupSpecifier, Set<string>>;

    constructor(schema: types.Schema) {
        this.validClasses      = new Set();
        this.defaultClasses    = new Set();
        this.classToGroup      = new Map();
        this.classToPrecedence = new Map();

        for (const [index, entry] of schema.entries()) {
            this.validClasses.add(entry.name);

            if (entry.group === "default") {
                this.defaultClasses.add(entry.name);
            }

            this.classToGroup.set(entry.name, entry.group);
            this.classToPrecedence.set(entry.name, index);
        }

        this.groupToClasses = this.mapGroupToClasses(this.validClasses);
    }

    mapGroupToClasses(classes: Set<string>) {
        let result = new Map<types.GroupSpecifier, Set<string>>();

        for (let cls of classes) {
            const group = this.classToGroup.get(cls)!;
            if (result.has(group)) {
                result.get(group)!.add(cls);
            } else {
                result.set(group, new Set([cls]));
            }
        }
        return result;
    }

    validate(...classNames: string[]) {
        for (let name of classNames) {
            if (!this.validClasses.has(name)) {
                throw new Error(`${name} not in schema.`);
            }
        }
    }
}

export default function make(schema: types.Schema) {
    const spec = new Spec(schema);

    const use = (...classesToEnable: string[]) => {
        return useClasses(spec, ...classesToEnable);
    }

    const serialize = (state: Set<string>) => {
        return serializeClasses(spec, state);
    }

    return { useClasses: use, serializeClasses: serialize };
}

function useClasses(spec: Spec, ...classesToEnable: string[]) {
    spec.validate(...classesToEnable);

    const [state, set] = useState(() => {
        return union(new Set(classesToEnable), spec.defaultClasses);
    });

    const _setClasses = (...args: types.SetClassesFunctionArgument[]) => {
        set((currentState: Set<string>) => setClasses(spec, currentState, ...args));
    }

    return {classes: state, setClasses: _setClasses};
}

function serializeClasses(spec: Spec, state: Set<string>) {
    const sorted = [...state].sort((a: string, b: string) => {
        const pa = spec.classToPrecedence.get(a)!;
        const pb = spec.classToPrecedence.get(b)!;
        return pa - pb;
    });
    const result = sorted.join(" ");
    return result;
}

function setClasses(spec: Spec, currentState: Set<string>, ...args: types.SetClassesFunctionArgument[]) {
    let classesToEnable  = new Set<string>();
    let classesToDisable = new Set<string>();

    for (let x of args) {
        let value: unknown = x;
        if (isFunction(x)) {
            value = (x as types.UpdateFunction)(currentState);
        }

        if (isString(value)) {
            const name = value as string;
            classesToEnable.add(name);
        } else if (Array.isArray(value)) {
            const names = new Set(value as string[]);
            classesToEnable = union(classesToEnable, names);
        } else {
            const dict = value as {[key: string]: boolean};
            for (let key of Object.keys(dict)) {
                (dict[key] ? classesToEnable : classesToDisable).add(key);
            }
        }
    }

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

    let newState = union(currentState, classesToEnable);
    newState = difference(newState, classesToDisable);
    return newState;
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
