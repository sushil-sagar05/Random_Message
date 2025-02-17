import { google } from '@ai-sdk/google';   
import { streamText } from 'ai';  
import { NextResponse } from 'next/server';

const model = google("gemini-1.5-flash");

export const runtime = 'edge';  

export async function POST(req: Request) {
    try {
        const prompt =  "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
        
        const { textStream } = await streamText({
            model,
            prompt,
        });

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const text of textStream) {
                        // Push each chunk of data to the stream
                        controller.enqueue(text);
                    }
                    // Close the stream once all data is processed
                    controller.close();
                } catch (error) {
                    // In case of error, signal that the stream is done
                    controller.error(error);
                }
            }
        });

        // Return the stream to the client in the response
        return new NextResponse(readableStream, {
            headers: {
                'Content-Type': 'text/Stream', // Or any other appropriate content type
            },
        });
        
    } catch (error) {
        console.error("Error processing the request:", error);
        return NextResponse.json({ success: false, message: 'Error processing request' }, { status: 500 });
    }
}
