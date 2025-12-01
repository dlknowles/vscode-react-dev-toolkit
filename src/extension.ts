import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  const createComponentDisposable = vscode.commands.registerCommand(
    "reactDevToolkit.createComponent",
    async () => {
      const editor = getEditor();
      if (!editor) return;

      const workspaceFolder = getWorkspaceFolder(editor);
      if (!workspaceFolder) return;

      const componentName = await vscode.window.showInputBox({
        prompt: "Component name",
        placeHolder: "MyComponent",
        validateInput: (value) => {
          const trimmed = value.trim();
          if (!trimmed) return "Component name cannot be empty.";
          if (!/^[A-Z][A-Za-z0-9]*$/.test(trimmed)) {
            return "Use PascalCase, e.g. MyComponent";
          }
          return null;
        }
      });

      if (!componentName) return; // cancelled

      const trimmedName = componentName.trim();
      const fileName = `${trimmedName}.tsx`;
      const template = getReactComponentTemplate(trimmedName);

      await createReactFile({
        workspaceFolder,
        dirSettingKey: "componentsDir",
        defaultDir: "src/components",
        fileName,
        template,
        entityType: "Component"
      });
    }
  );

  const createHookDisposable = vscode.commands.registerCommand(
    "reactDevToolkit.createHook",
    async () => {
      const editor = getEditor();
      if (!editor) return;

      const workspaceFolder = getWorkspaceFolder(editor);
      if (!workspaceFolder) return;

      const hookName = await vscode.window.showInputBox({
        prompt: "Hook name (must start with use)",
        placeHolder: "useThing",
        validateInput: (value) => {
          const trimmed = value.trim();
          if (!trimmed) return "Hook name cannot be empty.";
          if (!/^use[A-Z][A-Za-z0-9]*$/.test(trimmed)) {
            return "Hook name should look like useThing, useUserData, etc.";
          }
          return null;
        }
      });

      if (!hookName) return; // cancelled

      const trimmedName = hookName.trim();
      const fileName = `${trimmedName}.ts`;
      const template = getReactHookTemplate(trimmedName);

      await createReactFile({
        workspaceFolder,
        dirSettingKey: "hooksDir",
        defaultDir: "src/hooks",
        fileName,
        template,
        entityType: "Hook"
      });
    }
  );

  const createContextDisposable = vscode.commands.registerCommand(
    "reactDevToolkit.createContext",
    async () => {
      const editor = getEditor();
      if (!editor) return;

      const workspaceFolder = getWorkspaceFolder(editor);
      if (!workspaceFolder) return;

      const contextBaseName = await vscode.window.showInputBox({
        prompt: "Context name (base, e.g. User, Theme)",
        placeHolder: "User",
        validateInput: (value) => {
          const trimmed = value.trim();
          if (!trimmed) return "Context name cannot be empty.";
          if (!/^[A-Z][A-Za-z0-9]*$/.test(trimmed)) {
            return "Use PascalCase, e.g. User, Theme, Auth";
          }
          return null;
        }
      });

      if (!contextBaseName) return; // cancelled

      const trimmedBase = contextBaseName.trim();
      const fileName = `${trimmedBase}Context.tsx`;
      const template = getReactContextTemplate(trimmedBase);

      await createReactFile({
        workspaceFolder,
        dirSettingKey: "contextDir",
        defaultDir: "src/context",
        fileName,
        template,
        entityType: "Context"
      });
    }
  );

  context.subscriptions.push(createComponentDisposable);
  context.subscriptions.push(createHookDisposable);
  context.subscriptions.push(createContextDisposable);
}

export function deactivate() {
  // nothing to clean up
}

function getEditor(): vscode.TextEditor | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return null;
  }
  return editor;
}

function getWorkspaceFolder(editor: vscode.TextEditor): vscode.WorkspaceFolder | null {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
  if (!workspaceFolder) {
    vscode.window.showErrorMessage(
      "No workspace folder found. Open a folder or workspace first."
    );
    return null;
  }
  return workspaceFolder;
}

type CreateReactFileOptions = {
  workspaceFolder: vscode.WorkspaceFolder;
  dirSettingKey: "componentsDir" | "hooksDir" | "contextDir";
  defaultDir: string;
  fileName: string;
  template: string;
  entityType: "Component" | "Hook" | "Context";
};

async function createReactFile(options: CreateReactFileOptions): Promise<void> {
  const { workspaceFolder, dirSettingKey, defaultDir, fileName, template, entityType } = options;
  const config = vscode.workspace.getConfiguration("reactDevToolkit");
  const dirSetting = config.get<string>(dirSettingKey) || defaultDir;
  const targetDir = path.join(workspaceFolder.uri.fsPath, dirSetting);
  const filePath = path.join(targetDir, fileName);
  const fileUri = vscode.Uri.file(filePath);

  try {
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(targetDir));

    const exists = await vscode.workspace.fs.stat(fileUri).then(
      () => true,
      () => false
    );

    if (exists) {
      vscode.window.showErrorMessage(`${entityType} file ${fileName} already exists in ${dirSetting}.`);
      return;
    }

    const enc = new TextEncoder();
    await vscode.workspace.fs.writeFile(fileUri, enc.encode(template));

    const doc = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(doc);

    vscode.window.showInformationMessage(`Created ${entityType.toLowerCase()} ${fileName} in ${dirSetting}.`);
  } catch (err: any) {
    console.error(err);
    vscode.window.showErrorMessage(`Failed to create ${entityType.toLowerCase()} file. See console for details.`);
  }
}

function getReactComponentTemplate(name: string): string {
  return `import React from "react";

export type ${name}Props = {
  // props here
};

export function ${name}(props: ${name}Props) {
  return (
    <div className="flex items-center justify-center">
      <p>${name} component</p>
    </div>
  );
}
`;
}

function getReactHookTemplate(name: string): string {
  return `import { useState, useEffect } from "react";

export function ${name}() {
  const [state, setState] = useState<unknown>(null);

  useEffect(() => {
    // side effects here
  }, []);

  return { state, setState };
}
`;
}

function getReactContextTemplate(baseName: string): string {
  const contextName = `${baseName}Context`;
  const providerName = `${baseName}Provider`;
  const hookName = `use${baseName}`;
  const valueType = `${baseName}ContextValue`;

  return `import React, { createContext, useContext, useState } from "react";

export type ${valueType} = {
  // define shared state here
};

const ${contextName} = createContext<${valueType} | undefined>(undefined);

export function ${providerName}({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<unknown>(null);

  const contextValue: ${valueType} = {
    // implement context value based on state
  };

  return (
    <${contextName}.Provider value={contextValue}>
      {children}
    </${contextName}.Provider>
  );
}

export function ${hookName}() {
  const ctx = useContext(${contextName});
  if (!ctx) {
    throw new Error("${hookName} must be used inside ${providerName}");
  }
  return ctx;
}
`;
}
