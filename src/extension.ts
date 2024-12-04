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

const CACHE_FILE_PATH = path.join(__dirname, "gitignore_cache.json");

const convertToMilliseconds = (days: number): number => days * 24 * 60 * 60 * 1000;

const isCacheValid = (cacheTimestamp: number, refreshInterval: number): boolean =>
	Date.now() - cacheTimestamp < refreshInterval;

const fetchGitIgnoreList = async (refreshInterval: number): Promise<string[]> => {
	try {
		if (fs.existsSync(CACHE_FILE_PATH)) {
			const cache = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, "utf-8"));
			if (isCacheValid(cache.timestamp, refreshInterval)) {
				return cache.data;
			}
		}
	} catch (error) {
		console.error("Failed to read cache file", error);
	}

	const data = await fetchData<string>(`${giURL}list`);
	const formattedList = data.replace(/(\r\n|\n|\r)/gm, ",").split(",");

	try {
		fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify({ timestamp: Date.now(), data: formattedList }), "utf-8");
	} catch (error) {
		console.error("Failed to write cache file", error);
	}

	return formattedList;
};

const fetchGitIgnoreTemplate = async (template: string): Promise<string> => {
	const templateCachePath = path.join(__dirname, `${template}_cache.json`);

	try {
		if (fs.existsSync(templateCachePath)) {
			const cache = JSON.parse(fs.readFileSync(templateCachePath, "utf-8"));
			if (isCacheValid(cache.timestamp, convertToMilliseconds(7))) {
				// Assuming a 7-day cache validity for templates
				return cache.data;
			}
		}
	} catch (error) {
		console.error("Failed to read template cache file", error);
	}

	const templateContent = await fetchData<string>(`${giURL}${template}`);

	try {
		fs.writeFileSync(templateCachePath, JSON.stringify({ timestamp: Date.now(), data: templateContent }), "utf-8");
	} catch (error) {
		console.error("Failed to write template cache file", error);
	}

	return templateContent;
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

		const writeFileCallback = (err: NodeJS.ErrnoException | null, action: string) => {
			if (err) {
				console.error(`Failed to ${action} .gitignore`, err);
				showStatusMessage(`Failed to ${action} .gitignore`);
			} else {
				showStatusMessage(`${action.charAt(0).toUpperCase() + action.slice(1)} .gitignore successfully`);
			}
		};

		if (selection.label === "Append") {
			fs.appendFile(gitignorePath, content, (err) => writeFileCallback(err, "append to"));
		} else if (selection.label === "Overwrite") {
			fs.writeFile(gitignorePath, content, (err) => writeFileCallback(err, "overwrite"));
		}
	});
};

export const activate = (context: vscode.ExtensionContext) => {
	console.info('Extension "gi" is now active!');

	const disposable = vscode.commands.registerCommand("extension.gi", async () => {
		try {
			const timeReset: string = vscode.workspace.getConfiguration("gi").get("timeReset") || "7";
			const refreshInterval = convertToMilliseconds(parseInt(timeReset, 10));
			const templates = await fetchGitIgnoreList(refreshInterval);
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
