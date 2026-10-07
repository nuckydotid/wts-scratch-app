# Models

## Reasoning Model

For the core reasoning model, Antigravity offers leading frontier models. Availability depends on your plan:

| Model                                                            | Free & Google AI Plus | Google AI Pro | Google AI Ultra | Enterprise |
| ---------------------------------------------------------------- | --------------------- | ------------- | --------------- | ---------- |
| [Gemini 3.7 Flash](/blog/gemini-3-7-flash-in-google-antigravity) | ✅                    | ✅            | ✅              | ✅         |
| [Gemini 3.6 Flash](/blog/gemini-3-6-flash-in-google-antigravity) | ✅                    | ✅            | ✅              | ✅         |
| [Gemini 3.5 Flash](/blog/gemini-3-5-flash-in-google-antigravity) | ✅                    | ✅            | ✅              | ✅         |
| [Gemini 3.1 Pro](/blog/gemini-3-1-pro-in-google-antigravity)     | ✅                    | ✅            | ✅              | ✅         |
| Claude Sonnet 4.6 (thinking)                                     | ✅                    | ✅            | ✅              | ❌         |
| Claude Opus 4.6 (thinking)                                       | ✅                    | ✅            | ✅              | ❌         |
| GPT-OSS-120b                                                     | ✅                    | ✅            | ✅              | ❌         |

Users can select which reasoning model they want to use within the model selector drop-down under the conversation prompt box:

Model

Gemini 3.7 FlashMedium

Fast

LowMediumHigh

Gemini 3.6 FlashMedium

Fast

LowMediumHigh

Gemini 3.5 FlashMedium

Fast

LowMediumHigh

Gemini 3.1 ProHigh

LowHigh

Claude Sonnet 4.6 (Thinking)

Claude Opus 4.6 (Thinking)

GPT-OSS 120B (Medium)

View Usage

Gemini Models

Weekly Limit Remaining

100%

Five Hour Limit Remaining

100%

Claude and GPT models

Weekly Limit Remaining

100%

Five Hour Limit Remaining

100%

The choice of reasoning model is sticky between user messages within a conversation, so if you change the reasoning model while the Agent is running, it will continue to use the previously selected reasoning model until it has completed its steps for that user turn (or until you cancel the current execution).

Learn more about reasoning model rate limits in [our plans page](/docs/plans).

## Additional Models

Antigravity uses a number of other models for various parts of the stack that are not customizable:

- **[Nano Banana 2](/blog/nano-banana-pro)**: Used by the generative image tool when the Agent wants to produce a UI mockup, needs images to populate a web page or application, generate system or architecture diagrams, or other generative image tasks.
