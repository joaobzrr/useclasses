import * as types from "./types";

export default class Spec {
    validClasses:   Set<string>;
    defaultClasses: Set<string>;
    classToGroup:   Map<string, types.GroupSpecifier>;
    groupToClasses: Map<types.GroupSpecifier, Set<string>>;

    constructor(schema: types.Schema) {
        this.validClasses      = new Set();
        this.defaultClasses    = new Set();
        this.classToGroup      = new Map();

        for (const [index, entry] of schema.entries()) {
            this.validClasses.add(entry.name);

            if (entry.group === "default") {
                this.defaultClasses.add(entry.name);
            }

            this.classToGroup.set(entry.name, entry.group);
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
