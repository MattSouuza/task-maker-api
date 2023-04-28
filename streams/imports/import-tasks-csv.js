import { parse } from 'csv-parse';
import fs from 'node:fs';

const filePath = new URL("./tasks.csv", import.meta.url);
const fileStream = fs.createReadStream(filePath);

const parser = parse({
    delimiter: ",",
    skipEmptyLines: true,
    fromLine: 2
});

async function importTasks() {
    const fileContent = fileStream.pipe(parser);

    for await (const content of fileContent) {
        const [title, description] = content;

        await fetch("http://localhost:4000/task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                description: description
            })
        })
        .then(response => {
            console.log("Tasks created!", response.status);
        })
        .catch(error => {
            console.log(error);
        })
    }
}

importTasks();