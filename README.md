# @bentley/react-hooks

[![Build Status](https://dev.azure.com/bentleycs/iModelTechnologies/_apis/build/status/imodeljs.react-hooks)](https://dev.azure.com/bentleycs/iModelTechnologies/_build/latest?definitionId=4718)

Generic React hooks for daily development.

## Hooks

- **useAsyncEffect**: like `useEffect` but you can pass an async function and check if the component restarted the effect during your async operation.
  see [this article](https://blogs.bentley.com/2021/01/21/even-more-hooks-bentley-react-hooks-and-useasynceffect-for-animated-markers/)
- **useOnChange**: run an effect on a state change, but wait for some validity condition, any time you need to store a ref to previous state, consider this
  ```tsx
  const [activeType, setActiveType] = useState<string>();
  useOnChange(({prev}) => {
    const [prevType] = prev;
    uiToastNotifyUser(`active type changed from ${prevType} to ${activeType}`);
  }, [activeType]);
  ```
  or wait for some third party non-react state, the effect reruns *every render* if the validity condition was not met, it only stops running once it's met and none
  of the listened states have changed.
  ```tsx
  const viewport = thirdpartyLibrary.tryGetViewport();
  const [userDefinedColor] = useState("red");
  useOnChange(() => {
    // we know viewport is defined because of the condition
    viewport!.setBackgroundColor(userDefinedColor);
  }, viewport !== undefined, [userDefinedColor]);
  ```
- **useInterval**: the classic, run an effect every `n` milliseconds
- **useAsyncInterval**: `useInterval` but with the same API for async effects as `useAsyncEffect`
- **usePropertySetter**: for when you have an object in state but want a setter of its subproperty. Supports thunks (`prev=>next` callbacks)
    e.g.:
    ```tsx
    const [myobj, setMyobj] = useState({time: 5, area: "world"});
    const setArea = usePropertySetter("area", setMyobj);
    useEffect(() => {
      setArea(prevArea => prevArea === "world" ? "hello" : "world");
    }, []);
    return <MySubcomponent setArea={setArea} />;
    ```
- **useValidatedInput**: useState for strings that are parsed into some other type (i.e. parsing a number input).
  By default parses numeric input, but you can supply your own parse function, meaning you could handle search languages, SI units, lists, anything.
  Returns an optional parse failure reason.
  ```tsx
  const [value, input, setInput] = useValidatedInput("5", {
    // don't change the numeric parsing but validate that it's a positive number
    validate: (n: number) => {
      const valid = /\d+/.test(n);
      return { valid, status: !valid ? "only positive integers" : undefined };
    })
  });
  return <input value={input} onChange={e => setInput(e.currentTarget.value)} />;
  ```
- **useMediaQuery**: react to a media query (e.g. screen size > 400px?)
- **useScrolling**: react if your component is currently being scrolled through
- **useHelp**: manage a contextual help link based on what components are currently rendering.
  Internally this has been used to link to articles in a Bentley Communities page, based on which pages and menus (their components) are open (mounted).
- **useInlineComponent**: for tiny components
- **useOnMount**: for directly saying you're doing something is first added to the dom
- **useOnUnmount**: for directly saying you're doing something when the component is removed from the dom
- **useOnExternalClick**: A callback to fire on external clicks. Great for closing popups
  ```tsx
  const [isOpen, setIsOpen] = useState(true);
  const popupElemRef = useRef<HTMLDivElement>(null);
  useOnExternalClick(popupElemRef, () => setIsOpen(false)) // close popup if user clicks outside of it
  return (
    <div>
      <Toolbar />
      {isOpen && <div ref={popupElemRef}><UserPopup /></div>}
    </div>
  );
  ```

## Tips

To get `eslint-plugin-react-hooks` to warn on bad dependencies for hooks like
`useAsyncEffect`, see the eslint rule's [advanced configuration docs](https://www.npmjs.com/package/eslint-plugin-react-hooks#advanced-configuration).
Older versions of `eslint-plugin-react-hooks` may warn on passing an async argument, we have a PR in react's monorepo to fix that eslint rule, and we can maintain a trivial fork if this is a common issue, because not warning on missed effects almost always leads to bug.

## `useAsyncEffect`

Handle all the quirks of having async code in effects.
No wrapping async functions, no quirky promise handling, prevent async state
race conditions (cancel old async effects implicitly),
prevent "tried to update state on an unmounted component" error.

```tsx
function MyComponent() {
  useAsyncEffect(
    async ({isStale, setCancel}) => {
      const fetchPromise = myFetch(`http://example.com/users/${userId}`);
      // using setCancel, unfinished effect runs are cancelled by new runs
      // this allows you to cancel requests you no longer need
      setCancel(() => {
        console.log("dependencies (userId) changed, cancelling old request!")
        // your async API must have some kind of cancellation
        // for example, the axios ajax wrapper has one we have an example of
        fetchPromise.cancel();
      })
      const data = await fetchPromise;
      if (!isStale())
        setState(data);
    },
    [userId]
  ).catch(err => {
    console.log("an error occurred!");
    console.error(err);
  });
}
```

## `useOnChange`

Run effects on changing state, and you can also provide validity conditions.
Great when you have dependencies that need to be up to date but you only run
the effect on one of them changing. Normally this is done with extra refs and gets
really bad with multiple refs to check.

```tsx
function MyComponent() {
  // suppose we're loading some intensive third party viewer
  const {
    viewerLoaded,
    viewOrigin,
    viewerElement
  } = useContext(MyAppContext);

  useOnChange(
    () => {
      viewerElement.setUserData(userId);
    },
    intensiveViewerLoaded && viewerElement !== undefined,
    [userId]
  );
}
```

Or just use it to track previous state.

```tsx
function MyComponent() {
  useOnChange(({prev}) => {
    const [prevA, _prevB] = prev;
    if (prevA === a) {
      console.log("`a` didn't change so `b` must have!")
    }
  }, [a, b]);
}
```
