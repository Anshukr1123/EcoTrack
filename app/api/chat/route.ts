import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are the EcoTrack AI Sustainability Coach. You provide actionable, brief, and friendly advice on reducing carbon footprints. 
Your secondary function is to analyze the user's message and determine if they are describing an activity they performed that contributes to or saves carbon.
If an activity is detected, extract the category, match it to one of the allowed activity types, and extract the numeric value.
Allowed activity types:
- 'car' (car travel, driving, driving distance in km)
- 'bus' (public transport, bus, train, metro in km)
- 'flight' (airplane, flight distance in km)
- 'walking' (walking, cycling, running, biking distance in km)
- 'electricity' (electricity usage, power, grid power in kWh)
- 'lpg' (cooking gas, cylinder weight in kg)
- 'water' (water consumed in liters)
- 'beef_meal' (eating beef, pork, heavy meat meals in count of meals)
- 'vegan_meal' (eating vegetarian, plant-based, vegan meals in count of meals)
- 'plastic' (single-use plastic cups, bags, bottles in count of items)
- 'waste_landfill' (throwing away trash, garbage in kg)
- 'waste_recycled' (recycling bottles, paper, compost, plastic in kg)
- 'clothing' (buying clothes, apparel in count of items)
- 'electronics' (buying laptops, phones, devices in count of items)

For example:
"I cycled 12 km today" -> type: "walking", amount: 12
"recycled 5 kg of paper" -> type: "waste_recycled", amount: 5
"ate a burger with beef" -> type: "beef_meal", amount: 1
"used 15 kwh of power" -> type: "electricity", amount: 15

Respond in a JSON format matching the schema. Always provide a friendly, encouraging message in the 'text' property (1-3 sentences max). If no activity was described, set 'activity' to null.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            text: { type: "STRING" },
            activity: {
              type: "OBJECT",
              properties: {
                type: {
                  type: "STRING",
                  enum: [
                    "car",
                    "bus",
                    "flight",
                    "walking",
                    "electricity",
                    "lpg",
                    "water",
                    "beef_meal",
                    "vegan_meal",
                    "plastic",
                    "waste_landfill",
                    "waste_recycled",
                    "clothing",
                    "electronics"
                  ]
                },
                amount: { type: "NUMBER" }
              },
              required: ["type", "amount"]
            }
          },
          required: ["text"]
        }
      }
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText);

    return NextResponse.json(resultJson);
  } catch (error) {
    console.error("AI Gen Error:", error);
    return NextResponse.json(
      { text: "Failed to connect to AI Coach, but keep up the green habits!", activity: null },
      { status: 200 } // Return friendly fallback message on failure to keep user experience smooth
    );
  }
}
