This project is a dashboard for swimming events for the local community pool. It fetches events as a JSON from the pools scheduling API. The main goal is to show if the lanes and/or the kids pool are open. The file constants.js inside the src/utils folder has the keywords and event names we are filtering for, and applying logic on.

The eventParser.js file inside the src/utils folder has the logic for parsing the events and determining if the lanes and/or the kids pool are open, and for how long they are open.

That's the structure of the pool.json file which we fetch from the API:
```json
{
  "data": [
    {
      "id": "afb439df-50a8-4e6e-ae8b-497906d3ed08",
      "title": "Recreational Swim - 4 Lanes, Play & Therapy Pools Open",
      "start": "2025-12-07T07:30:00.000",
      "end": "2025-12-07T11:30:00.000",
      "backgroundColor": "#0000FF",
      "textColor": "#FFFFFF",
      "allDay": false
    },
    {
      "id": "d83e9235-e993-47f4-a586-5d1dded2c1dc",
      "title": "Lifesaving Club using 3 Lanes - 2 Lanes, Play & Therapy Pools Open",
      "start": "2025-12-07T11:30:00.000",
      "end": "2025-12-07T12:30:00.000",
      "backgroundColor": "#0000FF",
      "textColor": "#FFFFFF",
      "allDay": false
    },
    {
      "id": "e5bb2cd3-8387-420a-8bf0-408b4e6ada91",
      "title": "Public Swim - No Lanes, All Pools Available",
      "start": "2025-12-07T13:00:00.000",
      "end": "2025-12-07T16:00:00.000",
      "backgroundColor": "#0000FF",
      "textColor": "#FFFFFF",
      "allDay": false
    },
```

Never write dummy data or examples, always operate on the actual data. Never write long comments or tests or other explanations. Write in the view of a Principal Software Engineer, not as a LLM. Never add any emojis or other non-textual content. Never explain yourself to me via the comments, write comments for other devlopers. Never create overview markdown files.
