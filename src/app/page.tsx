"use client";

import {useState, useRef, useEffect} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Scan, ShieldAlert, ImagePlus, FileText, XCircle} from "lucide-react";
import {analyzePhishingIndicators} from "@/ai/flows/analyze-phishing-indicators";
import {Toaster} from "@/components/ui/toaster";
import {useToast} from "@/hooks/use-toast";
import {useTransition, animated} from 'react-spring';
import {Progress} from "@/components/ui/progress";
import {AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"

const threatColors = {
  Safe: "text-green-500",
  Suspicious: "text-yellow-500",
  Dangerous: "text-red-500",
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emlFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedEmlFile, setSelectedEmlFile] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleEmlFileUpload = () => {
    emlFileInputRef.current?.click();
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

  const handleEmlFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedEmlFile(reader.result as string);
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
        emlFileDataUri: selectedEmlFile,
      });

      setAnalysisResult(result);
      setScanHistory(prevHistory => [result, ...prevHistory.slice(0, 9)]); // Save to scan history

    } catch (error: any) {
      console.error("Error analyzing content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAnalysis = () => {
    setInputText("");
    setSelectedImage(null);
    setSelectedEmlFile(null);
    setAnalysisResult(null);
  };


  const getProgressBarColor = () => {
    if (analysisResult?.threatLevel === "Dangerous") {
      return "bg-red-500";
    } else if (analysisResult?.threatLevel === "Suspicious") {
      return "bg-yellow-500";
    } else {
      return "bg-green-500";
    }
  };

  const transitions = useTransition(analysisResult, {
    from: {opacity: 0, transform: 'translateY(-20px)'},
    enter: {opacity: 1, transform: 'translateY(0px)'},
    leave: {opacity: 0, transform: 'translateY(-20px)'},
    config: {tension: 200, friction: 20},
  });

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-12 dark:bg-gray-900 bg-gray-100 transition-colors duration-300">
      <Toaster/>
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 dark:text-white animate-pulse">
        <span className="text-blue-500">Phish</span>Guard <span className="text-purple-500">AI</span>
      </h1>

      <TooltipProvider>
        <div className="flex items-center space-x-4 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} className="shadow-md"/>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>
              Toggle Dark Mode
            </TooltipContent>
          </Tooltip>
          <label htmlFor="dark-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">
            Dark Mode
          </label>
        </div>
      </TooltipProvider>

      <Card className="w-full max-w-2xl p-6 rounded-xl shadow-2xl hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-700 dark:text-gray-100">Real-time Analysis Dashboard</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Enter the email/message content or upload an image/email file to analyze for phishing indicators.
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
              className="rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-50"
            />

            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={handleImageUpload}
                disabled={loading}
                className="rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
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
               <Button
                variant="secondary"
                onClick={handleEmlFileUpload}
                disabled={loading}
                className="rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <FileText className="mr-2 h-4 w-4"/>
                Upload .eml File
              </Button>
              <input
                type="file"
                accept=".eml"
                onChange={handleEmlFileChange}
                ref={emlFileInputRef}
                style={{display: 'none'}}
              />
              {selectedEmlFile && (
                <div className="relative">
                    .EML File Uploaded
                </div>
              )}
            </div>

            <div className="flex space-x-2">
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

               {analysisResult && (
                  <Button
                      variant="outline"
                      onClick={handleClearAnalysis}
                      disabled={loading}
                      className="rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Clear Analysis
                  </Button>
              )}
            </div>
          </div>

          {transitions((style, item) =>
            item ? (
              <animated.div style={style} className="mt-6">
                {analysisResult?.isPhishing ? (
                  <Alert variant="destructive" className="rounded-md shadow-xl dark:bg-red-900 dark:border-red-800">
                    <ShieldAlert className="h-4 w-4"/>
                    <AlertTitle className="dark:text-red-50">Potential Phishing Threat Detected</AlertTitle>
                    <AlertDescription className="dark:text-red-200">
                      This content has been flagged as potentially malicious with a safety score of{" "}
                      {analysisResult.safetyScore?.toFixed(2) ?? '0.00'}.
                      <br/>
                      <strong className="font-bold">Threat Level:</strong> <span className={threatColors[analysisResult.threatLevel]}>{analysisResult.threatLevel}</span>
                      <br/>
                      <strong>Indicators:</strong> {analysisResult.indicators?.join(", ") ?? 'No indicators found.'}
                      <br/>
                      <strong>Risk Factors:</strong> {analysisResult.riskFactors?.join(", ") ?? 'No risk factors found.'}
                      <br/>
                      <strong>Explanation:</strong> {analysisResult.explanation ?? 'No explanation provided.'}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="rounded-md shadow-xl dark:bg-green-900 dark:border-green-800">
                    <ShieldAlert className="h-4 w-4"/>
                    <AlertTitle className="dark:text-green-50">Content Appears Safe</AlertTitle>
                    <AlertDescription className="dark:text-green-200">
                      This content appears to be safe with a safety score of {analysisResult?.safetyScore?.toFixed(2) ?? '1.00'}.
                      <br/>
                      <strong className="font-bold">Threat Level:</strong> <span className={threatColors[analysisResult.threatLevel]}>{analysisResult.threatLevel}</span>
                      <br/>
                      <strong>Explanation:</strong> {analysisResult.explanation ?? 'No explanation provided.'}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Threat Score:</p>
                  <Progress value={(analysisResult?.safetyScore ?? 1) * 100} className={getProgressBarColor()} />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">AI Recommendations:</p>
                  <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400">
                    <li>{analysisResult?.isPhishing ? "Delete email immediately." : "Content appears safe."}</li>
                    <li>{analysisResult?.isPhishing ? "Verify with the organization." : "No action needed."}</li>
                    <li>{analysisResult?.isPhishing ? "Report to IT team." : "Continue with caution."}</li>
                  </ul>
                </div>
              </animated.div>
            ) : null
          )}
        </CardContent>
      </Card>

       <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="mt-4">View Scan History</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Scan History</AlertDialogTitle>
            <AlertDialogDescription>
              Here are your last 10 scans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            {scanHistory.length > 0 ? (
              scanHistory.map((scan, index) => (
                <div key={index} className="border rounded-md p-4 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Scan {index + 1}:</p>
                  <p className={`text-sm ${scan.isPhishing ? 'text-red-500' : 'text-green-500'}`}>
                    {scan.isPhishing ? 'Potential Phishing Threat Detected' : 'Content Appears Safe'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Safety Score: {scan.safetyScore?.toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No scan history available.</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
