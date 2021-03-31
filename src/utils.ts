export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set<T>([...a, ...b]);
}

export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set<T>([...a].filter((k: T) => !b.has(k)));
}

export function isFunction (obj: any) {
    return obj && Object.prototype.toString.call(obj) === '[object Function]';
}

export function isString(obj: any) {
    return Object.prototype.toString.call(obj) === "[object String]";
}
