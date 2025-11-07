#!/usr/bin/env python3
# Fox Chat + DedSec's Database (Unified Login Script)
# Enhanced with Instagram-like UI and Dark/Light themes

import os
import sys
import time
import re
import subprocess
import shutil
import socket
import secrets
import html
import binascii
import signal
import threading
import mimetypes
import datetime
import contextlib
import pathlib
import logging
from base64 import b64decode

# Try import requests to avoid runtime errors later; don't crash if it's missing
try:
    import requests
    requests.packages.urllib3.disable_warnings(requests.packages.urllib3.exceptions.InsecureRequestWarning)
except Exception:
    requests = None

# Try imports for both apps
try:
    from flask import Flask, render_template_string, request, redirect, send_from_directory, session, url_for, flash, get_flashed_messages, Blueprint
    from flask_socketio import SocketIO, emit, join_room, leave_room
    from cryptography import x509
    from cryptography.x509.oid import NameOID
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives.serialization import Encoding, PrivateFormat, NoEncryption
except ImportError:
    pass # Will be handled by install_requirements

# ----------------------------
# Termux-aware helper functions (Combined)
# ----------------------------
def install_requirements(termux_opt=True):
    print("Checking and installing Python requirements (if needed)...")
    try:
        import pkgutil
        # Combined requirements from both scripts
        reqs = ["flask", "flask_socketio", "requests", "cryptography"]
        to_install = []
        for r in reqs:
            if not pkgutil.find_loader(r):
                to_install.append(r)
        
        if to_install:
            cmd = [sys.executable, "-m", "pip", "install", "--no-cache-dir"] + to_install
            print("Installing:", " ".join(to_install))
            subprocess.run(cmd, check=True)
            
    except Exception as e:
        print("WARNING: automatic pip install failed or unavailable:", e)
        
    # Attempt to install cloudflared and openssh on Termux (best-effort)
    if termux_opt and os.path.exists("/data/data/com.termux"):
        print("Attempting to install Termux packages (cloudflared, openssh)...")
        if shutil.which("cloudflared") is None:
            os.system("pkg update -y > /dev/null 2>&1 && pkg install cloudflared -y > /dev/null 2>&1")
        if shutil.which("ssh") is None:
            os.system("pkg update -y > /dev/null 2>&1 && pkg install openssh -y > /dev/null 2&>1")
    return

def generate_self_signed_cert(cert_path="cert.pem", key_path="key.pem"):
    # generate cert only if missing
    if os.path.exists(cert_path) and os.path.exists(key_path):
        return
    try:
        # Imports are already at top, just use them
        print(f"Generating new SSL certificate at {cert_path}...")
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        with open(key_path, "wb") as f:
            f.write(key.private_bytes(encoding=Encoding.PEM, format=PrivateFormat.TraditionalOpenSSL, encryption_algorithm=NoEncryption()))
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, u"US"),
            x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
        ])
        cert = x509.CertificateBuilder().subject_name(subject).issuer_name(issuer).public_key(key.public_key()) \
            .serial_number(x509.random_serial_number()).not_valid_before(datetime.datetime.utcnow()) \
            .not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=365)) \
            .add_extension(x509.SubjectAlternativeName([x509.DNSName(u"localhost")]), critical=False) \
            .sign(key, hashes.SHA256())
        with open(cert_path, "wb") as f:
            f.write(cert.public_bytes(Encoding.PEM))
    except Exception as e:
        print("WARNING: cryptography module missing or failed; skipping cert generation:", e)
        return

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def start_server_process(secret_key, verbose_mode):
    # This single process will run both apps
    # Note: Only one key is needed now, passed as both --server and --db-password
    cmd = [sys.executable, __file__, "--server", secret_key, "--db-password", secret_key]
    if not verbose_mode:
        cmd.append("--quiet")
    return subprocess.Popen(cmd)

def wait_for_server(url, timeout=20):
    print(f"Waiting for local server at {url}...")
    start_time = time.time()
    try:
        import requests
    except Exception:
        return False
        
    while time.time() - start_time < timeout:
        try:
            # Check the chat health endpoint
            response = requests.get(url, verify=False, timeout=1)
            if response.status_code == 200:
                print(f"Server at {url} is up and running.")
                return True
        except requests.RequestException:
            time.sleep(0.5)
    print(f"Error: Local server at {url} did not start within the timeout period.")
    return False

# 50 GB limit for Fox Chat
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 * 1024  # 53,687,091,200 bytes

@contextlib.contextmanager
def suppress_stdout_stderr():
    """Suppresses console output for cleaner execution."""
    with open(os.devnull, 'w') as devnull:
        old_stdout, old_stderr = sys.stdout, sys.stderr
        sys.stdout, sys.stderr = devnull, devnull
        try:
            yield
        finally:
            sys.stdout, sys.stderr = old_stdout, old_stderr

def start_cloudflared_tunnel(port, proto="https", name=""):
    """Starts a cloudflared tunnel, reads output for the URL, and lets the process run."""
    print(f"🚀 Starting Cloudflare tunnel for {name} (port {port})... please wait.")
    
    cmd = ["cloudflared", "tunnel", "--url", f"{proto}://localhost:{port}", "--no-tls-verify"]

    try:
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
        
        start_time = time.time()
        # Wait up to 15s for the URL
        while time.time() - start_time < 15:
            line = process.stdout.readline()
            if not line and process.poll() is not None:
                print(f"⚠️ Cloudflare process for {name} exited unexpectedly.")
                return None, None
                
            match = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', line)
            if match:
                online_url = match.group(0)
                print(f"✅ Cloudflare tunnel for {name} is live.")
                return process, online_url
            
            time.sleep(0.2)

        print(f"⚠️ Could not find Cloudflare URL for {name} in output.")
        return process, None # Return process anyway, maybe it's just slow

    except Exception as e:
        print(f"❌ Failed to start Cloudflare tunnel for {name}: {e}")
        return None, None


def graceful_shutdown(signum, frame):
    print("Shutting down gracefully...")
    sys.exit(0)

signal.signal(signal.SIGINT, graceful_shutdown)
signal.signal(signal.SIGTERM, graceful_shutdown)


# -------------------------------------------------------------------
#
# PART 1: DEDSEC'S DATABASE CODE (as a Blueprint)
#
# -------------------------------------------------------------------

# Create a Blueprint for the Database, prefixed with /db
db_blueprint = Blueprint('database', __name__, url_prefix='/db')

# ==== GLOBAL CONFIG & APP SETUP ====
SERVER_PASSWORD = None # This will be set by the server main function

# --- MODIFIED: Use the user's Downloads folder for storage ---
# This provides a cross-platform way to access the user's main downloads directory.
try:
    DOWNLOADS_DIR = pathlib.Path.home() / "Downloads"
    BASE_DIR = DOWNLOADS_DIR / "DedSec's Database"
    BASE_DIR.mkdir(exist_ok=True, parents=True)
except Exception as e:
    print(f"WARNING: Could not create directory in Downloads folder ({e}). Using a local folder instead.")
    BASE_DIR = pathlib.Path("DedSec_Database_Files")
    BASE_DIR.mkdir(exist_ok=True)


# Define file categories for organization
FILE_CATEGORIES = {
    'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
    'Videos': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    'Audio': ['.mp3', '.wav', '.ogg', '.flac'],
    'Documents': ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.xls', '.xlsx', '.md', '.csv'],
    'Archives': ['.zip', '.rar', '.7z', '.tar', '.gz'],
    'Code': ['.py', '.js', '.html', '.css', '.json', '.xml', '.sh', '.c', '.cpp'],
}

