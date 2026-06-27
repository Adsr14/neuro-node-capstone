from mcp.server.fastmcp import FastMCP
import json

# Initialize the MCP server
mcp = FastMCP("NeuroNodeServer")

# Resource: The agent can 'read' the file through this
@mcp.resource("file://tasks.json")
def read_tasks_resource() -> str:
    """Returns the current state of tasks.json."""
    with open('tasks.json', 'r') as f:
        return f.read()

# Tool: The agent can 'call' this to update tasks
@mcp.tool()
def update_study_tasks(stress_level: float) -> str:
    """Updates tasks based on physiological stress."""
    with open('tasks.json', 'r') as f:
        data = json.load(f)
    
    # Logic: High stress = Priority override
    if stress_level > 0.7:
        for task in data['study_tasks']:
            task['urgency'] = 0.99
    
    with open('tasks.json', 'w') as f:
        json.dump(data, f, indent=2)
    return "Task priorities updated via MCP."

if __name__ == "__main__":
    mcp.run()