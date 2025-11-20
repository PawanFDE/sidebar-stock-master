const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL: GEMINI_API_KEY is not set in environment variables!");
} else {
  console.log("Gemini API Key found:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractInvoiceData(fileBuffer, mimeType, availableCategories = "") {
  try {
    const modelName = "gemini-2.5-flash";
    console.log("Using Gemini Model:", modelName);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
    });

    const categoryInstructions = availableCategories 
      ? `Available categories in the system: ${availableCategories}. Choose the MOST APPROPRIATE category from this list.`
      : `Category options: Electronics, Furniture, Office Supplies, Hardware, Clothing, Food & Beverage, or infer the most appropriate category.`;

    const prompt = `
      You are an expert at analyzing invoices and receipts. Carefully examine this image and extract the following information.
      
      Extract these fields in JSON format:
      - name: The main item/product name (be specific and concise)
      - category: ${categoryInstructions}
      - quantity: The quantity purchased (look for "Qty", "Quantity", or count. Default to 1 if not found)
      - minStock: Minimum stock level (if mentioned, otherwise use 5 as default)
      - supplier: The supplier/vendor/company name (look at the top of the invoice)
      - model: Model number, SKU, or product code (if visible)
      - location: Storage location if mentioned (otherwise leave as empty string)
      - description: A brief description of the item (combine details from the invoice)

      IMPORTANT INSTRUCTIONS:
      1. Look carefully at ALL text in the image, including headers, line items, and details
      2. If multiple items are listed, extract information for the FIRST or MOST PROMINENT item
      3. For the category field, you MUST choose from the available categories list if provided
      4. For unclear or missing fields, use reasonable defaults:
         - quantity: 1
         - minStock: 5
         - location: ""
      5. Return ONLY valid JSON - no markdown, no explanations, no extra text
      6. Ensure all string values are properly escaped

      Return format:
      {
        "name": "item name here",
        "category": "category from available list",
        "quantity": 1,
        "minStock": 5,
        "supplier": "supplier name",
        "model": "model/sku",
        "location": "",
        "description": "brief description"
      }
    `;

    const imagePart = {
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean up the response to ensure it's valid JSON
    let jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Try to parse the JSON
    let extractedData;
    try {
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw response:", text);
      
      // Return default structure if parsing fails
      return {
        name: "",
        category: "General",
        quantity: 1,
        minStock: 5,
        supplier: "",
        model: "",
        location: "",
        description: "Failed to extract data from invoice"
      };
    }
    
    // Ensure all required fields exist with defaults
    return {
      name: extractedData.name || "",
      category: extractedData.category || "General",
      quantity: extractedData.quantity || 1,
      minStock: extractedData.minStock || 5,
      supplier: extractedData.supplier || "",
      model: extractedData.model || "",
      location: extractedData.location || "",
      description: extractedData.description || ""
    };
  } catch (error) {
    console.error("Error extracting invoice data:", error);
    if (error.response) {
      console.error("Gemini API Error Response:", error.response);
    }
    throw new Error("Failed to process invoice with Gemini API: " + error.message);
  }
}

module.exports = { extractInvoiceData };
