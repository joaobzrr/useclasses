export type Schema = {[key: string]: GroupSpecifier};

export type GroupSpecifier = number | string | null;

export type UseClassesReturnType = [Set<string>, SetClassesFunction];

export type UseClassesFunction = (...initialState: string[]) => [Set<string>, SetClassesFunction];

export type SetClassesFunctionArgument = string | string[] | Set<string> | {[key: string]: boolean};

export type SetClassesFunction = (...args: SetClassesFunctionArgument[]) => void;

export type SerializeClassesFunction = (state: Set<string>) => string;

export type UpdateFunction = (oldState: Set<string>) => SetClassesFunctionArgument;
