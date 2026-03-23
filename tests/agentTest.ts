import { Output, tool, ToolLoopAgent } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import z from 'zod';

const op = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

// function runTradingAgent(tools: ToolSet){
try{
  
const tradingAgent = new ToolLoopAgent({
  model: op.chat("mistralai/devstral-2512:free"),
  output: Output.object({
    schema: z.object({
      weather: z.string(),
      location: z.string(),
      reason: z.string()
    })
  }),
  tools: {
    weatherTool: tool({
      description: "Tool to get the weather of any place by name.",
      inputSchema: z.object({
        name: z.string()
      }),
      execute: async ({ name }) => {
        return { weather: `The weather in the city ${name} is 30 degrees celcius.`}
      }
    })
  },
  instructions: "You are a helpful assistant.This is test runs don't complicate this just use tools and answer.",
  maxOutputTokens: 300,
})
// }
const answer = await tradingAgent.generate({
  prompt: "What is the weather of beijing."
})

for ( const message of answer.response.messages){
  if(message.role === 'assistant'){
    console.log("Assistant: ",message.content)
  }
  else if(message.role === 'tool'){
    console.log("Tool: ",message.content)
  }
}
console.log("Text: ",answer.output)


}
catch( error ){
  console.error(error)
}