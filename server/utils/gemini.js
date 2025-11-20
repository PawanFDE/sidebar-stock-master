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
      You are an expert at analyzing invoices and receipts. Carefully examine this image and extract information for ALL items listed.
      
      Extract these fields for EACH item in JSON format:
      - name: The item/product name (be specific and concise)
      - category: ${categoryInstructions}
      - quantity: The quantity purchased (look for "Qty", "Quantity", or count. Default to 1 if not found)
      - minStock: Minimum stock level (if mentioned, otherwise use 5 as default)
      - supplier: The supplier/vendor/company name (look at the top of the invoice - this will be the same for all items)
      - model: Model number, SKU, or product code (if visible)
      - serialNumber: Serial number(s), S/N, Serial No, or any alphanumeric codes that look like serial numbers (if multiple, separate with commas). Look carefully for any codes labeled as "Serial", "S/N", "Serial Number", or similar identifiers.
      - warranty: Warranty period or duration (e.g., "3 Years", "12 Months", "2 Years Warranty"). Look for text mentioning warranty, guarantee, or coverage period.
      - location: Storage location if mentioned (otherwise leave as empty string)
      - description: A brief description of the item (combine details from the invoice)

      IMPORTANT INSTRUCTIONS:
      1. Look carefully at ALL text in the image, including headers, line items, and details
      2. Extract information for EVERY item listed in the invoice - create a separate object for each item
      3. If only ONE item is present, return an array with one object
      4. For the category field, you MUST choose from the available categories list if provided
      5. The supplier name is usually at the top of the invoice and is the SAME for all items
      6. For unclear or missing fields, use reasonable defaults:
         - quantity: 1
         - minStock: 5
         - location: ""
      7. Return ONLY valid JSON array - no markdown, no explanations, no extra text
      8. Ensure all string values are properly escaped

      Return format (MUST be an array):
      [
        {
          "name": "first item name",
          "category": "category from available list",
          "quantity": 1,
          "minStock": 5,
          "supplier": "supplier name",
          "model": "model/sku",
          "serialNumber": "SN123456",
          "warranty": "3 Years",
          "location": "",
          "description": "brief description"
        },
        {
          "name": "second item name",
          "category": "category from available list",
          "quantity": 2,
          "minStock": 5,
          "supplier": "supplier name",
          "model": "model/sku2",
          "serialNumber": "SN123457",
          "warranty": "3 Years",
          "location": "",
          "description": "brief description"
        }
      ]
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
      console.log("Extracted data from Gemini:", extractedData);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw response:", text);
      
      // Return default structure if parsing fails
      return [{
        name: "",
        category: "General",
        quantity: 1,
        minStock: 5,
        supplier: "",
        model: "",
        serialNumber: "",
        warranty: "",
        location: "Warehouse - General",
        description: "Failed to extract data from invoice"
      }];
    }
    
    // Ensure we have an array (backward compatibility if single object is returned)
    const itemsArray = Array.isArray(extractedData) ? extractedData : [extractedData];
    
    // Ensure all required fields exist with defaults for each item
    return itemsArray.map(item => ({
      name: item.name || "",
      category: item.category || "General",
      quantity: item.quantity || 1,
      minStock: item.minStock || 5,
      supplier: item.supplier || "",
      model: item.model || "",
      serialNumber: item.serialNumber || "",
      warranty: item.warranty || "",
      location: item.location || "Warehouse - General",
      description: item.description || ""
    }));
  } catch (error) {
    console.error("Error extracting invoice data:", error);
    if (error.response) {
      console.error("Gemini API Error Response:", error.response);
    }
    throw new Error("Failed to process invoice with Gemini API: " + error.message);
  }
}

module.exports = { extractInvoiceData };
