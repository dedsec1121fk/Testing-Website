#!/usr//bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import subprocess
import shlex
import traceback
from datetime import datetime
from difflib import SequenceMatcher

HOME = os.path.expanduser('~')
NOTES_FILE = os.path.join(HOME, '.smart_notes.json')
CONFIG_FILE = os.path.join(HOME, '.smart_notes_config.json')
ERROR_LOG = os.path.join(HOME, '.smart_notes_error.log')

# Ensure files exist
for path, default in [(NOTES_FILE, {}), (CONFIG_FILE, {})]:
    if not os.path.exists(path):
        try:
            with open(path, 'w') as f:
                json.dump(default, f)
        except Exception:
            pass

# Optional dependencie
try:
    from dateutil import parser as dateparser
except Exception:
    dateparser = None

# Load timezones
def load_timezones():
    """Loads available timezones. (Not directly used by CLI but was in original for reminders)"""
    try:
        from zoneinfo import available_timezones
        tzs = sorted([t for t in available_timezones() if '/' in t])
        if tzs:
            return tzs
    except Exception:
        pass
    try:
        import pytz
        return sorted(list(pytz.all_timezones))
    except Exception:
        pass
    return sorted([
        'UTC', 'Europe/Athens', 'Europe/London', 'Europe/Berlin', 'Europe/Paris',
        'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney'
    ])

TIMEZONES = load_timezones()

# -----------------
# Core File Logic
# -----------------