# ==== HELPER FUNCTIONS ====
def get_file_info(filename):
    """Gathers metadata for a given file path. Skips directories."""
    try:
        full_path = BASE_DIR / filename
        
        if full_path.is_dir():
            return None 

        stat_info = full_path.stat()
        size_raw = stat_info.st_size
        mtime = stat_info.st_mtime
        file_type = mimetypes.guess_type(full_path)[0] or "Unknown"

        return {
            "size": size_raw,
            "mtime": mtime,
            "mtime_str": datetime.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S"),
            "mimetype": file_type,
        }
    except Exception:
        return None

def get_file_category(filename):
    """Returns the category of a file based on its extension."""
    ext = pathlib.Path(filename).suffix.lower()
    for category, extensions in FILE_CATEGORIES.items():
        if ext in extensions:
            return category
    return 'Other'

def filesizeformat(value):
    """Formats a file size in bytes into a human-readable string."""
    try:
        if value < 1024: return f"{value} B"
        for unit in ['B', 'KB', 'MB', 'GB', 'TB', 'PB']:
            if value < 1024:
                return f"{value:.1f} {unit}"
            value /= 1024
        return f"{value:.1f} PB"
    except Exception:
        return "0 B"

# Register the filter with the blueprint
db_blueprint.add_app_template_filter(filesizeformat, 'filesizeformat')

# ==== HTML TEMPLATES (DB) ====
# Updated with theme toggle and Instagram-like styling
html_template_db = '''
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes" />
<title>DedSec's Database - Files</title>
<style>
    :root {
        --bg-primary: #0d021a;
        --bg-secondary: #1a0f29;
        --bg-tertiary: #2a1f39;
        --text-primary: #e0e0e0;
        --text-secondary: #c080c0;
        --accent-color: #800080;
        --border-color: #4a2f4a;
        --success-color: #00ff00;
        --error-color: #ff4d4d;
        --warning-color: #ffff00;
    }

    [data-theme="light"] {
        --bg-primary: #fafafa;
        --bg-secondary: #ffffff;
        --bg-tertiary: #f0f0f0;
        --text-primary: #262626;
        --text-secondary: #8e8e8e;
        --accent-color: #0095f6;
        --border-color: #dbdbdb;
        --success-color: #00a400;
        --error-color: #ed4956;
        --warning-color: #ffcc00;
    }

    /* Global Reset and Base Styles */
    body {
        background-color: var(--bg-primary); 
        color: var(--text-primary); 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
        margin: 0; 
        padding: 10px;
        transition: all 0.3s ease;
    }
    .container {
        background-color: var(--bg-secondary); 
        padding: 15px; 
        border-radius: 10px; 
        margin: auto;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--border-color);
        max-width: 100%;
        min-height: 90vh;
    }
    
    /* Typography */
    h1 { 
        color: var(--text-primary); 
        text-align: center; 
        border-bottom: 1px solid var(--border-color); 
        padding-bottom: 10px; 
        font-weight: 600;
        font-size: 1.5rem;
        margin-top: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    h2 { 
        margin-top: 25px; 
        font-size: 1.2em; 
        color: var(--text-secondary); 
        border-left: 5px solid var(--accent-color); 
        padding-left: 10px; 
        font-weight: 500;
    }
    
    /* Header with theme toggle */
    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .theme-toggle {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-primary);
        padding: 5px;
        border-radius: 50%;
        transition: background-color 0.3s;
    }
    
    .theme-toggle:hover {
        background-color: var(--bg-tertiary);
    }
    
    /* Flash Messages */
    .flash { 
        padding: 10px; 
        margin-bottom: 15px; 
        border-radius: 5px; 
        font-weight: bold; 
    }
    .flash.success { 
        background-color: rgba(0, 128, 0, 0.2); 
        border: 1px solid var(--success-color); 
        color: var(--success-color); 
    }
    .flash.error { 
        background-color: rgba(128, 0, 0, 0.2); 
        border: 1px solid var(--error-color); 
        color: var(--error-color); 
    }
    .flash.warning { 
        background-color: rgba(128, 128, 0, 0.2); 
        border: 1px solid var(--warning-color); 
        color: var(--warning-color); 
    }

    /* Forms and Inputs */
    .form-group {
        display: flex; 
        flex-wrap: wrap; 
        gap: 8px; 
        margin-bottom: 15px; 
        padding: 10px; 
        background: var(--bg-tertiary); 
        border-radius: 6px; 
    }
    input, select, .button {
        padding: 8px; 
        border-radius: 4px; 
        border: 1px solid var(--border-color); 
        background: var(--bg-secondary); 
        color: var(--text-primary);
        font-family: inherit;
    }
    input[type="submit"] {
        background-color: var(--accent-color); 
        color: #fff; 
        cursor: pointer; 
        border-color: var(--accent-color); 
        transition: all 0.3s ease;
        font-weight: 500;
    }
    input[type="submit"]:hover { 
        background-color: var(--text-secondary); 
        box-shadow: 0 0 10px var(--text-secondary); 
    }

    /* Manager Section */
    .manager-section { 
        margin-top: 20px; 
        background: var(--bg-tertiary);
        padding: 10px;
        border-radius: 6px;
        text-align: center;
    }
    .icon-button {
        padding: 10px 15px;
        font-size: 1em;
        font-weight: bold;
        background-color: var(--accent-color);
        color: #fff;
        border: none;
        cursor: pointer;
        border-radius: 20px;
        transition: all 0.3s ease;
        display: inline-block;
        margin: 5px 0; 
    }
    .icon-button:hover {
        background-color: var(--text-secondary);
        box-shadow: 0 0 10px var(--text-secondary);
    }
    
    /* File List Items */
    .file-item {
        background: var(--bg-tertiary); 
        padding: 10px 12px; 
        border-radius: 6px; 
        display: flex; 
        flex-direction: column;
        align-items: flex-start;
        gap: 10px; 
        margin-bottom: 8px; 
        transition: background-color 0.2s ease;
        max-width: 100%;
        box-sizing: border-box;
    }
    .file-item:hover { 
        background: rgba(128, 0, 128, 0.1); 
    }
    
    .filename { 
        flex-grow: 1; 
        font-weight: 500; 
        word-wrap: break-word; 
        white-space: normal;
        max-width: 100%;
        font-size: 1.1em;
    }
    .buttons { 
        display: flex; 
        gap: 6px; 
        flex-wrap: wrap; 
        max-width: 100%;
    }
    .button { 
        text-decoration: none; 
        font-size: 0.9em; 
        padding: 6px 10px;
        background-color: var(--bg-secondary);
        border-radius: 4px;
        transition: all 0.2s;
    }
    .delete-button { 
        background-color: var(--error-color); 
        color: white;
    }
    .delete-button:hover { 
        background-color: #ff6b6b; 
    }
    
    /* Info Popup */
    .info-popup {
        display: none; 
        position: absolute; 
        background: var(--bg-secondary); 
        border: 1px solid var(--accent-color); 
        border-radius: 5px;
        padding: 10px; 
        color: var(--text-primary); 
        z-index: 10; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.2); 
        font-size: 0.9em;
    }

    /* Media Query for larger screens */
    @media (min-width: 600px) {
        .file-item {
            flex-direction: row;
            align-items: center;
        }
    }
    
    .footer { 
        text-align: center; 
        margin-top: 20px; 
        font-size: 0.8em; 
        color: var(--text-secondary); 
    }
</style>
<script>
    // Theme management
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    }
    
    function updateThemeButton(theme) {
        const button = document.querySelector('.theme-toggle');
        button.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    document.addEventListener('DOMContentLoaded', initTheme);

    function toggleInfo(event, id) {
        event.stopPropagation();
        document.querySelectorAll('.info-popup').forEach(p => {
            if (p.id !== 'info-' + id) p.style.display = 'none';
        });
        const popup = document.getElementById('info-' + id);
        popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    }
    document.addEventListener('click', () => {
        document.querySelectorAll('.info-popup').forEach(p => p.style.display = 'none');
    });
</script>
</head>
<body>
<div class="container">
    <div class="header-container">
        <h1>DedSec's Database</h1>
        <button class="theme-toggle" onclick="toggleTheme()">☀️</button>
    </div>

    {% with messages = get_flashed_messages(with_categories=true) %}
        {% if messages %}
            {% for category, message in messages %}
                <div class="flash {{ category }}">{{ message }}</div>
            {% endfor %}
        {% endif %}
    {% endwith %}

    <div class="manager-section">
        <button class="icon-button" onclick="document.getElementById('file-upload-input').click()">
            ⬆️ Upload File
        </button>
        
        <form id="upload-form" action="{{ url_for('database.upload_file') }}" method="POST" enctype="multipart/form-data" style="display:none;">
            <input type="file" name="file" id="file-upload-input" onchange="document.getElementById('upload-form').submit()" multiple />
            <input type="hidden" name="sort" value="{{ request.args.get('sort', 'a-z') }}" />
        </form>
    </div>
    
    <form class="form-group" action="{{ url_for('database.index') }}" method="GET">
        <input type="search" name="query" list="fileSuggestions" placeholder="Search files in Database..." value="{{ request.args.get('query', '') }}" style="flex-grow:1;" />
        
        <datalist id="fileSuggestions">
            {% for filename in all_filenames %}
                <option value="{{ filename }}">
            {% endfor %}
        </datalist>
        
        <select name="sort">
            <option value="a-z" {% if sort=='a-z' %}selected{% endif %}>Sort A-Z</option>
            <option value="z-a" {% if sort=='z-a' %}selected{% endif %}>Sort Z-A</option>
            <option value="newest" {% if sort=='newest' %}selected{% endif %}>Newest First</option>
            <option value="oldest" {% if sort=='oldest' %}selected{% endif %}>Oldest First</option>
            <option value="biggest" {% if sort=='biggest' %}selected{% endif %}>Biggest First</option>
            <option value="smallest" {% if sort=='smallest' %}selected{% endif %}>Smallest First</option>
        </select>
        <input type="submit" value="Filter" />
    </form>

    {% set found_files = false %}
    {% for category, file_list in categorized_files.items() %}
        {% if file_list %}
            {% set found_files = true %}
            <h2>{{ category }}</h2>
            <div class="file-list">
            {% for f in file_list %}
            {% set info = files_info[f] %}
            <div class="file-item">
                <div class="filename">
                    📄 {{ f }}
                </div>
                
                <div class="buttons">
                    <button class="button info-button" onclick="toggleInfo(event, '{{ loop.index0 ~ category }}')">Info</button>
                    <div class="info-popup" id="info-{{ loop.index0 ~ category }}" onclick="event.stopPropagation()">
                        <b>Type:</b> {{ info['mimetype'] }}<br/>
                        <b>Size:</b> {{ info['size'] | filesizeformat }}<br/>
                        <b>Added:</b> {{ info['mtime_str'] }}
                    </div>
                    
                    <a href="{{ url_for('database.download_file', filename=f) }}" class="button" download onclick="return confirm(&quot;Download &apos;{{ f }}&apos; now?&quot;)">Download</a>
                    
                    <a href="{{ url_for('database.delete_path', filename=f, sort=sort) }}" class="button delete-button" onclick="return confirm(&quot;Delete &apos;{{ f }}&apos;? This cannot be undone.&quot;)">Delete</a>
                </div>
            </div>
            {% endfor %}
            </div>
        {% endif %}
    {% endfor %}

    {% if not found_files %}
        <p style="text-align:center; margin-top:30px;">
        {% if request.args.get('query') %}
            No files match your search query in the Database.
        {% else %}
            The Database is empty. Use the ⬆️ Upload button to add files.
        {% endif %}
        </p>
    {% endif %}
    <div class="footer">Made by DedSec Project/dedsec1121fk!</div>
</div>
</body>
</html>
'''

