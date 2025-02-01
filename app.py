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
        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE
        )""")
        c.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE,
            filename TEXT,
            folder_id INTEGER,
            FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
        )""")
        
        # Ensure default folders exist
        c.execute("INSERT OR IGNORE INTO folders (name) VALUES ('Principal')")
        c.execute("INSERT OR IGNORE INTO folders (name) VALUES ('Templates')")
        conn.commit()

init_db()

@app.route('/')
def index():
    folder_id = request.args.get('folder_id', type=int)
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("SELECT id, name FROM folders")
        folders = c.fetchall()
        if folder_id:
            c.execute("SELECT id, title FROM notes WHERE folder_id = ?", (folder_id,))
        else:
            c.execute("SELECT id, title FROM notes")
        notes = c.fetchall()
    return render_template('index.html', notes=notes, folders=folders)

@app.route('/add_folder', methods=['POST'])
def add_folder():
    name = request.form['name']
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("INSERT INTO folders (name) VALUES (?)", (name,))
        conn.commit()
    return redirect(url_for('index'))

@app.route('/edit_folder/<int:folder_id>', methods=['GET', 'POST'])
def edit_folder(folder_id):
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        if request.method == 'POST':
            new_name = request.form['name']
            c.execute("UPDATE folders SET name = ? WHERE id = ?", (new_name, folder_id))
            conn.commit()
            return redirect(url_for('index'))
        else:
            c.execute("SELECT name FROM folders WHERE id = ?", (folder_id,))
            folder = c.fetchone()
    return render_template('edit_folder.html', folder=folder, folder_id=folder_id)

@app.route('/delete_folder/<int:folder_id>', methods=['POST'])
def delete_folder(folder_id):
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM folders WHERE id = ?", (folder_id,))
        conn.commit()
    return redirect(url_for('index'))

@app.route('/add', methods=['POST'])
def add_note():
    title = request.form['title']
    folder_id = request.form['folder_id']
    filename = f"{title}.md"
    filepath = os.path.join(NOTES_DIR, filename)
    with open(filepath, 'w') as f:
        f.write("# New Note\n")
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("INSERT INTO notes (title, filename, folder_id) VALUES (?, ?, ?)", (title, filename, folder_id))
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

    if not note:
        return "Note not found", 404

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
