import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Get the data from the frontend
    const body = await req.json();

    // 2. Check if the Cloud URL is set
    const latexServiceUrl = process.env.LATEX_SERVICE_URL;
    
    if (!latexServiceUrl) {
      console.error("LATEX_SERVICE_URL is missing in .env.local");
      return NextResponse.json(
        { error: "Server configuration error: Missing Latex URL" },
        { status: 500 }
      );
    }

    console.log("Forwarding request to Latex Engine:", `${latexServiceUrl}/generate`);

    // 3. Send data to Google Cloud Run
    const response = await fetch(`${latexServiceUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Latex Engine Error:", errorText);
      return NextResponse.json(
        { error: `Latex generation failed: ${errorText}` },
        { status: response.status }
      );
    }

    // 4. Send the PDF back to the frontend
    const pdfBuffer = await response.arrayBuffer();
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}