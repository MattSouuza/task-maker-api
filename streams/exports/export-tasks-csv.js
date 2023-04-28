import { stringify } from 'csv-stringify';
import fs from 'node:fs';

const exportFilePath = new URL("./tasks.csv", import.meta.url);

const writableStream = fs.createWriteStream(exportFilePath);

const columns = ["title", "description", "completed_at", "created_at"];

exportTasks()

async function exportTasks() {

    const tasks = await getTasks();

    const stringifier = stringify({header: true, columns: columns});

    for (const task of tasks) {
        stringifier.write(task);
    }

    stringifier.pipe(writableStream);

    console.log("Tasks exported!");
}

async function getTasks() {
    return await fetch("http://localhost:4000/task", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("Tasks listed!", data.response);

            return data.response;
        })
        .catch(error => {
            console.log(error);

            process.exitCode = 1;
        })
}