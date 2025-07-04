import dbClient from '../utils/db.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { hashPassword, checkPassword } from '../utils/password.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { serialize } from 'cookie';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let db;

class Controller {

  // Registration processor
  static async postRegister(req, res) {
    let { username, password } = req.body;
    let db;
    if (typeof username !== 'string' || username.trim() === '' || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({"message": "Invalid username"});
    }

    username = username.trim();
    password = password.trim();

    if (username.length > 64) {
      return res.status(400).json({"message": "Length of username must be <= 64"});
    }

    if (password.length > 64) {
      return res.status(400).json({"message": "Length of password must be <= 64"});
    }

    try {
      if (!dbClient.db) {
        await dbClient.connect();
      }
      db = await dbClient.getDb();
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({"message": "Internal server error"});
    }

    try {
      const user = await db.collection('users').findOne({username});
      if (user) {
        return res.status(409).json({"message": "Username already exist"});
      }
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({"message": "Internal server error"});
    }

    try {
      const hashedPassword = await hashPassword(password);
      const newUser = {"username": username, "password": hashedPassword, "created_at": new Date(), "tasks": []}
      await db.collection('users').insertOne(newUser);
      res.status(201).json({"message": "Created"});
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({"message": "Internal server error"});
    }
  }
  
  // Login processor
  static async postLogin(req, res) {

	let { username, password } = req.body;

    if (typeof username !== 'string' || username.trim() === '' || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({"message": "Invalid username or password"});
    }

    username = username.trim();
    password = password.trim();

    if (username.length > 64) {
      return res.status(400).json({"message": "Bad request"});
    }

    if (password.length > 64) {
      return res.status(400).json({"message": "Bad request"});
    }

    try {
      if (!dbClient.db) {
        await dbClient.connect();
      }
      db = dbClient.getDb();
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({"message": "Internal server error"});
    }

    try {
      const user = await db.collection('users').findOne({username});
      if (!user) {
        return res.status(401).json({"message": "Unauthorized"});
      }

      const match = await checkPassword(password, user.password);
      if (!match) {
        return res.status(401).json({"message": "Unauthorized"});
      }

      const token = jwt.sign({
        "id": user._id,
        "username": user.username},
        process.env.JWT_SECRET,
        {"expiresIn": '24h'}
      );
      res.setHeader("Set-Cookie", serialize("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 86400000
      }));
      res.json({"message": "Login successful"});
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({"message": "Internal server error"});
    }
  }
  
  // Adds a task to the user tasks list
  static async addTask(req, res) {
    const { title, description} = req.body;

    if (typeof title !== 'string' || title.trim() === '' || title.trim().length > 200) {
      return res.status(400).json({message: "'title' must be a non-empty string with fewer than 200 characters."});
    }

    if (typeof description !== 'string' || description.trim() === '' || description.trim().length > 500) {
      return res.status(400).json({message: "'description' must be a non-empty string with fewer than 500 characters."});
    }

    try {
      if (!dbClient.db) {
        await dbClient.connect();
      }
      db = dbClient.getDb();
      const newTask = {_id: new ObjectId(), title: title.trim(), description: description.trim(), status: false, createdAt: new Date()};
      await db.collection('users').updateOne({_id: new ObjectId(req.user.id)}, {$push: {tasks: newTask}});
      newTask.id = newTask._id;
      delete newTask._id;
      return res.status(201).json(newTask);
    } catch (err) {
      console.log("Error:", err);
      return res.status(500).json({message: "Internal server error"});
    }
  }

  // Edits a task 
  static async editTask(req, res) {
    const { title, description, status} = req.body;
    const update = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '' || title.trim().length > 200) {
        return res.status(400).json({
          error: "Validation Error",
          details: {
            field: "title",
            message: "'title' must be a non-empty string with fewer than 200 characters."
          }
        });
      }
      update['tasks.$.title'] = title;
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '' || description.trim().length > 500) {
        return res.status(400).json({
          error: "Validation Error",
          details: {
            field: "description",
            message: "'description' must be a non-empty string with fewer than 500 characters."
          }
        });
      }
      update['tasks.$.description'] =  description;
    }

    if (status !== undefined) {
      if (typeof status !== 'boolean') {
        return res.status(400).json({
          error: "Validation Error",
          details: {
            field: "status",
            message: "'status' must be a boolean either 'true' or 'false'"
          }
        });
      }
      update['tasks.$.status'] = status;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({message: "No valid fields to update."});
    }

    try {    
      if (!dbClient.db) {
        await dbClient.connect();
      }
      db = dbClient.getDb();

      const result = await db.collection('users').updateOne(
        {_id: new ObjectId(req.user.id), 'tasks._id': new ObjectId(req.taskId)},
        {$set: update}
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({message: "Task not found"});
      }

      if (result.modifiedCount === 0) {
        return res.status(200).json({message: "No changes made. Task was already up to date."});
      }

      res.status(200).json({message: "Task updated successfully."});
    } catch (err) {
      console.log("Error:", err);
      return res.status(500).json({message: "Internal server error"});
    }
  }

  // Deletes a task
  static async deleteTask(req, res) {
    try {
      if (!dbClient.db) {
        await dbClient.connect();
      }
      db = dbClient.getDb();

      const result = await db.collection('users').updateOne(
        {_id: new ObjectId(req.user.id)},
        {$pull: {tasks: {_id: new ObjectId(req.taskId)}}}
      );
       
      if (result.modifiedCount === 0) {
        return res.status(404).json({message: "Task not found or already deleted."});
      }

      res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (err) {
      console.log("Error:", err);
      return res.status(500).json({message: "Internal server error"});
    }
  }
  
  // Retrieves tasks
  static async getTasks(req, res) {
    try {
      if (!dbClient.db) {
        await dbClient.connect();
      }
      db = dbClient.getDb();

      const user = await db.collection('users').findOne({_id: new ObjectId(req.user.id)});
      if (!user) {
        return res.status(404).json({message: "User not found"});
      }

      if (user.tasks.length > 0) {
        user.tasks.forEach((doc) => {
          doc.id = doc._id;
          delete doc._id;
        });
      }

      res.json(user.tasks || []);
    } catch (err) {
      console.log("Error:", err);
      return res.status(500).json({message: "Internal server error"});
    }
  }

  // Retrieve a task
  static async getTask(req, res) {
    try {
      if (!dbClient.db) {
        await dbClient.connect();
      }
      db = dbClient.getDb();

      const user = await db.collection('users').findOne({_id: new ObjectId(req.user.id)});
      if (!user) {
        return res.status(404).json({message: "User not found"});
      }

      const task = (user.tasks || []).find(t => t._id.toString() === req.taskId);

      if (!task) {
        return res.status(404).json({message: "Task not found"});
      }

      task.id = task._id;
      delete task._id;
      res.json(task);
    } catch (err) {
      console.log("Error:", err);
      return res.status(500).json({message: "Internal server error"});
    }
  }

  // Check if a user logged in
  static async authCheck(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://simple-todo-list-spa.vercel.app');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    try {
      if (!dbClient.db) { 
        await dbClient.connect();
      }
      db = dbClient.getDb();

      const user = await db.collection('users').findOne({_id: new ObjectId(req.user.id)});
      if (!user) {
        console.log('1');
        return res.status(401).json({message: "Unauthorized"});
      }
      res.status(200).json({"message": "Success"});
    } catch (err) {
      console.log('2');
      res.status(500).json({"message": "Internal Server Error"});
      console.log("Error:", err);
    }
  }
}


export default Controller;
