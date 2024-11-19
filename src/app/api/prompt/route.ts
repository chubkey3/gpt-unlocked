import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionContentPart } from "openai/resources/index.mjs";

const openai = new OpenAI({apiKey: process.env.API_KEY});


export async function POST(request: NextRequest) {    
                
    const content: Array<ChatCompletionContentPart> = [];

    try {        
        const formData = await request.formData();        
        const files = formData.getAll('file[]') as File[];        
        
        const prompt = formData.get('prompt')?.toString() || process.env.DEFAULT_PROMPT || ""
        
        for (let i = 0; i < files.length; i++) {
          const fileArrayBuffer = await files[i].arrayBuffer();
          const fileBuffer = Buffer.from(fileArrayBuffer)          

          content.push({ type: "text", text: prompt})
          content.push({
            type: "image_url",
            image_url: {
              "url": `data:${files[i].type};base64,${fileBuffer.toString('base64')}`
            }
          })
        }                

    }  catch (error) {        
        console.log(error)
        return NextResponse.json({ error: error}, { status: 500})

    }
    

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: content,            
          },
        ],
        
      });
          
  
    return new Response(JSON.stringify({ data: response.choices[0].message.content }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
  }
  