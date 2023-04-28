import { randomUUID } from "node:crypto";
import routePathBuilder from "./utils/route-path-builder.js";
import Context from "./db/context.js";
import { TaskNotFound } from "./utils/error-models/task-not-found.js";

const context = new Context();

export const routes = [
    {
        method: "GET",
        path: routePathBuilder("/task"),
        handler: (req, res) => {
            const { search } = req.query;

            try {
                return res.end(JSON.stringify({ response: context.select(search ? { title: search } : null) }))
            } catch (error) {
                return res.writeHead(400).end(JSON.stringify({ message: `A error has occoured while trying to list all tasks: ${error}` }))
            }
        }
    },
    {
        method: "POST",
        path: routePathBuilder("/task"),
        handler: (req, res) => {
            const { title, description } = req.body;

            let newTask = {};

            try {
                newTask = context.insert({
                    id: randomUUID(),
                    title,
                    description,
                    completed_at: null,
                    created_at: new Date(),
                    updated_at: null,
                });
            } catch (error) {
                console.log("A error has occoured while trying to create a task!", error);

                return res.writeHead(400).end(JSON.stringify({ message: `A error has occoured while trying to create a task: ${error}` }));
            }

            return res.writeHead(200).end(JSON.stringify({message: "Task created!", response: newTask}));
        }
    },
    {
        method: "PUT",
        path: routePathBuilder("/task/:id"),
        handler: (req, res) => {
            const { id } = req.params;
            const { title, description } = req.body;

            let updatedTask = {};

            try {
                updatedTask = context.update(id, {
                    title,
                    description
                })
            } catch (error) {
                if (error instanceof TaskNotFound) {
                    return res.writeHead(404).end(JSON.stringify({ message: error.message }));
                }

                return res.writeHead(400).end(JSON.stringify({ message: `The following error occoured while trying to update this task: ${error}` }));
            }

            return res.end(JSON.stringify({ message: "Task updated!", response: updatedTask }));
        }
    },
    {
        method: "DELETE",
        path: routePathBuilder("/task/:id"),
        handler: (req, res) => {
            const { id } = req.params;

            try {
                context.delete(id)
            } catch (error) {
                if (error instanceof TaskNotFound) {
                    return res.writeHead(404).end(JSON.stringify({ message: error.message }));
                }

                return res.writeHead(400).end(JSON.stringify({ message: `The following error occoured while trying to delete this task: ${error}` }));
            }

            return res.writeHead(200).end({ message: `Task deleted!`});
        }
    },
    {
        method: "PATCH",
        path: routePathBuilder("/task/:id/complete"),
        handler: (req, res) => {
            const { id } = req.params;

            try {
                context.completeTask(id);
            } catch (error) {
                if (error instanceof TaskNotFound) {
                    return res.writeHead(404).end(JSON.stringify({ message: error.message }));
                }

                return res.writeHead(400).end(JSON.stringify({ message: `The following error occoured while trying to complete this task: ${error}` }));
            }

            return res.writeHead(200).end(JSON.stringify({message: "Task completed!"}));
        }
    },
    {
        method: "GET",
        path: routePathBuilder("/task/:id"),
        handler: (req, res) => {
            const { id } = req.params;

            try {
                return res.end(JSON.stringify({ response: context.searchById(id) }));
            } catch (error) {
                if (error instanceof TaskNotFound) {
                    return res.writeHead(404).end(JSON.stringify({ message: error.message }));
                }

                return res.writeHead(400).end(JSON.stringify({ message: `The following error occoured while trying to list this task: ${error}` }));
            }
        }
    }
]