export const COMPLETION_TEMPLATE = {
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: [
        {
          type: "text",
          text: "Create four functions for a bill-checking chatbot: creating a bill, retrieving menus from a bill, recording a member's payment, and checking which members have already paid their portion.\n\n# Steps\n\n1. **Create Bill Function**\n   - Function Name: `create_bill()`\n   - Input: A list containing menu details (name, quantity, price).\n   - Define a bill structure containing:\n     - A bill ID (Generated internally for tracking each bill).\n     - A list of menu items with each item's name, quantity, and net price.\n   - Return: Bill ID after successful bill creation.\n\n2. **Check Menus by Bill ID Function**\n   - Function Name: `get_menu_items()`\n   - Input: Bill ID.\n   - Retrieve menu items for a particular bill by providing its bill ID.\n   - Return: List of menus in the bill (including name, quantity, and net price).\n\n3. **Create Bill Payment for Member Function**\n   - Function Name: `create_payment()`\n   - Input: Bill ID, Member Name, Total Payment.\n   - Record a payment made by a specific member for a selected bill.\n   - Add this payment to a list of payments made for the bill with details (member name and amount paid).\n   - Return: Confirmation of payment recorded.\n\n4. **Check Members' Payment for a Bill Function**\n   - Function Name: `get_paid_members()`\n   - Input: Bill ID.\n   - Check payments for a given bill ID and retrieve all member details of those who have paid.\n   - Return: List of members who have paid their portion along with the total paid amount.\n\n# Output Format\n\nThe functions should return responses as follows:\n- `create_bill()`: Return a string with the value of Bill ID.\n- `get_menu_items()`: Return a list of dictionaries, each containing 'menu_name', 'quantity', and 'net_price'.\n- `create_payment()`: Return a string confirming that payment has been recorded for the member.\n- `get_paid_members()`: Return a list of dictionaries, each containing 'member_name' and 'amount_paid'.\n\n# Examples\n\n**Example for `create_bill()`:**\n\n- **Input**: `create_bill([{'menu_name': 'Pizza', 'quantity': 2, 'net_price': 20}, {'menu_name': 'Pasta', 'quantity': 1, 'net_price': 10}])`\n- **Output**: `\"Bill ID: b123\"`\n\n**Example for `get_menu_items()`:**\n\n- **Input**: `get_menu_items('b123')`\n- **Output**: `[{ 'menu_name': 'Pizza', 'quantity': 2, 'net_price': 20}, { 'menu_name': 'Pasta', 'quantity': 1, 'net_price': 10}]`\n\n**Example for `create_payment()`:**\n\n- **Input**: `create_payment('b123', 'Alice', 25)`\n- **Output**: `\"Successfully recorded payment of 25 from Alice for bill ID: b123\"`\n\n**Example for `get_paid_members()`:**\n\n- **Input**: `get_paid_members('b123')`\n- **Output**: `[{ 'member_name': 'Alice', 'amount_paid': 25}]`",
        },
      ],
    },
  ],
  response_format: {
    type: "text",
  },
  tools: [
    {
      type: "function",
      function: {
        name: "create_bill",
        description:
          "Create bill from the content text returned from the AI Form Recognizer (Azure) and analyze it to return it as JSON.",
        parameters: {
          type: "object",
          required: ["content_text"],
          properties: {
            content_text: {
              type: "string",
              description:
                "The text content extracted from the AI Form Recognizer that needs to be analyzed for bill creation.",
            },
          },
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "check_menus_in_bill",
        description: "Check menus in a bill by bill ID",
        parameters: {
          type: "object",
          required: ["bill_id"],
          properties: {
            bill_id: {
              type: "string",
              description: "Unique identifier for the bill",
            },
          },
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "confirm_payment",
        description:
          "Inform that you have paid by passing your name and total.",
        parameters: {
          type: "object",
          required: ["name", "total"],
          properties: {
            name: {
              type: "string",
              description: "The name of the person making the payment.",
            },
            total: {
              type: "number",
              description: "The total amount that has been paid.",
            },
          },
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "check_paid_members",
        description:
          "Checks other members that already paid for the bill by giving bill id",
        parameters: {
          type: "object",
          required: ["bill_id", "include_details"],
          properties: {
            bill_id: {
              type: "string",
              description:
                "Unique identifier for the bill to check payment status",
            },
            include_details: {
              type: "boolean",
              description:
                "Flag to include additional details about the members who paid",
            },
          },
          additionalProperties: false,
        },
        strict: true,
      },
    },
  ],
  temperature: 1,
  max_tokens: 2048,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
