# API Documentation

EcoTrack AI exposes a lightweight serverless POST endpoint to safely interface with Google Gemini.

---

## POST `/api/chat`

Conversational coach chat route that parses natural language inputs and extracts carbon footprint activities using structured JSON schemas.

### Request Body

JSON object containing the user input string:

```json
{
  "prompt": "I drove 25 km in my car today and ate a plant-based lunch"
}
```

* **`prompt`**: `string` (Required). The conversational message to analyze. Must be a non-empty string.

### Response Codes

* **`200 OK`**: Prompt was successfully analyzed by the coach.
* **`400 Bad Request`**: Prompt is missing or has an invalid structure.

### Successful Response Schema (`200 OK`)

Returns a JSON object matching this schema:

```json
{
  "text": "That's fantastic! Choosing a plant-based meal significantly reduces your daily dietary emissions compared to meat. I can help log your 25 km car drive for you.",
  "activity": {
    "type": "car",
    "amount": 25
  }
}
```

* **`text`**: `string`. The conversational coaching message from Gemini.
* **`activity`**: `object | null`. The parsed activity. Set to `null` if no matching activity type is detected.
  * **`type`**: `string`. The parsed type. Must match one of: `car`, `bus`, `flight`, `walking`, `electricity`, `lpg`, `water`, `beef_meal`, `vegan_meal`, `plastic`, `waste_landfill`, `waste_recycled`, `clothing`, `electronics`.
  * **`amount`**: `number`. The parsed numerical value.

### Input Sanitation & Fail-Safe Handling

1. **HTML Strip**: All inputs have HTML tags stripped using regex patterns to avoid script injections.
2. **Credential Fallback**: If the `GEMINI_API_KEY` is not present, or if the API connection fails, the handler catches the exception and returns a friendly message to preserve user experience:
   ```json
   {
     "text": "Failed to connect to AI Coach, but keep up the green habits!",
     "activity": null
   }
   ```
   * *Status code*: Returns `200` to avoid crash notifications in the UI console.
3. **Empty Input**: Returns `400` with the response body:
   ```json
   {
     "text": "Please enter a valid message for the coach.",
     "activity": null
   }
   ```