# ==== FLASK ROUTING & AUTH (DB) ====
@db_blueprint.route("/", methods=["GET"])
def index():
    query = request.args.get("query", "").lower()
    sort = request.args.get("sort", "a-z")
    
    search_terms = query.split()

    try:
        full_contents = [p.name for p in BASE_DIR.iterdir()]
    except Exception:
        full_contents = []
    
    current_files = []
    files_info = {}
    all_filenames = []
    
    for item in full_contents:
        info = get_file_info(item)
        if info is not None: 
            all_filenames.append(item)
            item_lower = item.lower()
            
            if not search_terms or all(term in item_lower for term in search_terms):
                current_files.append(item)
                files_info[item] = info

    # Sorting logic
    reverse_map = {"z-a": True, "newest": True, "biggest": True}
    sort_key_map = {
        "a-z": lambda p: p.lower(), "z-a": lambda p: p.lower(),
        "oldest": lambda p: files_info[p]["mtime"], "newest": lambda p: files_info[p]["mtime"],
        "smallest": lambda p: files_info[p]["size"], "biggest": lambda p: files_info[p]["size"],
    }
    current_files.sort(key=sort_key_map.get(sort, lambda p: p.lower()), reverse=reverse_map.get(sort, False))

    # Categorization logic
    categorized_files = {cat: [] for cat in list(FILE_CATEGORIES.keys()) + ['Other']}
    for p in current_files:
        category = get_file_category(p)
        categorized_files[category].append(p)
        
    messages = get_flashed_messages(with_categories=True)

    return render_template_string(html_template_db, 
                                  categorized_files=categorized_files, 
                                  files_info=files_info, 
                                  request=request, 
                                  sort=sort,
                                  all_filenames=all_filenames,
                                  messages=messages)


@db_blueprint.route("/upload", methods=["POST"])
def upload_file():
    uploaded_files = request.files.getlist("file")
    sort = request.form.get("sort", "a-z")
    
    uploaded_count = 0
    
    for file in uploaded_files:
        if file and file.filename:
            filename = os.path.basename(file.filename)
            try:
                file.save(BASE_DIR / filename)
                uploaded_count += 1
            except Exception:
                flash(f"Error uploading {filename}.", 'error')

    if uploaded_count > 0:
        flash(f"Successfully uploaded {uploaded_count} file(s).", 'success')
            
    return redirect(url_for('database.index', sort=sort))

@db_blueprint.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    basename = os.path.basename(filename)
    full_path = BASE_DIR / basename
    
    if full_path.exists() and full_path.is_file():
        return send_from_directory(BASE_DIR, basename, as_attachment=True)
    
    flash("Download path invalid or restricted.", 'error')
    return redirect(url_for('database.index', sort=request.args.get('sort', 'a-z')))

# --- FILE MANAGEMENT ROUTES ---

@db_blueprint.route("/delete_path", methods=["GET"])
def delete_path():
    filename_to_delete = request.args.get("filename") 
    sort = request.args.get("sort", "a-z")
    
    if filename_to_delete:
        item_name = os.path.basename(filename_to_delete)
        full_path = BASE_DIR / item_name
        
        if full_path.exists() and full_path.is_file():
            try:
                full_path.unlink()
                flash(f"File '{item_name}' successfully deleted.", 'success')
            except Exception as e:
                flash(f"Error deleting '{item_name}': {e}", 'error')
        else:
            flash(f"File '{item_name}' not found or is a folder.", 'error')
                
    return redirect(url_for('database.index', sort=sort))


