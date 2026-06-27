# bridge.py
from http.server import SimpleHTTPRequestHandler, HTTPServer

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # 1. Tell the browser we allow CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # 2. Prevent the browser from caching old data!
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    # 3. Handle the browser's "Preflight" checks gracefully
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    # 4. Silence the annoying network logs so you only see real print statements
    def log_message(self, format, *args):
        pass

print("Robust Bridge Server running on http://localhost:8000")
HTTPServer(('localhost', 8000), CORSRequestHandler).serve_forever()