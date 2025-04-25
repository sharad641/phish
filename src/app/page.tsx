"use client";

import {useState, useRef, useEffect} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Scan, ShieldAlert, ImagePlus} from "lucide-react";
import {analyzePhishingIndicators} from "@/ai/flows/analyze-phishing-indicators";
import {Toaster} from "@/components/ui/toaster";
import {useToast} from "@/hooks/use-toast";
import {useTransition, animated} from 'react-spring';

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzePhishingIndicators({
        text: inputText,
        photoDataUri: selectedImage,
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing content:", error);
      toast({
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const transitions = useTransition(analysisResult, {
    from: {opacity: 0, transform: 'translateY(-20px)'},
    enter: {opacity: 1, transform: 'translateY(0px)'},
    leave: {opacity: 0, transform: 'translateY(-20px)'},
    config: {tension: 200, friction: 20},
  });

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-12 bg-gradient-to-br from-blue-100 to-purple-100">
      <Toaster/>
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 animate-pulse">
        <span className="text-blue-500">Phish</span>Guard <span className="text-purple-500">AI</span>
      </h1>

      <Card className="w-full max-w-2xl p-6 rounded-xl shadow-2xl hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-700">Real-time Analysis Dashboard</CardTitle>
          <CardDescription className="text-gray-500">
            Enter the email/message content or upload an image to analyze for phishing indicators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-4">
            <Input
              type="text"
              placeholder="Paste text or URL here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={handleImageUpload}
                disabled={loading}
                className="rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-200"
              >
                <ImagePlus className="mr-2 h-4 w-4"/>
                Upload Image
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{display: 'none'}}
              />
              {selectedImage && (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Uploaded"
                    className="w-24 h-24 object-cover rounded-md shadow-md"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors duration-300"
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4"/> Analyze
                </>
              )}
            </Button>
          </div>

          {transitions((style, item) =>
            item ? (
              <animated.div style={style} className="mt-6">
                {analysisResult.isPhishing ? (
                  <Alert variant="destructive" className="rounded-md shadow-xl">
                    <ShieldAlert className="h-4 w-4"/>
                    <AlertTitle>Potential Phishing Threat Detected</AlertTitle>
                    <AlertDescription>
                      This content has been flagged as potentially malicious with a safety score of{" "}
                      {analysisResult.safetyScore.toFixed(2)}.
                      <br/>
                      <strong>Indicators:</strong> {analysisResult.indicators.join(", ")}
                      <br/>
                      <strong>Explanation:</strong> {analysisResult.explanation}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="rounded-md shadow-xl">
                    <ShieldAlert className="h-4 w-4"/>
                    <AlertTitle>Content Appears Safe</AlertTitle>
                    <AlertDescription>
                      This content appears to be safe with a safety score of {analysisResult.safetyScore.toFixed(2)}.
                      <br/>
                      <strong>Explanation:</strong> {analysisResult.explanation}
                    </AlertDescription>
                  </Alert>
                )}
              </animated.div>
            ) : null
          )}
        </CardContent>
      </Card>
    </div>
  );
}
