import { renderHook, act } from "@testing-library/react-hooks";
import make from "./useClasses";

const spec = [
    {name: "a", group: "default"},
    {name: "b", group: "default"},
    {name: "c", group: null},
    {name: "d", group: 1},
    {name: "e", group: 1},
    {name: "f", group: null}
];

test("default classes", () => {
    const { useClasses, serializeClasses } = make(spec);
    const { result } = renderHook(() => useClasses());

    expect(result.current.classes).toEqual(new Set(["a", "b"]));
});

test("update state", () => {
    const { useClasses, serializeClasses } = make(spec);
    const { result } = renderHook(() => useClasses());

    act(() => result.current.setClasses("c"));
    expect(result.current.classes).toEqual(new Set(["a", "b", "c"]));

    act(() => result.current.setClasses({b: false}));
    expect(result.current.classes).toEqual(new Set(["a", "c"]));
});

test("mutually exclusive groups", () => {
    const { useClasses, serializeClasses } = make(spec);
    const { result } = renderHook(() => useClasses("d"));

    expect(result.current.classes).toEqual(new Set(["a", "b", "d"]));

    act(() => result.current.setClasses("e"));
    expect(result.current.classes).toEqual(new Set(["a", "b", "e"]));
    expect(result.current.classes).not.toContain("d");
});

test("classes in the null group are not mutually exclusive", () => {
    const { useClasses, serializeClasses } = make(spec);
    const { result } = renderHook(() => useClasses());

    act(() => result.current.setClasses("c"));
    expect(result.current.classes).toEqual(new Set(["a", "b", "c"]));

    act(() => result.current.setClasses("f"));
    expect(result.current.classes).toEqual(new Set(["a", "b", "c", "f"]));
});

test("setClasses accepts a function which takes the current state", () => {
    const { useClasses, serializeClasses } = make(spec);
    const { result } = renderHook(() => useClasses());

    let state;
    act(() => result.current.setClasses((s: Set<string>) => {
        state = s;
        return s;
    }));

    expect(state).toEqual(result.current.classes);
});

test("setClasses accepts a function which updates the state", () => {
    const { useClasses, serializeClasses } = make(spec);
    const { result } = renderHook(() => useClasses());

    act(() => result.current.setClasses(() => "c"));
    expect(result.current.classes).toEqual(new Set(["a", "b", "c"]));
});

test("forbid classes not specified in the spec to be set on init", () => {
    const { useClasses, serializeClasses } = make(spec);
    const { result } = renderHook(() => useClasses("z"));

    expect(result.error).toBeDefined();
});

test("forbid classes not specified in the spec to be set on update", () => {
    const { useClasses, serializeClasses } = make(spec);
    const { result } = renderHook(() => useClasses());

    act(() => result.current.setClasses("z"));
    expect(result.error).toBeDefined();
});

test("state serialization", () => {
    const { useClasses, serializeClasses } = make(spec);
    const { result } = renderHook(() => useClasses("c", "e"));

    expect(serializeClasses(result.current.classes)).toEqual("a b c e");
});
