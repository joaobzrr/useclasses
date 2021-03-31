import DefaultMap from "./DefaultMap";
import * as types from "./types";

export default class Spec {
    validClasses:   Set<string>;
    defaultClasses: Set<string>;
    classToGroup:   Map<string, types.GroupSpecifier>;
    groupToClasses: DefaultMap<types.GroupSpecifier, Set<string>>;

    constructor(schema: types.Schema) {
        this.validClasses   = new Set();
        this.defaultClasses = new Set();
        this.classToGroup   = new Map();
        this.groupToClasses = new DefaultMap(() => new Set);

        for (const [name, group] of Object.entries(schema)) {
            this.validClasses.add(name);
            this.classToGroup.set(name, group);

            if (group === "default") {
                this.defaultClasses.add(name);
            }

            this.groupToClasses.get(group).add(name);
        }
    }

    mapGroupToClasses(classes: Set<string>) {
        let result = new DefaultMap<types.GroupSpecifier, Set<string>>(() => new Set());

        for (let cls of classes) {
            const group = this.classToGroup.get(cls)!
            result.get(group).add(cls);
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
