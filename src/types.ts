export type Schema = SchemaEntry[];

export type SchemaEntry = {name: string, group: GroupSpecifier};

export type GroupSpecifier = number | string | null;

export type UseClassesReturnType = [Set<string>, SetClassesFunction];

export type UseClassesFunction = (...initialState: string[]) => [Set<string>, SetClassesFunction];

export type SetClassesFunctionArgument = string | {[key: string]: boolean} | UpdateFunction;

export type SetClassesFunction = (...args: SetClassesFunctionArgument[]) => void;

export type SerializeClassesFunction = (state: Set<string>) => string;

export type UpdateFunction = (oldState: Set<string>) => string | string[] | Set<string> | {[key: string]: boolean};
