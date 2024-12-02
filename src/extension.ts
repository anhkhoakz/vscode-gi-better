import vscode from "vscode";
import fs from "fs";
import path from "path";
import axios from "axios";

const giURL = "https://www.gitignore.io/api/";

const fetchData = async <T>(url: string): Promise<T> => {
	try {
		const response = await axios.get<T>(url);
		return response.data;
	} catch (error) {
		console.error(`Failed to fetch data from ${url}`, error);
		showStatusMessage(`Failed to fetch data from ${url}`);
		throw error;
	}
};

const fetchGitIgnoreList = async (): Promise<string[]> => {
	const data = await fetchData<string>(`${giURL}list`);
	const formattedList = data.replace(/(\r\n|\n|\r)/gm, ",");
	return formattedList.split(",");
};

const fetchGitIgnoreTemplate = async (template: string): Promise<string> => {
	return await fetchData<string>(`${giURL}${template}`);
};

const showStatusMessage = (message: string): void => {
	vscode.window.setStatusBarMessage(message, 3000);
};

const makeFile = (content: string): void => {
	const choices: vscode.QuickPickItem[] = [
		{ label: "Append", description: "Append to current .gitignore" },
		{ label: "Overwrite", description: "Overwrite current .gitignore" },
	];

	vscode.window.showQuickPick(choices).then((selection) => {
		if (!selection) {
			showStatusMessage("No action selected");
			return;
		}

		const workspaceFolders = vscode.workspace.workspaceFolders;

		if (!workspaceFolders || workspaceFolders.length === 0) {
			showStatusMessage("No workspace folder found");
			return;
		}

		const workspaceFolder = workspaceFolders[0].uri.fsPath;
		const gitignorePath = path.join(workspaceFolder, ".gitignore");

		if (selection.label === "Append") {
			fs.appendFile(gitignorePath, content, (err) => {
				if (err) {
					console.error("Failed to append to .gitignore", err);
					showStatusMessage("Failed to append to .gitignore");
				} else {
					showStatusMessage("Appended to .gitignore successfully");
				}
			});
		} else if (selection.label === "Overwrite") {
			fs.writeFile(gitignorePath, content, (err) => {
				if (err) {
					console.error("Failed to overwrite .gitignore", err);
					showStatusMessage("Failed to overwrite .gitignore");
				} else {
					showStatusMessage("Overwritten .gitignore successfully");
				}
			});
		}
	});
};

export const activate = (context: vscode.ExtensionContext) => {
	console.info('Extension "gi" is now active!');

	const disposable = vscode.commands.registerCommand("extension.gi", async () => {
		try {
			const templates = await fetchGitIgnoreList();
			const options: vscode.QuickPickOptions = {
				ignoreFocusOut: false,
				placeHolder: "Search Operating Systems, IDEs, or Programming Languages",
			};

			const selectedTemplate = await vscode.window.showQuickPick(templates, options);
			if (!selectedTemplate) {
				showStatusMessage("Action canceled");
				return;
			}

			const templateContent = await fetchGitIgnoreTemplate(selectedTemplate);
			makeFile(templateContent);
		} catch (error) {
			console.error("Error occurred in the extension:", error);
			showStatusMessage("An error occurred while executing the extension");
		}
	});

	context.subscriptions.push(disposable);
};

export const deactivate = () => {
	console.info('Extension "gi" is now deactivated!');
	showStatusMessage('Extension "gi" is now deactivated!');
};
