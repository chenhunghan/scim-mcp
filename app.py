import os

import gradio as gr
import requests
from huggingface_hub import InferenceClient

# Initialize Hugging Face Inference Client
# Uses HF_TOKEN from environment (optional, but gives higher rate limits)
client = InferenceClient()

# MCP server configuration
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:3001/mcp")

def call_mcp_tool(tool_name, parameters):
    """Call an MCP tool via HTTP"""
    try:
        response = requests.post(
            MCP_SERVER_URL,
            json={
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {
                    "name": tool_name,
                    "arguments": parameters
                }
            },
            headers={
                "Content-Type": "application/json",
                # Add SCIM credentials if needed
                "x-scim-api-token": os.getenv("SCIM_API_TOKEN", ""),
                "x-scim-base-url": os.getenv("SCIM_BASE_URL", "")
            }
        )
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def chat_with_mcp(message, history):
    """
    Chat function using Hugging Face's free LLM with MCP tool access.
    
    Args:
        message: Current user message
        history: List of [user_msg, assistant_msg] pairs from previous turns
    
    Returns:
        Assistant's response
    """
    # Build conversation context
    conversation = ""
    for user_msg, assistant_msg in history:
        conversation += f"User: {user_msg}\nAssistant: {assistant_msg}\n"
    
    # Add system prompt with available tools
    system_prompt = """You are a helpful assistant with access to SCIM user provisioning tools.
Available tools:
- create-user: Create a new SCIM user
- create-group: Create a new SCIM group
- patch-user: Update user attributes
- delete-user: Delete a user
- add-user-to-group: Add user to a group

When a user asks you to perform SCIM operations, acknowledge that you understand and describe what would happen."""
    
    full_prompt = f"{system_prompt}\n\n{conversation}User: {message}\nAssistant:"
    
    # Call Hugging Face Inference API with a free model
    # Options: meta-llama/Llama-3.2-3B-Instruct, microsoft/Phi-3-mini-4k-instruct, 
    #          mistralai/Mistral-7B-Instruct-v0.3, Qwen/Qwen2.5-7B-Instruct
    response = client.text_generation(
        full_prompt,
        model="Qwen/Qwen2.5-7B-Instruct",
        max_new_tokens=1000,
        temperature=0.7,
        return_full_text=False
    )
    
    return response

# Create chat interface
demo = gr.ChatInterface(
    fn=chat_with_mcp,
    title="Chat with Claude + SCIM MCP",
    description="Chat with Claude AI that has access to SCIM provisioning tools via MCP",
    examples=[
        "Create a user named John Doe with email john.doe@example.com",
        "What SCIM tools do you have access to?",
        "Show me user information for user ID 12345"
    ],
    retry_btn="Retry",
    undo_btn="Undo",
    clear_btn="Clear"
)

if __name__ == "__main__":
    demo.launch()