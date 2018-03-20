import fs from "fs";
import child_process from "child_process";
import { promisify } from "util";
import { basename } from "path";

const execPromised = promisify(child_process.exec)

export const generateRandomInt = (start, end) =>
    typeof end === "undefined" ? Math.floor(Math.random() * start) : Math.floor(Math.random() * (end - start) + start);

export const generateRandomDate = (currentDate, start, end) =>
    new Date(generateRandomInt(new Date(currentDate).getTime() + start * 24 * 60 * 60 * 1000, new Date(currentDate).getTime() + end * 24 * 60 * 60 * 1000))

export const getFileLineCount = (path) => 
    execPromised(`wc -l ${path}`).then(({stdout, stderr}) => parseInt(stdout.replace(path,'').trim(), 10))

export const getLine = (path, lineNumber) => 
    execPromised(`sed -n '${lineNumber}p' < ${path}`).then(({stdout, stderr}) => parseInt(stdout.trim(), 10))