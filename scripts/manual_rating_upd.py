import keyboard
import tkinter as tk
import json
import time
import threading

from tkinter import simpledialog
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial


# Config
HOST = "127.0.0.1"
PORT = 8000
HOTKEY = "f8"

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "rating.json"
DATA_PATH.parent.mkdir(parents=True, exist_ok=True)


# HTTP Server
class RequestHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


handler = partial(
    RequestHandler,
    directory=str(BASE_DIR)
)

server = ThreadingHTTPServer((HOST, PORT), handler)


# UI
root = tk.Tk()
root.withdraw()
root.attributes("-topmost", True)


def update_rating():
    rating = simpledialog.askinteger(
        "Rating",
        "Digite o novo rating:",
        parent=root,
        minvalue=0
    )

    if rating is not None:
        DATA_PATH.write_text(json.dumps({
            "rating": rating,
            "timestamp": int(time.time() * 1000)
        }))

        print(f"Rating atualizado: {rating}")


# Start
keyboard.add_hotkey(
    HOTKEY,
    lambda: root.after(0, update_rating)
)

threading.Thread(
    target=server.serve_forever,
    daemon=True
).start()

print(f"Servidor iniciado: http://{HOST}:{PORT}")
print(f"Atalho de atualização: {HOTKEY.upper()}")

try:
    root.mainloop()
finally:
    keyboard.unhook_all_hotkeys()
    server.shutdown()
    server.server_close()