# -------------------------------------------------------------------
#
# PART 2: FOX CHAT CODE (Main App)
#
# -------------------------------------------------------------------

app = Flask("chat")
# SECRET_KEY_SERVER will be set by server main
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
connected_users = {}
VIDEO_ROOM = "global_video_room"

# --- Register the Database Blueprint ---
app.register_blueprint(db_blueprint)

# Instagram-like UI with dark/light theme
HTML = '''
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Fox Chat</title>
<script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
<style>
    :root {
        --bg-primary: #000000;
        --bg-secondary: #121212;
        --bg-tertiary: #1e1e1e;
        --bg-input: #262626;
        --text-primary: #ffffff;
        --text-secondary: #a8a8a8;
        --accent-color: #0095f6;
        --accent-hover: #0081d6;
        --border-color: #363636;
        --self-msg-bg: #0095f6;
        --other-msg-bg: #262626;
        --error-color: #ed4956;
        --success-color: #00a400;
    }

    [data-theme="light"] {
        --bg-primary: #ffffff;
        --bg-secondary: #fafafa;
        --bg-tertiary: #f0f0f0;
        --bg-input: #efefef;
        --text-primary: #262626;
        --text-secondary: #8e8e8e;
        --accent-color: #0095f6;
        --accent-hover: #0081d6;
        --border-color: #dbdbdb;
        --self-msg-bg: #0095f6;
        --other-msg-bg: #efefef;
        --error-color: #ed4956;
        --success-color: #00a400;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        transition: background-color 0.3s, color 0.3s, border-color 0.3s;
    }

    body, html {
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        overflow: hidden;
    }

    /* Login Screen */
    #login-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-primary);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    #login-box {
        background: var(--bg-secondary);
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border: 1px solid var(--border-color);
        width: 90%;
        max-width: 350px;
    }

    #login-box h2 {
        margin-bottom: 20px;
        color: var(--text-primary);
        font-weight: 600;
    }

    #key-input {
        width: 100%;
        padding: 12px;
        margin: 10px 0;
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 14px;
    }

    #key-input:focus {
        outline: none;
        border-color: var(--accent-color);
    }

    #connect-btn {
        width: 100%;
        padding: 12px;
        background: var(--accent-color);
        border: none;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        margin-top: 10px;
    }

    #connect-btn:hover {
        background: var(--accent-hover);
    }

    #login-error {
        color: var(--error-color);
        margin-top: 10px;
        height: 1em;
        font-size: 14px;
    }

    /* Main Layout */
    #main-content {
        display: none;
        flex-direction: column;
        height: 100vh;
    }

    /* Header - Instagram-like */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--bg-primary);
        border-bottom: 1px solid var(--border-color);
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .header-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .header-btn {
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 1.3rem;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        transition: background-color 0.2s;
    }

    .header-btn:hover {
        background: var(--bg-tertiary);
    }

    /* Chat Container */
    #chat-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: var(--bg-primary);
        display: flex;
        flex-direction: column;
    }

    /* Message Bubbles - Instagram Style */
    .chat-message {
        display: flex;
        margin-bottom: 16px;
        max-width: 85%;
    }

    .chat-message.self {
        align-self: flex-end;
        flex-direction: row-reverse;
    }

    .chat-message.other {
        align-self: flex-start;
    }

    .message-bubble-wrapper {
        display: flex;
        flex-direction: column;
        max-width: 100%;
    }

    .message-username {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 4px;
        margin-left: 12px;
    }

    .chat-message.self .message-username {
        text-align: right;
        margin-right: 12px;
        margin-left: 0;
    }

    .message-content {
        padding: 12px 16px;
        border-radius: 18px;
        line-height: 1.4;
        word-wrap: break-word;
        position: relative;
    }

    .chat-message.self .message-content {
        background: var(--self-msg-bg);
        color: white;
        border-bottom-right-radius: 4px;
    }

    .chat-message.other .message-content {
        background: var(--other-msg-bg);
        color: var(--text-primary);
        border-bottom-left-radius: 4px;
    }

    .message-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 8px;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .chat-message:hover .message-actions {
        opacity: 1;
    }

    .action-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 14px;
        padding: 4px;
    }

    .action-btn:hover {
        color: var(--text-primary);
    }

    /* Media in messages */
    .message-content img,
    .message-content video {
        max-width: 250px;
        border-radius: 12px;
        display: block;
    }

    .message-content audio {
        width: 250px;
        height: 40px;
    }

    .file-link {
        color: var(--accent-color);
        text-decoration: none;
        font-weight: 500;
        cursor: pointer;
    }

    .file-link:hover {
        text-decoration: underline;
    }

    /* Input Area */
    .input-container {
        display: flex;
        padding: 12px 16px;
        background: var(--bg-primary);
        border-top: 1px solid var(--border-color);
        gap: 8px;
        align-items: flex-end;
    }

    #message {
        flex: 1;
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        padding: 12px 16px;
        color: var(--text-primary);
        font-size: 14px;
        resize: none;
        max-height: 120px;
        font-family: inherit;
    }

    #message:focus {
        outline: none;
        border-color: var(--accent-color);
    }

    .input-btn {
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 1.4rem;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: background-color 0.2s;
    }

    .input-btn:hover {
        background: var(--bg-tertiary);
    }

    #sendBtn {
        background: var(--accent-color);
        color: white;
        font-size: 1rem;
        padding: 10px 16px;
        border-radius: 20px;
        border: none;
        cursor: pointer;
        font-weight: 600;
    }

    #sendBtn:hover {
        background: var(--accent-hover);
    }

    /* New Line Button for Mobile */
    #newline-btn {
        display: none;
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 8px;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
        .header {
            padding: 10px 12px;
        }
        
        .header-title {
            font-size: 16px;
        }
        
        .header-btn {
            font-size: 1.2rem;
            padding: 5px;
        }
        
        #chat-container {
            padding: 12px;
        }
        
        .chat-message {
            max-width: 90%;
        }
        
        .input-container {
            padding: 10px 12px;
        }
        
        #newline-btn {
            display: block;
        }
    }

    /* Call UI */
    #call-ui-container {
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        padding: 12px 16px;
    }

    #controls {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .call-btn {
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        background: var(--bg-tertiary);
        color: var(--text-primary);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
    }

    .call-btn:hover:not(:disabled) {
        background: var(--bg-input);
    }

    .call-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .call-btn.primary {
        background: var(--accent-color);
        color: white;
    }

    .call-btn.primary:hover:not(:disabled) {
        background: var(--accent-hover);
    }

    .call-btn.danger {
        background: var(--error-color);
        color: white;
    }

    #videos {
        display: none;
        padding: 12px;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
    }

    #videos.show {
        display: flex;
    }

    #videos video {
        width: 120px;
        height: 90px;
        border-radius: 8px;
        object-fit: cover;
        border: 2px solid var(--border-color);
    }

    #local {
        transform: scaleX(-1);
    }

    /* Overlays */
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }

    .overlay-content {
        max-width: 90vw;
        max-height: 80vh;
        border-radius: 12px;
        overflow: hidden;
    }

    .overlay-controls {
        display: flex;
        gap: 12px;
        margin-top: 20px;
        flex-wrap: wrap;
        justify-content: center;
    }

    .overlay-btn {
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        background: var(--bg-tertiary);
        color: var(--text-primary);
        cursor: pointer;
        font-size: 14px;
        text-decoration: none;
    }

    .overlay-btn.primary {
        background: var(--accent-color);
        color: white;
    }

    /* System Messages */
    .system-message {
        text-align: center;
        color: var(--text-secondary);
        font-size: 13px;
        margin: 8px 0;
        font-style: italic;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
        width: 6px;
    }

    ::-webkit-scrollbar-track {
        background: var(--bg-primary);
    }

    ::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: var(--text-secondary);
    }
</style>
</head>
<body>
<div id="login-overlay">
    <div id="login-box">
        <h2>Fox Chat</h2>
        <input type="text" id="key-input" placeholder="Enter secret key...">
        <button id="connect-btn">Connect</button>
        <p id="login-error"></p>
    </div>
</div>

<div id="main-content">
    <div class="header">
        <div class="header-title">Fox Chat</div>
        <div class="header-actions">
            <button class="header-btn" id="themeToggle">🌙</button>
            <button class="header-btn" id="toggleCallUIBtn">📞</button>
            <button class="header-btn" id="infoButton">ℹ️</button>
        </div>
    </div>
    
    <div id="call-ui-container" style="display: none;">
        <div id="controls">
            <button class="call-btn primary" id="joinBtn">Join Call</button>
            <button class="call-btn" id="muteBtn" disabled>Mute</button>
            <button class="call-btn" id="videoBtn" disabled>Cam Off</button>
            <button class="call-btn danger" id="leaveBtn" disabled>Leave</button>
            <button class="call-btn" id="switchCamBtn" disabled>🔄</button>
        </div>
        <div id="videos">
            <video id="local" autoplay muted playsinline></video>
        </div>
    </div>
    
    <div id="chat-container">
        <div id="chat"></div>
    </div>
    
    <div class="input-container">
        <button class="input-btn" onclick="openLiveCamera()" title="Camera">📸</button>
        <button class="input-btn" onclick="sendFile()" title="Attach File">📎</button>
        <button class="input-btn" id="recordButton" onclick="toggleRecording()" title="Voice Message">🎙️</button>
        <textarea id="message" placeholder="Message..." rows="1"></textarea>
        <button class="input-btn" id="newline-btn" title="New Line">↵</button>
        <button id="sendBtn" onclick="sendMessage()">Send</button>
        <button class="input-btn" onclick="window.open('/db', '_blank');" title="Database">🛡️</button>
    </div>
</div>

<script>
    // Theme Management
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    }
    
    function updateThemeButton(theme) {
        const button = document.getElementById('themeToggle');
        button.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Mobile detection
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.innerWidth <= 768);
    }

    // Auto-resize textarea
    const messageInput = document.getElementById('message');
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Mobile-friendly input behavior
    function setupMobileInput() {
        const newlineBtn = document.getElementById('newline-btn');
        const messageInput = document.getElementById('message');
        
        if (isMobileDevice()) {
            // Show new line button on mobile
            newlineBtn.style.display = 'block';
            
            // New line button functionality
            newlineBtn.addEventListener('click', function() {
                const start = messageInput.selectionStart;
                const end = messageInput.selectionEnd;
                const value = messageInput.value;
                
                messageInput.value = value.substring(0, start) + '\n' + value.substring(end);
                messageInput.selectionStart = messageInput.selectionEnd = start + 1;
                
                // Trigger resize
                messageInput.dispatchEvent(new Event('input', { bubbles: true }));
                messageInput.focus();
            });
            
            // Enter key sends message on mobile
            messageInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                }
            });
        } else {
            // Desktop behavior - Enter to send, Ctrl+Enter for new line
            newlineBtn.style.display = 'none';
            
            messageInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && e.ctrlKey) {
                    // Ctrl+Enter - insert new line
                    const start = this.selectionStart;
                    const end = this.selectionEnd;
                    
                    this.value = this.value.substring(0, start) + '\n' + this.value.substring(end);
                    this.selectionStart = this.selectionEnd = start + 1;
                    
                    // Trigger resize
                    this.dispatchEvent(new Event('input', { bubbles: true }));
                    e.preventDefault();
                } else if (e.key === 'Enter' && !e.shiftKey) {
                    // Enter without Shift - send message
                    e.preventDefault();
                    sendMessage();
                }
                // Shift+Enter - default behavior (new line) is preserved
            });
        }
    }

    // Login functionality
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        setupMobileInput();
        
        const keyInput = document.getElementById('key-input');
        const connectBtn = document.getElementById('connect-btn');
        const loginError = document.getElementById('login-error');
        
        const savedKey = sessionStorage.getItem("secretKey");
        if (savedKey) keyInput.value = savedKey;
        
        connectBtn.onclick = () => {
            const secretKey = keyInput.value.trim();
            if (secretKey) {
                loginError.textContent = 'Connecting...';
                sessionStorage.setItem("secretKey", secretKey);
                initializeChat(secretKey);
            } else {
                loginError.textContent = 'Please enter a secret key';
            }
        };
        
        keyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                connectBtn.click();
            }
        });
    });

    // Info dialog
    function showInfo() {
        const infoText = `Fox Chat - Secure Messaging

• Type messages and press Enter to send
• On mobile: Use the ↵ button for new lines
• On desktop: Use Shift+Enter for new lines
• 📸 Take and send photos
• 📎 Attach files (up to 50GB)
• 🎙️ Record voice messages
• 📞 Video calls with multiple participants
• 🛡️ Access file database
• ☀️ Toggle dark/light theme

Made with ❤️ by Fox Chat Team`;
        alert(infoText);
    }
    document.getElementById('infoButton').addEventListener('click', showInfo);

    // Toggle call UI
    document.getElementById('toggleCallUIBtn').addEventListener('click', function() {
        const callUI = document.getElementById('call-ui-container');
        callUI.style.display = callUI.style.display === 'none' ? 'block' : 'none';
    });

    let socket = null;

    function initializeChat(secretKey) {
        socket = io({ 
            auth: { token: secretKey },
            transports: ['websocket', 'polling'] // Better browser compatibility
        });
        
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            document.getElementById('login-error').textContent = 'Invalid key or connection failed';
            sessionStorage.removeItem("secretKey");
        });
        
        socket.on('connect', () => {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('main-content').style.display = 'flex';
            
            let username = localStorage.getItem("username");
            if (!username) {
                username = prompt("Choose a username:") || "User" + Math.floor(Math.random() * 1000);
                localStorage.setItem("username", username);
            }
            
            socket.emit("join", username);
        });
        
        const MAX_FILE_SIZE = 50 * 1024 * 1024 * 1024; // 50 GB
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        const chat = document.getElementById('chat');
        
        function generateId() { 
            return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5); 
        }
        
        window.sendMessage = () => {
            const text = messageInput.value.trim();
            if (!text) return;
            
            const safeText = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
                
            socket.emit("message", { 
                id: generateId(), 
                username: localStorage.getItem("username"), 
                message: safeText 
            });
            
            messageInput.value = '';
            messageInput.style.height = 'auto';
        };
        
        window.sendFile = () => fileInput.click();
        
        fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > MAX_FILE_SIZE) {
                alert(`File too large. Maximum size: 50GB`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = () => {
                socket.emit("message", { 
                    id: generateId(), 
                    username: localStorage.getItem("username"), 
                    message: reader.result, 
                    fileType: file.type, 
                    filename: file.name 
                });
            };
            reader.readAsDataURL(file);
            fileInput.value = '';
        });
        
        let mediaRecorder, recordedChunks = [], isRecording = false;
        window.toggleRecording = () => {
            const recordButton = document.getElementById("recordButton");
            
            if (isRecording) {
                mediaRecorder.stop();
            } else {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        isRecording = true;
                        recordButton.style.color = 'var(--error-color)';
                        recordedChunks = [];
                        
                        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                        mediaRecorder.ondataavailable = e => {
                            if (e.data.size > 0) recordedChunks.push(e.data);
                        };
                        
                        mediaRecorder.onstop = () => {
                            isRecording = false;
                            recordButton.style.color = '';
                            stream.getTracks().forEach(track => track.stop());
                            
                            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                socket.emit("message", { 
                                    id: generateId(), 
                                    username: localStorage.getItem("username"), 
                                    message: reader.result, 
                                    fileType: blob.type, 
                                    filename: `voice-message-${Date.now()}.webm` 
                                });
                            };
                            reader.readAsDataURL(blob);
                        };
                        
                        mediaRecorder.start();
                    })
                    .catch(err => {
                        alert("Microphone access is required for voice messages");
                    });
            }
        };
        
        // Message display
        socket.on("message", data => {
            const messageDiv = document.createElement('div');
            
            if (data.username === 'System') {
                messageDiv.className = 'system-message';
                messageDiv.textContent = data.message;
            } else {
                const isSelf = data.username === localStorage.getItem("username");
                messageDiv.className = `chat-message ${isSelf ? 'self' : 'other'}`;
                messageDiv.id = data.id;
                
                const bubbleWrapper = document.createElement('div');
                bubbleWrapper.className = 'message-bubble-wrapper';
                
                // Username (only for others)
                if (!isSelf) {
                    const usernameDiv = document.createElement('div');
                    usernameDiv.className = 'message-username';
                    usernameDiv.textContent = data.username;
                    bubbleWrapper.appendChild(usernameDiv);
                }
                
                const content = document.createElement('div');
                content.className = 'message-content';
                content.id = `content-${data.id}`;
                
                // File message
                if (data.fileType && data.message.startsWith('data:')) {
                    if (data.fileType.startsWith('audio/') || data.filename.includes('voice-message')) {
                        const audio = document.createElement('audio');
                        audio.src = data.message;
                        audio.controls = true;
                        audio.controlsList = 'nodownload';
                        content.appendChild(audio);
                    } else if (data.fileType.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.src = data.message;
                        img.alt = data.filename;
                        img.style.cursor = 'pointer';
                        img.onclick = () => showMediaPreview(data);
                        content.appendChild(img);
                    } else if (data.fileType.startsWith('video/')) {
                        const video = document.createElement('video');
                        video.src = data.message;
                        video.controls = true;
                        video.onclick = () => showMediaPreview(data);
                        content.appendChild(video);
                    } else {
                        const fileLink = document.createElement('span');
                        fileLink.className = 'file-link';
                        fileLink.textContent = data.filename;
                        fileLink.onclick = () => showMediaPreview(data);
                        content.appendChild(fileLink);
                    }
                } else {
                    // Text message
                    content.innerHTML = data.message;
                }
                
                bubbleWrapper.appendChild(content);
                
                // Action buttons for own messages
                if (isSelf && data.username !== 'System') {
                    const actions = document.createElement('div');
                    actions.className = 'message-actions';
                    
                    if (!data.fileType) {
                        const editBtn = document.createElement('button');
                        editBtn.className = 'action-btn';
                        editBtn.innerHTML = '✏️';
                        editBtn.title = 'Edit';
                        editBtn.onclick = () => toggleEdit(data.id, data.message);
                        actions.appendChild(editBtn);
                    }
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'action-btn';
                    deleteBtn.innerHTML = '🗑️';
                    deleteBtn.title = 'Delete';
                    deleteBtn.onclick = () => socket.emit('delete_message', { id: data.id });
                    actions.appendChild(deleteBtn);
                    
                    messageDiv.appendChild(actions);
                }
                
                messageDiv.appendChild(bubbleWrapper);
            }
            
            chat.appendChild(messageDiv);
            
            // Auto-scroll to bottom
            chat.scrollTop = chat.scrollHeight;
        });
        
        socket.on('delete_message', data => {
            const element = document.getElementById(data.id);
            if (element) element.remove();
        });
        
        socket.on('message_edited', data => {
            const contentDiv = document.getElementById(`content-${data.id}`);
            if (contentDiv) {
                contentDiv.innerHTML = data.new_message + ' <em>(edited)</em>';
            }
        });
        
        function toggleEdit(id, currentText) {
            const contentDiv = document.getElementById(`content-${id}`);
            if (contentDiv.querySelector('input')) return;
            
            contentDiv.innerHTML = '';
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
            input.style.width = '100%';
            input.style.padding = '8px';
            input.style.border = '1px solid var(--accent-color)';
            input.style.borderRadius = '4px';
            input.style.background = 'var(--bg-input)';
            input.style.color = 'var(--text-primary)';
            
            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save';
            saveBtn.style.marginLeft = '8px';
            saveBtn.style.padding = '8px 12px';
            saveBtn.style.background = 'var(--accent-color)';
            saveBtn.style.color = 'white';
            saveBtn.style.border = 'none';
            saveBtn.style.borderRadius = '4px';
            saveBtn.style.cursor = 'pointer';
            
            saveBtn.onclick = () => {
                const newText = input.value.trim();
                if (newText && newText !== currentText) {
                    const safeNewText = newText
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    socket.emit('edit_message', { id: id, new_message: safeNewText });
                } else {
                    contentDiv.innerHTML = currentText;
                }
            };
            
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style.marginLeft = '4px';
            cancelBtn.style.padding = '8px 12px';
            cancelBtn.style.background = 'var(--bg-tertiary)';
            cancelBtn.style.color = 'var(--text-primary)';
            cancelBtn.style.border = 'none';
            cancelBtn.style.borderRadius = '4px';
            cancelBtn.style.cursor = 'pointer';
            
            cancelBtn.onclick = () => contentDiv.innerHTML = currentText;
            
            input.onkeydown = (e) => {
                if (e.key === 'Enter') saveBtn.click();
                if (e.key === 'Escape') cancelBtn.click();
            };
            
            contentDiv.appendChild(input);
            contentDiv.appendChild(saveBtn);
            contentDiv.appendChild(cancelBtn);
            input.focus();
        }
        
        // Media preview
        window.showMediaPreview = function(data) {
            const existingOverlay = document.getElementById('media-preview-overlay');
            if (existingOverlay) existingOverlay.remove();
            
            const overlay = document.createElement('div');
            overlay.id = 'media-preview-overlay';
            overlay.className = 'overlay';
            
            let mediaElement;
            if (data.fileType.startsWith('image/')) {
                mediaElement = document.createElement('img');
            } else if (data.fileType.startsWith('video/')) {
                mediaElement = document.createElement('video');
                mediaElement.controls = true;
                mediaElement.autoplay = true;
            } else if (data.fileType.startsWith('audio/')) {
                mediaElement = document.createElement('audio');
                mediaElement.controls = true;
                mediaElement.autoplay = true;
            } else {
                mediaElement = document.createElement('div');
                mediaElement.style.padding = '40px';
                mediaElement.style.fontSize = '24px';
                mediaElement.textContent = '📄';
                mediaElement.style.textAlign = 'center';
            }
            
            if (mediaElement.src !== undefined) {
                mediaElement.src = data.message;
            }
            
            mediaElement.className = 'overlay-content';
            
            const controls = document.createElement('div');
            controls.className = 'overlay-controls';
            
            const downloadLink = document.createElement('a');
            downloadLink.href = data.message;
            downloadLink.download = data.filename;
            downloadLink.className = 'overlay-btn primary';
            downloadLink.textContent = 'Download';
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'overlay-btn';
            closeBtn.textContent = 'Close';
            closeBtn.onclick = () => overlay.remove();
            
            if (data.username === localStorage.getItem("username")) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'overlay-btn';
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => {
                    socket.emit('delete_message', { id: data.id });
                    overlay.remove();
                };
                controls.appendChild(deleteBtn);
            }
            
            controls.appendChild(downloadLink);
            controls.appendChild(closeBtn);
            
            overlay.appendChild(mediaElement);
            overlay.appendChild(controls);
            document.body.appendChild(overlay);
        };
        
        // Camera functionality
        window.openLiveCamera = function() {
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            
            const video = document.createElement('video');
            video.id = 'camera-preview';
            video.autoplay = true;
            video.playsInline = true;
            video.className = 'overlay-content';
            
            const controls = document.createElement('div');
            controls.className = 'overlay-controls';
            
            const captureBtn = document.createElement('button');
            captureBtn.className = 'overlay-btn primary';
            captureBtn.textContent = 'Capture';
            
            const switchBtn = document.createElement('button');
            switchBtn.className = 'overlay-btn';
            switchBtn.textContent = 'Switch Camera';
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'overlay-btn';
            closeBtn.textContent = 'Close';
            
            let currentFacingMode = 'user';
            let stream = null;
            
            function startCamera(facingMode) {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
                navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: facingMode } 
                })
                .then(newStream => {
                    stream = newStream;
                    video.srcObject = stream;
                })
                .catch(err => {
                    alert('Camera access denied or unavailable');
                    overlay.remove();
                });
            }
            
            captureBtn.onclick = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                socket.emit("message", { 
                    id: generateId(), 
                    username: localStorage.getItem("username"), 
                    message: dataUrl, 
                    fileType: 'image/jpeg', 
                    filename: `photo-${Date.now()}.jpg` 
                });
                
                overlay.remove();
            };
            
            switchBtn.onclick = () => {
                currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
                startCamera(currentFacingMode);
            };
            
            closeBtn.onclick = () => {
                if (stream) stream.getTracks().forEach(track => track.stop());
                overlay.remove();
            };
            
            controls.appendChild(captureBtn);
            controls.appendChild(switchBtn);
            controls.appendChild(closeBtn);
            
            overlay.appendChild(video);
            overlay.appendChild(controls);
            document.body.appendChild(overlay);
            
            startCamera(currentFacingMode);
        };
        
        // WebRTC Video Call functionality
        const videos = document.getElementById('videos');
        const localVideo = document.getElementById('local');
        const joinBtn = document.getElementById('joinBtn');
        const muteBtn = document.getElementById('muteBtn');
        const videoBtn = document.getElementById('videoBtn');
        const leaveBtn = document.getElementById('leaveBtn');
        const switchCamBtn = document.getElementById('switchCamBtn');
        
        let localStream = null;
        let peerConnections = {};
        let isMuted = false;
        let videoOff = false;
        let currentFacingMode = 'user';
        
        const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
        
        joinBtn.onclick = async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: currentFacingMode, width: 320, height: 240 },
                    audio: true
                });
                
                localVideo.srcObject = localStream;
                videos.classList.add('show');
                
                joinBtn.disabled = true;
                muteBtn.disabled = false;
                videoBtn.disabled = false;
                leaveBtn.disabled = false;
                switchCamBtn.disabled = false;
                
                socket.emit('join-room');
            } catch (err) {
                alert('Could not access camera and microphone');
            }
        };
        
        leaveBtn.onclick = () => {
            socket.emit('leave-room');
            
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream = null;
            }
            
            Object.values(peerConnections).forEach(pc => pc.close());
            peerConnections = {};
            
            localVideo.srcObject = null;
            videos.classList.remove('show');
            document.querySelectorAll('#videos video:not(#local)').forEach(v => v.remove());
            
            joinBtn.disabled = false;
            muteBtn.disabled = true;
            videoBtn.disabled = true;
            leaveBtn.disabled = true;
            switchCamBtn.disabled = true;
        };
        
        muteBtn.onclick = () => {
            if (!localStream) return;
            isMuted = !isMuted;
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });
            muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
        };
        
        videoBtn.onclick = () => {
            if (!localStream) return;
            videoOff = !videoOff;
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !videoOff;
            });
            videoBtn.textContent = videoOff ? 'Cam On' : 'Cam Off';
        };
        
        switchCamBtn.onclick = async () => {
            if (!localStream) return;
            
            currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            
            try {
                localStream.getTracks().forEach(track => track.stop());
                
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: currentFacingMode, width: 320, height: 240 },
                    audio: true
                });
                
                localStream = newStream;
                localVideo.srcObject = newStream;
                
                // Update all peer connections with new stream
                Object.values(peerConnections).forEach(pc => {
                    const senders = pc.getSenders();
                    senders.forEach(sender => {
                        if (sender.track.kind === 'video') {
                            sender.replaceTrack(newStream.getVideoTracks()[0]);
                        } else if (sender.track.kind === 'audio') {
                            sender.replaceTrack(newStream.getAudioTracks()[0]);
                        }
                    });
                });
            } catch (err) {
                alert('Failed to switch camera');
                currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            }
        };
        
        // WebRTC signaling
        socket.on('all-users', data => {
            data.users.forEach(userId => {
                createPeerConnection(userId, true);
            });
        });
        
        socket.on('user-joined', data => {
            if (localStream) {
                createPeerConnection(data.sid, true);
            }
        });
        
        socket.on('user-left', data => {
            if (peerConnections[data.sid]) {
                peerConnections[data.sid].close();
                delete peerConnections[data.sid];
                
                const remoteVideo = document.getElementById(`video-${data.sid}`);
                if (remoteVideo) remoteVideo.remove();
            }
        });
        
        socket.on('signal', async data => {
            const pc = peerConnections[data.from] || createPeerConnection(data.from, false);
            
            if (data.data.sdp) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.data.sdp));
                if (data.data.sdp.type === 'offer') {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('signal', { to: data.from, data: { sdp: pc.localDescription } });
                }
            } else if (data.data.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(data.data.candidate));
            }
        });
        
        function createPeerConnection(userId, isOfferer) {
            const pc = new RTCPeerConnection({ iceServers });
            peerConnections[userId] = pc;
            
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    pc.addTrack(track, localStream);
                });
            }
            
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('signal', { to: userId, data: { candidate: event.candidate } });
                }
            };
            
            pc.ontrack = (event) => {
                const remoteVideo = document.createElement('video');
                remoteVideo.id = `video-${userId}`;
                remoteVideo.autoplay = true;
                remoteVideo.playsInline = true;
                remoteVideo.srcObject = event.streams[0];
                videos.appendChild(remoteVideo);
            };
            
            if (isOfferer) {
                pc.createOffer()
                    .then(offer => pc.setLocalDescription(offer))
                    .then(() => {
                        socket.emit('signal', { to: userId, data: { sdp: pc.localDescription } });
                    })
                    .catch(console.error);
            }
            
            return pc;
        }
    }
</script>
</body>
</html>
'''

