# React Dev Toolkit

React Dev Toolkit is a VS Code extension that generates common React files and patterns with simple commands. It speeds up development by creating components, hooks, and context providers (with associated access hooks) using configurable directory structures.

---

## Features

- Create a new React component file in a configurable directory.
- Create a new React hook file in a configurable directory.
- Create a new React context provider file that includes:
  - A Context object
  - A Provider component
  - A custom hook for accessing the context
- Automatically creates missing directories.
- Warns if files already exist.
- All directory paths are configurable.

---

## Commands

### React Dev Toolkit: Create Component
Generates a new React component file named `ComponentName.tsx`.

The component includes:
- A typed props object
- A functional component
- A Tailwind-ready wrapper

The file is created in the directory set by `reactDevToolkit.componentsDir`.

---

### React Dev Toolkit: Create Hook
Generates a new React hook file named `useSomething.ts`.

The hook includes:
- A useState value
- A sample useEffect block
- A typed return structure

The file is created in the directory set by `reactDevToolkit.hooksDir`.

---

### React Dev Toolkit: Create Context
Generates a new React Context file named `NameContext.tsx`.

The file includes:
- A Context object
- A Provider component
- A custom hook `useName` that wraps `useContext` and adds safety checks

The file is created in the directory set by `reactDevToolkit.contextDir`.

---

## Configuration

You can configure where files are created by modifying VS Code settings.

Example configuration:

```json
{
  "reactDevToolkit.componentsDir": "src/components",
  "reactDevToolkit.hooksDir": "src/hooks",
  "reactDevToolkit.contextDir": "src/context"
}
````

Each directory is relative to the workspace root.

---

## Usage

1. Open a workspace folder in VS Code.
2. Open the Command Palette:

   * Ctrl + Shift + P (Windows/Linux)
   * Cmd + Shift + P (Mac)
3. Run one of the following commands:

   * React Dev Toolkit: Create Component
   * React Dev Toolkit: Create Hook
   * React Dev Toolkit: Create Context
4. Enter the requested name when prompted.
5. The toolkit generates the file, opens it in an editor, and confirms success.

---

## Generated File Examples

### Component

```tsx
import React from "react";

export type MyComponentProps = {
  // props here
};

export function MyComponent(props: MyComponentProps) {
  return (
    <div className="flex items-center justify-center">
      <p>MyComponent component</p>
    </div>
  );
}
```

---

### Hook

```ts
import { useState, useEffect } from "react";

export function useThing() {
  const [state, setState] = useState<unknown>(null);

  useEffect(() => {
    // side effects here
  }, []);

  return { state, setState };
}
```

---

### Context

```tsx
import React, { createContext, useContext, useState } from "react";

export type UserContextValue = {
  // define shared state here
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<unknown>(null);

  const contextValue: UserContextValue = {
    // implement context value
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return ctx;
}
```


---

## License

MIT License