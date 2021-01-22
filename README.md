# @bentley/react-hooks

[![Build Status](https://dev.azure.com/bentleycs/iModelTechnologies/_apis/build/status/imodeljs.react-hooks)](https://dev.azure.com/bentleycs/iModelTechnologies/_build/latest?definitionId=4718)

Generic React hooks for daily development.

## Hooks

- **useAsyncEffect**: like `useEffect` but you can pass an async function and check if the component restarted the effect during your async operation.

  ```tsx
  useAsyncEffect(
    async ({isStale, setCancel}) => {

      const fetchPromise = fetch(`http://example.com/users/${userId}`);
      // using setCancel, unfinished effect runs are cancelled by new runs
      // this allows you to cancel requests you no longer need
      setCancel(() => {
        console.log("dependencies (userId) changed, cancelling old request!")
        // your async API must have some kind of cancellation
        // for example, the fetch API can use an AbortController
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
  ```
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
