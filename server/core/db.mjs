import { DatabaseSync } from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
export function openDatabase(path){
 if(path!==':memory:') mkdirSync(dirname(path),{recursive:true});
 const db=new DatabaseSync(path);db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('teacher','parent','student')), login TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS classes(id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL, school_year TEXT NOT NULL, created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS students(id TEXT PRIMARY KEY, class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE, user_id TEXT NOT NULL UNIQUE REFERENCES users(id), full_name TEXT NOT NULL, birth_date TEXT NOT NULL DEFAULT '', parent_name TEXT NOT NULL DEFAULT '', parent_phone TEXT NOT NULL DEFAULT '', parent_email TEXT NOT NULL DEFAULT '', private_note TEXT NOT NULL DEFAULT '');
 CREATE TABLE IF NOT EXISTS parent_links(parent_id TEXT NOT NULL REFERENCES users(id), student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE, PRIMARY KEY(parent_id,student_id));
 CREATE TABLE IF NOT EXISTS invites(token_hash TEXT PRIMARY KEY, student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE, expires_at TEXT NOT NULL, consumed_at TEXT);
 CREATE TABLE IF NOT EXISTS password_resets(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires_at TEXT NOT NULL,consumed_at TEXT);
 CREATE TABLE IF NOT EXISTS lessons(id TEXT PRIMARY KEY,class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 1 AND 7),lesson_number INTEGER NOT NULL CHECK(lesson_number BETWEEN 1 AND 20),subject TEXT NOT NULL,room TEXT NOT NULL DEFAULT '',UNIQUE(class_id,day_of_week,lesson_number));
 CREATE TABLE IF NOT EXISTS bells(id TEXT PRIMARY KEY,class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,lesson_number INTEGER NOT NULL CHECK(lesson_number BETWEEN 1 AND 20),start_time TEXT NOT NULL,end_time TEXT NOT NULL,UNIQUE(class_id,lesson_number));
 CREATE TABLE IF NOT EXISTS homework(id TEXT PRIMARY KEY,class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,subject TEXT NOT NULL,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',due_date TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS completions(homework_id TEXT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,completed_at TEXT NOT NULL,PRIMARY KEY(homework_id,student_id));
 CREATE TABLE IF NOT EXISTS awards(id TEXT PRIMARY KEY,class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,homework_id TEXT REFERENCES homework(id) ON DELETE SET NULL,kind TEXT NOT NULL CHECK(kind IN ('automatic','manual')),badge_key TEXT,title TEXT NOT NULL,message TEXT NOT NULL DEFAULT '',awarded_by TEXT REFERENCES users(id),created_at TEXT NOT NULL);
 CREATE UNIQUE INDEX IF NOT EXISTS automatic_award_unique ON awards(student_id,badge_key) WHERE kind='automatic';
 CREATE UNIQUE INDEX IF NOT EXISTS manual_award_unique ON awards(student_id,homework_id) WHERE kind='manual';
 CREATE INDEX IF NOT EXISTS students_class ON students(class_id); CREATE INDEX IF NOT EXISTS homework_class ON homework(class_id,due_date); CREATE INDEX IF NOT EXISTS awards_student ON awards(student_id); CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
 PRAGMA user_version=1;`);return db;
}