def load_notes():
    """Loads notes from the JSON file."""
    if not os.path.exists(NOTES_FILE):
        return {}
    try:
        with open(NOTES_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading notes: {e}. Starting with an empty set.")
        return {}

def save_notes(notes):
    """Saves notes to the JSON file."""
    try:
        with open(NOTES_FILE, 'w') as f:
            json.dump(notes, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving notes: {e}")

# -----------------
# Config & Error Logic
# -----------------

def _load_config():
    """Loads configuration or returns default."""
    if not os.path.exists(CONFIG_FILE):
        return {"last_opened_note": None, "editor_cmd": "$EDITOR"}
    try:
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return {"last_opened_note": None, "editor_cmd": "$EDITOR"}

def _save_config(config):
    """Saves current configuration."""
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=4, ensure_ascii=False)
    except Exception as e:
        _log_error(f"Config Save Error: {e}")

def _log_error(message):
    """Logs an error with a timestamp."""
    try:
        with open(ERROR_LOG, 'a') as f:
            f.write(f"[{datetime.now().isoformat()}] {message}\n")
    except Exception:
        pass # Failsafe

# -----------------
# Reminder Logic
# -----------------

def _parse_reminder_data(note_content: str) -> dict:
    """Parses reminder metadata from the beginning of a note."""
    data = {}
    lines = note_content.split('\n')
    for line in lines:
        if line.strip().startswith('#reminder:'):
            parts = line.split(':', 2)
            if len(parts) == 3:
                key = parts[1].strip()
                value = parts[2].strip()
                data[key] = value
        elif not line.strip(): # Stop on first empty line
            break
        elif not line.strip().startswith('#'): # Stop on first non-comment/non-empty line
            break
    return data

def get_reminder_content(note_content: str) -> str:
    """Removes metadata lines from note content for display."""
    lines = note_content.split('\n')
    content_lines = []
    metadata_done = False
    for line in lines:
        if not metadata_done and line.strip().startswith('#reminder:'):
            continue
        if not metadata_done and not line.strip():
            metadata_done = True
            continue
        if not metadata_done and not line.strip().startswith('#'):
            metadata_done = True
            
        if metadata_done:
            content_lines.append(line)
    return '\n'.join(content_lines).strip()

def run_reminders(auto_run=False):
    """Checks and executes overdue reminders."""
    notes = load_notes()
    reminders_run = 0
    
    if not dateparser:
        if auto_run: return 0 # Cannot run without dateutil
        print('Cannot run reminders: The dateutil library is required.')
        print('Please install it with: pip install python-dateutil')
        return 0

    print("\n--- Checking Reminders ---")
    
    for name, content in notes.items():
        data = _parse_reminder_data(content)
        
        # Check for reminder trigger
        if 'due' in data:
            try:
                # Use dateparser to handle flexible date formats
                due_time = dateparser.parse(data['due'])
                
                # Assume local timezone if none is specified in 'due' string
                if due_time.tzinfo is None or due_time.tzinfo.utcoffset(due_time) is None:
                    # Best-effort localization (assuming system local time)
                    due_time = due_time.astimezone(datetime.now().astimezone().tzinfo)
                    
                if due_time < datetime.now().astimezone():
                    print(f"\n🔔 Reminder Overdue: {name} (Due: {data['due']})")
                    print("-" * (len(name) + 20))
                    print(get_reminder_content(content))
                    
                    command = data.get('run_cmd')
                    if command:
                        print(f"\n[!] Executing command: {command}")
                        try:
                            # Use shlex to safely split the command string
                            process = subprocess.run(shlex.split(command), capture_output=True, text=True, timeout=10)
                            print(f"Command Output:\n{process.stdout}")
                            if process.stderr:
                                print(f"Command Error:\n{process.stderr}")
                            print(f"Command finished with exit code {process.returncode}")
                        except Exception as e:
                            print(f"❌ Error executing command: {e}")
                            
                    # Remove the reminder metadata after execution (if set to auto_remove)
                    if data.get('auto_remove', 'False').lower() == 'true':
                        print("\n[!] Auto-removing reminder metadata...")
                        new_lines = []
                        for line in content.split('\n'):
                            if not line.strip().startswith('#reminder:'):
                                new_lines.append(line)
                        notes[name] = '\n'.join(new_lines).strip()
                        save_notes(notes)
                    
                    reminders_run += 1
                    print("-" * (len(name) + 20))
                    
            except Exception as e:
                print(f"❌ Error parsing date for note {name}: {e}")
                
    if reminders_run == 0:
        print("No overdue reminders found.")

    return reminders_run

# -----------------
# Console/CLI Logic
# -----------------

def get_filtered_notes(notes, filter_text):
    """Filters notes based on the current filter text."""
    note_names = sorted(notes.keys(), key=str.lower)
    if not filter_text:
        return note_names
        
    filter_lower = filter_text.lower()
    
    # Exact match / starts with
    filtered = [name for name in note_names if name.lower().startswith(filter_lower)]
    # Contains
    filtered.extend([name for name in note_names if filter_lower in name.lower() and name not in filtered])
    # Fuzzy match (similarity ratio)
    filtered.extend([
        name for name in note_names 
        if name not in filtered and SequenceMatcher(None, filter_lower, name.lower()).ratio() > 0.3
    ])

    return filtered

def _external_edit_cli(notes, config, note_name=None):
    """Launches external editor for a note."""
    
    # 1. Prepare temp file with current content
    temp_file = os.path.join(HOME, f".smart_notes_temp_{os.getpid()}.txt")
    initial_content = notes.get(note_name, "") if note_name else ""
    
    try:
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(initial_content)
    except Exception as e:
        print(f"Error preparing temp file: {e}")
        return notes, config
        
    # 2. Get editor command
    editor_cmd = config.get("editor_cmd", "$EDITOR")
    editor_cmd = os.environ.get('EDITOR', 'vi') if editor_cmd == '$EDITOR' else editor_cmd
    
    full_command = f"{editor_cmd} {shlex.quote(temp_file)}"

    # 3. Launch editor
    try:
        print(f"Launching external editor: {full_command}")
        subprocess.run(shlex.split(full_command), check=True)
        print("Editor closed. Reading new content...")
        
        # 4. Read content back
        with open(temp_file, 'r', encoding='utf-8') as f:
            new_content = f.read().strip()
        
        # 5. Handle saving
        if not note_name:
            # New note case
            name = input("Enter new note name: ").strip()
            if not name:
                print("Canceled: Empty name.")
                return notes, config
            if name in notes:
                if input(f"Note '{name}' already exists. Replace? (y/N): ").lower() != 'y':
                    print('Canceled.')
                    return notes, config
            
            notes[name] = new_content
            config['last_opened_note'] = name
        else:
            # Existing note case
            notes[note_name] = new_content
            config['last_opened_note'] = note_name
            
        save_notes(notes)
        _save_config(config)
        print("Note saved.")

    except subprocess.CalledProcessError:
        print("Editor failed with an error. Note not saved.")
    except KeyboardInterrupt:
        print("\nEditing canceled by user.")
    except Exception as e:
        print(f"An error occurred during external edit: {e}")
        _log_error(f"External Edit Error: {e}\n{traceback.format_exc()}")
    finally:
        # Clean up temp file
        if os.path.exists(temp_file):
            os.remove(temp_file)
    
    return notes, config

def _delete_note_cli(notes, config, note_name):
    """Deletes a note after confirmation."""
    confirmation = input(f"Delete '{note_name}'? (y/N): ").strip().lower()
    if confirmation in ('y', 'yes'):
        del notes[note_name]
        save_notes(notes)
        if config.get('last_opened_note') == note_name:
            config['last_opened_note'] = None
            _save_config(config)
            
        print(f"Note '{note_name}' deleted.")
    else:
        print("Deletion canceled.")
    return notes, config

def _view_note_cli(notes, note_name):
    """Displays a note's content in the console."""
    content = notes.get(note_name, "NOTE NOT FOUND")
    
    print("\n" + "="*50)
    print(f"--- Note: {note_name} ---")
    
    data = _parse_reminder_data(content)
    if data:
        print("--- Metadata ---")
        for k, v in data.items():
            print(f"  {k}: {v}")
        print("--- Content ---")
    
    print(get_reminder_content(content))
    print("="*50)
    input("\nPress Enter to return to list...")

def cli_add_note():
    """Adds a note via standard console input (for Termux widget/automation)."""
    notes = load_notes()
    name = input('Enter note name: ').strip()
    if not name:
        print('Canceled: empty name')
        return
    if name in notes:
        if input('Replace existing? (y/N): ').lower() not in ('y', 'yes'):
            print('Canceled')
            return
    print('Starting editor. Terminate with a line containing only .save')
    try:
        lines = []
        while True:
            ln = input()
            if ln.strip() == '.save':
                break
            lines.append(ln)
        new = '\n'.join(lines)
    except KeyboardInterrupt:
        print('\nCanceled')
        return
    notes[name] = new
    save_notes(notes)
    print('Saved.')

# Help
def print_help(is_main_loop=False):
    """Prints help text for the CLI."""
    if is_main_loop:
        print("\n--- Smart Notes Help ---")
        print("Enter a command:")
        print("  [Number] : View/Edit note by its number")
        print("  a        : Add a new note (opens $EDITOR)")
        print("  d [Num]  : Delete note by number (e.g., 'd 5')")
        print("  f [Text] : Filter list (e.g., 'f todo'). 'f' alone clears filter.")
        print("  r        : Run overdue reminders")
        print("  h        : Show this help screen")
        print("  q        : Quit")
    else:
        print("Smart Notes - CLI")
        print("Commands:")
        print("  (no arguments) -> Interactive CLI mode")
        print("  --add            -> Add note via simple line-by-line input")
        print("  --run-reminders  -> Execute overdue reminders and exit")
        print("  --help           -> This help screen")

def cli_loop():
    """Main interactive CLI loop."""
    notes = load_notes()
    config = _load_config()
    filter_text = ""
    
    # Check reminders on startup
    if run_reminders(auto_run=True) > 0:
        input("Overdue reminders were run. Press Enter to continue...")

    while True:
        # 1. Get filtered list
        filtered_list = get_filtered_notes(notes, filter_text)
        
        # 2. Display list
        print("\n--- Smart Notes ---")
        if filter_text:
            print(f"Filter: '{filter_text}' ({len(filtered_list)}/{len(notes)})")
        else:
            print(f"({len(filtered_list)} notes)")

        if not filtered_list:
            print("\nNo notes found.")
        else:
            for i, name in enumerate(filtered_list):
                # Check for reminder status
                has_reminder = False
                is_overdue = False
                try:
                    data = _parse_reminder_data(notes.get(name, ""))
                    if 'due' in data and dateparser:
                        has_reminder = True
                        due_time = dateparser.parse(data['due']).astimezone(datetime.now().astimezone().tzinfo)
                        if due_time < datetime.now().astimezone():
                            is_overdue = True
                except Exception:
                    pass # Ignore parsing errors during draw

                symbol = ""
                if is_overdue:
                    symbol = "🔔"
                elif has_reminder:
                    symbol = "⏰"
                
                print(f"  {i+1: >3}) {symbol} {name}")
        
        # 3. Get input
        print("\n(h for help, q to quit)")
        cmd_raw = input("Enter command: ").strip()
        
        if not cmd_raw:
            continue
            
        cmd_parts = cmd_raw.split(maxsplit=1)
        cmd = cmd_parts[0].lower()
        arg = cmd_parts[1] if len(cmd_parts) > 1 else ""

        # 4. Handle commands
        try:
            # Quit
            if cmd == 'q':
                print("Goodbye!")
                break
            
            # Help
            elif cmd == 'h':
                print_help(is_main_loop=True)
            
            # Add
            elif cmd == 'a':
                notes, config = _external_edit_cli(notes, config, note_name=None)
            
            # Run Reminders
            elif cmd == 'r':
                run_reminders()
                notes = load_notes() # Refresh notes
                input("Reminder check complete. Press Enter to continue...")

            # Filter
            elif cmd == 'f':
                filter_text = arg
                if filter_text:
                    print(f"Filtering for: '{filter_text}'")
                else:
                    print("Filter cleared.")
            
            # Delete
            elif cmd == 'd':
                if not arg:
                    print("Error: Delete 'd' must be followed by a number (e.g., 'd 5').")
                    continue
                try:
                    num = int(arg)
                    if 1 <= num <= len(filtered_list):
                        note_name = filtered_list[num-1]
                        notes, config = _delete_note_cli(notes, config, note_name)
                    else:
                        print(f"Error: Invalid number. Must be between 1 and {len(filtered_list)}.")
                except ValueError:
                    print(f"Error: '{arg}' is not a valid number.")

            # View/Edit by Number
            elif cmd.isdigit():
                num = int(cmd)
                if 1 <= num <= len(filtered_list):
                    note_name = filtered_list[num-1]
                    _view_note_cli(notes, note_name)
                    
                    # Ask to edit
                    if input(f"Edit '{note_name}'? (y/N): ").strip().lower() == 'y':
                        notes, config = _external_edit_cli(notes, config, note_name)
                else:
                    print(f"Error: Invalid number. Must be between 1 and {len(filtered_list)}.")
            
            else:
                print(f"Unknown command: '{cmd_raw}'. Type 'h' for help.")

        except Exception as e:
            print(f"\n--- An Unexpected Error Occurred ---")
            print(f"Error: {e}")
            print("Please check the error log: ~/.smart_notes_error.log")
            _log_error(traceback.format_exc())
            input("Press Enter to try and continue...")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg == '--add':
            cli_add_note()
        elif arg == '--run-reminders':
            run_reminders()
        elif arg == '--help':
            print_help(is_main_loop=False)
        else:
            print(f"Unknown argument: {arg}. Use --help for usage.")
    else:
        # Interactive CLI Mode
        try:
            cli_loop()
        except KeyboardInterrupt:
            print("\nGoodbye!")
        except Exception as e:
            print(f"\nAn unexpected fatal error occurred: {e}")
            _log_error(traceback.format_exc())
            print(f"Please check the error log: {ERROR_LOG}")