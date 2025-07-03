import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { parse } from 'cookie';
import { responseCookiesToRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
dotenv.config();

const SECRET = process.env.JWT_SECRET;

export default function authenticate(req, res) {
  const cookie = parse(req.headers.cookie || '');
  const token = cookie.token;

  if (!token) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
    
    //return res.status(401).json({"message": "Unauthorized"});
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
  } catch (error) {
    console.log(error);
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
    //return res.status(401).json({"message": "Unauthorized"});
  }
}

/*export function authDashboard(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.redirect('/login');
  }
}*/
