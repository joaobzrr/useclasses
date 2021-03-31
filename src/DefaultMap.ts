import { isFunction } from "./utils";

type DefaultValueFunction<V> = () => V;
type DefaultValueType<V> = V | DefaultValueFunction<V>;

// @Note: We tried extending Map but this raised an error while calling super
// inside DefaultMap's constructor. The error we got was:
//
// TypeError: Constructor Map requires 'new'
//
// There's a discussion on  the typescript repo about it, but it was locked
// to collaborators: https://github.com/microsoft/TypeScript/issues/10853.
export default class DefaultMap<K, V> {
    map: Map<K, V>;
    defaultValue: DefaultValueType<V>;

    constructor(defaultValue: DefaultValueType<V>, values?: [K, V][]) {
        this.map = new Map<K, V>(values);
        this.defaultValue = defaultValue;
    }

    get(key: K): V {
        if (this.map.has(key)) {
            return this.map.get(key)!;
        } else {
            let value;
            if (isFunction(this.defaultValue)) {
                value = (this.defaultValue as Function)();
            } else {
                value = this.defaultValue as DefaultValueFunction<V>;
            }

            this.map.set(key, value);
            return value;
        }
    }

    [Symbol.iterator]() {
        return this.map[Symbol.iterator]();
    }
}
