# @bentley/react-hooks

[![Build Status](https://dev.azure.com/bentleycs/iModelTechnologies/_apis/build/status/imodeljs.react-hooks?branchName=release%2Ftest-bad-tests)](https://dev.azure.com/bentleycs/iModelTechnologies/_build/latest?definitionId=4718&branchName=release%2Ftest-bad-tests)

Generic React hooks for daily development.

## Hooks

- **useAsyncEffect**: like `useEffect` but you can pass an async function and check if the effect component restarted the effect while you were doing an async operation
- **useOnChange**: run an effect on a state change, but wait for some validity condition
- **useInterval**: the classic, run an effect every `n` milliseconds
- **useAsyncInterval**: `useInterval` but with the same API for async effects as `useAsyncEffect`
- **usePropertySetter**: for when you have an object in state but want a setter of its subproperty. Supports thunks (`prev=>next` callbacks) and regular state

use only if you know what you're doing:
- **useInlineComponent**
- **useOnMount**
- **useOnUnmount**

## Tips

To get `eslint-plugin-react-hooks` to warn on bad dependencies for hooks like
`useAsyncEffect`, see the eslint rule's [advanced configuration docs](https://www.npmjs.com/package/eslint-plugin-react-hooks#advanced-configuration).
Older versions of `eslint-plugin-react-hooks` may not understand the parameter layout
of some custom dependency-requiring hooks, but it should work for `useAsyncEffect` and
prevent bugs.

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