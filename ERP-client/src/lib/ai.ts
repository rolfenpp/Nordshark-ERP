import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
})

const erpKnowledge = {
  inventory: {
    createItem: "Go to Inventory → Create New Item → Fill in name, category, price, stock level",
    bulkImport: "Use CSV import: Inventory → Import → Download template → Upload filled file",
    categories: "Available categories: Machine Parts, Electronics, Office Supplies, Tools",
    updateStock: "Inventory → Find Item → Edit → Update Stock Level → Save",
    reports: "Inventory → Reports → Stock Levels, Low Stock, Value Report"
  },
  invoices: {
    createInvoice: "Invoices → New Invoice → Select customer → Add items → Set payment terms",
    paymentTerms: "Net 30, Net 60, Due on Receipt, Custom terms available",
    sendInvoice: "Invoice → Send → Email or Download PDF",
    trackPayment: "Invoices → View → Payment Status → Mark as Paid",
    reminders: "Invoices → Overdue → Send Reminder"
  },
  projects: {
    createProject: "Projects → New Project → Name, client, start date, budget",
    addTasks: "Project → Tasks → Add Task → Description, assignee, due date",
    trackProgress: "Project → Dashboard → Progress bars, task completion",
    timeTracking: "Project → Time → Start Timer → Stop → Log hours"
  },
  users: {
    addUser: "Users → Add User → Email, role, permissions → Send invite",
    manageRoles: "Users → Roles → Admin, Manager, User, Viewer",
    permissions: "Admin: Full access, Manager: Project/Team access, User: Limited access"
  }
}

export const askAI = async (question: string, context: any) => {
  try {
    const prompt = `You are Nordshark ERP's AI assistant. Help users navigate the system effectively.

CONTEXT:
- Current page: ${context.currentPage}
- User: ${context.currentUser || 'Unknown'}
- Available features: ${context.availableFeatures.join(', ')}
- User permissions: ${context.userPermissions || 'Standard'}

ERP KNOWLEDGE BASE:
${JSON.stringify(erpKnowledge, null, 2)}

USER QUESTION: "${question}"

RESPONSE GUIDELINES:
1. Be specific about navigation (exact menu names, button labels)
2. Include keyboard shortcuts if available
3. Use step-by-step numbered lists
4. Keep responses under 200 words
5. Reference the knowledge base above for accurate information
6. Write "add" correctly, NEVER write "ooadd"
7. Use proper spelling and grammar

FORMAT YOUR RESPONSE:
- Use clear, numbered steps
- Put UI elements in "quotes" (NOT bold formatting)
- Use bullet points for options
- End with a helpful tip

EXAMPLE:
To add something to your inventory:

1. Navigate to the "Inventory" section
2. Click "Create New Item"  
3. Fill in: Name, Category, Price, Stock Level
4. Click "Save"

Use quotes around buttons and menu names.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    })
    
    const responseText = response.text || 'Sorry, I could not generate a response.'
    console.log('AI Response Debug:', {
      question,
      rawResponse: response,
      responseText,
      hasText: !!response.text
    })
    
    return responseText
  } catch (error) {
    console.error('AI API Error:', error)
    return 'Sorry, I encountered an error. Please try again.'
  }
}