# --- Fox Chat Server Routes ---

@app.route('/')
def index_chat():
    return render_template_string(HTML)

@app.route('/health')
def health_check():
    return "OK", 200

@socketio.on('connect')
def handle_connect(auth):
    token = None
    try:
        token = auth.get('token') if auth else None
    except Exception:
        token = None
        
    # Find the SECRET_KEY_SERVER in sys.argv (set by launcher)
    key = None
    if "--server" in sys.argv:
        try:
            key_index = sys.argv.index("--server") + 1
            if key_index < len(sys.argv):
                key = sys.argv[key_index]
        except Exception:
            pass
            
    if token != key:
        # Reject connection
        return False
        
    # --- UNIFIED LOGIN ---
    # Log them into the DB session as well
    session['db_logged_in'] = True
    
    connected_users[request.sid] = {'username': 'pending'}
    return True

@socketio.on("join")
def handle_join(username):
    safe_username = html.escape(username)
    if request.sid in connected_users:
        connected_users[request.sid]['username'] = safe_username
    emit('message', {'id': f'join_{int(time.time())}','username': 'System','message': f'{safe_username} has joined.'}, broadcast=True)

@socketio.on("message")
def handle_message(data):
    if not isinstance(data, dict): return
    
    data['username'] = html.escape(data.get('username', 'Anonymous'))
    data['id'] = html.escape(str(data.get('id', '')))

    if data.get('fileType'):
        try:
            if ',' not in data['message']: return
            header, encoded = data['message'].split(",", 1)
            
            decoded_len = (len(encoded) * 3) // 4
            if decoded_len > MAX_FILE_SIZE_BYTES:
                emit("message", {'id': f'reject_{int(time.time())}', 'username': 'System', 'message': 'File rejected: exceeds server limit.'}, room=request.sid)
                return
                
            binascii.a2b_base64(encoded.encode('utf-8'))
            
        except (ValueError, binascii.Error, IndexError):
            return 
            
        data['filename'] = html.escape(data.get('filename', 'file'))
        data['fileType'] = html.escape(data.get('fileType', 'application/octet-stream'))
    else:
        data['message'] = html.escape(data.get('message', ''))
        
    emit("message", data, broadcast=True)

