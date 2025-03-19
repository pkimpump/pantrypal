import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit?: string;
}

export async function analyzeReceipt(imageBase64: string): Promise<ReceiptItem[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this receipt and extract all food items with their quantities. Format the response as a JSON array of objects with 'name' and 'quantity' properties. For example: [{\"name\": \"Apples\", \"quantity\": 2}, {\"name\": \"Milk\", \"quantity\": 1, \"unit\": \"gallon\"}]"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const items = JSON.parse(content);
      return items as ReceiptItem[];
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Failed to parse receipt items');
    }
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    throw error;
  }
}

const receiptAnalyzer = {
  analyzeReceipt,
};

export default receiptAnalyzer; 