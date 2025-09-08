# Gemini Code Assist & MCP Collaboration Workflow

This document outlines the standard operating procedure for collaborating on this project using Gemini Code Assist and the Model Context Protocol (MCP) tool server.

The goal is to provide a consistent, repeatable workflow that can be initiated from a "clean slate" (e.g., a new chat session or after restarting the IDE) without relying on prior conversation history.

## The Core Workflow

The entire development process is driven by a single, high-level tool: `implement_feature`. This tool orchestrates the planning, code generation, and application of changes for any new feature request.

### How to Initiate Work

To start working on a new feature, the user (you) will instruct Gemini Code Assist (me) to use the `implement_feature` tool with a clear, high-level description of the desired feature.

**Your instruction should follow this format:**

> "Use the `implement_feature` tool to [describe the feature you want]."

**Examples:**

*   "Use the `implement_feature` tool to add a heatmap layer to the React map."
*   "Use the `implement_feature` tool to create a new UI component for filtering crime types."
*   "Use the `implement_feature` tool to refactor the Map component to use React hooks."

### What Happens Next (The Automated Process)

When I receive this instruction, I will execute the following steps using the MCP tools:

1.  **Plan:** I will call the `q_plan` tool to break down your feature request into a series of smaller, actionable tasks.
2.  **Generate Code:** For each task in the plan, I will call the `q_codegen` tool to generate the necessary code changes in the form of a `git diff`.
3.  **Apply Changes:** I will use the `apply_diff` tool to apply all the generated diffs to your local files. This will stage the changes in Git, but **it will not commit them**.

### Your Role: Review and Commit

After I have completed the process, the new feature will be staged in your local Git repository. Your responsibility is to:

1.  **Review the staged changes** in your IDE to ensure they meet your expectations.
2.  **Run `git commit`** to save the work to the repository's history.