import fs from 'node:fs/promises';
import { TaskNotFound } from '../utils/error-models/task-not-found.js';

const databasePath = new URL("db.json", import.meta.url);

export default class Context {
    #database = [];

    constructor() {
        fs.readFile(databasePath, "utf8")
            .then(data => {
                this.#database = JSON.parse(data);
            })
            .catch(() => {
                this.#persist();
            })
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    select(search) {
        let tasks = this.#database;

        if (!tasks) {
            return [];
        }

        if (search) {
            tasks = tasks.filter(task => {
                return Object.entries(search).some(([key, value]) => task[key].toLowerCase().includes(value.toLowerCase()))
            })
        }

        return tasks;
    }

    insert(newTask) {

        if (!newTask.title || !newTask.description) {
            throw new Error("The title and/or description must be provided in order to create a task!");
        }

        this.#database.push(newTask);
        this.#persist();

        return newTask;
    }

    update(id, { title, description }) {
        const { searched_task: searchedTask, task_index: taskIndex } = this.searchById(id);

        if (!title && !description) {
            throw new Error("The title and description must be provided in order to update the task!");
        }

        const newTask = {
            title: title ?? searchedTask.title,
            description: description ?? searchedTask.description,
            completed_at: searchedTask.completed_at,
            created_at: searchedTask.created_at,
            updated_at: new Date()
        }

        this.#database[taskIndex] = { id, ...newTask };
        this.#persist();

        return this.#database[taskIndex];
    }

    delete(id) {
        const { task_index: taskIndex } = this.searchById(id);

        this.#database.splice(taskIndex, 1);
        this.#persist();
    }

    completeTask(id) {
        const { task_index: taskIndex } = this.searchById(id);

        this.#database[taskIndex].completed_at = new Date();
        this.#persist();
    }

    searchById(id) {
        const taskIndex = this.#database.findIndex(row => row.id === id);

        if (taskIndex === -1) {
            throw new TaskNotFound(`The task with the ID provided wasn't found!`);
        }

        return { searched_task: this.#database[taskIndex], task_index: taskIndex };
    }
}