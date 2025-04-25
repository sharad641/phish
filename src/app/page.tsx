"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Scan, ShieldAlert } from "lucide-react";
import { analyzePhishingIndicators } from "@/ai/flows/analyze-phishing-indicators";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [inputText, setInputText] = useState("Dear Customer,\n\nWe have noticed suspicious activity on your account. Please log in immediately to verify your details:\n\n[Suspicious Link]\n\nThank you for your prompt attention to this matter.\n\nSincerely,\nYour Bank");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
	const { toast } = useToast();

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzePhishingIndicators({ text: inputText });
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing text:", error);
      toast({  // toast is now in useToast hook
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-12 bg-background">
      <Toaster />
      <h1 className="text-4xl font-bold mb-8 text-foreground">
        <span className="text-primary">Phish</span>Guard <span className="text-primary">AI</span>
      </h1>

      <Card className="w-full max-w-2xl p-4">
        <CardHeader>
          <CardTitle>Real-time Analysis Dashboard</CardTitle>
          <CardDescription>
            Enter the email/message content or URL to analyze for phishing indicators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Input
              type="text"
              placeholder="Paste text or URL here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : <><Scan className="mr-2 h-4 w-4" /> Analyze</>}
            </Button>
          </div>

          {analysisResult && (
            <div className="mt-6">
              {analysisResult.isPhishing ? (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Potential Phishing Threat Detected</AlertTitle>
                  <AlertDescription>
                    This content has been flagged as potentially malicious with a safety score of{" "}
                    {analysisResult.safetyScore.toFixed(2)}.
                    <br />
                    <strong>Indicators:</strong> {analysisResult.indicators.join(", ")}
                    <br />
                    <strong>Explanation:</strong> {analysisResult.explanation}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Content Appears Safe</AlertTitle>
                  <AlertDescription>
                    This content appears to be safe with a safety score of {analysisResult.safetyScore.toFixed(2)}.
                    <br />
                    <strong>Explanation:</strong> {analysisResult.explanation}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
