// Copyright (c) Bentley Systems, Incorporated. All rights reserved.

/**
 * useHelp, a hook managing help links contextually
 * each useHelp additional hook in mount order will specify a deeper
 * help section, so that as users navigate nested user interfaces,
 * the help link is always contextually appropriate. Unmounting a component
 * will of course go back to the previous level's help topic.
 */

import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";

type HelpSpec = string | (() => string);

interface IHelpState {
  baseUrl: string;
  pushHelp: (help: HelpSpec) => void;
  popHelp: () => void;
  showHelp: () => void;
  replaceHelp: (newSpec: HelpSpec) => void;
}

/**
 * Properties to configure the HelpContextProvider
 */
interface IHelpProps {
  baseUrl: string;
  fallbackTopic: string;
  requestHelp: (baseUrl: string, helpTopic: string) => void;
  children: any;
}

/* eslint-disable @typescript-eslint/no-empty-function */
const defaultHelpState: IHelpState = {
  baseUrl: "",
  pushHelp: () => {},
  popHelp: () => {},
  showHelp: () => {},
  replaceHelp: () => false,
};
/* eslint-enable @typescript-eslint/no-empty-function */

export const HelpContext = createContext(defaultHelpState);

/**
 * HelpContextProvider that intercepts F1 key down to request help.
 * It works in combination with the useHelp hook to assign a help topic per page
 * @param baseUrl     Url or other identifier passed as first argument to help request
 * @param requestHelp Function executing the help request
 */
export function HelpContextProvider({
  baseUrl,
  fallbackTopic,
  requestHelp,
  children,
}: IHelpProps): JSX.Element {
  const helpSpecStack = useRef<HelpSpec[]>([fallbackTopic]);

  const showHelp = useCallback(() => {
    const helpSpec = helpSpecStack.current[helpSpecStack.current.length - 1];
    const topic = typeof helpSpec === "function" ? helpSpec() : helpSpec;
    requestHelp(baseUrl, topic);
  }, [baseUrl, requestHelp]);

  const [helpState] = useState<IHelpState>({
    ...defaultHelpState,
    baseUrl,
    pushHelp,
    popHelp,
    showHelp,
    replaceHelp,
  });

  function pushHelp(helpSpec: HelpSpec) {
    helpSpecStack.current.push(helpSpec);
  }

  function popHelp() {
    helpSpecStack.current.pop();
    if (helpSpecStack.current.length === 0) {
      console.warn("HelpTopic Stack not expected to be empty");
      helpSpecStack.current.push(fallbackTopic);
    }
  }

  function replaceHelp(newSpec: HelpSpec) {
    helpSpecStack.current[helpSpecStack.current.length - 1] = newSpec;
  }

  useEffect(() => {
    const handleHelpKey = (event: KeyboardEvent) => {
      if (event.isComposing || event.keyCode === 229) {
        return;
      }
      if (event.key === "F1") {
        event.preventDefault();
        showHelp();
      }
    };
    document.addEventListener("keydown", handleHelpKey);
    return () => document.removeEventListener("keydown", handleHelpKey);
  }, [showHelp]);

  return (
    <HelpContext.Provider value={helpState}>{children}</HelpContext.Provider>
  );
}

/**
 * Hook to specify the help topic when the component is loaded.
 * The hook is intended for top-level components only to specify the help topic
 * to display upon help request. The hook requires the HelpContextProvider to be present
 * higher in the component tree.
 */
export function useHelp(topicUrl: string): (s: HelpSpec) => void {
  const { pushHelp, popHelp, replaceHelp } = useContext(HelpContext);

  useEffect(() => {
    pushHelp(topicUrl);
    // restore previous helpUrl when unmounting
    return () => popHelp();
  }, [popHelp, pushHelp, topicUrl]);

  return replaceHelp;
}

/**
 * Open a new browser tab with the specified URL
 * @param url  The url to display in the new browser tab
 */
export function openUrlInNewTab(url: string): void {
  // https://stackoverflow.com/questions/49276569/window-open-with-noopener-opens-a-new-window-instead-of-a-new-tab
  const wnd = window.open(url, "_blank");
  if (wnd !== null) {
    wnd.opener = null;
  }
}