@socketio.on("delete_message")
def handle_delete(data):
    safe_id = html.escape(str(data.get('id', '')))
    emit("delete_message", {'id': safe_id}, broadcast=True)

@socketio.on("edit_message")
def handle_edit(data):
    if not isinstance(data, dict) or 'id' not in data or 'new_message' not in data:
        return
    safe_id = html.escape(str(data['id']))
    new_message_safe = html.escape(data['new_message'])
    emit("message_edited", {'id': safe_id, 'new_message': new_message_safe}, broadcast=True)

@socketio.on("join-room")
def join_video():
    join_room(VIDEO_ROOM)
    users_in_room = []
    try:
        users_in_room = [sid for sid in socketio.server.manager.rooms['/'].get(VIDEO_ROOM, set()) if sid != request.sid]
    except Exception:
        users_in_room = []
    emit("all-users", {"users": users_in_room})
    emit("user-joined", {"sid": request.sid}, to=VIDEO_ROOM, include_self=False)

@socketio.on("leave-room")
def leave_video():
    leave_room(VIDEO_ROOM)
    emit("user-left", {"sid": request.sid}, to=VIDEO_ROOM, include_self=False)

@socketio.on("signal")
def signal(data):
    target_sid = data.get('to')
    if target_sid in connected_users:
        emit("signal", {"from": request.sid, "data": data['data']}, to=target_sid)

