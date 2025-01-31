from flask import Flask, render_template, request, redirect, url_for
import sqlite3
import os
import markdown

app = Flask(__name__)
DB_FILE = 'notes.db'
NOTES_DIR = 'notes'

if not os.path.exists(NOTES_DIR):
    os.makedirs(NOTES_DIR)

def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE,
            filename TEXT
        )""")
        conn.commit()

init_db()

@app.route('/')
def index():
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("SELECT id, title FROM notes")
        notes = c.fetchall()
    return render_template('index.html', notes=notes)

@app.route('/add', methods=['POST'])
def add_note():
    title = request.form['title']
    filename = f"{title}.md"
    filepath = os.path.join(NOTES_DIR, filename)
    with open(filepath, 'w') as f:
        f.write("# New Note\n")
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("INSERT INTO notes (title, filename) VALUES (?, ?)", (title, filename))
        conn.commit()
    return redirect(url_for('index'))

@app.route('/edit/<int:note_id>', methods=['GET', 'POST'])
def edit_note(note_id):
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("SELECT title, filename FROM notes WHERE id = ?", (note_id,))
        note = c.fetchone()
    if request.method == 'POST':
        content = request.form['content']
        with open(os.path.join(NOTES_DIR, note[1]), 'w') as f:
            f.write(content)
        return redirect(url_for('index'))
    with open(os.path.join(NOTES_DIR, note[1]), 'r') as f:
        content = f.read()
    return render_template('edit.html', title=note[0], content=content, note_id=note_id)

@app.route('/show/<int:note_id>')
def show_note(note_id):
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("SELECT title, filename FROM notes WHERE id = ?", (note_id,))
        note = c.fetchone()
    with open(os.path.join(NOTES_DIR, note[1]), 'r') as f:
        content = f.read()
    html_content = markdown.markdown(content)
    return render_template('show.html', title=note[0], content=html_content)

@app.route('/delete/<int:note_id>', methods=['POST'])
def delete_note(note_id):
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("SELECT filename FROM notes WHERE id = ?", (note_id,))
        note = c.fetchone()
        if note:
            os.remove(os.path.join(NOTES_DIR, note[0]))
            c.execute("DELETE FROM notes WHERE id = ?", (note_id,))
            conn.commit()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)

