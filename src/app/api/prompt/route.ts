import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.API_KEY});


export async function POST(request: NextRequest) {    
    
    let formData: FormData;
    let file: File;
    let prompt: string;
    let base64: string;

    try {        
        formData = await request.formData();
        file = formData.get('file') as File;
        prompt = formData.get('prompt')?.toString() || process.env.DEFAULT_PROMPT || ""
        
        const fileArrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer)
        base64 = fileBuffer.toString('base64')        
        
    }  catch (error) {        
        console.log(error)
        return NextResponse.json({ error: error}, { status: 500})

    }
        
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [              
              { type: "text", text: prompt},
              {
                type: "image_url",
                image_url: {
                  "url": `data:${file.type};base64,${base64}`,
                },
              },
            ],
            
          },
        ],
        
      });
          
  
    return new Response(JSON.stringify({ data: response.choices[0].message.content }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
  }
  