@socketio.on("disconnect")
def on_disconnect():
    leave_room(VIDEO_ROOM)
    emit("user-left", {"sid": request.sid}, to=VIDEO_ROOM)
    if request.sid in connected_users: del connected_users[request.sid]


# -------------------------------------------------------------------
#
# PART 3: LAUNCHER / MAIN
#
# -------------------------------------------------------------------

# ----------------------------
# Launcher mode (non-server)
# ----------------------------
if __name__ == '__main__' and "--server" not in sys.argv:
    VERBOSE_MODE = "--verbose" in sys.argv
    server_process = None
    tunnel_proc = None

    try:
        # Install requirements for both apps
        install_requirements()
        # Generate cert for chat app
        generate_self_signed_cert()
        
        try:
            # --- ONLY ONE KEY IS NEEDED ---
            SECRET_KEY = input("🔑 Create a one-time Secret Key for this session: ").strip()
            if not SECRET_KEY:
                print("No secret key entered. Exiting.")
                sys.exit(1)
                
        except Exception:
            print("FATAL: Could not read input for key. Exiting.")
            sys.exit(1)
            
        # Pass the single key to the server process
        server_process = start_server_process(SECRET_KEY, VERBOSE_MODE)
        
        # Wait for the single server
        server_ready = wait_for_server("https://localhost:5000/health")
        
        if server_ready:
            local_ip = get_local_ip()
            local_url = f"https://{local_ip}:5000"
            online_url = None
            
            if shutil.which("cloudflared"):
                tunnel_proc, online_url = start_cloudflared_tunnel(5000, "https", "Fox Chat")
            else:
                 print("'cloudflared' not installed, so no Online Link was generated.")

            os.system('cls' if os.name == 'nt' else 'clear')
            print(
f"""✅ Fox Chat is now live!
=================================================================
🔑 Your one-time Secret Key (for login):
   {SECRET_KEY}
=================================================================
--- Server URL ---
🔗 Online (Internet):     {online_url or 'N/A'}
🏠 Offline (Hotspot/LAN): {local_url}

Press Ctrl+C to stop the server."""
            )
            
            # Wait for user to press Ctrl+C
            try:
                while True:
                    time.sleep(3600)
            except KeyboardInterrupt:
                pass # Handled by finally
        else:
            print("\nFatal: The server failed to start. Exiting.")
            
    except KeyboardInterrupt:
        print("\nShutting down servers...")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
    finally:
        # Terminate all subprocesses
        try:
            if tunnel_proc and tunnel_proc.poll() is None:
                tunnel_proc.terminate()
        except Exception: pass
        try:
            if server_process and server_process.poll() is None:
                server_process.terminate()
        except Exception: pass
        sys.exit()

