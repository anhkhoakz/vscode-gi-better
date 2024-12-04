# vscode-gi-better

![logo](assets/icon.png)

This is the "vscode-gi-better" extension's README. It offers a simple method for managing and integrating `.gitignore` files for various operating systems, IDEs, and programming languages right within Visual Studio Code.

This plugin helps developers expedite their workflow by providing a straightforward interface for quickly fetching and applying `.gitignore` templates.

## Features

-   **Fetch Gitignore Templates**: Utilize [gitignore.io](https://www.gitignore.io) to retrieve a list of available `.gitignore` templates.
-   A searchable list of operating systems, integrated development environments, and programming languages is displayed via the **Quick Pick Interface**.
-   **Append or Overwrite**: Select if you want to add the chosen template to your existing `.gitignore` file or replace it.
-   **Status Bar Feedback**: Notifies users of actions or errors by providing feedback via the status bar of Visual Studio Code.

> Tip: Developers who frequently start new projects and need to rapidly configure `.gitignore` files will find this extension extremely helpful.

## Requirements

The following dependencies are needed for this extension:

-   **Node.js**: To use the addon, make sure Node.js is installed.
-   **VS Code API**: The extensibility API of Visual Studio Code, which is supplied by Visual Studio Code itself, is the foundation for this extension.

To retrieve the `.gitignore` templates from `gitignore.io`, an active internet connection is necessary because the extension leverages **axios** for HTTP queries.

## Usage

1. **Open a Workspace Folder**: Before using the extension, ensure that a workspace folder is open in Visual Studio Code.
2. **Access the Command Palette**: Press `Ctrl+Shift+P`(Windows) or `Ctrl+Shift+P`(MacOS, Linux) to open the command palette.
3. **Execute the Command**: Type `gi: Generate .gitignore` in the command palette and press `Enter`. 3. **Select a Template**: A list of `.gitignore` templates will be displayed in the Quick Pick Interface. Use the search bar to filter the list.
4. **Choose an Action**: Select whether you want to append the template to your existing `.gitignore` file or overwrite it.

## Known Issues

-   **No Workspace Folder**: The extension cannot write to the `.gitignore` file if it is executed without a workspace folder open. Before utilizing the addon, make sure a workspace folder is open.
-   **API Downtime**: The extension will not be able to retrieve the list of accessible templates if the `gitignore.io` API is unavailable.

## Release Notes

### 1.0.0

Initial release of vscode-gi-better.

## 1.1.0

Save cache of recently fetched templates for offline use and faster access.
