import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { resumeText, jobDetails } = body

    if (!resumeText || !jobDetails) {
      return NextResponse.json({ error: "Resume text and job details are required" }, { status: 400 })
    }

    const systemPrompt = `
You are an expert HR assistant that analyzes resumes against job descriptions. Provide a match percentage (0-100) and a brief explanation of the match.
    `

    const userPrompt = `
Analyze this resume against the job description and provide a match percentage (0-100) and brief explanation. Format your response as JSON with "score" (number) and "explanation" (string) fields.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDetails}
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    })

    const text = completion.choices[0]?.message?.content || ""

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    let result

    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[0])
      } catch {
        const scoreMatch = text.match(/score["\s:]+(\d+)/i)
        const explanation = text.replace(/\{[\s\S]*\}/, "").trim()

        result = {
          score: scoreMatch ? Number.parseInt(scoreMatch[1]) : 70,
          explanation: explanation || "Analysis complete",
        }
      }
    } else {
      result = {
        score: 70,
        explanation: text,
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in resume matching:", error)
    return NextResponse.json({ error: "Failed to process resume matching" }, { status: 500 })
  }
}
