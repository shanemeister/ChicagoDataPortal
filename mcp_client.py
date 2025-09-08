#!/usr/bin/env python3
import subprocess
import json
import sys
import os
import threading

class MCPClient:
    """
    A client for communicating with an MCP server over stdio.

    This class demonstrates the correct way to interact with the server.py script:
    1. It spawns server.py as a child process.
    2. It communicates by writing JSON-RPC messages to the process's stdin
       and reading responses from its stdout.
    """
    def __init__(self, server_path, python_executable=sys.executable):
        self.server_path = server_path
        self.python_executable = python_executable
        self._proc = None
        self._request_id = 1

    def start(self):
        """Starts the MCP server as a subprocess."""
        if self._proc and self._proc.poll() is None:
            print("Client is already running.", file=sys.stderr)
            return

        print(f"Starting MCP server: {self.server_path}", file=sys.stderr)
        self._proc = subprocess.Popen(
            [self.python_executable, self.server_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,  # Capture server logs separately
            text=True,
            bufsize=1  # Line-buffered
        )
        # Start a thread to print server logs (stderr) without blocking
        self._log_thread = threading.Thread(target=self._log_reader, daemon=True)
        self._log_thread.start()
        print("MCP server process started.", file=sys.stderr)

    def _log_reader(self):
        """Reads and prints the server's stderr stream."""
        for line in iter(self._proc.stderr.readline, ''):
            print(f"[SERVER LOG]: {line.strip()}", file=sys.stderr)

    def stop(self):
        """Terminates the MCP server process."""
        if self._proc:
            print("Stopping MCP server...", file=sys.stderr)
            self._proc.terminate()
            try:
                self._proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self._proc.kill()
            self._proc = None
            print("MCP server stopped.", file=sys.stderr)

    def call(self, tool_name, arguments=None):
        """
        Sends a 'tools/call' request to the MCP server and gets the response.
        """
        if not self._proc or self._proc.poll() is not None:
            raise RuntimeError("Server is not running. Call start() first.")

        # Construct the JSON-RPC request
        request = {
            "jsonrpc": "2.0",
            "id": self._request_id,
            "method": "tools/call",
            "params": {"name": tool_name, "arguments": arguments or {}}
        }
        self._request_id += 1

        # Write the request to the server's stdin
        self._proc.stdin.write(json.dumps(request) + "\n")
        self._proc.stdin.flush()

        # Read the response from the server's stdout
        response_line = self._proc.stdout.readline()
        if not response_line:
            raise ConnectionError("Did not receive a response from the server.")
        
        return json.loads(response_line)

    def list_tools(self):
        """
        Sends a 'tools/list' request to the MCP server to discover tools.
        """
        if not self._proc or self._proc.poll() is not None:
            raise RuntimeError("Server is not running. Call start() first.")

        # Construct the JSON-RPC request for tool discovery
        request = {
            "jsonrpc": "2.0",
            "id": self._request_id,
            "method": "tools/list",  # The method is 'tools/list' directly
            "params": {}
        }
        self._request_id += 1

        self._proc.stdin.write(json.dumps(request) + "\n")
        self._proc.stdin.flush()

        response_line = self._proc.stdout.readline()
        if not response_line:
            raise ConnectionError("Did not receive a response from the server for tools/list.")
        
        return json.loads(response_line)

if __name__ == "__main__":
    # --- Demonstration for another AI ---
    # This script shows how to use the MCP tools.

    # 1. Define the path to the server script, now located in the qbridge directory.
    home_dir = os.path.expanduser("~")
    server_script_path = os.path.join(home_dir, "qbridge", "server.py")

    # 2. Instantiate and start the client. This spawns server.py.
    client = MCPClient(server_path=server_script_path)
    client.start()

    try:
        # 3. DEMO 1: Discover available tools using the built-in 'tools/list' method.
        # An AI should do this first to understand its capabilities.
        print("\n--- DEMO 1: Discovering available tools ---")
        tool_list_response = client.list_tools()
        print(json.dumps(tool_list_response, indent=2))

        # 4. DEMO 2: Check the repo status before making changes.
        print("\n--- DEMO 2: Checking repository status ---")
        repo_path = os.path.dirname(os.path.abspath(__file__))
        status_args = {"repo_root": repo_path}
        status_response = client.call("get_repo_status", status_args)
        print(json.dumps(status_response, indent=2))

        # 5. DEMO 3: Implement a new feature using the high-level tool.
        # This is the primary workflow. Instead of asking me to "plan",
        # you can now ask me to "use the implement_feature tool".
        print("\n--- DEMO 3: Implementing a new feature ---")
        feature_args = {"feature_spec": "Add a heatmap layer to the map to visualize crime data.", "repo_root": repo_path}
        # implement_response = client.call("implement_feature", feature_args)
        # print(json.dumps(implement_response, indent=2))

    except Exception as e:
        print(f"\nAn error occurred: {e}", file=sys.stderr)
    finally:
        # 5. Clean up by stopping the server process.
        client.stop()