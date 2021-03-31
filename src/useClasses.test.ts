import { renderHook, act } from "@testing-library/react-hooks";
import { fromSchema, useClasses, serializeClasses } from "./useClasses";

const schema = {
    a: "default",
    b: "default",
    c: null,
    d: 1,
    e: 1,
    f: null
};

describe("with schema", () => {
    const useClasses = fromSchema(schema);

    test("default classes", () => {
        const { result } = renderHook(() => useClasses());

        expect(result.current.classes).toEqual(new Set(["a", "b"]));
    });

    test("update state directly", () => {
        const { result } = renderHook(() => useClasses());

        act(() => result.current.setClasses("c"));
        expect(result.current.classes).toEqual(new Set(["a", "b", "c"]));

        act(() => result.current.setClasses({a: false, b: false}));
        expect(result.current.classes).toEqual(new Set(["c"]));

        act(() => result.current.setClasses(new Set(["e"])));
        expect(result.current.classes).toEqual(new Set(["c", "e"]))

        act(() => result.current.setClasses(["b", "f"]));
        expect(result.current.classes).toEqual(new Set(["b", "c", "e", "f"]))
    });

    test("update state with update function", () => {
        const { result } = renderHook(() => useClasses());

        act(() => result.current.setClasses((s: Set<string>) => "c"));
        expect(result.current.classes).toEqual(new Set(["a", "b", "c"]));

        act(() => result.current.setClasses((s: Set<string>) => { return {a: false, b: false} }));
        expect(result.current.classes).toEqual(new Set(["c"]));

        act(() => result.current.setClasses((s: Set<string>) => new Set(["e"])));
        expect(result.current.classes).toEqual(new Set(["c", "e"]))

        act(() => result.current.setClasses((s: Set<string>) => ["b", "f"]));
        expect(result.current.classes).toEqual(new Set(["b", "c", "e", "f"]))
    });

    test("disable all classes at once", () => {
        const { result } = renderHook(() => useClasses());

        act(() => result.current.setClasses(null));
        expect(result.current.classes).toEqual(new Set());
    });

    test("mutually exclusive groups", () => {
        const { result } = renderHook(() => useClasses("d"));

        expect(result.current.classes).toEqual(new Set(["a", "b", "d"]));

        act(() => result.current.setClasses("e"));
        expect(result.current.classes).toEqual(new Set(["a", "b", "e"]));
        expect(result.current.classes).not.toContain("d");
    });

    test("classes in the null group are not mutually exclusive", () => {
        const { result } = renderHook(() => useClasses());

        act(() => result.current.setClasses("c"));
        expect(result.current.classes).toEqual(new Set(["a", "b", "c"]));

        act(() => result.current.setClasses("f"));
        expect(result.current.classes).toEqual(new Set(["a", "b", "c", "f"]));
    });

    test("setClasses accepts a function which takes the current state", () => {
        const { result } = renderHook(() => useClasses());

        let state;
        act(() => result.current.setClasses((s: Set<string>) => {
            state = s;
            return s;
        }));

        expect(state).toEqual(result.current.classes);
    });

    test("setClasses accepts a function which updates the state", () => {
        const { result } = renderHook(() => useClasses());

        act(() => result.current.setClasses(() => "c"));
        expect(result.current.classes).toEqual(new Set(["a", "b", "c"]));
    });

    test("forbid classes not specified in the schema to be set on init", () => {
        const { result } = renderHook(() => useClasses("z"));

        expect(result.error).toBeDefined();
    });

    test("forbid classes not specified in the schema to be set on update", () => {
        const { result } = renderHook(() => useClasses());

        act(() => result.current.setClasses("z"));
        expect(result.error).toBeDefined();
    });

    test("state serialization", () => {
        const { result } = renderHook(() => useClasses("c", "e"));
        expect(serializeClasses(result.current.classes).split(" ").sort()).toEqual(["a", "b", "c", "e"]);
    });
});

describe("without schema", () => {
    test("update state directly", () => {
        const { result } = renderHook(() => useClasses("a", "b"));

        act(() => result.current.setClasses("c"));
        expect(result.current.classes).toEqual(new Set(["a", "b", "c"]));

        act(() => result.current.setClasses({a: false, b: false}));
        expect(result.current.classes).toEqual(new Set(["c"]));

        act(() => result.current.setClasses(new Set(["e"])));
        expect(result.current.classes).toEqual(new Set(["c", "e"]))

        act(() => result.current.setClasses(["b", "f"]));
        expect(result.current.classes).toEqual(new Set(["b", "c", "e", "f"]))
    });

    test("update state with update function", () => {
        const { result } = renderHook(() => useClasses("a", "b"));

        act(() => result.current.setClasses((s: Set<string>) => "c"));
        expect(result.current.classes).toEqual(new Set(["a", "b", "c"]));

        act(() => result.current.setClasses((s: Set<string>) => { return {a: false, b: false} }));
        expect(result.current.classes).toEqual(new Set(["c"]));

        act(() => result.current.setClasses((s: Set<string>) => new Set(["e"])));
        expect(result.current.classes).toEqual(new Set(["c", "e"]))

        act(() => result.current.setClasses((s: Set<string>) => ["b", "f"]));
        expect(result.current.classes).toEqual(new Set(["b", "c", "e", "f"]))
    });

    test("disable all classes at once", () => {
        const { result } = renderHook(() => useClasses("a", "b"));

        act(() => result.current.setClasses(null));
        expect(result.current.classes).toEqual(new Set());
    });

    test("setClasses accepts a function which takes the current state", () => {
        const { result } = renderHook(() => useClasses("a", "b"));

        let state;
        act(() => result.current.setClasses((s: Set<string>) => {
            state = s;
            return s;
        }));

        expect(state).toEqual(result.current.classes);
    });

    test("setClasses accepts a function which updates the state", () => {
        const { result } = renderHook(() => useClasses("a", "b"));

        act(() => result.current.setClasses(() => "c"));
        expect(result.current.classes).toEqual(new Set(["a", "b", "c"]));
    });

    test("state serialization", () => {
        const { result } = renderHook(() => useClasses("a", "b"));

        expect(serializeClasses(result.current.classes).split(" ").sort()).toEqual(["a", "b"]);
    });
});
