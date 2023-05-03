#!/usr/bin/env node
//https://dev.to/duwainevandriel/build-your-own-project-template-generator-59k4
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import { render } from "ejs";

export interface CliOptions {
  projectName: string;
  templateName: string;
  templatePath: string;
  tartgetPath: string;
}

const CURR_DIR = process.cwd();
const WORK_DIR = path.resolve(import.meta.url.split("file:///")[1], "../..");
const SKIP_FILES = ["node_modules", ".template.json"];
const CHOICES = fs.readdirSync(path.resolve(WORK_DIR, "templates"));
const QUESTIONS = [
  {
    name: "template",
    type: "list",
    message: "What project template would you like to use?",
    choices: CHOICES,
  },
  {
    name: "name",
    type: "input",
    message: "New project name?",
  },
];

function createDirectoryContents(templatePath: string, projectName: string) {
  const filesToCreate = fs.readdirSync(templatePath);
  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);
    const stats = fs.statSync(origFilePath);
    if (SKIP_FILES.indexOf(file) > -1) return;

    if (stats.isFile()) {
      let contents = fs.readFileSync(origFilePath, "utf8");
      const writePath = path.join(CURR_DIR, projectName, file);
      contents = render(contents, { projectName });
      fs.writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      fs.mkdirSync(path.join(CURR_DIR, projectName, file));
      createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
    }
  });
}

function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    process.stdout.write(chalk.red(`Folder ${projectPath} exists. Delete or use another name.`) + "\n");
    return false;
  }
  fs.mkdirSync(projectPath);

  return true;
}

inquirer.prompt(QUESTIONS).then((answers) => {
  const projectChoice = answers["template"];
  const projectName = answers["name"];
  const templatePath = path.resolve(WORK_DIR, "templates", projectChoice);
  const tartgetPath = path.join(CURR_DIR, projectName);

  if (!createProject(tartgetPath)) return;

  createDirectoryContents(templatePath, projectName);
});