# ----------------------------
# Server code below
# ----------------------------
if __name__ == '__main__' and "--server" in sys.argv:
    
    # --- Get Keys/Passwords from args ---
    SECRET_KEY_SERVER = None
    DB_PASSWORD_SERVER = None
    QUIET_MODE_SERVER = "--quiet" in sys.argv
    
    try:
        key_index = sys.argv.index("--server") + 1
        if key_index < len(sys.argv):
            SECRET_KEY_SERVER = sys.argv[key_index]
    except Exception:
        pass
        
    try:
        # This will be the same as the secret key, as passed by the launcher
        db_pass_index = sys.argv.index("--db-password") + 1
        if db_pass_index < len(sys.argv):
            DB_PASSWORD_SERVER = sys.argv[db_pass_index]
    except Exception:
        pass

    if not SECRET_KEY_SERVER or not DB_PASSWORD_SERVER:
        print("FATAL: Server started without a secret key.")
        sys.exit(1)

    # --- Set passwords for the apps ---
    SERVER_PASSWORD = DB_PASSWORD_SERVER # Set global for DB blueprint
    app.config['SECRET_KEY'] = SECRET_KEY_SERVER # Main secret key for session
    
    if QUIET_MODE_SERVER:
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)
    else:
        print(f"Starting server with key: {SECRET_KEY_SERVER[:4]}...")
        
    # --- Start Main Server (Chat + DB) ---
    print("Starting Fox Chat (with DB) server on https://localhost:5000...")
    try:
        # This one command runs the Flask app, the SocketIO, AND the DB blueprint
        socketio.run(app, host='0.0.0.0', port=5000, ssl_context=('cert.pem', 'key.pem'))
    except Exception as e:
        print(f"Failed to start server: {e}")
        print("Make sure cert.pem and key.pem are present.")