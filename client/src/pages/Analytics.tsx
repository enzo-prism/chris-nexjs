"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, MessageCircle, Phone, TrendingUp, Eye, MousePointer, Target, Globe, Clock, Star, CheckCircle2, AlertCircle, Search, MapPin, ScrollText, Zap, Award } from "lucide-react";
import MetaTags from "@/components/common/MetaTags";
import { pageTitles } from "@/lib/metaContent";
import { Appointment, ContactMessage, Service, Testimonial } from "@shared/schema";
import { julyAnalyticsData } from "@/data/analytics-july-2025";

const COLORS = ['#005f40', '#00a86b', '#4ade80', '#86efac', '#bbf7d0'];
const data = julyAnalyticsData;

function PasswordDialog({ open, onOpenChange, onAuthenticate }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onAuthenticate: () => void; 
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "chris") {
      onAuthenticate();
      onOpenChange(false);
      setError("");
      setPassword("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Analytics Dashboard</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Access Dashboard
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Analytics() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Check for existing session
  useEffect(() => {
    const authStatus = sessionStorage.getItem("analytics-auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      setShowPasswordDialog(true);
    }
  }, []);

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("analytics-auth", "true");
  };

  // Format acquisition data for pie chart
  const acquisitionData = Object.entries(data.acquisition.firstTimeUsers).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    value: value
  }));

  if (!isAuthenticated) {
    return (
      <>
        <MetaTags 
          title="Analytics Dashboard - Access Restricted"
          description="Secure analytics dashboard for practice performance metrics"
        />
        <PasswordDialog 
          open={showPasswordDialog} 
          onOpenChange={setShowPasswordDialog}
          onAuthenticate={handleAuthenticate}
        />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>Please authenticate to view the analytics dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowPasswordDialog(true)}
                className="w-full"
              >
                Enter Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaTags 
        title="Analytics Dashboard | Practice Performance Metrics"
        description="Comprehensive analytics dashboard showing marketing performance and practice metrics"
        robots="noindex, nofollow, noarchive"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-lg text-gray-600">July 2025 Performance Report</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Last updated: {data.period.lastUpdated}
            </div>
          </div>

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>{data.executive.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <p className="text-sm text-gray-600">New Users</p>
                  <p className="text-2xl font-bold">{data.executive.newUsers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Returning Users</p>
                  <p className="text-2xl font-bold">{data.executive.returningUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{data.executive.activeUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mobile Share</p>
                  <p className="text-2xl font-bold">{data.executive.mobileShare}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Session</p>
                  <p className="text-2xl font-bold">{data.executive.avgSessionDuration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bounce Rate</p>
                  <p className="text-2xl font-bold">{data.executive.bounceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="acquisition" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="reputation">Reputation</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
              <TabsTrigger value="targets">Targets</TabsTrigger>
            </TabsList>

            {/* Acquisition Tab */}
            <TabsContent value="acquisition" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>First-Time Users by Source</CardTitle>
                    <CardDescription>How new visitors are finding your practice</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={acquisitionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {acquisitionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sessions by Source</CardTitle>
                    <CardDescription>Traffic volume from each platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.acquisition.sessionsBySource}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="source" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sessions" fill="#005f40" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Cities</CardTitle>
                  <CardDescription>Geographic distribution of your visitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {data.acquisition.topCities.map((city, index) => (
                      <Badge key={city} variant={index < 3 ? "default" : "secondary"}>
                        <MapPin className="w-3 h-3 mr-1" />
                        {city}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Behavior Metrics</CardTitle>
                  <CardDescription>{data.behavior.insight}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Avg Session</p>
                      <p className="text-2xl font-bold">{data.behavior.metrics.avgSessionDuration}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Pages/Session</p>
                      <p className="text-2xl font-bold">{data.behavior.metrics.pagesPerSession}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Bounce Rate</p>
                      <p className="text-2xl font-bold">{data.behavior.metrics.bounceRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Avg Scroll</p>
                      <p className="text-2xl font-bold">{data.behavior.metrics.avgScrollDepth}%</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Top Pages (Sessions)</h4>
                      <div className="space-y-2">
                        {data.behavior.topPages.map((page) => (
                          <div key={page.page} className="flex justify-between items-center">
                            <span className="text-sm">{page.page}</span>
                            <Badge variant="secondary">{page.sessions}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Top Clicks</h4>
                      <div className="space-y-2">
                        {data.behavior.topClicks.map((click) => (
                          <div key={click.element} className="flex justify-between items-center">
                            <span className="text-sm">{click.element}</span>
                            <Badge variant="secondary">{click.clicks}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <CheckCircle2 className="inline w-4 h-4 mr-1" />
                      Friction: {data.behavior.friction.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Search Visibility Tab */}
            <TabsContent value="search" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search Visibility</CardTitle>
                  <CardDescription>{data.searchVisibility.insight}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Landing Pages by Impressions</h4>
                      <div className="space-y-2">
                        {data.searchVisibility.landingPagesByImpressions.map((page) => (
                          <div key={page.page} className="flex justify-between items-center">
                            <span className="text-sm font-mono text-gray-600">{page.page}</span>
                            <Badge>{page.impressions.toLocaleString()}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Queries by Clicks</h4>
                      <div className="space-y-2">
                        {data.searchVisibility.queriesByClicks.map((query) => (
                          <div key={query.query} className="flex justify-between items-center">
                            <span className="text-sm">{query.query}</span>
                            <Badge variant="secondary">{query.clicks}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conversions Card */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Conversion Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Qualified Leads</p>
                      <p className="text-2xl font-bold">{data.conversions.qualifiedLeads}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Converted Leads</p>
                      <p className="text-2xl font-bold">{data.conversions.convertedLeads}</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="mb-2">{data.conversions.status}</Badge>
                  <p className="text-sm text-gray-700">{data.conversions.message}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reputation Tab */}
            <TabsContent value="reputation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reputation & Social Proof</CardTitle>
                  <CardDescription>Reviews build trust and lift conversion rates on every channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">New Reviews (July)</p>
                      <p className="text-3xl font-bold">{data.reputation.july.newReviewsCount}</p>
                      <div className="flex justify-center gap-2 mt-2">
                        <Badge variant="outline">Google: {data.reputation.july.platformBreakdown.google}</Badge>
                        <Badge variant="outline">Yelp: {data.reputation.july.platformBreakdown.yelp}</Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Average Rating</p>
                        <div className="flex justify-center items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-blue-500 text-blue-500" />
                          ))}
                        </div>
                      <p className="text-lg font-semibold mt-1">{data.reputation.july.avgRatingNew.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Preview (August)</p>
                      <p className="text-3xl font-bold">{data.reputation.previewAug.newReviewsCount}</p>
                      <p className="text-xs text-gray-500 mt-1">Already incoming</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h4 className="font-semibold mb-3">Recent Review Highlights</h4>
                    <div className="space-y-3">
                      {data.reputation.july.topQuotes.map((quote, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm italic mb-2">"{quote.excerpt}"</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">{quote.source} • {quote.date}</Badge>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-blue-500 text-blue-500" />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      {data.reputation.previewAug.quotes?.map((quote, index) => (
                        <div key={`aug-${index}`} className="bg-blue-50 p-4 rounded-lg">
                          <Badge className="mb-2" variant="default">August Preview</Badge>
                          <p className="text-sm italic mb-2">"{quote.excerpt}"</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">{quote.source} • {quote.date}</Badge>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-blue-500 text-blue-500" />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h4 className="font-semibold mb-3">Common Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.reputation.july.themes.map((theme) => (
                        <Badge key={theme} variant="secondary">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <TrendingUp className="inline w-4 h-4 mr-1" />
                      {data.reputation.insight}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Highlights Tab */}
            <TabsContent value="highlights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipped This Month (Prism Highlights)</CardTitle>
                  <CardDescription>Proof of work and value delivered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.highlights.map((highlight, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{highlight.title}</h4>
                              {highlight.status === 'complete' ? (
                                <Badge variant="default">Complete</Badge>
                              ) : (
                                <Badge variant="secondary">In Progress</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{highlight.impact}</p>
                            <div className="space-y-1">
                              {highlight.evidence.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                  <span className="text-xs text-gray-500">{item}</span>
                                </div>
                              ))}
                            </div>
                            {highlight.statusNote && (
                              <p className="text-xs text-orange-600 mt-2">{highlight.statusNote}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{highlight.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Tech Stack
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Analytics Tools</p>
                        <div className="flex flex-wrap gap-1">
                          {data.stack.analytics.map((tool) => (
                            <Badge key={tool} variant="outline" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">AI Models</p>
                        <div className="flex flex-wrap gap-1">
                          {data.stack.aiModels.map((model) => (
                            <Badge key={model} variant="outline" className="text-xs">
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{data.stack.notes}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Targets Tab */}
            <TabsContent value="targets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>August Targets</CardTitle>
                  <CardDescription>Priority actions to maintain momentum</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.targetsNextMonth.map((target) => (
                      <div key={target.priority} className="flex gap-4 items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex-shrink-0">
                          {target.priority}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{target.title}</h4>
                          <p className="text-sm text-gray-600">{target.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </>
  );
}
