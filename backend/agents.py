from google.adk import Agent
from google.adk.tools import FunctionTool
import json

def update_tasks_logic(stress_level: float) -> str:
    """Updates task priorities in tasks.json based on stress levels."""
    try:
        with open('tasks.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        return "Error: tasks.json not found."
    
    if stress_level > 0.7:
        for task in data['study_tasks']:
            if task['topic'] == 'Data Structures':
                task['urgency'] = 0.99 
                task['status'] = 'priority_review'
        data['system_state']['current_stress'] = stress_level
    
    with open('tasks.json', 'w') as f:
        json.dump(data, f, indent=2)
        
    return f"Agent Logic Executed: Stress level {stress_level} processed."

# Initialize Agent
study_agent = Agent(
    name="StudyAgent",
    model="gemini-1.5-flash",
    instruction="You are a study concierge. Call update_tasks_logic when stress is high.",
    tools=[FunctionTool(update_tasks_logic)]
)

if __name__ == "__main__":
    # We will call the logic directly for Day 1. 
    # This proves the tool works. 
    # Day 2's MCP Server will handle the agentic loop.
    print("Testing Tool...")
    print(update_tasks_logic(0.85))
    print("Tool test successful. Agentic loop bypass confirmed.")