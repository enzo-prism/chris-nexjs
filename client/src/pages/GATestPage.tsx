import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackGAEvent } from "@/lib/analytics";
import { useState } from "react";
import MetaTags from "@/components/common/MetaTags";

export default function GATestPage() {
  const [eventsSent, setEventsSent] = useState<string[]>([]);

  const testEvent = (eventName: string, params?: Record<string, any>) => {
    trackGAEvent(eventName, params);
    const timestamp = new Date().toLocaleTimeString();
    setEventsSent(prev => [...prev, `${timestamp}: ${eventName} ${params ? JSON.stringify(params) : ''}`]);
  };

  return (
    <>
      <MetaTags
        title="Google Analytics Test Page"
        description="Internal testing page for Google Analytics events."
        robots="noindex, nofollow, noarchive"
      />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Google Analytics Test Page</CardTitle>
          <p className="text-sm text-gray-600">
            Testing new tracking ID: G-94WRBJY51J
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">✓ Google Analytics Updated Successfully</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Tracking ID updated in index.html</li>
              <li>• GoogleAnalytics component updated</li>
              <li>• Page view tracking active</li>
              <li>• Event tracking functional</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Test Event Tracking:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={() => testEvent('test_button_click', { button: 'primary' })}
                className="w-full"
              >
                Test Button Click Event
              </Button>
              <Button 
                onClick={() => testEvent('form_submission', { form_name: 'test_form' })}
                variant="outline"
                className="w-full"
              >
                Test Form Submission Event
              </Button>
              <Button 
                onClick={() => testEvent('page_interaction', { element: 'cta', action: 'hover' })}
                variant="secondary"
                className="w-full"
              >
                Test Page Interaction Event
              </Button>
              <Button 
                onClick={() => testEvent('conversion', { type: 'appointment_scheduled' })}
                variant="default"
                className="w-full"
              >
                Test Conversion Event
              </Button>
            </div>
          </div>

          {eventsSent.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Events Sent to GA:</h3>
              <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                <ul className="text-xs font-mono space-y-1">
                  {eventsSent.map((event, index) => (
                    <li key={index} className="text-gray-700">{event}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Verification Steps:</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Open your browser's Developer Tools (F12)</li>
              <li>2. Go to the Network tab</li>
              <li>3. Filter by "gtag" or "google"</li>
              <li>4. Click the test buttons above</li>
              <li>5. You should see requests to Google Analytics with tid=G-94WRBJY51J</li>
              <li>6. Check your Google Analytics Real-Time reports to see the events</li>
            </ol>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
